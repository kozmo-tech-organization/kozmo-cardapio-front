import { publicProcedure, protectedProcedure } from '../middleware'
import { CreateOrderSchema, UpdateOrderStatusSchema } from '@repo/schemas'
import type { OrdersService } from '../../modules/orders/orders.service'

export function createOrdersRouter(ordersService: OrdersService) {
  return {
    create: publicProcedure
      .input(CreateOrderSchema)
      .handler(async ({ input }) => {
        const order = await ordersService.create(input)
        return ordersService.toPublic(order)
      }),

    list: protectedProcedure
      .handler(async ({ context }) => {
        const orders = await ordersService.findByRestaurant(context.restaurant.id)
        return orders.map((o) => ordersService.toPublic(o))
      }),

    updateStatus: protectedProcedure
      .input(UpdateOrderStatusSchema)
      .handler(async ({ input, context }) => {
        const order = await ordersService.updateStatus(input, context.restaurant.id)
        return ordersService.toPublic(order)
      }),
  }
}
