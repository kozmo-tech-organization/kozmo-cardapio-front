import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { Promotion } from './entities/promotion.entity'
import { Product } from '../products/entities/product.entity'
import type { CreatePromotionInput, UpdatePromotionInput } from '@repo/schemas'

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionsRepository: Repository<Promotion>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findByRestaurant(restaurantId: string) {
    return this.promotionsRepository.find({
      where: { restaurantId },
      relations: ['products'],
      order: { createdAt: 'ASC' },
    })
  }

  async findById(id: string) {
    const promotion = await this.promotionsRepository.findOne({
      where: { id },
      relations: ['products'],
    })
    if (!promotion) throw new NotFoundException('Promotion not found')
    return promotion
  }

  async create(restaurantId: string, input: CreatePromotionInput) {
    const promotion = this.promotionsRepository.create({
      ...input,
      restaurantId,
      discountPercent: input.discountPercent,
    })
    return this.promotionsRepository.save(promotion)
  }

  async update(id: string, restaurantId: string, input: UpdatePromotionInput) {
    const promotion = await this.findById(id)
    if (promotion.restaurantId !== restaurantId) throw new ForbiddenException()
    Object.assign(promotion, input)
    return this.promotionsRepository.save(promotion)
  }

  async remove(id: string, restaurantId: string) {
    const promotion = await this.findById(id)
    if (promotion.restaurantId !== restaurantId) throw new ForbiddenException()
    await this.promotionsRepository.remove(promotion)
    return { success: true }
  }

  async setProducts(promotionId: string, restaurantId: string, productIds: string[]) {
    const promotion = await this.findById(promotionId)
    if (promotion.restaurantId !== restaurantId) throw new ForbiddenException()

    const products =
      productIds.length > 0
        ? await this.productsRepository.findBy({ id: In(productIds), restaurantId })
        : []

    promotion.products = products
    return this.promotionsRepository.save(promotion)
  }

  toPublic(promotion: Promotion) {
    return {
      id: promotion.id,
      restaurantId: promotion.restaurantId,
      name: promotion.name,
      discountPercent: Number(promotion.discountPercent),
      active: promotion.active,
      productIds: (promotion.products || []).map((p) => p.id),
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
    }
  }
}
