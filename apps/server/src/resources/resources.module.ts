import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resources } from '../entities/Resources';

@Module({
  imports: [TypeOrmModule.forFeature([Resources])],
  controllers: [],
  providers: [],
  exports: [],
})
export class ResourcesModule {}
