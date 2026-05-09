import { IncomingMessage } from 'http'
import { JwtService } from '@nestjs/jwt'

export interface ORPCContext {
  restaurant: { id: string; email: string; slug: string } | null
  rawRequest: IncomingMessage
}

export function createContextBuilder(jwtService: JwtService) {
  return async (req: IncomingMessage): Promise<ORPCContext> => {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return { restaurant: null, rawRequest: req }
    }

    const token = authHeader.slice(7)
    try {
      const payload = jwtService.verify<{ sub: string; email: string; slug: string }>(token)
      return {
        restaurant: { id: payload.sub, email: payload.email, slug: payload.slug },
        rawRequest: req,
      }
    } catch {
      return { restaurant: null, rawRequest: req }
    }
  }
}
