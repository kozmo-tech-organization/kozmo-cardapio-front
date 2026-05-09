"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_1 = require("@orpc/server/node");
const app_module_1 = require("./app.module");
const auth_service_1 = require("./modules/auth/auth.service");
const restaurants_service_1 = require("./modules/restaurants/restaurants.service");
const products_service_1 = require("./modules/products/products.service");
const reviews_service_1 = require("./modules/reviews/reviews.service");
const jwt_1 = require("@nestjs/jwt");
const router_1 = require("./orpc/router");
const context_1 = require("./orpc/context");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 3001);
    const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:5173');
    app.enableCors({
        origin: corsOrigin,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    await app.init();
    const authService = app.get(auth_service_1.AuthService);
    const restaurantsService = app.get(restaurants_service_1.RestaurantsService);
    const productsService = app.get(products_service_1.ProductsService);
    const reviewsService = app.get(reviews_service_1.ReviewsService);
    const jwtService = app.get(jwt_1.JwtService);
    const appRouter = (0, router_1.createAppRouter)({
        authService,
        restaurantsService,
        productsService,
        reviewsService,
    });
    const buildContext = (0, context_1.createContextBuilder)(jwtService);
    const rpcHandler = new node_1.RPCHandler(appRouter);
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use('/rpc', async (req, res, next) => {
        const context = await buildContext(req);
        const { matched } = await rpcHandler.handle(req, res, { context });
        if (!matched)
            next();
    });
    await app.listen(port);
    console.log(`API running on http://localhost:${port}`);
    console.log(`RPC endpoint: http://localhost:${port}/rpc`);
}
bootstrap();
//# sourceMappingURL=main.js.map