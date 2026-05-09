"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRouter = createAuthRouter;
const middleware_1 = require("../middleware");
const schemas_1 = require("../../../../../packages/schemas/src/index.ts");
function createAuthRouter(authService) {
    return {
        login: middleware_1.publicProcedure
            .input(schemas_1.LoginSchema)
            .handler(async ({ input }) => {
            return authService.login(input);
        }),
        register: middleware_1.publicProcedure
            .input(schemas_1.RegisterSchema)
            .handler(async ({ input }) => {
            return authService.register(input);
        }),
    };
}
//# sourceMappingURL=auth.router.js.map