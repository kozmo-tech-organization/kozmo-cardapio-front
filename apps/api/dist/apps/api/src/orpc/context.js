"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContextBuilder = createContextBuilder;
function createContextBuilder(jwtService) {
    return async (req) => {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return { restaurant: null, rawRequest: req };
        }
        const token = authHeader.slice(7);
        try {
            const payload = jwtService.verify(token);
            return {
                restaurant: { id: payload.sub, email: payload.email, slug: payload.slug },
                rawRequest: req,
            };
        }
        catch {
            return { restaurant: null, rawRequest: req };
        }
    };
}
//# sourceMappingURL=context.js.map