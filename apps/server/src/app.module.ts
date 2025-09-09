import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { getEnvFilePath } from './utils/env-file-path';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: getEnvFilePath(),
      isGlobal: true,
      cache: true,
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
