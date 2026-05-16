import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: [process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'],
    credentials: true,
  });

  // Swagger OpenAPI docs — wrapped: @nestjs/swagger 7.x has known Node 24 incompat (reflect-metadata mismatch).
  // Skip silently in dev if it fails; the API still serves. Re-enable after upgrade to swagger@8.
  try {
    const config = new DocumentBuilder()
      .setTitle('Não Cá Vàng API')
      .setDescription('API cho nền tảng học bằng mind map + AI')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  } catch (err) {
    logger.warn(`Swagger setup skipped: ${(err as Error).message}`);
  }

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  logger.log(`🚀 API listening on http://localhost:${port}`);
  logger.log(`📘 Swagger docs at http://localhost:${port}/api/docs`);

  if (process.env.NIGHT_SHIFT_MODE === 'true') {
    logger.warn('🌙 NIGHT_SHIFT_MODE=true — using mock AI provider');
  }
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap', err);
  process.exit(1);
});
