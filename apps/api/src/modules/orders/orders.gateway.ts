import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
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
      client.disconnect()
      return
    }
    try {
      const payload = this.jwtService.verify<{ restaurantId: string }>(token)
      client.join(`restaurant:${payload.restaurantId}`)
    } catch {
      client.disconnect()
    }
  }

  handleDisconnect(_client: Socket) {}

  emitOrderCreated(restaurantId: string, order: object) {
    this.server.to(`restaurant:${restaurantId}`).emit('order:created', order)
  }

  emitOrderUpdated(restaurantId: string, order: object) {
    this.server.to(`restaurant:${restaurantId}`).emit('order:updated', order)
  }
}
