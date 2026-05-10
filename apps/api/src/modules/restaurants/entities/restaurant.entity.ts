import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { Product } from '../../products/entities/product.entity'

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', unique: true })
  email: string

  @Column({ type: 'varchar' })
  passwordHash: string

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'varchar', unique: true })
  slug: string

  @Column({ type: 'jsonb', default: () => "'{\"primaryColor\":\"#000000\",\"secondaryColor\":\"#ffffff\",\"accentColor\":\"#ff6b35\",\"fontFamily\":\"Inter\"}'" })
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
  }

  @Column({ nullable: true, type: 'text' })
  logoUrl: string | null

  @Column({ nullable: true, type: 'text' })
  bannerUrl: string | null

  @Column({ nullable: true, type: 'varchar' })
  whatsappPhone: string | null

  @OneToMany(() => Product, (product) => product.restaurant)
  products: Product[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
