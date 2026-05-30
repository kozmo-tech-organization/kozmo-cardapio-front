import { publicProcedure, protectedProcedure } from '../middleware'
import { CreateCouponSchema, UpdateCouponSchema, ValidateCouponSchema } from '@repo/schemas'
import { z } from 'zod'
import type { CouponsService } from '../../modules/coupons/coupons.service'

export function createCouponsRouter(couponsService: CouponsService) {
  return {
    list: protectedProcedure.handler(async ({ context }) => {
      const coupons = await couponsService.findByRestaurant(context.restaurant.id)
      return coupons.map((c) => couponsService.toPublic(c))
    }),

    create: protectedProcedure
      .input(CreateCouponSchema)
      .handler(async ({ input, context }) => {
        const coupon = await couponsService.create(context.restaurant.id, input)
        return couponsService.toPublic(coupon)
      }),

    update: protectedProcedure
      .input(z.object({ id: z.string().uuid() }).merge(UpdateCouponSchema))
      .handler(async ({ input, context }) => {
        const { id, ...data } = input
        const coupon = await couponsService.update(id, context.restaurant.id, data)
        return couponsService.toPublic(coupon)
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .handler(async ({ input, context }) => {
        return couponsService.remove(input.id, context.restaurant.id)
      }),

    validate: publicProcedure
      .input(ValidateCouponSchema)
      .handler(async ({ input }) => {
        return couponsService.validate(input)
      }),
  }
}
