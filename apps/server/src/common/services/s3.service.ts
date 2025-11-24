import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.getOrThrow<string>('AWS_S3_REGION');
    this.bucketName = this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME');
    
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadFile(fileBuffer: Buffer, originalname: string, mimetype: string): Promise<string> {
    const key = `images/original/${uuidv4()}-${originalname}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: mimetype,
    });

    await this.s3Client.send(command);

    // Return the full URL
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
