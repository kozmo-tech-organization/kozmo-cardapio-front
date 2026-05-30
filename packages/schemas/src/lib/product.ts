import { z } from 'zod'

export const OptionItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceAdd: z.number().min(0),
})

export const OptionGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  required: z.boolean().default(false),
  min: z.number().int().min(0).default(0),
  max: z.number().int().min(1).default(1),
  items: z.array(OptionItemSchema).min(1),
})

export const ProductSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid(),
  name: z.string(),
  price: z.number().positive(),
  preparationTimeMinutes: z.number().int().positive(),
  description: z.string(),
  imageUrl: z.string().url().nullable(),
  inStock: z.boolean(),
  options: z.array(OptionGroupSchema).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CreateProductSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  preparationTimeMinutes: z.number().int().positive(),
  description: z.string().min(5),
  imageUrl: z.string().url().nullable().optional(),
  inStock: z.boolean().default(true),
  options: z.array(OptionGroupSchema).optional().default([]),
})

export const UpdateProductSchema = CreateProductSchema.partial()

export const ProductFiltersSchema = z.object({
  search: z.string().optional(),
  inStock: z.boolean().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
})

export type OptionItem = z.infer<typeof OptionItemSchema>
export type OptionGroup = z.infer<typeof OptionGroupSchema>
export type Product = z.infer<typeof ProductSchema>
export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>
export type ProductFilters = z.infer<typeof ProductFiltersSchema>
