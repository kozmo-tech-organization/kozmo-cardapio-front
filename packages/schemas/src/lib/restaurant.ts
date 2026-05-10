import { z } from 'zod'

export const ThemeSchema = z.object({
  primaryColor: z.string().default('#000000'),
  secondaryColor: z.string().default('#ffffff'),
  accentColor: z.string().default('#ff6b35'),
  fontFamily: z.string().default('Inter'),
})

export const RestaurantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  email: z.string().email(),
  theme: ThemeSchema,
  logoUrl: z.string().url().nullable(),
  bannerUrl: z.string().url().nullable(),
  whatsappPhone: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const UpdateRestaurantSchema = z.object({
  name: z.string().min(2).optional(),
  theme: ThemeSchema.partial().optional(),
  logoUrl: z.string().url().nullable().optional(),
  bannerUrl: z.string().url().nullable().optional(),
  whatsappPhone: z.string().nullable().optional(),
})

export type Theme = z.infer<typeof ThemeSchema>
export type Restaurant = z.infer<typeof RestaurantSchema>
export type UpdateRestaurantInput = z.infer<typeof UpdateRestaurantSchema>
