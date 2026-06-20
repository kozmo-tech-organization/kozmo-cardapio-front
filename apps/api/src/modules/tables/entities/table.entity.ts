import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm'
import { Restaurant } from '../../restaurants/entities/restaurant.entity'

@Entity('tables')
@Unique('UQ_table_restaurant_number', ['restaurantId', 'number'])
@Unique('UQ_table_restaurant_name', ['restaurantId', 'name'])
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  restaurantId: string

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'int' })
  number: number

  @CreateDateColumn()
  createdAt: Date
}
