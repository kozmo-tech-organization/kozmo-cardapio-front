import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Product } from './entities/product.entity'
import { ProductsService } from './products.service'
import { Restaurant } from '../restaurants/entities/restaurant.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Product, Restaurant])],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
