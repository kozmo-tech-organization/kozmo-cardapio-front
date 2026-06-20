import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { Restaurant } from '../modules/restaurants/entities/restaurant.entity.js'
import { Product } from '../modules/products/entities/product.entity.js'
import { Review } from '../modules/reviews/entities/review.entity.js'
import { Category } from '../modules/categories/entities/category.entity.js'
import { Promotion } from '../modules/promotions/entities/promotion.entity.js'
import { Order } from '../modules/orders/entities/order.entity.js'
import { Table } from '../modules/tables/entities/table.entity.js'
import { WaiterCall } from '../modules/waiter-calls/entities/waiter-call.entity.js'

export const getDatabaseConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get('PGHOST') ?? config.get('DB_HOST', 'localhost'),
  port: Number(config.get('PGPORT') ?? config.get('DB_PORT', 5432)),
  username: config.get('PGUSER') ?? config.get('DB_USERNAME', 'postgres'),
  password: config.get('PGPASSWORD') ?? config.get('DB_PASSWORD', 'postgres'),
  database: config.get('PGDATABASE') ?? config.get('DB_NAME', 'kozmo_cardapio'),
  entities: [Restaurant, Product, Review, Category, Promotion, Order, Table, WaiterCall],
  synchronize: true,
  logging: config.get('NODE_ENV') === 'development',
  ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
})
