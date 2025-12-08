import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 속성 거름
      forbidNonWhitelisted: true, // DTO에 없는 속성 에러처리
      transform: true, // 자동 타입 변환
    })
  );


  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
