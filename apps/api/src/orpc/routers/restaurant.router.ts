import { protectedProcedure } from '../middleware'
import { UpdateRestaurantSchema } from '@repo/schemas'
import type { RestaurantsService } from '../../modules/restaurants/restaurants.service'

export function createRestaurantRouter(restaurantsService: RestaurantsService) {
  return {
    me: protectedProcedure
      .handler(async ({ context }) => {
        const restaurant = await restaurantsService.findById(context.restaurant.id)
        return restaurantsService.toPublic(restaurant)
      }),

    update: protectedProcedure
      .input(UpdateRestaurantSchema)
      .handler(async ({ input, context }) => {
        const restaurant = await restaurantsService.update(context.restaurant.id, input)
        return restaurantsService.toPublic(restaurant)
      }),
  }
}
