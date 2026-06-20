import { z } from 'zod'

export const WaiterCallStatusSchema = z.enum(['pending', 'accepted', 'waiting', 'completed', 'declined'])

export const CreateWaiterCallSchema = z.object({
  restaurantId: z.string().uuid(),
  tableId: z.string().uuid(),
  tableNumber: z.number().int(),
  tableName: z.string(),
})

export const UpdateWaiterCallStatusSchema = z.object({
  id: z.string().uuid(),
  status: WaiterCallStatusSchema,
})

export const WaiterCallSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid(),
  tableId: z.string().uuid(),
  tableNumber: z.number().int(),
  tableName: z.string(),
  status: WaiterCallStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type WaiterCallStatus = z.infer<typeof WaiterCallStatusSchema>
export type CreateWaiterCallInput = z.infer<typeof CreateWaiterCallSchema>
export type UpdateWaiterCallStatusInput = z.infer<typeof UpdateWaiterCallStatusSchema>
export type WaiterCall = z.infer<typeof WaiterCallSchema>
