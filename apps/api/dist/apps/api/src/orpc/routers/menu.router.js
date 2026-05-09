"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMenuRouter = createMenuRouter;
const zod_1 = require("zod");
const middleware_1 = require("../middleware");
function createMenuRouter(restaurantsService, productsService, reviewsService) {
    return {
        getBySlug: middleware_1.publicProcedure
            .input(zod_1.z.object({ slug: zod_1.z.string() }))
            .handler(async ({ input }) => {
            const restaurant = await restaurantsService.findBySlug(input.slug);
            const products = await productsService.findByRestaurant(restaurant.id, { inStock: true });
            const productsWithReviews = await Promise.all(products.map(async (product) => {
                const reviews = await reviewsService.findByProduct(product.id);
                return {
                    ...productsService.toPublic(product),
                    reviews: reviews.map((r) => reviewsService.toPublic(r)),
                    averageRating: reviewsService.getAverageRating(reviews),
                };
            }));
            return {
                restaurant: restaurantsService.toPublic(restaurant),
                products: productsWithReviews,
            };
        }),
    };
}
//# sourceMappingURL=menu.router.js.map