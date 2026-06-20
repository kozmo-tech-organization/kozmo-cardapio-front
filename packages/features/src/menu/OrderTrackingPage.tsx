import { useEffect, useRef } from 'react'
import { useParams } from 'react-router'
import { useOrderById } from '@repo/queries'
import { Spinner } from '@repo/ui'
import type { OrderStatus } from '@repo/schemas'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'

const STATUS_STEPS: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready', 'delivered']

const STATUS_INFO: Record<OrderStatus, { label: string; emoji: string; description: string }> = {
  pending:   { label: 'Aguardando confirmação', emoji: '🕐', description: 'Seu pedido foi recebido e aguarda confirmação do restaurante.' },
  accepted:  { label: 'Pedido aceito',          emoji: '✅', description: 'O restaurante confirmou seu pedido!' },
  preparing: { label: 'Em preparo',             emoji: '👨‍🍳', description: 'Seu pedido está sendo preparado.' },
  ready:     { label: 'Pronto',                 emoji: '🍽️', description: 'Seu pedido está pronto! Em breve será entregue ou você pode retirar.' },
  delivered: { label: 'Entregue',               emoji: '🎉', description: 'Pedido entregue. Bom apetite!' },
  rejected:  { label: 'Recusado',               emoji: '❌', description: 'O restaurante não pôde aceitar seu pedido.' },
}

function StatusTimeline({ status }: { status: OrderStatus }) {
  if (status === 'rejected') {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <span className="text-5xl">❌</span>
        <p className="text-xl font-bold text-red-600">{STATUS_INFO.rejected.label}</p>
        <p className="text-sm text-gray-500 text-center">{STATUS_INFO.rejected.description}</p>
      </div>
    )
  }

  const currentIndex = STATUS_STEPS.indexOf(status)

  return (
    <div className="py-6">
      <div className="flex flex-col gap-0">
        {STATUS_STEPS.map((step, index) => {
          const isDone = index < currentIndex
          const isCurrent = index === currentIndex
          const isLast = index === STATUS_STEPS.length - 1
          const info = STATUS_INFO[step]

          return (
            <div key={step} className="flex gap-4">
              {/* Timeline line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold transition-all ${
                    isCurrent
                      ? 'ring-4 ring-offset-2'
                      : isDone
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                  style={isCurrent ? { backgroundColor: '#f97316', color: '#fff' } : {}}
                >
                  {isDone ? '✓' : <span aria-hidden="true">{info.emoji}</span>}
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 mt-0 min-h-8 transition-colors ${isDone ? 'bg-green-400' : 'bg-gray-200'}`}
                  />
                )}
              </div>

              {/* Step content */}
              <div className={`pb-8 pt-1.5 flex-1 ${isLast ? 'pb-0' : ''}`}>
                <p className={`text-sm font-semibold ${isCurrent ? 'text-orange-600' : isDone ? 'text-green-700' : 'text-gray-400'}`}>
                  {info.label}
                </p>
                {isCurrent && (
                  <p className="text-xs text-gray-500 mt-0.5">{info.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data: order, isLoading, isError } = useOrderById(orderId ?? null)
  const queryClient = useQueryClient()
  const socketRef = useRef<ReturnType<typeof io> | null>(null)

  useEffect(() => {
    if (!orderId) return

    const apiUrl = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? 'http://localhost:3001'
    const socket = io(apiUrl, {
      forceNew: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    })
    socketRef.current = socket

    const joinRoom = () => socket.emit('track:order', orderId)

    socket.on('connect', joinRoom)
    socket.io.on('reconnect', () => {
      joinRoom()
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
    })

    socket.on('order:status', (updatedOrder) => {
      if (updatedOrder) {
        queryClient.setQueryData(['order', orderId], updatedOrder)
      }
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
    })

    return () => {
      socket.disconnect()
    }
  }, [orderId, queryClient])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">Pedido não encontrado</p>
          <p className="text-gray-500 mt-2">Verifique o link e tente novamente.</p>
        </div>
      </div>
    )
  }

  const shortId = order.id.replace(/-/g, '').slice(0, 8).toUpperCase()
  const info = STATUS_INFO[order.status]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start pt-12 px-4 pb-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-orange-500 px-6 py-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Acompanhamento do pedido</p>
          <p className="text-2xl font-bold mt-0.5">#{shortId}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl" aria-hidden="true">{info.emoji}</span>
            <span className="font-semibold">{info.label}</span>
          </div>
        </div>

        {/* Order details */}
        <div className="px-6 pt-4 pb-2 border-b border-gray-100">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">Cliente</span>
            <span className="font-medium text-gray-900">{order.customerName}</span>
          </div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">Tipo</span>
            <span className="font-medium text-gray-900">{order.orderType === 'delivery' ? '🛵 Delivery' : '🏪 Retirada'}</span>
          </div>
          {order.tableNumber && (
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-500">Mesa</span>
              <span className="font-medium text-gray-900">{order.tableNumber}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Total</span>
            <span className="font-bold text-gray-900">R$ {Number(order.total).toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        {/* Items */}
        <div className="px-6 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Itens</p>
          <div className="space-y-1.5">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  <span className="font-medium">{item.quantity}x</span> {item.productName}
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <span className="text-xs text-gray-400 ml-1">
                      ({item.selectedOptions.map((o) => o.itemName).join(', ')})
                    </span>
                  )}
                </span>
                <span className="text-gray-500">R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status timeline */}
        <div className="px-6">
          <StatusTimeline status={order.status} />
        </div>

        <div className="px-6 pb-6">
          <p className="text-center text-xs text-gray-400">
            Atualização em tempo real via WebSocket
          </p>
        </div>
      </div>
    </div>
  )
}
