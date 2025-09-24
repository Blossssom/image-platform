import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { WorkflowParserService } from './workflow-parser.service';
import { A1111MetadataExtractorService } from './a1111-metadata-extractor.service';
import { Workflows } from '../entities/Workflows';
import { Images } from '../entities/Images';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workflows, Images]),
  ],
  controllers: [WorkflowsController],
  providers: [
    WorkflowsService,
    WorkflowParserService,
    A1111MetadataExtractorService,
  ],
  exports: [
    WorkflowsService,
    WorkflowParserService,
    A1111MetadataExtractorService,
  ],
})
export class WorkflowsModule {}