import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';

import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { ImageProcessingService } from './services/image-processing.service';
import { Images } from '../entities/Images';
import { uploadConfig } from '../config/upload.config';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Images]),
    MulterModule.register(uploadConfig),
    WorkflowsModule,
  ],
  controllers: [ImagesController],
  providers: [ImagesService, ImageProcessingService],
  exports: [ImagesService, ImageProcessingService],
})
export class ImagesModule {}