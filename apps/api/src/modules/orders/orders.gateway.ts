import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { Injectable } from '@nestjs/common'

@Injectable()
@WebSocketGateway({
  cors: { origin: '*', credentials: false },
  transports: ['websocket', 'polling'],
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const token =
      (client.handshake.auth as Record<string, string>)?.token ||
      client.handshake.query?.token as string

    if (!token) {
      // Unauthenticated clients can still join specific order rooms via event
      return
    }
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token)
      client.join(`restaurant:${payload.sub}`)
    } catch (err) {
      // Invalid token — allow connection for public order tracking
      console.warn('[OrdersGateway] Token inválido, cliente não entrou no room do restaurante:', (err as Error).message)
    }
  }

  handleDisconnect(_client: Socket) {}

  @SubscribeMessage('track:order')
  handleTrackOrder(@MessageBody() orderId: string, @ConnectedSocket() client: Socket) {
    if (orderId && typeof orderId === 'string') {
      client.join(`order:${orderId}`)
    }
  }

  @SubscribeMessage('track:waiterCall')
  handleTrackWaiterCall(@MessageBody() callId: string, @ConnectedSocket() client: Socket) {
    if (callId && typeof callId === 'string') {
      client.join(`call:${callId}`)
    }
  }

  emitOrderCreated(restaurantId: string, order: object) {
    this.server.to(`restaurant:${restaurantId}`).emit('order:created', order)
  }

  emitOrderUpdated(restaurantId: string, order: object) {
    this.server.to(`restaurant:${restaurantId}`).emit('order:updated', order)
  }

  emitOrderStatusToCustomer(orderId: string, order: object) {
    this.server.to(`order:${orderId}`).emit('order:status', order)
  }

  emitWaiterCallCreated(restaurantId: string, call: object) {
    this.server.to(`restaurant:${restaurantId}`).emit('waiterCall:created', call)
  }

  emitWaiterCallUpdated(restaurantId: string, call: object & { id: string }) {
    this.server.to(`restaurant:${restaurantId}`).emit('waiterCall:updated', call)
    this.server.to(`call:${call.id}`).emit('waiterCall:updated', call)
  }
}
