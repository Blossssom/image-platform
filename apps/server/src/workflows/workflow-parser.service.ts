import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

export interface ComfyUINode {
  id: number;
  type: string;
  pos: [number, number];
  size?: [number, number];
  flags?: object;
  order?: number;
  mode?: number;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  widgets_values?: any[];
  properties?: Record<string, any>;
}

export interface ComfyUIWorkflow {
  version?: number;
  nodes: ComfyUINode[];
  links: any[][];
  groups?: any[];
  config?: object;
  extra?: object;
}

export interface ParsedWorkflowData {
  workflowData: ComfyUIWorkflow;
  workflowHash: string;
  nodeCount: number;
  nodeTypes: string[];
  requiredModels: string[];
  requiredLoras: string[];
  difficultyLevel: number;
  workflowType: number; // 0: ComfyUI, 1: A1111
  workflowVersion?: string;
}

@Injectable()
export class WorkflowParserService {
  private readonly MODEL_NODE_TYPES = [
    'CheckpointLoaderSimple',
    'CheckpointLoader',
    'DiffusersLoader',
    'LoraLoader',
    'ControlNetLoader',
    'UNETLoader',
    'CLIPLoader',
    'VAELoader',
  ];

  private readonly LORA_NODE_TYPES = [
    'LoraLoader',
    'LoraLoaderModelOnly',
  ];

