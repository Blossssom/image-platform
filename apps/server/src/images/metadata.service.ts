import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { ImageMetadata } from '../entities/ImageMetadata';

import exif from 'exif-reader';

@Injectable()
export class MetadataService {
  async extractMetadata(buffer: Buffer): Promise<Partial<ImageMetadata>> {
    const metadata = await sharp(buffer).metadata();
    const result: Partial<ImageMetadata> = {};

    console.log('metadata :', metadata);

    // 1. PNG Text Chunks (Stable Diffusion / A1111)
    const meta = metadata as any;
    if (metadata.format === 'png' && meta.text) {
      if (meta.text.parameters) {
        const params = this.parseGenerationParameters(meta.text.parameters);
        Object.assign(result, params);
      }
    }

    // 2. Exif (JPEG / WebP / PNG)
    if (metadata.exif) {
      try {
        const parsedExif = exif(metadata.exif) as any;
        // UserComment (0x9286) often contains generation params in A1111 JPEG
        // Sometimes it has "UNICODE\0" prefix or similar.
        if (parsedExif.exif && parsedExif.exif.UserComment) {
          const userComment = this.decodeUserComment(parsedExif.exif.UserComment);
          if (userComment) {
             const params = this.parseGenerationParameters(userComment);
             Object.assign(result, params);
          }
        }
      } catch (error) {
        console.warn('Failed to parse Exif:', error);
      }
    }
    
    return result;
  }

  private decodeUserComment(data: Buffer | string): string | null {
    if (Buffer.isBuffer(data)) {
      // Check for UNICODE prefix (ASCII: 85 78 73 67 79 68 69 0)
      // or just try to decode as utf8
      const str = data.toString('utf8');
      if (str.startsWith('UNICODE\0')) {
         return str.substring(8).replace(/\0/g, ''); // Remove prefix and nulls
      }
      return str.replace(/\0/g, '');
    } else if (typeof data === 'string') {
        return data.replace(/\0/g, '');
    }
    return null;
  }

  private parseGenerationParameters(text: string): Partial<ImageMetadata> {
    const result: Partial<ImageMetadata> = {};

    // 1. Prompt (Positive) - Everything before "Negative prompt:" or "Steps:"
    const negativePromptIndex = text.indexOf('Negative prompt:');
    const stepsIndex = text.indexOf('Steps:');

    let positivePromptEndIndex = text.length;
    if (negativePromptIndex !== -1) {
      positivePromptEndIndex = negativePromptIndex;
    } else if (stepsIndex !== -1) {
      positivePromptEndIndex = stepsIndex;
    }

    result.positivePrompt = text.substring(0, positivePromptEndIndex).trim();

    // 2. Negative Prompt
    if (negativePromptIndex !== -1) {
      const negativePromptEndIndex = stepsIndex !== -1 ? stepsIndex : text.length;
      result.negativePrompt = text
        .substring(negativePromptIndex + 'Negative prompt:'.length, negativePromptEndIndex)
        .trim();
    }

    // 3. Parameters (Steps, Sampler, CFG scale, Seed, Model hash, etc.)
    if (stepsIndex !== -1) {
      const paramsText = text.substring(stepsIndex);
      const params = paramsText.split(',').map((p) => p.trim());

      params.forEach((param) => {
        const [key, value] = param.split(':').map((s) => s.trim());
        if (!key || !value) return;

        switch (key) {
          case 'Steps':
            result.steps = parseInt(value, 10);
            break;
          case 'Sampler':
            result.sampler = value;
            break;
          case 'CFG scale':
            result.cfgScale = parseFloat(value);
            break;
          case 'Seed':
            result.seed = value;
            break;
          case 'Model hash':
            result.modelHash = value;
            break;
          case 'Model':
             // Model name could be stored if we had a field for it, or mapped to generationTool/Method
             break;
        }
      });
      
      result.rawParams = { raw: paramsText }; // Store raw params for reference
    }
    
    // Default tool/method if we detected parameters
    if (result.steps || result.modelHash) {
        result.generationTool = 'Stable Diffusion'; // Assumption for now
        result.generationMethod = 'txt2img'; // Assumption, could be img2img
    }

    return result;
  }
}
