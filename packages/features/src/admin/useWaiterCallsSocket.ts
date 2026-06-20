import { useEffect, useRef, useReducer } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import type { WaiterCall } from '@repo/schemas'
import { useToast } from '@repo/ui'
import { useTranslation } from '@repo/i18n'
import { playNotificationBell } from './notificationSound'

const API_URL =
  typeof window !== 'undefined'
    ? (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? 'http://localhost:3001'
    : 'http://localhost:3001'

const WAITER_CALLS_KEY = ['waiterCalls']

export function useWaiterCallsSocket() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0)

  // refs para que o socket sempre enxergue versões atuais sem reconectar
  const toastRef = useRef(toast)
  const tRef = useRef(t)
  toastRef.current = toast
  tRef.current = t

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    const socket = io(API_URL, {
      auth: { token },
      forceNew: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    })

    socket.on('waiterCall:created', (call: WaiterCall) => {
      playNotificationBell()
      toastRef.current({
        title: tRef.current('admin.waiterCalls.newCallToast'),
        description: call.tableName ?? `${tRef.current('admin.waiterCalls.tableLabel')} ${call.tableNumber}`,
        variant: 'default',
      })
      queryClient.setQueryData<WaiterCall[]>(WAITER_CALLS_KEY, (prev) => {
        if (!prev) return undefined
        if (prev.some((c) => c.id === call.id)) return prev
        return [call, ...prev]
      })
      queryClient.invalidateQueries({ queryKey: WAITER_CALLS_KEY })
      forceUpdate()
    })

    socket.on('waiterCall:updated', (call: WaiterCall) => {
      queryClient.setQueryData<WaiterCall[]>(WAITER_CALLS_KEY, (prev) => {
        if (!prev) return undefined
        return prev.map((c) => (c.id === call.id ? call : c))
      })
      queryClient.invalidateQueries({ queryKey: WAITER_CALLS_KEY })
    })

    return () => { socket.disconnect() }
  }, [queryClient])
}
