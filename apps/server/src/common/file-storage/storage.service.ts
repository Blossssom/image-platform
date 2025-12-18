import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    if (this.configService.get('NODE_ENV') !== 'production') {
      this.uploadDir =
        this.configService.get<string>('LOCAL_UPLOAD_PATH') ||
        '/home/bloxxom/uploads';
      if (!fs.existsSync(this.uploadDir)) {
        try {
          fs.mkdirSync(this.uploadDir, { recursive: true });
        } catch (err) {
          console.error('not fount fileDir :', err);
        }
      }
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'misc',
  ): Promise<string> {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    if (isProduction) {
      // TODO: Implement S3 upload logic
      throw new Error('S3 upload not implemented yet');
    } else {
      return this.uploadToLocal(file, folder);
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    folder = 'misc',
  ): Promise<string> {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    if (isProduction) {
      // TODO: Implement S3 upload logic for buffer
      throw new Error('S3 upload not implemented yet');
    } else {
      const targetDir = path.join(this.uploadDir, folder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const filePath = path.join(targetDir, filename);
      fs.writeFileSync(filePath, buffer);
      return `/uploads/${folder}/${filename}`;
    }
  }

  private async uploadToLocal(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    const filename = `${Date.now()}-${file.originalname}`;
    return this.uploadBuffer(file.buffer, filename, folder);
  }
}
