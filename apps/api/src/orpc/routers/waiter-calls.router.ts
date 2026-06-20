import { publicProcedure, protectedProcedure } from '../middleware'
import { CreateWaiterCallSchema, UpdateWaiterCallStatusSchema } from '@repo/schemas'
import { z } from 'zod'
import type { WaiterCallsService } from '../../modules/waiter-calls/waiter-calls.service'

export function createWaiterCallsRouter(waiterCallsService: WaiterCallsService) {
  return {
    create: publicProcedure
      .input(CreateWaiterCallSchema)
      .handler(async ({ input }) => {
        const call = await waiterCallsService.create(input)
        return waiterCallsService.toPublic(call)
      }),

    getById: publicProcedure
      .input(z.object({ id: z.string().uuid() }))
      .handler(async ({ input }) => {
        const call = await waiterCallsService.findById(input.id)
        return waiterCallsService.toPublic(call)
      }),

    list: protectedProcedure
      .handler(async ({ context }) => {
        const calls = await waiterCallsService.findByRestaurant(context.restaurant.id)
        return calls.map((c) => waiterCallsService.toPublic(c))
      }),

    updateStatus: protectedProcedure
      .input(UpdateWaiterCallStatusSchema)
      .handler(async ({ input, context }) => {
        const call = await waiterCallsService.updateStatus(input, context.restaurant.id)
        return waiterCallsService.toPublic(call)
      }),
  }
}
