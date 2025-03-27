import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { globalConfigs } from './common/constants/global-config.constant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors();

  // Swagger configs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Dynasty Showdown Game Server Documentation')
    .setVersion('1.0')
    .setDescription('The documentation of the Dynasty Showdown Game Server')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, documentFactory);

  await app.listen(globalConfigs.serverPort);
}

void bootstrap();
