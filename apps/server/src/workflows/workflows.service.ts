import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflows } from '../entities/Workflows';
import { Images } from '../entities/Images';
import { WorkflowParserService } from './workflow-parser.service';
import { A1111MetadataExtractorService } from './a1111-metadata-extractor.service';

export interface CreateWorkflowDto {
  imageId?: string;
  workflowData: any;
  title?: string;
  description?: string;
  category?: string;
  isPublic?: boolean;
}

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(Workflows)
    private readonly workflowsRepository: Repository<Workflows>,
    @InjectRepository(Images)
    private readonly imagesRepository: Repository<Images>,
    private readonly workflowParserService: WorkflowParserService,
    private readonly a1111ExtractorService: A1111MetadataExtractorService,
  ) {}

  /**
   * Create a new workflow from parsed data
   */
  async createWorkflow(createWorkflowDto: CreateWorkflowDto): Promise<Workflows> {
    const { imageId, workflowData, title, description, category, isPublic = true } = createWorkflowDto;

    try {
      // Parse workflow data
      const parsedData = this.workflowParserService.parseComfyUIWorkflow(workflowData);

      // Check for existing workflow with same hash
      const existingWorkflow = await this.workflowsRepository.findOne({
        where: { workflowHash: parsedData.workflowHash },
      });

      if (existingWorkflow) {
        throw new BadRequestException('Workflow with identical content already exists');
      }

      // Verify image exists if provided
      let image: Images | null = null;
      if (imageId) {
        image = await this.imagesRepository.findOne({
          where: { id: imageId },
        });
        if (!image) {
          throw new NotFoundException('Associated image not found');
        }
      }

      // Create workflow entity
      const workflow = this.workflowsRepository.create({
        workflowData: parsedData.workflowData,
        workflowHash: parsedData.workflowHash,
        workflowType: parsedData.workflowType,
        workflowVersion: parsedData.workflowVersion,
        title: title || this.generateTitle(parsedData),
        description,
        category: category || this.inferCategory(parsedData),
        nodeCount: parsedData.nodeCount,
        nodeTypes: parsedData.nodeTypes,
        requiredModels: parsedData.requiredModels,
        requiredLoras: parsedData.requiredLoras,
        difficultyLevel: parsedData.difficultyLevel,
        isPublic,
        image: image || undefined,
      });

      return await this.workflowsRepository.save(workflow);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create workflow: ${(error as Error).message}`);
    }
  }

  /**
   * Process workflow from image metadata
   */
  async processWorkflowFromImage(imageId: string, metadata: any): Promise<Workflows | null> {
    try {
      // First check if this image already has a workflow
      const existingWorkflow = await this.workflowsRepository.findOne({
        where: { image: { id: imageId } },
      });

      if (existingWorkflow) {
        return existingWorkflow;
      }

      // Try to extract ComfyUI workflow first
      if (metadata.comfyui || metadata.workflow) {
        const workflowData = metadata.comfyui || metadata.workflow;
        return await this.createWorkflow({
          imageId,
          workflowData,
          title: 'Extracted ComfyUI Workflow',
          isPublic: true,
        });
      }

      // Try to extract A1111 parameters
      const a1111Data = this.a1111ExtractorService.extractFromMetadata(metadata);
      if (a1111Data) {
        // Create a simplified workflow representation for A1111
        const workflowData = {
          type: 'a1111',
          parameters: a1111Data.parameters,
          version: 1,
        };

        const workflow = this.workflowsRepository.create({
          workflowData,
          workflowHash: this.generateA1111Hash(a1111Data.parameters),
          workflowType: 1, // A1111
          title: 'A1111 Generation Parameters',
          category: 'txt2img',
          nodeCount: 1,
          nodeTypes: ['A1111Generation'],
          requiredModels: a1111Data.requiredModels,
          requiredLoras: [],
          difficultyLevel: a1111Data.difficultyLevel,
          isPublic: true,
          image: { id: imageId } as Images,
        });

        return await this.workflowsRepository.save(workflow);
      }

      return null;
    } catch (error) {
      console.error('Failed to process workflow from image metadata:', error);
      return null;
    }
  }

  /**
   * Get workflow by ID with validation
   */
  async findOne(id: string): Promise<Workflows> {
    const workflow = await this.workflowsRepository.findOne({
      where: { id },
      relations: ['image'],
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return workflow;
  }

  /**
   * Get workflow by image ID
   */
  async findByImageId(imageId: string): Promise<Workflows | null> {
    return await this.workflowsRepository.findOne({
      where: { image: { id: imageId } },
      relations: ['image'],
    });
  }

  /**
   * Get workflows with pagination and filtering
   */
  async findMany(options: {
    page?: number;
    limit?: number;
    category?: string;
    workflowType?: number;
    difficultyLevel?: number;
    isPublic?: boolean;
  } = {}): Promise<{ workflows: Workflows[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      category,
      workflowType,
      difficultyLevel,
      isPublic = true,
    } = options;

    const queryBuilder = this.workflowsRepository
      .createQueryBuilder('workflow')
      .leftJoinAndSelect('workflow.image', 'image')
      .where('workflow.isPublic = :isPublic', { isPublic });

    if (category) {
      queryBuilder.andWhere('workflow.category = :category', { category });
    }

    if (workflowType !== undefined) {
      queryBuilder.andWhere('workflow.workflowType = :workflowType', { workflowType });
    }

    if (difficultyLevel !== undefined) {
      queryBuilder.andWhere('workflow.difficultyLevel = :difficultyLevel', { difficultyLevel });
    }

    const [workflows, total] = await queryBuilder
      .orderBy('workflow.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { workflows, total };
  }

  /**
   * Get trending workflows based on downloads and favorites
   */
  async findTrending(limit = 10): Promise<Workflows[]> {
    return await this.workflowsRepository
      .createQueryBuilder('workflow')
      .leftJoinAndSelect('workflow.image', 'image')
      .where('workflow.isPublic = true')
      .orderBy('workflow.downloadCount + workflow.favoriteCount', 'DESC')
      .addOrderBy('workflow.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Increment download count
   */
  async incrementDownloadCount(id: string): Promise<void> {
    await this.workflowsRepository.increment({ id }, 'downloadCount', 1);
  }

  /**
   * Parse and validate workflow without saving
   */
  async parseWorkflow(workflowData: any): Promise<any> {
    const parsed = this.workflowParserService.parseComfyUIWorkflow(workflowData);
    const validation = this.workflowParserService.validateWorkflow(parsed.workflowData);

    return {
      parsed,
      validation,
    };
  }

  /**
   * Check for duplicate workflows
   */
  async checkDuplicate(workflowData: any): Promise<{ isDuplicate: boolean; existingWorkflow?: Workflows }> {
    try {
      const parsed = this.workflowParserService.parseComfyUIWorkflow(workflowData);

      const existingWorkflow = await this.workflowsRepository.findOne({
        where: { workflowHash: parsed.workflowHash },
        relations: ['image'],
      });

      return {
        isDuplicate: !!existingWorkflow,
        existingWorkflow: existingWorkflow || undefined,
      };
    } catch (error) {
      return { isDuplicate: false };
    }
  }

  /**
   * Generate title from workflow data
   */
  private generateTitle(parsedData: any): string {
    const nodeTypes = parsedData.nodeTypes || [];
    const nodeCount = parsedData.nodeCount || 0;

    // Try to create a meaningful title based on node types
    if (nodeTypes.includes('ControlNetApply')) {
      return `ControlNet Workflow (${nodeCount} nodes)`;
    }
    if (nodeTypes.includes('LoraLoader')) {
      return `LoRA Enhanced Workflow (${nodeCount} nodes)`;
    }
    if (nodeTypes.includes('Inpaint')) {
      return `Inpainting Workflow (${nodeCount} nodes)`;
    }
    if (nodeTypes.includes('Upscale')) {
      return `Upscaling Workflow (${nodeCount} nodes)`;
    }

    return `ComfyUI Workflow (${nodeCount} nodes)`;
  }

  /**
   * Infer category from workflow data
   */
  private inferCategory(parsedData: any): string {
    const nodeTypes = parsedData.nodeTypes || [];

    if (nodeTypes.includes('ControlNetApply')) return 'controlnet';
    if (nodeTypes.includes('LoraLoader')) return 'lora';
    if (nodeTypes.includes('Inpaint')) return 'inpainting';
    if (nodeTypes.includes('Upscale')) return 'upscaling';
    if (nodeTypes.includes('FaceRestore')) return 'face-restoration';

    return 'general';
  }

  /**
   * Generate hash for A1111 parameters
   */
  private generateA1111Hash(parameters: any): string {
    const crypto = require('crypto');
    const normalizedParams = JSON.stringify(parameters, Object.keys(parameters).sort());
    return crypto.createHash('sha256').update(normalizedParams).digest('hex');
  }
}