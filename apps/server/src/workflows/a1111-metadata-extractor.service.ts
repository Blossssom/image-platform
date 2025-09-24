import { Injectable } from '@nestjs/common';

export interface A1111Parameters {
  prompt?: string;
  negativePrompt?: string;
  steps?: number;
  sampler?: string;
  cfgScale?: number;
  seed?: number;
  size?: { width: number; height: number };
  model?: string;
  modelHash?: string;
  clipSkip?: number;
  denoisingStrength?: number;
  hiresUpscaler?: string;
  hiresSteps?: number;
  hiresUpscaleBy?: number;
  faceRestoration?: string;
  version?: string;
  [key: string]: any; // For additional parameters
}

export interface ExtractedA1111Data {
  parameters: A1111Parameters;
  workflowType: number; // 1 for A1111
  requiredModels: string[];
  difficultyLevel: number;
  metadataSource: 'exif' | 'filename' | 'manual';
}

@Injectable()
export class A1111MetadataExtractorService {
  /**
   * Extract A1111 generation parameters from image metadata
   */
  extractFromMetadata(metadata: any): ExtractedA1111Data | null {
    try {
      // Try to extract from EXIF UserComment or other EXIF fields
      let parameterString = null;

      // Check common EXIF fields where A1111 stores parameters
      if (metadata.exif) {
        parameterString = metadata.exif.UserComment ||
                         metadata.exif.ImageDescription ||
                         metadata.exif.Software ||
                         metadata.exif['0th']?.[270]; // ImageDescription tag
      }

      // Try PNG text chunks (common in A1111 outputs)
      if (!parameterString && metadata.textual) {
        parameterString = metadata.textual.parameters ||
                         metadata.textual.dream ||
                         metadata.textual.sd;
      }

      if (!parameterString) {
        return null;
      }

      return this.parseParameterString(parameterString);
    } catch (error) {
      console.warn('Failed to extract A1111 metadata:', (error as Error).message);
      return null;
    }
  }

  /**
   * Parse A1111 parameter string
   */
  parseParameterString(parameterString: string): ExtractedA1111Data {
    const parameters: A1111Parameters = {};
    let requiredModels: string[] = [];

    try {
      // Split the parameter string by lines and key-value pairs
      const lines = parameterString.split('\n').map(line => line.trim()).filter(line => line);

      let prompt = '';
      let negativePrompt = '';
      let parsingNegative = false;
      let parsingParameters = false;

      for (const line of lines) {
        // Check if this line starts the negative prompt
        if (line.toLowerCase().startsWith('negative prompt:')) {
          parsingNegative = true;
          parsingParameters = false;
          negativePrompt = line.substring('negative prompt:'.length).trim();
          continue;
        }

        // Check if this line starts the parameters section
        if (this.isParameterLine(line)) {
          parsingParameters = true;
          parsingNegative = false;
          this.parseParametersFromLine(line, parameters);
          continue;
        }

        // Continue parsing based on current state
        if (parsingNegative) {
          negativePrompt += ' ' + line;
        } else if (parsingParameters) {
          this.parseParametersFromLine(line, parameters);
        } else {
          // This must be part of the main prompt
          prompt += (prompt ? ' ' : '') + line;
        }
      }

      // Set extracted values
      if (prompt) parameters.prompt = prompt.trim();
      if (negativePrompt) parameters.negativePrompt = negativePrompt.trim();

      // Extract models from parameters
      requiredModels = this.extractModelsFromParameters(parameters);

      // Calculate difficulty level
      const difficultyLevel = this.calculateDifficultyLevel(parameters);

      return {
        parameters,
        workflowType: 1, // A1111
        requiredModels,
        difficultyLevel,
        metadataSource: 'exif',
      };
    } catch (error) {
      throw new Error(`Failed to parse A1111 parameters: ${(error as Error).message}`);
    }
  }

