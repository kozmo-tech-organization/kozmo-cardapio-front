import { z } from 'zod'

export const OrderItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
})

export const OrderStatusSchema = z.enum(['pending', 'accepted', 'rejected'])

export const CreateOrderSchema = z.object({
  restaurantId: z.string().uuid(),
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  orderType: z.enum(['pickup', 'delivery']),
  deliveryAddress: z.string().nullable().optional(),
  tableNumber: z.string().nullable().optional(),
  items: z.array(OrderItemSchema).min(1),
  total: z.number().min(0),
})

export const UpdateOrderStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['accepted', 'rejected']),
})

export const OrderSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid(),
  customerName: z.string(),
  customerPhone: z.string(),
  orderType: z.enum(['pickup', 'delivery']),
  deliveryAddress: z.string().nullable(),
  tableNumber: z.string().nullable(),
  items: z.array(OrderItemSchema),
  total: z.number(),
  status: OrderStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type OrderItem = z.infer<typeof OrderItemSchema>
export type OrderStatus = z.infer<typeof OrderStatusSchema>
export type Order = z.infer<typeof OrderSchema>
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>
