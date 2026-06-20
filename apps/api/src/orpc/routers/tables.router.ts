import { publicProcedure, protectedProcedure } from '../middleware'
import { CreateTableSchema, GetTableByIdSchema, DeleteTableSchema } from '@repo/schemas'
import type { TablesService } from '../../modules/tables/tables.service'

export function createTablesRouter(tablesService: TablesService) {
  return {
    list: protectedProcedure
      .handler(async ({ context }) => {
        const tables = await tablesService.findByRestaurant(context.restaurant.id)
        return tables.map((t) => tablesService.toPublic(t))
      }),

    create: protectedProcedure
      .input(CreateTableSchema)
      .handler(async ({ input, context }) => {
        const table = await tablesService.create(input, context.restaurant.id)
        return tablesService.toPublic(table)
      }),

    delete: protectedProcedure
      .input(DeleteTableSchema)
      .handler(async ({ input, context }) => {
        return tablesService.delete(input.id, context.restaurant.id)
      }),

    getById: publicProcedure
      .input(GetTableByIdSchema)
      .handler(async ({ input }) => {
        const table = await tablesService.findById(input.id)
        return tablesService.toPublic(table)
      }),
  }
}
