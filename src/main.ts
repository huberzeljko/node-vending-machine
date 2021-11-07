import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from 'src/config';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from 'src/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(configService.get('baseUrl'));

  enableSwagger(app);

  await app.listen(3000);
}

bootstrap();

export function enableSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Vending Machine')
    .setDescription('Vending Machine API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}
