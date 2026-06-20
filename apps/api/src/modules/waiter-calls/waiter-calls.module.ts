import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WaiterCall } from './entities/waiter-call.entity'
import { WaiterCallsService } from './waiter-calls.service'
import { OrdersModule } from '../orders/orders.module'

@Module({
  imports: [TypeOrmModule.forFeature([WaiterCall]), OrdersModule],
  providers: [WaiterCallsService],
  exports: [WaiterCallsService],
})
export class WaiterCallsModule {}
