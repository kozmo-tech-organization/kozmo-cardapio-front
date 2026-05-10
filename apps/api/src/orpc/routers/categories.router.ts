import { z } from 'zod'
import { protectedProcedure } from '../middleware'
import { CreateCategorySchema, UpdateCategorySchema, IdSchema } from '@repo/schemas'
import type { CategoriesService } from '../../modules/categories/categories.service'

export function createCategoriesRouter(categoriesService: CategoriesService) {
  return {
    list: protectedProcedure.handler(async ({ context }) => {
      const categories = await categoriesService.findByRestaurant(context.restaurant.id)
      return categories.map((c) => categoriesService.toPublic(c))
    }),

    create: protectedProcedure
      .input(CreateCategorySchema)
      .handler(async ({ input, context }) => {
        const category = await categoriesService.create(context.restaurant.id, input)
        return categoriesService.toPublic(category)
      }),

    update: protectedProcedure
      .input(IdSchema.merge(UpdateCategorySchema))
      .handler(async ({ input, context }) => {
        const { id, ...data } = input
        const category = await categoriesService.update(id, context.restaurant.id, data)
        return categoriesService.toPublic(category)
      }),

    delete: protectedProcedure
      .input(IdSchema)
      .handler(async ({ input, context }) => {
        return categoriesService.remove(input.id, context.restaurant.id)
      }),

    setProducts: protectedProcedure
      .input(z.object({ categoryId: z.string().uuid(), productIds: z.array(z.string().uuid()) }))
      .handler(async ({ input, context }) => {
        const category = await categoriesService.setProducts(
          input.categoryId,
          context.restaurant.id,
          input.productIds,
        )
        return categoriesService.toPublic(category)
      }),
  }
}
