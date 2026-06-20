import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('waiter_calls')
export class WaiterCall {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  restaurantId: string

  @Column({ type: 'uuid' })
  tableId: string

  @Column({ type: 'int' })
  tableNumber: number

  @Column({ type: 'varchar' })
  tableName: string

  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'accepted' | 'waiting' | 'completed' | 'declined'

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
