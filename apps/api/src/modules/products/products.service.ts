import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, ILike } from 'typeorm'
import { Product } from './entities/product.entity'
import type { CreateProductInput, UpdateProductInput, ProductFilters } from '@repo/schemas'

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findByRestaurant(restaurantId: string, filters?: ProductFilters) {
    const where: any = { restaurantId }

    if (filters?.inStock !== undefined) where.inStock = filters.inStock
    if (filters?.search) where.name = ILike(`%${filters.search}%`)

    const products = await this.productsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    })

    return products.filter((p) => {
      if (filters?.minPrice !== undefined && p.price < filters.minPrice) return false
      if (filters?.maxPrice !== undefined && p.price > filters.maxPrice) return false
      return true
    })
  }

  async findById(id: string) {
    const product = await this.productsRepository.findOne({ where: { id } })
    if (!product) throw new NotFoundException('Product not found')
    return product
  }

  async create(restaurantId: string, input: CreateProductInput) {
    const product = this.productsRepository.create({
      ...input,
      restaurantId,
      price: input.price,
      imageUrl: input.imageUrl ?? null,
    })
    return this.productsRepository.save(product)
  }

  async update(id: string, restaurantId: string, input: UpdateProductInput) {
    const product = await this.findById(id)
    if (product.restaurantId !== restaurantId) throw new ForbiddenException()
    Object.assign(product, input)
    return this.productsRepository.save(product)
  }

  async remove(id: string, restaurantId: string) {
    const product = await this.findById(id)
    if (product.restaurantId !== restaurantId) throw new ForbiddenException()
    await this.productsRepository.remove(product)
    return { success: true }
  }

  toPublic(product: Product) {
    return {
      id: product.id,
      restaurantId: product.restaurantId,
      name: product.name,
      price: Number(product.price),
      preparationTimeMinutes: product.preparationTimeMinutes,
      description: product.description,
      imageUrl: product.imageUrl,
      inStock: product.inStock,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }
  }
}
