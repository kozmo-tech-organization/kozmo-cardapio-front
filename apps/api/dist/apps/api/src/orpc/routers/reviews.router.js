"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewsRouter = createReviewsRouter;
const zod_1 = require("zod");
const middleware_1 = require("../middleware");
const schemas_1 = require("../../../../../packages/schemas/src/index.ts");
function createReviewsRouter(reviewsService) {
    return {
        create: middleware_1.publicProcedure
            .input(schemas_1.CreateReviewSchema)
            .handler(async ({ input }) => {
            const review = await reviewsService.create(input);
            return reviewsService.toPublic(review);
        }),
        listByProduct: middleware_1.publicProcedure
            .input(zod_1.z.object({ productId: zod_1.z.string().uuid() }))
            .handler(async ({ input }) => {
            const reviews = await reviewsService.findByProduct(input.productId);
            return reviews.map((r) => reviewsService.toPublic(r));
        }),
    };
}
//# sourceMappingURL=reviews.router.js.map