import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comments } from '../entities/Comments';

@Module({
  imports: [TypeOrmModule.forFeature([Comments])],
  controllers: [],
  providers: [],
  exports: [],
})
export class CommentsModule {}
