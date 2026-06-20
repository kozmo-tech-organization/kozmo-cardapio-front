import { z } from 'zod'

export const CreateTableSchema = z.object({
  name: z.string().min(1).max(50),
  number: z.number().int().min(1),
})

export const TableSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid(),
  name: z.string(),
  number: z.number().int(),
  createdAt: z.string().datetime(),
})

export const GetTableByIdSchema = z.object({
  id: z.string().uuid(),
})

export const DeleteTableSchema = z.object({
  id: z.string().uuid(),
})

export type CreateTableInput = z.infer<typeof CreateTableSchema>
export type Table = z.infer<typeof TableSchema>
export type GetTableByIdInput = z.infer<typeof GetTableByIdSchema>
