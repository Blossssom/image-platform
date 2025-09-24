import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getEnvFilePath } from './utils/env-file-path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ImagesModule } from './images/images.module';
import { WorkflowsModule } from './workflows/workflows.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: getEnvFilePath(),
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          entities: [__dirname + '/../**/*.entity{.js,.ts}'],
          synchronize: process.env.NODE_ENV !== 'production',
        };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: 1000, // 1 second
            limit: 3, // 3 requests per second
          },
          {
            name: 'medium', 
            ttl: 10000, // 10 seconds
            limit: 20, // 20 requests per 10 seconds
          },
          {
            name: 'long',
            ttl: configService.get<number>('THROTTLE_TTL', 60000), // 1 minute
            limit: configService.get<number>('THROTTLE_LIMIT', 100), // 100 requests per minute
          },
        ],
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    ImagesModule,
    WorkflowsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
