import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { Restaurant } from '../restaurants/entities/restaurant.entity'
import { Product } from '../products/entities/product.entity'
import { Category } from '../categories/entities/category.entity'
import type { LoginInput, RegisterInput } from '@repo/schemas'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @Inject(JwtService)
    private jwtService: JwtService,
  ) {}

  async login(input: LoginInput) {
    const restaurant = await this.restaurantsRepository.findOne({
      where: { email: input.email },
    })

    if (!restaurant) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(input.password, restaurant.passwordHash)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    await this.handlePlanExpirationOnLogin(restaurant)

    return this.generateAuthResponse(restaurant)
  }

  async register(input: RegisterInput) {
    const existing = await this.restaurantsRepository.findOne({
      where: { email: input.email },
    })

    if (existing) {
      throw new ConflictException('Email already in use')
    }

    const passwordHash = await bcrypt.hash(input.password, 12)
    const slug = this.generateSlug(input.name)

    const restaurant = this.restaurantsRepository.create({
      email: input.email,
      passwordHash,
      name: input.name,
      slug: await this.ensureUniqueSlug(slug),
      theme: {
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        accentColor: '#ff6b35',
        fontFamily: 'Inter',
      },
      logoUrl: null,
      bannerUrl: null,
    })

    await this.restaurantsRepository.save(restaurant)
    return this.generateAuthResponse(restaurant)
  }

  async validateById(id: string) {
    return this.restaurantsRepository.findOne({ where: { id } })
  }

  private generateAuthResponse(restaurant: Restaurant) {
    const payload = { sub: restaurant.id, email: restaurant.email }
    const accessToken = this.jwtService.sign(payload)

    return {
      accessToken,
      restaurant: {
        id: restaurant.id,
        email: restaurant.email,
        name: restaurant.name,
        slug: restaurant.slug,
      },
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  private async ensureUniqueSlug(slug: string): Promise<string> {
    const existing = await this.restaurantsRepository.findOne({ where: { slug } })
    if (!existing) return slug
    return `${slug}-${Date.now()}`
  }

  private async handlePlanExpirationOnLogin(restaurant: Restaurant) {
    if (restaurant.planType === 'FREE') return
    if (!restaurant.paymentDay) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const paymentDay = new Date(restaurant.paymentDay)
    paymentDay.setHours(0, 0, 0, 0)

    if (today <= paymentDay) return

    restaurant.limitProducts = 1
    restaurant.limitCategories = 1
    restaurant.planType = 'FREE'
    restaurant.paymentDay = null

    await this.restaurantsRepository.save(restaurant)
    await this.productsRepository.update(
      { restaurantId: restaurant.id },
      { inStock: false },
    )
    await this.categoriesRepository.update(
      { restaurantId: restaurant.id },
      { status: false },
    )
  }
}
