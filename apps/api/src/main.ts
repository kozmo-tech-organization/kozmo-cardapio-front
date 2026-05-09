import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 3001)
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:5173')

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )

  await app.listen(port)
  console.log(`API running on http://localhost:${port}`)
  console.log(`RPC endpoint: http://localhost:${port}/rpc`)
}

bootstrap()
