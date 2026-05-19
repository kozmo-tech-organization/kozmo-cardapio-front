import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Category } from './entities/category.entity'
import { Product } from '../products/entities/product.entity'
import { CategoriesService } from './categories.service'
import { Restaurant } from '../restaurants/entities/restaurant.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product, Restaurant])],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
