import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Restaurant } from '../../restaurants/entities/restaurant.entity'

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  restaurantId: string

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant

  @Column({ type: 'varchar' })
  code: string

  @Column({ type: 'varchar' })
  discountType: 'percent' | 'fixed'

  @Column({ type: 'numeric' })
  discountValue: number

  @Column({ type: 'numeric', nullable: true, default: null })
  minOrderAmount: number | null

  @Column({ type: 'int', nullable: true, default: null })
  maxUses: number | null

  @Column({ type: 'int', default: 0 })
  usesCount: number

  @Column({ type: 'timestamptz', nullable: true, default: null })
  expiresAt: Date | null

  @Column({ type: 'boolean', default: true })
  active: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
