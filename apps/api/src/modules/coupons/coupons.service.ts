import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Coupon } from './entities/coupon.entity'
import type { CreateCouponInput, UpdateCouponInput, ValidateCouponInput } from '@repo/schemas'

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponsRepository: Repository<Coupon>,
  ) {}

  async findByRestaurant(restaurantId: string) {
    return this.couponsRepository.find({
      where: { restaurantId },
      order: { createdAt: 'DESC' },
    })
  }

  async findById(id: string) {
    const coupon = await this.couponsRepository.findOne({ where: { id } })
    if (!coupon) throw new NotFoundException('Coupon not found')
    return coupon
  }

  async create(restaurantId: string, input: CreateCouponInput) {
    const code = input.code.toUpperCase().trim()
    const existing = await this.couponsRepository.findOne({ where: { restaurantId, code } })
    if (existing) throw new BadRequestException('Coupon code already exists')

    const coupon = this.couponsRepository.create({
      restaurantId,
      code,
      discountType: input.discountType,
      discountValue: input.discountValue,
      minOrderAmount: input.minOrderAmount ?? null,
      maxUses: input.maxUses ?? null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      active: input.active ?? true,
    })
    return this.couponsRepository.save(coupon)
  }

  async update(id: string, restaurantId: string, input: UpdateCouponInput) {
    const coupon = await this.findById(id)
    if (coupon.restaurantId !== restaurantId) throw new ForbiddenException()

    if (input.code) {
      const code = input.code.toUpperCase().trim()
      const existing = await this.couponsRepository.findOne({ where: { restaurantId, code } })
      if (existing && existing.id !== id) throw new BadRequestException('Coupon code already exists')
      coupon.code = code
    }
    if (input.discountType !== undefined) coupon.discountType = input.discountType
    if (input.discountValue !== undefined) coupon.discountValue = input.discountValue
    if (input.minOrderAmount !== undefined) coupon.minOrderAmount = input.minOrderAmount ?? null
    if (input.maxUses !== undefined) coupon.maxUses = input.maxUses ?? null
    if (input.expiresAt !== undefined) coupon.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null
    if (input.active !== undefined) coupon.active = input.active

    return this.couponsRepository.save(coupon)
  }

  async remove(id: string, restaurantId: string) {
    const coupon = await this.findById(id)
    if (coupon.restaurantId !== restaurantId) throw new ForbiddenException()
    await this.couponsRepository.remove(coupon)
    return { success: true }
  }

  async validate(input: ValidateCouponInput) {
    const code = input.code.toUpperCase().trim()
    const coupon = await this.couponsRepository.findOne({
      where: { restaurantId: input.restaurantId, code, active: true },
    })

    if (!coupon) {
      return { valid: false, coupon: null, discountAmount: 0, message: 'Cupom inválido ou inativo' }
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, coupon: null, discountAmount: 0, message: 'Cupom expirado' }
    }

    if (coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses) {
      return { valid: false, coupon: null, discountAmount: 0, message: 'Cupom esgotado' }
    }

    if (coupon.minOrderAmount !== null && input.orderTotal < Number(coupon.minOrderAmount)) {
      return {
        valid: false,
        coupon: null,
        discountAmount: 0,
        message: `Pedido mínimo de R$ ${Number(coupon.minOrderAmount).toFixed(2)} para usar este cupom`,
      }
    }

    let discountAmount = 0
    if (coupon.discountType === 'percent') {
      discountAmount = input.orderTotal * (Number(coupon.discountValue) / 100)
    } else {
      discountAmount = Math.min(Number(coupon.discountValue), input.orderTotal)
    }

    return { valid: true, coupon: this.toPublic(coupon), discountAmount }
  }

  async incrementUses(couponCode: string, restaurantId: string) {
    const coupon = await this.couponsRepository.findOne({
      where: { restaurantId, code: couponCode },
    })
    if (coupon) {
      coupon.usesCount += 1
      await this.couponsRepository.save(coupon)
    }
  }

  toPublic(coupon: Coupon) {
    return {
      id: coupon.id,
      restaurantId: coupon.restaurantId,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      minOrderAmount: coupon.minOrderAmount !== null ? Number(coupon.minOrderAmount) : null,
      maxUses: coupon.maxUses,
      usesCount: coupon.usesCount,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null,
      active: coupon.active,
      createdAt: coupon.createdAt.toISOString(),
      updatedAt: coupon.updatedAt.toISOString(),
    }
  }
}
