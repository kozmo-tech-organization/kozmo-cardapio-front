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

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  restaurantId: string

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant

  @Column({ type: 'varchar' })
  customerName: string

  @Column({ type: 'varchar' })
  customerPhone: string

  @Column({ type: 'varchar', default: 'pickup' })
  orderType: 'pickup' | 'delivery'

  @Column({ type: 'text', nullable: true, default: null })
  deliveryAddress: string | null

  @Column({ type: 'varchar', nullable: true, default: null })
  tableNumber: string | null

  @Column({ type: 'jsonb' })
  items: {
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    selectedOptions: Array<{ groupId: string; groupName: string; itemId: string; itemName: string; priceAdd: number }>
    observation: string
  }[]

  @Column({ type: 'numeric' })
  total: number

  @Column({ type: 'numeric', default: 0 })
  discountAmount: number

  @Column({ type: 'varchar', nullable: true, default: null })
  couponCode: string | null

  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'rejected'

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
