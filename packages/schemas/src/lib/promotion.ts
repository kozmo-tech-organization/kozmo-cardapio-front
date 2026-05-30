import { z } from 'zod'

export const PromotionSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid(),
  name: z.string(),
  discountPercent: z.number().min(1).max(100),
  active: z.boolean(),
  productIds: z.array(z.string().uuid()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CreatePromotionSchema = z.object({
  name: z.string().min(2),
  discountPercent: z.number().min(1).max(100),
  active: z.boolean().default(true),
})

export const UpdatePromotionSchema = CreatePromotionSchema.partial()

export type Promotion = z.infer<typeof PromotionSchema>
export type CreatePromotionInput = z.infer<typeof CreatePromotionSchema>
export type UpdatePromotionInput = z.infer<typeof UpdatePromotionSchema>
