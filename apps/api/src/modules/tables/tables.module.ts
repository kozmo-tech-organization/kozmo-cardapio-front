import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Table } from './entities/table.entity'
import { TablesService } from './tables.service'

@Module({
  imports: [TypeOrmModule.forFeature([Table])],
  providers: [TablesService],
  exports: [TablesService],
})
export class TablesModule {}
