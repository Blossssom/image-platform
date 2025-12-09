import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { Images } from '../entities/Images';
import { ImageMetadata } from '../entities/ImageMetadata';
import { StorageModule } from '../common/file-storage/storage.module';

import { ImagesRepository } from './images.repository';
import { Users } from '../entities/Users';

@Module({
  imports: [
    TypeOrmModule.forFeature([Images, ImageMetadata, Users]),
    StorageModule,
  ],
  controllers: [ImagesController],
  providers: [ImagesService, ImagesRepository],
})
export class ImagesModule {}
