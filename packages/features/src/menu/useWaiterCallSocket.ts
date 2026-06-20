import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import type { WaiterCall } from '@repo/schemas'

const API_URL =
  typeof window !== 'undefined'
    ? (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? 'http://localhost:3001'
    : 'http://localhost:3001'

export function useWaiterCallSocket(callId: string | null) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!callId) return

    const socket = io(API_URL, {
      forceNew: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    })

    const joinRoom = () => socket.emit('track:waiterCall', callId)

    socket.on('connect', joinRoom)
    socket.io.on('reconnect', () => {
      joinRoom()
      queryClient.invalidateQueries({ queryKey: ['waiterCallStatus', callId] })
    })

    socket.on('waiterCall:updated', (call: WaiterCall) => {
      queryClient.setQueryData(['waiterCallStatus', call.id], call)
      queryClient.invalidateQueries({ queryKey: ['waiterCallStatus', call.id] })
    })

    return () => { socket.disconnect() }
  }, [callId, queryClient])
}
