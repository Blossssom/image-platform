import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Images } from '../entities/Images';
import { ImageLikes } from '../entities/ImageLikes';
import { ImageResources } from '../entities/ImageResources';
import { ImagesController } from './images.controller'; // Import controller
import { ImagesService } from './images.service';
import { S3Service } from '../common/services/s3.service';
import { LocalStorageService } from '../common/services/local-storage.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Images, ImageLikes, ImageResources]),
    ConfigModule,
    CommonModule,
  ],
  controllers: [ImagesController], // Add controller
  providers: [
    ImagesService,
    {
      provide: 'StorageService',
      useFactory: (
        configService: ConfigService,
        s3Service: S3Service,
        localStorageService: LocalStorageService
      ) => {
        const provider = configService.get('STORAGE_PROVIDER');
        return provider === 's3' ? s3Service : localStorageService;
      },
      inject: [ConfigService, S3Service, LocalStorageService],
    },
  ],
  exports: [ImagesService],
})
export class ImagesModule {}
