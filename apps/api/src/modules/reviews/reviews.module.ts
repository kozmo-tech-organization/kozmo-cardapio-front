import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Review } from './entities/review.entity'
import { ReviewsService } from './reviews.service'

@Module({
  imports: [TypeOrmModule.forFeature([Review])],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
