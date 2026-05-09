"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReviewSchema = exports.ReviewSchema = void 0;
const zod_1 = require("zod");
exports.ReviewSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    productId: zod_1.z.string().uuid(),
    clientName: zod_1.z.string(),
    comment: zod_1.z.string(),
    rating: zod_1.z.number().int().min(1).max(5),
    createdAt: zod_1.z.string().datetime(),
});
exports.CreateReviewSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    clientName: zod_1.z.string().min(2),
    comment: zod_1.z.string().min(5),
    rating: zod_1.z.number().int().min(1).max(5),
});
//# sourceMappingURL=review.js.map