import { publicProcedure } from '../middleware'
import { LoginSchema, RegisterSchema } from '@repo/schemas'
import type { AuthService } from '../../modules/auth/auth.service'

export function createAuthRouter(authService: AuthService) {
  return {
    login: publicProcedure
      .input(LoginSchema)
      .handler(async ({ input }) => {
        return authService.login(input)
      }),

    register: publicProcedure
      .input(RegisterSchema)
      .handler(async ({ input }) => {
        return authService.register(input)
      }),
  }
}
