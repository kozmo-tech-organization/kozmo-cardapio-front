"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdSchema = exports.PaginationSchema = void 0;
const zod_1 = require("zod");
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z.number().int().min(1).default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
});
exports.IdSchema = zod_1.z.object({ id: zod_1.z.string().uuid() });
//# sourceMappingURL=shared.js.map