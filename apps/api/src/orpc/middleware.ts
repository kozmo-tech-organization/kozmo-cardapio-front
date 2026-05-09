import { os } from '@orpc/server'
import { ORPCError } from '@orpc/server'
import type { ORPCContext } from './context'

const base = os.$context<ORPCContext>()

export const publicProcedure = base

export const protectedProcedure = base.use(({ context, next }) => {
  if (!context.restaurant) {
    throw new ORPCError('UNAUTHORIZED', { message: 'Authentication required' })
  }
  return next({
    context: {
      ...context,
      restaurant: context.restaurant,
    },
  })
})
