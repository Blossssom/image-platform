import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { Images } from '../entities/Images';
import { ImageMetadata } from '../entities/ImageMetadata';
import { Users } from '../entities/Users';
import { ImagesRepository } from './images.repository';
// import { StorageModule } from '../storage/storage.module'; // File storage module seems to be in common/file-storage or similar. Checking file structure?
// Wait, previous logs showed StorageModule in ../storage/storage.module but lint error says otherwise.
import { StorageModule } from '../common/file-storage/storage.module';
import { MetadataService } from './metadata.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Images, ImageMetadata, Users]),
    StorageModule,
    SearchModule,
  ],
  controllers: [ImagesController],
  providers: [ImagesService, ImagesRepository, MetadataService],
})
export class ImagesModule {}
