/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  const PORT = process.env.PORT ?? 3000;
  await app
    .listen(PORT)
    .then(() => {
      console.log(`App is running on port ${PORT}`);
    })
    .catch((e) => {
      console.log(e);
    });
}
bootstrap();
