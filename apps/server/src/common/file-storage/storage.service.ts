import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    if (this.configService.get('NODE_ENV') !== 'production') {
      this.uploadDir = this.configService.get<string>('LOCAL_UPLOAD_PATH') || '/home/bloxxom/uploads';
      if (!fs.existsSync(this.uploadDir)) {
        try {
          fs.mkdirSync(this.uploadDir, { recursive: true });
        }catch(err) {
          console.error('not fount fileDir :', err);
        }
      }
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    if (isProduction) {
      // TODO: Implement S3 upload logic
      throw new Error('S3 upload not implemented yet');
    } else {
      return this.uploadToLocal(file);
    }
  }

  private async uploadToLocal(file: Express.Multer.File): Promise<string> {
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadDir, filename);
    
    fs.writeFileSync(filePath, file.buffer);
    
    // Return relative URL for frontend
    return `/uploads/${filename}`;
  }
}
