"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRestaurantRouter = createRestaurantRouter;
const middleware_1 = require("../middleware");
const schemas_1 = require("../../../../../packages/schemas/src/index.ts");
function createRestaurantRouter(restaurantsService) {
    return {
        me: middleware_1.protectedProcedure
            .handler(async ({ context }) => {
            const restaurant = await restaurantsService.findById(context.restaurant.id);
            return restaurantsService.toPublic(restaurant);
        }),
        update: middleware_1.protectedProcedure
            .input(schemas_1.UpdateRestaurantSchema)
            .handler(async ({ input, context }) => {
            const restaurant = await restaurantsService.update(context.restaurant.id, input);
            return restaurantsService.toPublic(restaurant);
        }),
    };
}
//# sourceMappingURL=restaurant.router.js.map