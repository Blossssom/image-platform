import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        node:
          configService.get<string>('ELASTIC_NODE') || 'http://localhost:9200',
        auth: {
          username: configService.get<string>('ELASTIC_USERNAME') || 'elastic',
          password: configService.get<string>('ELASTIC_PASSWORD') || 'changeme',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}
