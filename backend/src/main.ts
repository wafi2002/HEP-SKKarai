import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,  // Remove properties yang tak ada dalam DTO
    forbidNonWhitelisted: true,  // Throw error kalau ada extra properties
    transform: true,  // Auto transform payload ke DTO instance
  }));
  app.enableCors({
    origin: 'http://localhost:3000', // URL Nuxt.js
    credentials: true,
  });
  await app.listen(process.env.APP_PORT ?? 3001);
}
bootstrap();
