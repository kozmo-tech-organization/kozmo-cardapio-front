import { z } from 'zod'

export const CategorySchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid(),
  title: z.string(),
  subtitle: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
  order: z.number().int(),
  status: z.boolean(),
  productIds: z.array(z.string().uuid()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CreateCategorySchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  order: z.number().int().min(0).default(0),
  status: z.boolean().default(false),
})

export const UpdateCategorySchema = CreateCategorySchema.partial()

export const SetCategoryProductsSchema = z.object({
  categoryId: z.string().uuid(),
  productIds: z.array(z.string().uuid()),
})

export type Category = z.infer<typeof CategorySchema>
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>
export type SetCategoryProductsInput = z.infer<typeof SetCategoryProductsSchema>
