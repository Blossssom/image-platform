import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Images } from '../entities/Images';
import { ImageLikes } from '../entities/ImageLikes';
import { ImageResources } from '../entities/ImageResources';
import { ImagesService } from './images.service';

@Module({
  imports: [TypeOrmModule.forFeature([Images, ImageLikes, ImageResources])],
  controllers: [],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
