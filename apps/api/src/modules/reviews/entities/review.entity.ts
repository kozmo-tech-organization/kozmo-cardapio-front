import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Product } from '../../products/entities/product.entity'

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  productId: string

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product

  @Column({ type: 'varchar' })
  clientName: string

  @Column({ type: 'text' })
  comment: string

  @Column({ type: 'int' })
  rating: number

  @CreateDateColumn()
  createdAt: Date
}
