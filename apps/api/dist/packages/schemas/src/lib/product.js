"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductFiltersSchema = exports.UpdateProductSchema = exports.CreateProductSchema = exports.ProductSchema = void 0;
const zod_1 = require("zod");
exports.ProductSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    restaurantId: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    price: zod_1.z.number().positive(),
    preparationTimeMinutes: zod_1.z.number().int().positive(),
    description: zod_1.z.string(),
    imageUrl: zod_1.z.string().url().nullable(),
    inStock: zod_1.z.boolean(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.CreateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    price: zod_1.z.number().positive(),
    preparationTimeMinutes: zod_1.z.number().int().positive(),
    description: zod_1.z.string().min(5),
    imageUrl: zod_1.z.string().url().nullable().optional(),
    inStock: zod_1.z.boolean().default(true),
});
exports.UpdateProductSchema = exports.CreateProductSchema.partial();
exports.ProductFiltersSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    inStock: zod_1.z.boolean().optional(),
    minPrice: zod_1.z.number().positive().optional(),
    maxPrice: zod_1.z.number().positive().optional(),
});
//# sourceMappingURL=product.js.map