export abstract class StorageService {
  abstract save(
    buffer: Buffer,
    filename: string,
    mimetype?: string
  ): Promise<{ url: string; path: string }>;
  abstract delete(path: string): Promise<void>;
  abstract getPresignedUrl(path: string): Promise<string>;
}
