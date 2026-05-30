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

  async updateStatus(input: UpdateOrderStatusInput, restaurantId: string) {
    const order = await this.ordersRepository.findOne({ where: { id: input.id } })
    if (!order) throw new NotFoundException('Order not found')
    if (order.restaurantId !== restaurantId) throw new ForbiddenException('Not your order')
    order.status = input.status
    const saved = await this.ordersRepository.save(order)
    this.ordersGateway?.emitOrderUpdated(saved.restaurantId, this.toPublic(saved))
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
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }
  }
}
