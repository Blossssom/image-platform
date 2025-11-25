import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from './storage.service';

@Injectable()
export class S3Service extends StorageService {
  getPresignedUrl(path: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.region = this.configService.getOrThrow<string>('AWS_S3_REGION');
    this.bucketName =
      this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME');

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY'
        ),
      },
    });
  }

  async save(
    buffer: Buffer,
    filename: string,
    mimetype?: string
  ): Promise<{ url: string; path: string }> {
    const key = `images/original/${uuidv4()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    });

    try {
      await this.s3Client.send(command);
      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
      return { url, path: key }; // For S3, path is the key
    } catch (error) {
      throw new InternalServerErrorException('Could not upload file to S3');
    }
  }

  async delete(path: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: path,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      throw new InternalServerErrorException('Could not delete file from S3');
    }
  }
}
