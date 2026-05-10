import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Restaurant } from './entities/restaurant.entity'
import type { UpdateRestaurantInput } from '@repo/schemas'

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
  ) {}

  async findById(id: string) {
    const restaurant = await this.restaurantsRepository.findOne({ where: { id } })
    if (!restaurant) throw new NotFoundException('Restaurant not found')
    return restaurant
  }

  async findBySlug(slug: string) {
    const restaurant = await this.restaurantsRepository.findOne({ where: { slug } })
    if (!restaurant) throw new NotFoundException('Restaurant not found')
    return restaurant
  }

  async update(id: string, input: UpdateRestaurantInput) {
    const restaurant = await this.findById(id)

    if (input.name !== undefined) restaurant.name = input.name
    if (input.logoUrl !== undefined) restaurant.logoUrl = input.logoUrl
    if (input.bannerUrl !== undefined) restaurant.bannerUrl = input.bannerUrl
    if (input.whatsappPhone !== undefined) restaurant.whatsappPhone = input.whatsappPhone
    if (input.theme) {
      restaurant.theme = { ...restaurant.theme, ...input.theme }
    }

    return this.restaurantsRepository.save(restaurant)
  }

  toPublic(restaurant: Restaurant) {
    return {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      email: restaurant.email,
      theme: restaurant.theme,
      logoUrl: restaurant.logoUrl,
      bannerUrl: restaurant.bannerUrl,
      whatsappPhone: restaurant.whatsappPhone ?? null,
      createdAt: restaurant.createdAt.toISOString(),
      updatedAt: restaurant.updatedAt.toISOString(),
    }
  }
}
