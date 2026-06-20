import { Injectable, NotFoundException, ForbiddenException, Optional } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WaiterCall } from './entities/waiter-call.entity'
import { OrdersGateway } from '../orders/orders.gateway'
import type { CreateWaiterCallInput, UpdateWaiterCallStatusInput } from '@repo/schemas'

@Injectable()
export class WaiterCallsService {
  constructor(
    @InjectRepository(WaiterCall)
    private waiterCallsRepository: Repository<WaiterCall>,
    @Optional() private readonly ordersGateway: OrdersGateway,
  ) {}

  async create(input: CreateWaiterCallInput) {
    const call = this.waiterCallsRepository.create({
      restaurantId: input.restaurantId,
      tableId: input.tableId,
      tableNumber: input.tableNumber,
      tableName: input.tableName,
      status: 'pending',
    })
    const saved = await this.waiterCallsRepository.save(call)
    this.ordersGateway?.emitWaiterCallCreated(saved.restaurantId, this.toPublic(saved))
    return saved
  }

  async findById(id: string) {
    const call = await this.waiterCallsRepository.findOne({ where: { id } })
    if (!call) throw new NotFoundException('Waiter call not found')
    return call
  }

  async findByRestaurant(restaurantId: string) {
    return this.waiterCallsRepository.find({
      where: { restaurantId },
      order: { createdAt: 'DESC' },
    })
  }

  async updateStatus(input: UpdateWaiterCallStatusInput, restaurantId: string) {
    const call = await this.waiterCallsRepository.findOne({ where: { id: input.id } })
    if (!call) throw new NotFoundException('Waiter call not found')
    if (call.restaurantId !== restaurantId) throw new ForbiddenException('Not your waiter call')
    call.status = input.status
    const saved = await this.waiterCallsRepository.save(call)
    this.ordersGateway?.emitWaiterCallUpdated(saved.restaurantId, this.toPublic(saved))
    return saved
  }

  toPublic(call: WaiterCall) {
    return {
      id: call.id,
      restaurantId: call.restaurantId,
      tableId: call.tableId,
      tableNumber: call.tableNumber,
      tableName: call.tableName,
      status: call.status,
      createdAt: call.createdAt.toISOString(),
      updatedAt: call.updatedAt.toISOString(),
    }
  }
}
