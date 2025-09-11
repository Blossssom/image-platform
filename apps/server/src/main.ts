import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('AI Image Platform API')
    .setDescription('A comprehensive API for AI-powered image processing and management platform')
    .setVersion('1.0.0')
    .addTag('app', 'Application health and status endpoints')
    .addTag('images', 'Image processing and management')
    .addTag('ai', 'AI-powered image operations')
    .addTag('users', 'User management and authentication')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'AI Image Platform API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b82f6 }
    `,
  });

  await app.listen(5000);
  console.log(`🚀 Application is running on: http://localhost:5000`);
  console.log(`📚 Swagger documentation available at: http://localhost:5000/api`);
}

bootstrap();
