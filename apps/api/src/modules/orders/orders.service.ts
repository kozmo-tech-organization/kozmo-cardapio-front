import { Injectable, NotFoundException, ForbiddenException, Optional } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Order } from './entities/order.entity'
import { OrdersGateway } from './orders.gateway'
import type { CreateOrderInput, UpdateOrderStatusInput } from '@repo/schemas'

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @Optional() private readonly ordersGateway: OrdersGateway,
  ) {}

  async create(input: CreateOrderInput) {
    const order = this.ordersRepository.create({
      restaurantId: input.restaurantId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      orderType: input.orderType,
      deliveryAddress: input.deliveryAddress ?? null,
      tableNumber: input.tableNumber ?? null,
      items: input.items,
      total: input.total,
      discountAmount: input.discountAmount ?? 0,
      couponCode: input.couponCode ?? null,
      status: 'pending',
    })
    const saved = await this.ordersRepository.save(order)
    this.ordersGateway?.emitOrderCreated(saved.restaurantId, this.toPublic(saved))
    return saved
  }

  async findByRestaurant(restaurantId: string) {
    return this.ordersRepository.find({
      where: { restaurantId },
      order: { createdAt: 'DESC' },
    })
  }

  async findById(id: string) {
    const order = await this.ordersRepository.findOne({ where: { id } })
    if (!order) throw new NotFoundException('Order not found')
    return order
  }

  async getCustomers(restaurantId: string) {
    const orders = await this.ordersRepository.find({
      where: { restaurantId },
      order: { createdAt: 'DESC' },
    })

    const map = new Map<string, {
      customerName: string
      customerPhone: string
      ordersCount: number
      totalSpent: number
      lastOrderAt: string
    }>()

    for (const o of orders) {
      const key = o.customerPhone
      if (!map.has(key)) {
        map.set(key, {
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          ordersCount: 0,
          totalSpent: 0,
          lastOrderAt: o.createdAt.toISOString(),
        })
      }
      const entry = map.get(key)!
      entry.ordersCount += 1
      entry.totalSpent += Number(o.total)
      if (new Date(o.createdAt) > new Date(entry.lastOrderAt)) {
        entry.lastOrderAt = o.createdAt.toISOString()
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime(),
    )
  }

  async updateStatus(input: UpdateOrderStatusInput, restaurantId: string) {
    const order = await this.ordersRepository.findOne({ where: { id: input.id } })
    if (!order) throw new NotFoundException('Order not found')
    if (order.restaurantId !== restaurantId) throw new ForbiddenException('Not your order')
    order.status = input.status
    const saved = await this.ordersRepository.save(order)
    this.ordersGateway?.emitOrderUpdated(saved.restaurantId, this.toPublic(saved))
    this.ordersGateway?.emitOrderStatusToCustomer(saved.id, this.toPublic(saved))
    return saved
  }

  toPublic(order: Order) {
    return {
      id: order.id,
      restaurantId: order.restaurantId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      orderType: order.orderType,
      deliveryAddress: order.deliveryAddress,
      tableNumber: order.tableNumber,
      items: order.items,
      total: Number(order.total),
      discountAmount: Number(order.discountAmount ?? 0),
      couponCode: order.couponCode ?? null,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }
  }
}
