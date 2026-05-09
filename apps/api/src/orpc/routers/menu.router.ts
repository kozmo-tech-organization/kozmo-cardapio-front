import { z } from 'zod'
import { publicProcedure } from '../middleware'
import type { RestaurantsService } from '../../modules/restaurants/restaurants.service'
import type { ProductsService } from '../../modules/products/products.service'
import type { ReviewsService } from '../../modules/reviews/reviews.service'

export function createMenuRouter(
  restaurantsService: RestaurantsService,
  productsService: ProductsService,
  reviewsService: ReviewsService,
) {
  return {
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .handler(async ({ input }) => {
        const restaurant = await restaurantsService.findBySlug(input.slug)
        const products = await productsService.findByRestaurant(restaurant.id, { inStock: true })

        const productsWithReviews = await Promise.all(
          products.map(async (product) => {
            const reviews = await reviewsService.findByProduct(product.id)
            return {
              ...productsService.toPublic(product),
              reviews: reviews.map((r) => reviewsService.toPublic(r)),
              averageRating: reviewsService.getAverageRating(reviews),
            }
          }),
        )

        return {
          restaurant: restaurantsService.toPublic(restaurant),
          products: productsWithReviews,
        }
      }),
  }
}
