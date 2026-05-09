import { protectedProcedure } from '../middleware'
import { CreateProductSchema, UpdateProductSchema, ProductFiltersSchema, IdSchema } from '@repo/schemas'
import type { ProductsService } from '../../modules/products/products.service'

export function createProductsRouter(productsService: ProductsService) {
  return {
    list: protectedProcedure
      .input(ProductFiltersSchema.optional())
      .handler(async ({ input, context }) => {
        const products = await productsService.findByRestaurant(context.restaurant.id, input)
        return products.map((p) => productsService.toPublic(p))
      }),

    create: protectedProcedure
      .input(CreateProductSchema)
      .handler(async ({ input, context }) => {
        const product = await productsService.create(context.restaurant.id, input)
        return productsService.toPublic(product)
      }),

    update: protectedProcedure
      .input(IdSchema.merge(UpdateProductSchema))
      .handler(async ({ input, context }) => {
        const { id, ...data } = input
        const product = await productsService.update(id, context.restaurant.id, data)
        return productsService.toPublic(product)
      }),

    delete: protectedProcedure
      .input(IdSchema)
      .handler(async ({ input, context }) => {
        return productsService.remove(input.id, context.restaurant.id)
      }),
  }
}
