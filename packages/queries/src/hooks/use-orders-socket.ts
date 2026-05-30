import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io, Socket } from 'socket.io-client'
import type { Order } from '@repo/schemas'

const API_URL =
  typeof window !== 'undefined'
    ? ((import.meta as Record<string, unknown>).env as Record<string, string>)?.VITE_API_URL ?? 'http://localhost:3001'
    : 'http://localhost:3001'

const ORDERS_KEY = ['orders']

export function useOrdersSocket() {
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    })

    socketRef.current = socket

    socket.on('order:created', (order: Order) => {
      queryClient.setQueryData<Order[]>(ORDERS_KEY, (prev) => {
        if (!prev) return [order]
        const exists = prev.some((o) => o.id === order.id)
        if (exists) return prev
        return [order, ...prev]
      })
    })

    socket.on('order:updated', (order: Order) => {
      queryClient.setQueryData<Order[]>(ORDERS_KEY, (prev) => {
        if (!prev) return [order]
        return prev.map((o) => (o.id === order.id ? order : o))
      })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [queryClient])
}
