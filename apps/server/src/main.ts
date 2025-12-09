import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule} from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 속성 거름
      forbidNonWhitelisted: true, // DTO에 없는 속성 에러처리
      transform: true, // 자동 타입 변환
    })
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI Image Platform API')
    .setDescription('AI Image Platform API')
    .setVersion('1.0')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  app.enableCors();
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('POSTGRES_PASSWORD type:', typeof process.env.POSTGRES_PASSWORD);
  console.log('is port :', process.env.PORT )
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
