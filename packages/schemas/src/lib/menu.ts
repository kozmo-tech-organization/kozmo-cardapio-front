import { z } from 'zod'
import { ProductSchema } from './product'
import { RestaurantSchema } from './restaurant'
import { ReviewSchema } from './review'

export const MenuProductSchema = ProductSchema.extend({
  reviews: z.array(ReviewSchema),
  averageRating: z.number().nullable(),
})

export const MenuCategorySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  subtitle: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
  order: z.number().int(),
  products: z.array(MenuProductSchema),
})

export const MenuSchema = z.object({
  restaurant: RestaurantSchema,
  categories: z.array(MenuCategorySchema),
  products: z.array(MenuProductSchema),
  uncategorizedProducts: z.array(MenuProductSchema),
})

export type MenuProduct = z.infer<typeof MenuProductSchema>
export type MenuCategory = z.infer<typeof MenuCategorySchema>
export type Menu = z.infer<typeof MenuSchema>
