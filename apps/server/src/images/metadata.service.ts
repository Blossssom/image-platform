import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { ImageMetadata } from '../entities/ImageMetadata';
import { GenerationTool, GenerationMethod } from '@shared/types';

import exif from 'exif-reader';

interface ComfyNode {
  inputs?: Record<string, any>;
  class_type?: string;
}

@Injectable()
export class MetadataService {
  async extractMetadata(
    metadata: sharp.Metadata,
  ): Promise<Partial<ImageMetadata>> {
    const result: Partial<ImageMetadata> = {};
    const meta = metadata as any;

    // 1. Handle PNG Comments (ComfyUI / A1111)
    if (meta.comments && Array.isArray(meta.comments)) {
      for (const comment of meta.comments) {
        // A1111 parameters
        if (comment.keyword === 'parameters') {
          const params = this.parseGenerationParameters(comment.text);
          Object.assign(result, params);
        }

        // ComfyUI API Format (prompt)
        if (comment.keyword === 'prompt') {
          try {
            // Replace NaN with null to make it valid JSON
            const sanitizedText = comment.text.replace(/: NaN/g, ': null');
            const json = JSON.parse(sanitizedText);
            result.rawParams = json; // Save full API graph to rawParams

            // Attempt to extract basic stats from ComfyUI graph
            const extracted = this.parseComfyUIPrompt(json);
            Object.assign(result, extracted);
          } catch (e) {
            console.warn('Failed to parse ComfyUI prompt:', e);
          }
        }

        // ComfyUI Workflow (UI Graph)
        if (comment.keyword === 'workflow') {
          try {
            result.workflow = JSON.parse(comment.text);
          } catch (e) {
            console.warn('Failed to parse ComfyUI workflow:', e);
          }
        }
      }
    }

    // 2. Exif (JPEG / WebP / PNG)
    if (metadata.exif) {
      try {
        const parsedExif = exif(metadata.exif) as any;
        // UserComment (0x9286) often contains generation params in A1111 JPEG
        if (parsedExif.exif && parsedExif.exif.UserComment) {
          const userComment = this.decodeUserComment(
            parsedExif.exif.UserComment,
          );
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

  private parseComfyUIPrompt(json: any): Partial<ImageMetadata> {
    const result: Partial<ImageMetadata> = {
      generationTool: GenerationTool.ComfyUI,
      // generationMethod: GenerationMethod.Txt2Img, // Removed default as per user request
      positivePrompt: '',
      negativePrompt: '',
    };

    // 1. Create Node Map (ID -> Node)
    const nodes = json;

    // 2. Global Parameter Extraction (Scalars: Seed, Steps, CFG, etc.)
    // Scanning all nodes is robust because these parameters are often scattered (e.g. RandomNoise, BasicScheduler)
    for (const id in nodes) {
      const node = nodes[id];
      const inputs = node.inputs || {};

      const safeSeed = this.extractNumeric(inputs.seed);
      if (safeSeed) result.seed = safeSeed as string;

      const safeNoiseSeed = this.extractNumeric(inputs.noise_seed);
      if (safeNoiseSeed) result.seed = safeNoiseSeed as string;

      const safeSteps = this.extractNumeric(inputs.steps, true); // Allow number cast
      if (safeSteps) result.steps = Number(safeSteps);

      const safeCfg = this.extractNumeric(inputs.cfg, true, true); // Float
      if (safeCfg) result.cfgScale = Number(safeCfg);

      const safeGuidance = this.extractNumeric(inputs.guidance, true, true);
      if (safeGuidance) result.cfgScale = Number(safeGuidance);

      if (inputs.sampler_name && !Array.isArray(inputs.sampler_name)) {
        result.sampler = inputs.sampler_name;
        if (inputs.scheduler && !Array.isArray(inputs.scheduler))
          result.sampler += ` (${inputs.scheduler})`;
      }

      if (inputs.ckpt_name && !Array.isArray(inputs.ckpt_name))
        result.modelHash = inputs.ckpt_name;
      if (inputs.unet_name && !Array.isArray(inputs.unet_name))
        result.modelHash = inputs.unet_name;
      if (inputs.model_name && !Array.isArray(inputs.model_name))
        result.modelHash = inputs.model_name; // UpscaleModelLoader

      // Detect img2img: present if LoadImage node exists (and is not just a mask or controlnet input - simplification)
      // Usually LoadImage + VAEEncode indicates img2img
      if (node.class_type === 'LoadImage') {
        result.generationMethod = GenerationMethod.Img2Img;
      }
    }

    // 3. Find Sampler or Output Node for Prompt Backtracking
    // Priority: UltimateSDUpscale > KSampler > SamplerCustom
    // Avoid Selector/Provider nodes
    let samplerNode: any = null;
    for (const id in nodes) {
      const node = nodes[id];
      const type = String(node.class_type);

      if (
        type.includes('Select') ||
        type.includes('Provider') ||
        type.includes('Option')
      )
        continue;

      if (type.includes('UltimateSDUpscale') || type.includes('KSampler')) {
        samplerNode = node;
        // Don't break immediately, prefer UltimateSDUpscale over others if possible, or just keep last one
      }

      // Flux SamplerCustomAdvanced (Lower priority than UltimateSDUpscale usually, but needed if no others)
      if (type === 'SamplerCustomAdvanced' && !samplerNode) {
        samplerNode = node;
      }
    }

    // 4. Recursive Trace Function
    const traceText = (nodeId: string, visited = new Set()): string => {
      if (!nodeId || visited.has(nodeId)) return '';
      visited.add(nodeId);

      const node = nodes[nodeId];
      if (!node) return '';

      const inputs = node.inputs || {};
      const type = String(node.class_type);

      // A. Text Node found
      if (
        (type.includes('CLIPTextEncode') || type.includes('Prompt')) &&
        (inputs.text ||
          inputs.text_g ||
          inputs.text_l ||
          inputs.clip_l ||
          inputs.t5xxl)
      ) {
        const texts: string[] = [];
        // Only push if it's a string (not a link array)
        if (inputs.text && typeof inputs.text === 'string')
          texts.push(inputs.text);
        if (inputs.text_g && typeof inputs.text_g === 'string')
          texts.push(inputs.text_g);
        if (inputs.text_l && typeof inputs.text_l === 'string')
          texts.push(inputs.text_l);
        if (inputs.clip_l && typeof inputs.clip_l === 'string')
          texts.push(inputs.clip_l);
        if (inputs.t5xxl && typeof inputs.t5xxl === 'string')
          texts.push(inputs.t5xxl);

        return texts
          .filter((t) => typeof t === 'string' && t.trim())
          .join('\n');
      }

      // B. Intermediate Node (ConditioningCombine, BasicGuider, etc.) -> Recursive
      let foundText = '';

      // Common link keys to traverse back
      const linkKeys = [
        'positive',
        'negative',
        'conditioning',
        'guider',
        'model',
      ];
      for (const key of linkKeys) {
        // ComfyUI links are usually ["ID", Slot]
        if (Array.isArray(inputs[key])) {
          const targetId = inputs[key][0];
          const text = traceText(targetId, visited);
          if (text) foundText += text + '\n';
        }
      }

      return foundText.trim();
    };

    if (samplerNode) {
      const inputs = samplerNode.inputs;

      // === [Positive / Negative Extraction] ===

      // Case A: Standard KSampler / Upscale (Explicit positive/negative inputs)
      if (inputs.positive && Array.isArray(inputs.positive)) {
        result.positivePrompt = traceText(inputs.positive[0]);
      }
      if (inputs.negative && Array.isArray(inputs.negative)) {
        result.negativePrompt = traceText(inputs.negative[0]);
      }

      // Case B: Flux (SamplerCustomAdvanced -> BasicGuider -> Conditioning)
      if (samplerNode.class_type === 'SamplerCustomAdvanced' && inputs.guider) {
        // Guider usually leads to Positive prompt in Flux workflows (Negative is often unused or separate)
        result.positivePrompt = traceText(inputs.guider[0]);
      }

      // Attempt to find model name from inputs if linked
      // This is harder as it requires tracing 'model' input back to a checkpoint loader

      // Attempt to find model name from inputs if linked
      // This is harder as it requires tracing 'model' input back to a checkpoint loader
    }
    // If no sampler node found, we could fallback to the old method, but for now strict extraction is safer to avoid garbage.

    // 5. Extract Resources (LoRAs)
    result.resources = this.extractResources('ComfyUI', json);

    return result;
  }

  private extractResources(
    tool: 'ComfyUI' | 'A1111',
    data: any, // A1111: prompt string, ComfyUI: node graph
  ): Record<string, any>[] {
    const resources: Record<string, any>[] = [];

    if (tool === 'A1111') {
      // Regex for <lora:name:weight>
      const loraRegex = /<lora:([^:]+):([0-9.]+)(?::([0-9.]+))?>/g;
      const text = data as string;
      let match;
      while ((match = loraRegex.exec(text)) !== null) {
        resources.push({
          type: 'lora',
          name: match[1],
          weight: match[2] ? parseFloat(match[2]) : 1.0,
        });
      }
    } else if (tool === 'ComfyUI') {
      const nodes = data;
      for (const id in nodes) {
        const node = nodes[id];
        const type = String(node.class_type);
        const inputs = node.inputs || {};

        if (type.includes('LoraLoader')) {
          // Standard LoraLoader / LoraLoaderModelOnly
          const name = inputs.lora_name;
          const strength =
            inputs.strength_model !== undefined
              ? inputs.strength_model
              : inputs.strength_clip;

          if (name) {
            resources.push({
              type: 'lora',
              name: name,
              weight: typeof strength === 'number' ? strength : 1.0,
            });
          }
        }
      }
    }

    return resources;
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
      const negativePromptEndIndex =
        stepsIndex !== -1 ? stepsIndex : text.length;
      result.negativePrompt = text
        .substring(
          negativePromptIndex + 'Negative prompt:'.length,
          negativePromptEndIndex,
        )
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
      result.generationTool = GenerationTool.WebUI; // A1111 / WebUI
      // result.generationMethod = GenerationMethod.Txt2Img; // Removed default as per user request

      // Extract Resources from prompt
      if (result.positivePrompt) {
        result.resources = this.extractResources(
          'A1111',
          result.positivePrompt,
        );
      }
    }

    return result;
  }
  private extractNumeric(
    value: any,
    asNumber = false,
    isFloat = false,
  ): string | number | undefined {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) return undefined; // Ignore links

    const str = String(value).trim();
    if (!str) return undefined;

    // Check strict numeric format
    // Integers for seed (could be large), Floats for cfg
    const integerRegex = /^-?\d+$/;
    const floatRegex = /^-?\d+(\.\d+)?$/;

    if (isFloat) {
      if (floatRegex.test(str)) {
        return asNumber ? Number(str) : str;
      }
    } else {
      if (integerRegex.test(str)) {
        return asNumber ? Number(str) : str;
      }
    }

    return undefined;
  }
}
