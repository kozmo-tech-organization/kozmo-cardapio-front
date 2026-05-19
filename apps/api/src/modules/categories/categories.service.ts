import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { Category } from './entities/category.entity'
import { Product } from '../products/entities/product.entity'
import { Restaurant } from '../restaurants/entities/restaurant.entity'
import type { CreateCategoryInput, UpdateCategoryInput } from '@repo/schemas'

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
  ) {}

  async findByRestaurant(restaurantId: string) {
    return this.categoriesRepository.find({
      where: { restaurantId },
      relations: ['products'],
      order: { order: 'ASC', createdAt: 'ASC' },
    })
  }

  async findById(id: string) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['products'],
    })
    if (!category) throw new NotFoundException('Category not found')
    return category
  }

  async create(restaurantId: string, input: CreateCategoryInput) {
    const restaurant = await this.getRestaurantById(restaurantId)
    const currentCategoriesCount = await this.categoriesRepository.countBy({ restaurantId })
    const limitCategories = Number(restaurant.limitCategories)

    if (currentCategoriesCount >= limitCategories) {
      throw new ForbiddenException('Category limit reached for this plan')
    }

    const category = this.categoriesRepository.create({
      ...input,
      restaurantId,
      subtitle: input.subtitle ?? null,
      imageUrl: input.imageUrl ?? null,
    })
    return this.categoriesRepository.save(category)
  }

  async update(id: string, restaurantId: string, input: UpdateCategoryInput) {
    const category = await this.findById(id)
    if (category.restaurantId !== restaurantId) throw new ForbiddenException()

    const statusInput = (input as UpdateCategoryInput & { status?: boolean }).status
    if (statusInput === true && !category.status) {
      await this.ensureCategoryActivationLimit(restaurantId)
    }

    Object.assign(category, input)
    return this.categoriesRepository.save(category)
  }

  async remove(id: string, restaurantId: string) {
    const category = await this.findById(id)
    if (category.restaurantId !== restaurantId) throw new ForbiddenException()
    await this.categoriesRepository.remove(category)
    return { success: true }
  }

  async setProducts(categoryId: string, restaurantId: string, productIds: string[]) {
    const category = await this.findById(categoryId)
    if (category.restaurantId !== restaurantId) throw new ForbiddenException()

    const products =
      productIds.length > 0
        ? await this.productsRepository.findBy({ id: In(productIds), restaurantId })
        : []

    category.products = products
    return this.categoriesRepository.save(category)
  }

  toPublic(category: Category) {
    return {
      id: category.id,
      restaurantId: category.restaurantId,
      title: category.title,
      subtitle: category.subtitle,
      imageUrl: category.imageUrl,
      order: category.order,
      status: category.status,
      productIds: (category.products || []).map((p) => p.id),
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    }
  }

  private async getRestaurantById(id: string) {
    const restaurant = await this.restaurantsRepository.findOne({ where: { id } })
    if (!restaurant) throw new NotFoundException('Restaurant not found')
    return restaurant
  }

  private async ensureCategoryActivationLimit(restaurantId: string) {
    const restaurant = await this.getRestaurantById(restaurantId)
    const activeCategoriesCount = await this.categoriesRepository.countBy({
      restaurantId,
      status: true,
    })
    const limitCategories = Number(restaurant.limitCategories)

    if (activeCategoriesCount >= limitCategories) {
      throw new ForbiddenException('Active category limit reached for this plan')
    }
  }
}
