import { Injectable, NestMiddleware, Inject } from '@nestjs/common'
import { RPCHandler } from '@orpc/server/node'
import { JwtService } from '@nestjs/jwt'
import { AuthService } from '../modules/auth/auth.service'
import { RestaurantsService } from '../modules/restaurants/restaurants.service'
import { ProductsService } from '../modules/products/products.service'
import { ReviewsService } from '../modules/reviews/reviews.service'
import { createAppRouter } from './router'
import { createContextBuilder } from './context'

@Injectable()
export class RpcMiddleware implements NestMiddleware {
  private readonly rpcHandler: RPCHandler<any>
  private readonly buildContext: (req: any) => Promise<any>

  constructor(
    @Inject(AuthService) authService: AuthService,
    @Inject(RestaurantsService) restaurantsService: RestaurantsService,
    @Inject(ProductsService) productsService: ProductsService,
    @Inject(ReviewsService) reviewsService: ReviewsService,
    @Inject(JwtService) jwtService: JwtService,
  ) {
    const appRouter = createAppRouter({ authService, restaurantsService, productsService, reviewsService })
    this.rpcHandler = new RPCHandler(appRouter)
    this.buildContext = createContextBuilder(jwtService)
  }

  async use(req: any, res: any, next: () => void) {
    const fullPath: string = req.originalUrl || req.url || '/'

    // Apenas processa requisições /rpc
    if (!fullPath.startsWith('/rpc')) return next()

    console.log(`[oRPC] ${req.method} ${fullPath}`)

    const savedOriginalUrl = req.originalUrl
    const savedUrl = req.url

    const stripped = fullPath.replace(/^\/rpc/, '') || '/'
    req.originalUrl = stripped
    req.url = stripped

    try {
      const context = await this.buildContext(req)
      const { matched } = await this.rpcHandler.handle(req, res, { context })
      if (!matched) {
        console.log(`[oRPC] não correspondeu: ${stripped}`)
        req.originalUrl = savedOriginalUrl
        req.url = savedUrl
        next()
      }
    } catch (err) {
      console.error(`[oRPC] erro:`, err)
      req.originalUrl = savedOriginalUrl
      req.url = savedUrl
      next(err)
    }
  }
}
