"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppRouter = createAppRouter;
const auth_router_1 = require("./routers/auth.router");
const restaurant_router_1 = require("./routers/restaurant.router");
const products_router_1 = require("./routers/products.router");
const menu_router_1 = require("./routers/menu.router");
const reviews_router_1 = require("./routers/reviews.router");
function createAppRouter(services) {
    return {
        auth: (0, auth_router_1.createAuthRouter)(services.authService),
        restaurant: (0, restaurant_router_1.createRestaurantRouter)(services.restaurantsService),
        products: (0, products_router_1.createProductsRouter)(services.productsService),
        menu: (0, menu_router_1.createMenuRouter)(services.restaurantsService, services.productsService, services.reviewsService),
        reviews: (0, reviews_router_1.createReviewsRouter)(services.reviewsService),
    };
}
//# sourceMappingURL=router.js.map