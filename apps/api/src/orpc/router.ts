import type { AuthService } from '../modules/auth/auth.service'
import type { RestaurantsService } from '../modules/restaurants/restaurants.service'
import type { ProductsService } from '../modules/products/products.service'
import type { ReviewsService } from '../modules/reviews/reviews.service'
import type { CategoriesService } from '../modules/categories/categories.service'
import { createAuthRouter } from './routers/auth.router'
import { createRestaurantRouter } from './routers/restaurant.router'
import { createProductsRouter } from './routers/products.router'
import { createMenuRouter } from './routers/menu.router'
import { createReviewsRouter } from './routers/reviews.router'
import { createCategoriesRouter } from './routers/categories.router'

export interface RouterServices {
  authService: AuthService
  restaurantsService: RestaurantsService
  productsService: ProductsService
  reviewsService: ReviewsService
  categoriesService: CategoriesService
}

export function createAppRouter(services: RouterServices) {
  return {
    auth: createAuthRouter(services.authService),
    restaurant: createRestaurantRouter(services.restaurantsService),
    products: createProductsRouter(services.productsService),
    categories: createCategoriesRouter(services.categoriesService),
    menu: createMenuRouter(services.restaurantsService, services.productsService, services.reviewsService, services.categoriesService),
    reviews: createReviewsRouter(services.reviewsService),
  }
}

export type AppRouter = ReturnType<typeof createAppRouter>
