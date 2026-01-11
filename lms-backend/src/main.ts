import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  // Use the port the cloud gives us, OR 3000 if we are local
  await app.listen(process.env.PORT || 3000); 
}
bootstrap();
