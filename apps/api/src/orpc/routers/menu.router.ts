import { z } from 'zod'
import { publicProcedure } from '../middleware'
import type { RestaurantsService } from '../../modules/restaurants/restaurants.service'
import type { ProductsService } from '../../modules/products/products.service'
import type { ReviewsService } from '../../modules/reviews/reviews.service'
import type { CategoriesService } from '../../modules/categories/categories.service'
import type { PromotionsService } from '../../modules/promotions/promotions.service'

export function createMenuRouter(
  restaurantsService: RestaurantsService,
  productsService: ProductsService,
  reviewsService: ReviewsService,
  categoriesService: CategoriesService,
  promotionsService: PromotionsService,
) {
  return {
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .handler(async ({ input }) => {
        const restaurant = await restaurantsService.findBySlug(input.slug)
        const allProducts = await productsService.findByRestaurant(restaurant.id, { inStock: true })

        const productsWithReviews = await Promise.all(
          allProducts.map(async (product) => {
            const reviews = await reviewsService.findByProduct(product.id)
            return {
              ...productsService.toPublic(product),
              reviews: reviews.map((r) => reviewsService.toPublic(r)),
              averageRating: reviewsService.getAverageRating(reviews),
            }
          }),
        )

        const productMap = new Map(productsWithReviews.map((p) => [p.id, p]))

        const allCategories = await categoriesService.findByRestaurant(restaurant.id)
        const activeCategories = allCategories.filter((c) => c.status)

        const categoriesWithProducts = activeCategories.map((category) => {
          const products = (category.products || [])
            .filter((p) => productMap.has(p.id))
            .map((p) => productMap.get(p.id)!)

          return {
            id: category.id,
            title: category.title,
            subtitle: category.subtitle,
            imageUrl: category.imageUrl,
            order: category.order,
            products,
          }
        })

        const categorizedProductIds = new Set(
          activeCategories.flatMap((c) => (c.products || []).map((p) => p.id)),
        )
        const uncategorized = productsWithReviews.filter((p) => !categorizedProductIds.has(p.id))

        const allPromotions = await promotionsService.findByRestaurant(restaurant.id)
        const activePromotions = allPromotions
          .filter((p) => p.active)
          .map((p) => ({
            id: p.id,
            name: p.name,
            discountPercent: Number(p.discountPercent),
            productIds: (p.products || []).map((prod) => prod.id),
          }))

        return {
          restaurant: restaurantsService.toPublic(restaurant),
          categories: categoriesWithProducts,
          products: productsWithReviews,
          uncategorizedProducts: uncategorized,
          promotions: activePromotions,
        }
      }),
  }
}
