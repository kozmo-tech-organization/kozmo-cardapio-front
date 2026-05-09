"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
const getDatabaseConfig = (config) => ({
    type: 'postgres',
    host: config.get('DB_HOST', 'localhost'),
    port: config.get('DB_PORT', 5432),
    username: config.get('DB_USERNAME', 'postgres'),
    password: config.get('DB_PASSWORD', 'postgres'),
    database: config.get('DB_NAME', 'kozmo_cardapio'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: config.get('NODE_ENV') !== 'production',
    logging: config.get('NODE_ENV') === 'development',
    ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
});
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=database.config.js.map