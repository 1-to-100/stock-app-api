import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      logLevels: ['log', 'error', 'warn', 'debug', 'verbose'],
      prefix: 'stock-app-api',
    }),
  });

  app.enableCors({
    // origin: 'http://example.com', // or ['http://example.com', 'http://another.com']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // allowedHeaders: 'Content-Type, Accept, Authorization',
    // exposedHeaders: 'Content-Length, X-Knowledge-Base',
    // credentials: true, // Allow cookies
    // preflightContinue: false,
    // optionsSuccessStatus: 204,
  });
  const config = new DocumentBuilder()
    .setTitle('stockApp API')
    .setDescription('The stockApp API description')
    .setVersion('0.1.0')
    .addTag('stockApp')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
