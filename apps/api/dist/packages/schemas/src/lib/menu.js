"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuSchema = exports.MenuProductSchema = void 0;
const zod_1 = require("zod");
const product_1 = require("./product");
const restaurant_1 = require("./restaurant");
const review_1 = require("./review");
exports.MenuProductSchema = product_1.ProductSchema.extend({
    reviews: zod_1.z.array(review_1.ReviewSchema),
    averageRating: zod_1.z.number().nullable(),
});
exports.MenuSchema = zod_1.z.object({
    restaurant: restaurant_1.RestaurantSchema,
    products: zod_1.z.array(exports.MenuProductSchema),
});
//# sourceMappingURL=menu.js.map