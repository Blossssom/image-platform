import { Module, Global } from '@nestjs/common';
import { S3Service } from './services/s3.service';
import { LocalStorageService } from './services/local-storage.service';

@Global() // Make services available globally
@Module({
  providers: [S3Service, LocalStorageService],
  exports: [S3Service, LocalStorageService],
})
export class CommonModule {}
