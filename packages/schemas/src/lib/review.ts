import { z } from 'zod'

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  clientName: z.string(),
  comment: z.string(),
  rating: z.number().int().min(1).max(5),
  createdAt: z.string().datetime(),
})

export const CreateReviewSchema = z.object({
  productId: z.string().uuid(),
  clientName: z.string().min(2),
  comment: z.string().min(5),
  rating: z.number().int().min(1).max(5),
})

export type Review = z.infer<typeof ReviewSchema>
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>
