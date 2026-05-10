import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { Restaurant } from '../modules/restaurants/entities/restaurant.entity.js'
import { Product } from '../modules/products/entities/product.entity.js'
import { Review } from '../modules/reviews/entities/review.entity.js'
import { Category } from '../modules/categories/entities/category.entity.js'

export const getDatabaseConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get('DB_HOST', 'localhost'),
  port: config.get<number>('DB_PORT', 5432),
  username: config.get('DB_USERNAME', 'postgres'),
  password: config.get('DB_PASSWORD', 'postgres'),
  database: config.get('DB_NAME', 'kozmo_cardapio'),
  entities: [Restaurant, Product, Review, Category],
  synchronize: config.get('NODE_ENV') !== 'production',
  logging: config.get('NODE_ENV') === 'development',
  ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
})
