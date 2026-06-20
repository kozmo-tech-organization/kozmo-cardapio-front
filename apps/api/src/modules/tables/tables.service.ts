import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Table } from './entities/table.entity'
import type { CreateTableInput } from '@repo/schemas'

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private tablesRepository: Repository<Table>,
  ) {}

  async create(input: CreateTableInput, restaurantId: string) {
    const [byNumber, byName] = await Promise.all([
      this.tablesRepository.findOne({ where: { restaurantId, number: input.number } }),
      this.tablesRepository.findOne({ where: { restaurantId, name: input.name } }),
    ])
    if (byNumber) throw new ConflictException(`Já existe uma mesa com o número ${input.number}`)
    if (byName) throw new ConflictException(`Já existe uma mesa com o nome "${input.name}"`)

    const table = this.tablesRepository.create({
      restaurantId,
      name: input.name,
      number: input.number,
    })
    return this.tablesRepository.save(table)
  }

  async findByRestaurant(restaurantId: string) {
    return this.tablesRepository.find({
      where: { restaurantId },
      order: { number: 'ASC' },
    })
  }

  async findById(id: string) {
    const table = await this.tablesRepository.findOne({ where: { id } })
    if (!table) throw new NotFoundException('Table not found')
    return table
  }

  async delete(id: string, restaurantId: string) {
    const table = await this.tablesRepository.findOne({ where: { id } })
    if (!table) throw new NotFoundException('Table not found')
    if (table.restaurantId !== restaurantId) throw new ForbiddenException('Not your table')
    await this.tablesRepository.remove(table)
    return { success: true }
  }

  toPublic(table: Table) {
    return {
      id: table.id,
      restaurantId: table.restaurantId,
      name: table.name,
      number: table.number,
      createdAt: table.createdAt.toISOString(),
    }
  }
}
