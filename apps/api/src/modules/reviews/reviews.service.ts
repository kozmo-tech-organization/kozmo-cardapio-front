import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Review } from './entities/review.entity'
import type { CreateReviewInput } from '@repo/schemas'

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  async findByProduct(productId: string) {
    return this.reviewsRepository.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    })
  }

  async create(input: CreateReviewInput) {
    const review = this.reviewsRepository.create(input)
    return this.reviewsRepository.save(review)
  }

  getAverageRating(reviews: Review[]): number | null {
    if (reviews.length === 0) return null
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }

  toPublic(review: Review) {
    return {
      id: review.id,
      productId: review.productId,
      clientName: review.clientName,
      comment: review.comment,
      rating: review.rating,
      createdAt: review.createdAt.toISOString(),
    }
  }
}
