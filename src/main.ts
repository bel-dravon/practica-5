import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as swaggerUi from 'swagger-ui-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Api de Usuarios')
    .setDescription('Documentación de la API para el controlador de usuarios')
    .setVersion('1.0')
    .addTag('notas')
    .build();
  const document = SwaggerModule.createDocument(app, config)

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(document));

  await app.listen(3000);
}
bootstrap();
