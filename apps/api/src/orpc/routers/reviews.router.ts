import { z } from 'zod'
import { publicProcedure } from '../middleware'
import { CreateReviewSchema } from '@repo/schemas'
import type { ReviewsService } from '../../modules/reviews/reviews.service'

export function createReviewsRouter(reviewsService: ReviewsService) {
  return {
    create: publicProcedure
      .input(CreateReviewSchema)
      .handler(async ({ input }) => {
        const review = await reviewsService.create(input)
        return reviewsService.toPublic(review)
      }),

    listByProduct: publicProcedure
      .input(z.object({ productId: z.string().uuid() }))
      .handler(async ({ input }) => {
        const reviews = await reviewsService.findByProduct(input.productId)
        return reviews.map((r) => reviewsService.toPublic(r))
      }),
  }
}
