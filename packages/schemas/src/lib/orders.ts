import { z } from 'zod'

export const SelectedOptionSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  itemId: z.string(),
  itemName: z.string(),
  priceAdd: z.number().min(0),
})

export const OrderItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  selectedOptions: z.array(SelectedOptionSchema).optional().default([]),
  observation: z.string().optional().default(''),
})

export const OrderStatusSchema = z.enum(['pending', 'accepted', 'preparing', 'ready', 'delivered', 'rejected'])

export const CreateOrderSchema = z.object({
  restaurantId: z.string().uuid(),
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  orderType: z.enum(['pickup', 'delivery']),
  deliveryAddress: z.string().nullable().optional(),
  tableNumber: z.string().nullable().optional(),
  items: z.array(OrderItemSchema).min(1),
  total: z.number().min(0),
  couponCode: z.string().optional(),
  discountAmount: z.number().min(0).optional().default(0),
})

export const UpdateOrderStatusSchema = z.object({
  id: z.string().uuid(),
  status: OrderStatusSchema,
})

export const GetOrderByIdSchema = z.object({
  id: z.string().uuid(),
})

export const CustomerSummarySchema = z.object({
  customerName: z.string(),
  customerPhone: z.string(),
  ordersCount: z.number().int(),
  totalSpent: z.number(),
  lastOrderAt: z.string().datetime(),
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
  discountAmount: z.number(),
  couponCode: z.string().nullable(),
  status: OrderStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type SelectedOption = z.infer<typeof SelectedOptionSchema>
export type OrderItem = z.infer<typeof OrderItemSchema>
export type OrderStatus = z.infer<typeof OrderStatusSchema>
export type Order = z.infer<typeof OrderSchema>
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>
export type CustomerSummary = z.infer<typeof CustomerSummarySchema>
