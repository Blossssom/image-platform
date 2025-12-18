export enum ImageStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface IImage {
  id: string;
  userId: string | null;
  urlOriginal: string;
  urlThumbnail: string;
  width: number;
  height: number;
  isNsfw: boolean | null;
  status: string;
  createdAt: Date | null;
}

export interface IUploadImageBody {
  nickname?: string;
}

export interface IUploadImageResponse {
  id: string;
  url: string;
}

export enum GenerationTool {
  WebUI = 'WebUI',
  ComfyUI = 'ComfyUI',
}

export enum GenerationMethod {
  Txt2Img = 'txt2img',
  Img2Img = 'img2img',
  Inpainting = 'inpainting',
  ControlNet = 'controlnet',
  Other = 'other',
}
