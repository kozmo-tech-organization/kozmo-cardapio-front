import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Promotion } from './entities/promotion.entity'
import { Product } from '../products/entities/product.entity'
import { PromotionsService } from './promotions.service'

@Module({
  imports: [TypeOrmModule.forFeature([Promotion, Product])],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
