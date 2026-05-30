import { z } from 'zod'
import { protectedProcedure } from '../middleware'
import { CreatePromotionSchema, UpdatePromotionSchema, IdSchema } from '@repo/schemas'
import type { PromotionsService } from '../../modules/promotions/promotions.service'

export function createPromotionsRouter(promotionsService: PromotionsService) {
  return {
    list: protectedProcedure.handler(async ({ context }) => {
      const promotions = await promotionsService.findByRestaurant(context.restaurant.id)
      return promotions.map((p) => promotionsService.toPublic(p))
    }),

    create: protectedProcedure
      .input(CreatePromotionSchema)
      .handler(async ({ input, context }) => {
        const promotion = await promotionsService.create(context.restaurant.id, input)
        return promotionsService.toPublic(promotion)
      }),

    update: protectedProcedure
      .input(IdSchema.merge(UpdatePromotionSchema))
      .handler(async ({ input, context }) => {
        const { id, ...data } = input
        const promotion = await promotionsService.update(id, context.restaurant.id, data)
        return promotionsService.toPublic(promotion)
      }),

    delete: protectedProcedure
      .input(IdSchema)
      .handler(async ({ input, context }) => {
        return promotionsService.remove(input.id, context.restaurant.id)
      }),

    setProducts: protectedProcedure
      .input(z.object({ promotionId: z.string().uuid(), productIds: z.array(z.string().uuid()) }))
      .handler(async ({ input, context }) => {
        const promotion = await promotionsService.setProducts(
          input.promotionId,
          context.restaurant.id,
          input.productIds,
        )
        return promotionsService.toPublic(promotion)
      }),
  }
}