  /**
   * Parse ComfyUI workflow JSON data
   */
  parseComfyUIWorkflow(workflowData: any): ParsedWorkflowData {
    try {
      // Validate basic structure
      if (!this.isValidComfyUIWorkflow(workflowData)) {
        throw new BadRequestException('Invalid ComfyUI workflow structure');
      }

      const workflow = workflowData as ComfyUIWorkflow;

      // Generate hash for duplicate detection
      const workflowHash = this.generateWorkflowHash(workflow);

      // Extract node information
      const nodeTypes = this.extractNodeTypes(workflow.nodes);
      const nodeCount = workflow.nodes.length;

      // Extract required models and LoRAs
      const requiredModels = this.extractRequiredModels(workflow.nodes);
      const requiredLoras = this.extractRequiredLoras(workflow.nodes);

      // Calculate difficulty level based on complexity
      const difficultyLevel = this.calculateDifficultyLevel(workflow);

      // Extract version if available
      const workflowVersion = workflow.version?.toString();

      return {
        workflowData: workflow,
        workflowHash,
        nodeCount,
        nodeTypes,
        requiredModels,
        requiredLoras,
        difficultyLevel,
        workflowType: 0, // ComfyUI
        workflowVersion,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to parse ComfyUI workflow: ${(error as Error).message}`);
    }
  }

  /**
   * Validate if the provided data is a valid ComfyUI workflow
   */
  private isValidComfyUIWorkflow(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check for required ComfyUI workflow properties
    if (!Array.isArray(data.nodes)) {
      return false;
    }

    if (!Array.isArray(data.links)) {
      return false;
    }

    // Validate nodes structure
    for (const node of data.nodes) {
      if (!node.id || !node.type || typeof node.id !== 'number' || typeof node.type !== 'string') {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate unique hash for workflow
   */
  private generateWorkflowHash(workflow: ComfyUIWorkflow): string {
    // Create a normalized version for hashing (remove position data, etc.)
    const normalizedWorkflow = {
      nodes: workflow.nodes.map(node => ({
        id: node.id,
        type: node.type,
        inputs: node.inputs || {},
        widgets_values: node.widgets_values || [],
      })),
      links: workflow.links,
    };

    const workflowString = JSON.stringify(normalizedWorkflow, Object.keys(normalizedWorkflow).sort());
    return crypto.createHash('sha256').update(workflowString).digest('hex');
  }

  /**
   * Extract unique node types from workflow
   */
  private extractNodeTypes(nodes: ComfyUINode[]): string[] {
    const types = new Set<string>();
    nodes.forEach(node => types.add(node.type));
    return Array.from(types).sort();
  }

  /**
   * Extract required models from workflow nodes
   */
  private extractRequiredModels(nodes: ComfyUINode[]): string[] {
    const models = new Set<string>();

    nodes.forEach(node => {
      if (this.MODEL_NODE_TYPES.includes(node.type)) {
        // Check widgets_values for model names
        if (node.widgets_values && Array.isArray(node.widgets_values)) {
          node.widgets_values.forEach(value => {
            if (typeof value === 'string' && this.isModelFileName(value)) {
              models.add(value);
            }
          });
        }

        // Check inputs for model references
        if (node.inputs) {
          Object.values(node.inputs).forEach(input => {
            if (typeof input === 'string' && this.isModelFileName(input)) {
              models.add(input);
            }
          });
        }
      }
    });

    return Array.from(models).sort();
  }

  /**
   * Extract required LoRAs from workflow nodes
   */
  private extractRequiredLoras(nodes: ComfyUINode[]): string[] {
    const loras = new Set<string>();

    nodes.forEach(node => {
      if (this.LORA_NODE_TYPES.includes(node.type)) {
        // Check widgets_values for LoRA names
        if (node.widgets_values && Array.isArray(node.widgets_values)) {
          node.widgets_values.forEach(value => {
            if (typeof value === 'string' && this.isLoraFileName(value)) {
              loras.add(value);
            }
          });
        }
      }
    });

    return Array.from(loras).sort();
  }

  /**
   * Calculate difficulty level based on workflow complexity
   */
  private calculateDifficultyLevel(workflow: ComfyUIWorkflow): number {
    let score = 0;

    // Base score from node count
    const nodeCount = workflow.nodes.length;
    if (nodeCount <= 5) score += 1;
    else if (nodeCount <= 15) score += 2;
    else if (nodeCount <= 30) score += 3;
    else if (nodeCount <= 50) score += 4;
    else score += 5;

    // Additional score for complex node types
    const complexNodeTypes = [
      'ControlNetApply',
      'ControlNetLoader',
      'IPAdapterApply',
      'Inpaint',
      'FaceRestore',
      'Upscale',
      'LoraLoader',
    ];

    const hasComplexNodes = workflow.nodes.some(node =>
      complexNodeTypes.includes(node.type)
    );
    if (hasComplexNodes) score += 1;

    // Score from link complexity
    const linkCount = workflow.links.length;
    if (linkCount > 20) score += 1;
    if (linkCount > 50) score += 1;

    // Ensure score is between 1 and 5
    return Math.max(1, Math.min(5, score));
  }

  /**
   * Check if a string looks like a model filename
   */
  private isModelFileName(filename: string): boolean {
    if (!filename || typeof filename !== 'string') return false;

    const modelExtensions = ['.safetensors', '.ckpt', '.pt', '.bin', '.pth'];
    return modelExtensions.some(ext =>
      filename.toLowerCase().endsWith(ext.toLowerCase())
    );
  }

  /**
   * Check if a string looks like a LoRA filename
   */
  private isLoraFileName(filename: string): boolean {
    if (!filename || typeof filename !== 'string') return false;

    const loraExtensions = ['.safetensors', '.ckpt', '.pt', '.bin'];
    return loraExtensions.some(ext =>
      filename.toLowerCase().endsWith(ext.toLowerCase())
    );
  }

  /**
   * Validate workflow against known patterns and common issues
   */
  validateWorkflow(workflowData: ComfyUIWorkflow): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for common issues
    if (workflowData.nodes.length === 0) {
      errors.push('Workflow contains no nodes');
    }

    if (workflowData.links.length === 0 && workflowData.nodes.length > 1) {
      warnings.push('Workflow has multiple nodes but no links');
    }

    // Check for required output nodes
    const hasOutputNode = workflowData.nodes.some(node =>
      ['SaveImage', 'PreviewImage'].includes(node.type)
    );
    if (!hasOutputNode) {
      warnings.push('Workflow does not contain an output node (SaveImage/PreviewImage)');
    }

    // Check for disconnected nodes
    const linkedNodeIds = new Set();
    workflowData.links.forEach(link => {
      if (Array.isArray(link) && link.length >= 2) {
        linkedNodeIds.add(link[0]);
        linkedNodeIds.add(link[2]);
      }
    });

    const disconnectedNodes = workflowData.nodes.filter(node =>
      !linkedNodeIds.has(node.id) && workflowData.nodes.length > 1
    );

    if (disconnectedNodes.length > 0) {
      warnings.push(`Found ${disconnectedNodes.length} disconnected nodes`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}