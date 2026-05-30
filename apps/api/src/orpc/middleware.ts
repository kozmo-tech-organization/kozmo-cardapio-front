import { os } from '@orpc/server'
import { ORPCError } from '@orpc/server'
import { HttpException } from '@nestjs/common'
import type { ORPCContext } from './context'

function httpStatusToORPCCode(status: number): string {
  const map: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_CONTENT',
    429: 'TOO_MANY_REQUESTS',
  }
  return map[status] ?? 'INTERNAL_SERVER_ERROR'
}

const base = os.$context<ORPCContext>().use(async ({ next }) => {
  try {
    return await next()
  } catch (err) {
    if (err instanceof HttpException) {
      const status = err.getStatus()
      const response = err.getResponse()
      const message =
        typeof response === 'string'
          ? response
          : (response as Record<string, unknown>).message?.toString() ?? err.message
      throw new ORPCError(httpStatusToORPCCode(status) as any, { message, status })
    }
    throw err
  }
})

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
