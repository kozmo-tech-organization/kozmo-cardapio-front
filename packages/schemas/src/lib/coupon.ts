import { z } from 'zod'

export const CouponSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid(),
  code: z.string(),
  discountType: z.enum(['percent', 'fixed']),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().min(0).nullable(),
  maxUses: z.number().int().positive().nullable(),
  usesCount: z.number().int().min(0),
  expiresAt: z.string().datetime().nullable(),
  active: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CreateCouponSchema = z.object({
  code: z.string().min(2).max(20).toUpperCase(),
  discountType: z.enum(['percent', 'fixed']),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().min(0).nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  active: z.boolean().default(true),
})

export const UpdateCouponSchema = CreateCouponSchema.partial()

export const ValidateCouponSchema = z.object({
  restaurantId: z.string().uuid(),
  code: z.string(),
  orderTotal: z.number().min(0),
})

export const ValidateCouponResultSchema = z.object({
  valid: z.boolean(),
  coupon: CouponSchema.nullable(),
  discountAmount: z.number(),
  message: z.string().optional(),
})

export type Coupon = z.infer<typeof CouponSchema>
export type CreateCouponInput = z.infer<typeof CreateCouponSchema>
export type UpdateCouponInput = z.infer<typeof UpdateCouponSchema>
export type ValidateCouponInput = z.infer<typeof ValidateCouponSchema>
export type ValidateCouponResult = z.infer<typeof ValidateCouponResultSchema>
