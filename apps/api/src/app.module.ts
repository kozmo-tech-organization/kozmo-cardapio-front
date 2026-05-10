import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { getDatabaseConfig } from './config/database.config'
import { AuthModule } from './modules/auth/auth.module'
import { RestaurantsModule } from './modules/restaurants/restaurants.module'
import { ProductsModule } from './modules/products/products.module'
import { ReviewsModule } from './modules/reviews/reviews.module'
import { CategoriesModule } from './modules/categories/categories.module'
import { RpcMiddleware } from './orpc/rpc.middleware'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    AuthModule,
    RestaurantsModule,
    ProductsModule,
    ReviewsModule,
    CategoriesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RpcMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