  /**
   * Check if a line contains parameter information
   */
  private isParameterLine(line: string): boolean {
    const parameterPatterns = [
      /Steps:\s*\d+/i,
      /Sampler:\s*[\w\s\+]+/i,
      /CFG scale:\s*[\d.]+/i,
      /Seed:\s*\d+/i,
      /Size:\s*\d+x\d+/i,
      /Model:\s*[\w\s.-]+/i,
      /Model hash:\s*[a-fA-F0-9]+/i,
      /Denoising strength:\s*[\d.]+/i,
    ];

    return parameterPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Parse parameters from a single line
   */
  private parseParametersFromLine(line: string, parameters: A1111Parameters): void {
    // Split by comma, but be careful of nested structures
    const parts = this.smartSplit(line, ',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      // Parse each key-value pair
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;

      const key = trimmed.substring(0, colonIndex).trim().toLowerCase();
      const value = trimmed.substring(colonIndex + 1).trim();

      this.parseParameter(key, value, parameters);
    }
  }

  /**
   * Parse a single parameter key-value pair
   */
  private parseParameter(key: string, value: string, parameters: A1111Parameters): void {
    switch (key) {
      case 'steps':
        parameters.steps = parseInt(value);
        break;
      case 'sampler':
        parameters.sampler = value;
        break;
      case 'cfg scale':
        parameters.cfgScale = parseFloat(value);
        break;
      case 'seed':
        parameters.seed = parseInt(value);
        break;
      case 'size':
        const sizeMatch = value.match(/(\d+)x(\d+)/);
        if (sizeMatch) {
          parameters.size = {
            width: parseInt(sizeMatch[1]),
            height: parseInt(sizeMatch[2]),
          };
        }
        break;
      case 'model':
        parameters.model = value;
        break;
      case 'model hash':
        parameters.modelHash = value;
        break;
      case 'clip skip':
        parameters.clipSkip = parseInt(value);
        break;
      case 'denoising strength':
        parameters.denoisingStrength = parseFloat(value);
        break;
      case 'hires upscaler':
        parameters.hiresUpscaler = value;
        break;
      case 'hires steps':
        parameters.hiresSteps = parseInt(value);
        break;
      case 'hires upscale by':
        parameters.hiresUpscaleBy = parseFloat(value);
        break;
      case 'face restoration':
        parameters.faceRestoration = value;
        break;
      case 'version':
        parameters.version = value;
        break;
      default:
        // Store unknown parameters as-is
        parameters[key.replace(/\s+/g, '_')] = value;
        break;
    }
  }

  /**
   * Smart split that respects nested structures
   */
  private smartSplit(text: string, delimiter: string): string[] {
    const parts: string[] = [];
    let current = '';
    let depth = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (char === '(' || char === '[' || char === '{') {
        depth++;
      } else if (char === ')' || char === ']' || char === '}') {
        depth--;
      }

      if (char === delimiter && depth === 0) {
        parts.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    if (current) {
      parts.push(current);
    }

    return parts;
  }

  /**
   * Extract model names from parameters
   */
  private extractModelsFromParameters(parameters: A1111Parameters): string[] {
    const models = new Set<string>();

    // Main model
    if (parameters.model && typeof parameters.model === 'string') {
      models.add(parameters.model);
    }

    // Check for additional models in other parameters
    Object.entries(parameters).forEach(([key, value]) => {
      if (typeof value === 'string' && this.isModelReference(value)) {
        models.add(value);
      }
    });

    return Array.from(models);
  }

  /**
   * Check if a value looks like a model reference
   */
  private isModelReference(value: string): boolean {
    const modelExtensions = ['.safetensors', '.ckpt', '.pt', '.bin', '.pth'];
    const modelPatterns = [
      /\.safetensors$/i,
      /\.ckpt$/i,
      /\.pt$/i,
      /\.bin$/i,
      /\.pth$/i,
      /^[\w\-._]+_v?\d+[\w\-._]*$/i, // Pattern like "model_v1.5" or "checkpoint_123"
    ];

    return modelExtensions.some(ext =>
      value.toLowerCase().endsWith(ext.toLowerCase())
    ) || modelPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Calculate difficulty level based on parameters
   */
  private calculateDifficultyLevel(parameters: A1111Parameters): number {
    let score = 1; // Base score

    // High step count indicates more complex generation
    if (parameters.steps && parameters.steps > 50) score++;
    if (parameters.steps && parameters.steps > 100) score++;

    // Hires/upscaling indicates more complex workflow
    if (parameters.hiresUpscaler || parameters.hiresSteps) score++;

    // Face restoration indicates more complex workflow
    if (parameters.faceRestoration) score++;

    // Multiple models/complex prompts
    if (parameters.prompt && parameters.prompt.length > 200) score++;

    // Low denoising strength indicates img2img workflow
    if (parameters.denoisingStrength && parameters.denoisingStrength < 0.8) score++;

    return Math.max(1, Math.min(5, score));
  }

  /**
   * Validate extracted parameters for common issues
   */
  validateParameters(parameters: A1111Parameters): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required parameters
    if (!parameters.prompt) {
      warnings.push('No prompt found in parameters');
    }

    // Validate numeric ranges
    if (parameters.steps && (parameters.steps < 1 || parameters.steps > 1000)) {
      warnings.push('Unusual step count detected');
    }

    if (parameters.cfgScale && (parameters.cfgScale < 1 || parameters.cfgScale > 30)) {
      warnings.push('Unusual CFG scale detected');
    }

    if (parameters.denoisingStrength && (parameters.denoisingStrength < 0 || parameters.denoisingStrength > 1)) {
      errors.push('Invalid denoising strength (must be 0-1)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}