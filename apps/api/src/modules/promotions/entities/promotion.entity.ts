import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm'
import { Restaurant } from '../../restaurants/entities/restaurant.entity'
import { Product } from '../../products/entities/product.entity'

@Entity('promotions')
@Index('IDX_PROMO_REST_UUID', ['restaurantId'])
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  restaurantId: string

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  discountPercent: number

  @Column({ type: 'boolean', default: true })
  active: boolean

  @ManyToMany(() => Product)
  @JoinTable({ name: 'promotion_products' })
  products: Product[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
