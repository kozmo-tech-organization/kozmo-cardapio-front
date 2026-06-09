import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { Restaurant } from '../modules/restaurants/entities/restaurant.entity.js'
import { Product } from '../modules/products/entities/product.entity.js'
import { Review } from '../modules/reviews/entities/review.entity.js'
import { Category } from '../modules/categories/entities/category.entity.js'
import { Promotion } from '../modules/promotions/entities/promotion.entity.js'
import { Order } from '../modules/orders/entities/order.entity.js'

export const getDatabaseConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get('PGHOST', 'localhost'),
  port: config.get<number>('PGPORT', 5432),
  username: config.get('PGUSER', 'postgres'),
  password: config.get('PGPASSWORD', 'postgres'),
  database: config.get('PGDATABASE', 'kozmo_cardapio'),
  entities: [Restaurant, Product, Review, Category, Promotion, Order],
  synchronize: config.get('NODE_ENV') !== 'production',
  logging: config.get('NODE_ENV') === 'development',
  ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
})
