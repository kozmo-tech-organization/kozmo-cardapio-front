import { z } from 'zod'
import { ProductSchema } from './product'
import { RestaurantSchema } from './restaurant'
import { ReviewSchema } from './review'

export const MenuProductSchema = ProductSchema.extend({
  reviews: z.array(ReviewSchema),
  averageRating: z.number().nullable(),
})

export const MenuSchema = z.object({
  restaurant: RestaurantSchema,
  products: z.array(MenuProductSchema),
})

export type MenuProduct = z.infer<typeof MenuProductSchema>
export type Menu = z.infer<typeof MenuSchema>
