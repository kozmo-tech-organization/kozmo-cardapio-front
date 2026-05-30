import { z } from 'zod'
import { ProductSchema } from './product'
import { RestaurantSchema } from './restaurant'
import { ReviewSchema } from './review'

export const MenuProductSchema = ProductSchema.extend({
  reviews: z.array(ReviewSchema),
  averageRating: z.number().nullable(),
})
// options already included from ProductSchema

export const MenuCategorySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  subtitle: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
  order: z.number().int(),
  products: z.array(MenuProductSchema),
})

export const MenuPromotionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  discountPercent: z.number(),
  productIds: z.array(z.string().uuid()),
})

export const MenuSchema = z.object({
  restaurant: RestaurantSchema,
  categories: z.array(MenuCategorySchema),
  products: z.array(MenuProductSchema),
  uncategorizedProducts: z.array(MenuProductSchema),
  promotions: z.array(MenuPromotionSchema),
})

export type MenuProduct = z.infer<typeof MenuProductSchema>
export type MenuCategory = z.infer<typeof MenuCategorySchema>
export type MenuPromotion = z.infer<typeof MenuPromotionSchema>
export type Menu = z.infer<typeof MenuSchema>
