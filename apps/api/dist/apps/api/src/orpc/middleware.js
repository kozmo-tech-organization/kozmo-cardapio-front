"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectedProcedure = exports.publicProcedure = void 0;
const server_1 = require("@orpc/server");
const server_2 = require("@orpc/server");
const base = server_1.os.$context();
exports.publicProcedure = base;
exports.protectedProcedure = base.use(({ context, next }) => {
    if (!context.restaurant) {
        throw new server_2.ORPCError('UNAUTHORIZED', { message: 'Authentication required' });
    }
    return next({
        context: {
            ...context,
            restaurant: context.restaurant,
        },
    });
});
//# sourceMappingURL=middleware.js.map