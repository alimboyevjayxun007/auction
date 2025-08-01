import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { log } from 'console';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ValidationTypes } from 'class-validator';
import { ApiCookieAuth, DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const PORT = process.env.PORT || 3000

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'verbose', 'debug']
  });
  const logger = new Logger('Bootstrap')
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }))
  app.use(cookieParser())

  const config = new DocumentBuilder()
    .setTitle('Auksion platformasi API')
    .setDescription('NESTJS bilan qurilgan to\'iq funksional auksion platformasi API hujjatlari ')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT avtorizatsiyasi (Access tokenni shu yerga kiriting )',
        in: 'header'
      },
      'access-token'
    )
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api-docs', app, document)
  await app.listen(PORT);
  logger.log(`Server is running on :  ${await app.getUrl()}`)
  logger.log(`Swagger documentation available at : ${await app.getUrl()}/api-docs`)
}
bootstrap();
