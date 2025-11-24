import { Module, Global } from '@nestjs/common';
import { S3Service } from './services/s3.service';

@Global() // Make services available globally
@Module({
  providers: [S3Service],
  exports: [S3Service],
})
export class CommonModule {}
