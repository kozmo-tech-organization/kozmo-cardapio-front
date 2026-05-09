"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthResponseSchema = exports.RegisterSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().min(2),
});
exports.AuthResponseSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
    restaurant: zod_1.z.object({
        id: zod_1.z.string().uuid(),
        email: zod_1.z.string().email(),
        name: zod_1.z.string(),
        slug: zod_1.z.string(),
    }),
});
//# sourceMappingURL=auth.js.map