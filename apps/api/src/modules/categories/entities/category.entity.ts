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
} from 'typeorm'
import { Restaurant } from '../../restaurants/entities/restaurant.entity'
import { Product } from '../../products/entities/product.entity'

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  restaurantId: string

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant

  @Column({ type: 'varchar' })
  title: string

  @Column({ nullable: true, type: 'text' })
  subtitle: string | null

  @Column({ nullable: true, type: 'text' })
  imageUrl: string | null

  @Column({ type: 'int', default: 0 })
  order: number

  @Column({type: 'boolean', default: false})
  status: boolean

  @ManyToMany(() => Product, (product) => product.categories)
  @JoinTable({ name: 'category_products' })
  products: Product[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
  
}
