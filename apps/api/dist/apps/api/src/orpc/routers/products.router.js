"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductsRouter = createProductsRouter;
const middleware_1 = require("../middleware");
const schemas_1 = require("../../../../../packages/schemas/src/index.ts");
function createProductsRouter(productsService) {
    return {
        list: middleware_1.protectedProcedure
            .input(schemas_1.ProductFiltersSchema.optional())
            .handler(async ({ input, context }) => {
            const products = await productsService.findByRestaurant(context.restaurant.id, input);
            return products.map((p) => productsService.toPublic(p));
        }),
        create: middleware_1.protectedProcedure
            .input(schemas_1.CreateProductSchema)
            .handler(async ({ input, context }) => {
            const product = await productsService.create(context.restaurant.id, input);
            return productsService.toPublic(product);
        }),
        update: middleware_1.protectedProcedure
            .input(schemas_1.IdSchema.merge(schemas_1.UpdateProductSchema))
            .handler(async ({ input, context }) => {
            const { id, ...data } = input;
            const product = await productsService.update(id, context.restaurant.id, data);
            return productsService.toPublic(product);
        }),
        delete: middleware_1.protectedProcedure
            .input(schemas_1.IdSchema)
            .handler(async ({ input, context }) => {
            return productsService.remove(input.id, context.restaurant.id);
        }),
    };
}
//# sourceMappingURL=products.router.js.map