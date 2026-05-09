"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRestaurantSchema = exports.RestaurantSchema = exports.ThemeSchema = void 0;
const zod_1 = require("zod");
exports.ThemeSchema = zod_1.z.object({
    primaryColor: zod_1.z.string().default('#000000'),
    secondaryColor: zod_1.z.string().default('#ffffff'),
    accentColor: zod_1.z.string().default('#ff6b35'),
    fontFamily: zod_1.z.string().default('Inter'),
});
exports.RestaurantSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    slug: zod_1.z.string(),
    email: zod_1.z.string().email(),
    theme: exports.ThemeSchema,
    logoUrl: zod_1.z.string().url().nullable(),
    bannerUrl: zod_1.z.string().url().nullable(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.UpdateRestaurantSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    theme: exports.ThemeSchema.partial().optional(),
    logoUrl: zod_1.z.string().url().nullable().optional(),
    bannerUrl: zod_1.z.string().url().nullable().optional(),
});
//# sourceMappingURL=restaurant.js.map