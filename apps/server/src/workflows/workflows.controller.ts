import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Response,
  StreamableFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkflowsService } from './workflows.service';
import { Throttle } from '@nestjs/throttler';
import { IsOptional, IsString, IsBoolean, IsObject, IsUUID, IsInt, Min, Max } from 'class-validator';

export class CreateWorkflowDto {
  @IsUUID()
  @IsOptional()
  imageId?: string;

  @IsObject()
  workflowData: any;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean = true;
}

export class ParseWorkflowDto {
  @IsObject()
  workflowData: any;
}

@ApiTags('workflows')
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @ApiOperation({ summary: 'Create a new workflow' })
  @ApiResponse({ status: 201, description: 'Workflow created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid workflow data' })
  @ApiResponse({ status: 409, description: 'Workflow already exists' })
  async create(@Body(ValidationPipe) createWorkflowDto: CreateWorkflowDto) {
    return await this.workflowsService.createWorkflow(createWorkflowDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get workflows with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'workflowType', required: false, type: Number })
  @ApiQuery({ name: 'difficultyLevel', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Workflows retrieved successfully' })
  async findMany(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('category') category?: string,
    @Query('workflowType', new DefaultValuePipe(undefined)) workflowType?: number,
    @Query('difficultyLevel') difficultyLevel?: number,
  ) {
    // Validate limit
    const validLimit = Math.min(Math.max(limit, 1), 100);

    return await this.workflowsService.findMany({
      page,
      limit: validLimit,
      category,
      workflowType: workflowType !== undefined ? Number(workflowType) : undefined,
      difficultyLevel: difficultyLevel !== undefined ? Number(difficultyLevel) : undefined,
    });
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending workflows' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Trending workflows retrieved successfully' })
  async findTrending(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const validLimit = Math.min(Math.max(limit, 1), 50);
    return await this.workflowsService.findTrending(validLimit);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent workflows' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Recent workflows retrieved successfully' })
  async findRecent(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const validLimit = Math.min(Math.max(limit, 1), 100);
    return await this.workflowsService.findMany({
      limit: validLimit,
      page: 1,
    });
  }

  @Get('image/:imageId')
  @ApiOperation({ summary: 'Get workflow by image ID' })
  @ApiResponse({ status: 200, description: 'Workflow retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async findByImageId(@Param('imageId', ParseUUIDPipe) imageId: string) {
    return await this.workflowsService.findByImageId(imageId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow by ID' })
  @ApiResponse({ status: 200, description: 'Workflow retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.workflowsService.findOne(id);
  }

  @Get(':id/download')
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 downloads per minute
  @ApiOperation({ summary: 'Download workflow file' })
  @ApiResponse({ status: 200, description: 'Workflow file downloaded' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async downloadWorkflow(
    @Param('id', ParseUUIDPipe) id: string,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const workflow = await this.workflowsService.findOne(id);

    // Increment download count
    await this.workflowsService.incrementDownloadCount(id);

    // Prepare download
    const filename = `workflow_${workflow.title?.replace(/[^a-z0-9]/gi, '_') || id}.json`;
    const workflowJson = JSON.stringify(workflow.workflowData, null, 2);

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(Buffer.from(workflowJson));
  }

  @Post('parse')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 parse requests per minute
  @ApiOperation({ summary: 'Parse and validate workflow without saving' })
  @ApiResponse({ status: 200, description: 'Workflow parsed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid workflow data' })
  @HttpCode(HttpStatus.OK)
  async parseWorkflow(@Body(ValidationPipe) parseWorkflowDto: ParseWorkflowDto) {
    return await this.workflowsService.parseWorkflow(parseWorkflowDto.workflowData);
  }

  @Post('duplicate-check')
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 duplicate checks per minute
  @ApiOperation({ summary: 'Check if workflow is duplicate' })
  @ApiResponse({ status: 200, description: 'Duplicate check completed' })
  @ApiResponse({ status: 400, description: 'Invalid workflow data' })
  @HttpCode(HttpStatus.OK)
  async checkDuplicate(@Body(ValidationPipe) parseWorkflowDto: ParseWorkflowDto) {
    return await this.workflowsService.checkDuplicate(parseWorkflowDto.workflowData);
  }

  @Post(':id/fork')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 forks per minute
  @ApiOperation({ summary: 'Fork an existing workflow' })
  @ApiResponse({ status: 201, description: 'Workflow forked successfully' })
  @ApiResponse({ status: 404, description: 'Original workflow not found' })
  async forkWorkflow(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() forkData: { title?: string; description?: string; category?: string },
  ) {
    const originalWorkflow = await this.workflowsService.findOne(id);

    const createDto: CreateWorkflowDto = {
      workflowData: originalWorkflow.workflowData,
      title: forkData.title || `${originalWorkflow.title || 'Untitled Workflow'} (Fork)`,
      description: forkData.description || `Forked from: ${originalWorkflow.title || 'Untitled Workflow'}`,
      category: forkData.category || originalWorkflow.category || undefined,
      isPublic: true,
    };

    return await this.workflowsService.createWorkflow(createDto);
  }

  @Get('validate/:id')
  @ApiOperation({ summary: 'Validate an existing workflow' })
  @ApiResponse({ status: 200, description: 'Workflow validation completed' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async validateWorkflow(@Param('id', ParseUUIDPipe) id: string) {
    const workflow = await this.workflowsService.findOne(id);
    return await this.workflowsService.parseWorkflow(workflow.workflowData);
  }
}