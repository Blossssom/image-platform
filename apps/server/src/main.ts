import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule} from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const isProduction = configService.get('NODE_ENV') === 'production';

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 속성 거름
      forbidNonWhitelisted: true, // DTO에 없는 속성 에러처리
      transform: true, // 자동 타입 변환
    })
  );

  if(!isProduction) {
    const uploadPath = configService.get<string>('LOCAL_UPLOAD_PATH') || '/home/bloxxom/uploads';
    if(uploadPath) {
      app.useStaticAssets(uploadPath, {
        prefix: '/uploads/',
      })
    }
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI Image Platform API')
    .setDescription('AI Image Platform API')
    .setVersion('1.0')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  app.enableCors();

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
