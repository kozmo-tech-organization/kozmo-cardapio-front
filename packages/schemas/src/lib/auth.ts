import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
})

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  restaurant: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
    slug: z.string(),
  }),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
