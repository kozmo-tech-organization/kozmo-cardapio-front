import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'
import { Restaurant } from '../../restaurants/entities/restaurant.entity'
import { Review } from '../../reviews/entities/review.entity'

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  restaurantId: string

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number

  @Column({ type: 'int' })
  preparationTimeMinutes: number

  @Column({ type: 'text' })
  description: string

  @Column({ nullable: true, type: 'text' })
  imageUrl: string | null

  @Column({ type: 'boolean', default: true })
  inStock: boolean

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
