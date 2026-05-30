import { useEffect, useRef } from 'react'
import { useOrders, useUpdateOrderStatus } from '@repo/queries'
import { useToast } from '@repo/ui'
import { useTranslation } from '@repo/i18n'
import type { Order } from '@repo/schemas'

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

function OrderCard({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus()
  const { toast } = useToast()
  const { t } = useTranslation()

  async function handleStatus(status: 'accepted' | 'rejected') {
    try {
      await updateStatus.mutateAsync({ id: order.id, status })
      toast({ variant: 'success', title: t(`admin.orders.${status}Toast`) })
    } catch {
      toast({ variant: 'error', title: t('admin.errors.generic') })
    }
  }

  const date = new Date(order.createdAt)
  const dateStr = date.toLocaleDateString('pt-BR')
  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-4 flex flex-wrap items-start justify-between gap-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-foreground">{order.customerName}</p>
            <span className="text-muted-foreground text-sm">·</span>
            <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}
            >
              {t(`admin.orders.status.${order.status}`)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {dateStr} {t('admin.orders.at')} {timeStr}
            {' · '}
            {order.orderType === 'delivery' ? `🛵 ${t('admin.orders.delivery')}` : `🏪 ${t('admin.orders.pickup')}`}
          </p>
          {order.deliveryAddress && (
            <p className="text-xs text-muted-foreground mt-0.5">📍 {order.deliveryAddress}</p>
          )}
        </div>
        <p className="text-lg font-bold text-foreground">
          R$ {Number(order.total).toFixed(2).replace('.', ',')}
        </p>
      </div>

      <div className="px-5 py-3 space-y-1">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-foreground">
              <span className="font-medium">{item.quantity}x</span> {item.productName}
            </span>
            <span className="text-muted-foreground">
              R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}
            </span>
          </div>
        ))}
      </div>

      {order.status === 'pending' && (
        <div className="px-5 py-3 flex gap-2 border-t border-border">
          <button
            onClick={() => handleStatus('accepted')}
            disabled={updateStatus.isPending}
            className="cursor-pointer flex-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
          >
            {t('admin.orders.accept')}
          </button>
          <button
            onClick={() => handleStatus('rejected')}
            disabled={updateStatus.isPending}
            className="cursor-pointer flex-1 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            {t('admin.orders.reject')}
          </button>
        </div>
      )}
    </div>
  )
}

export function OrdersPage() {
  const { data: orders, isLoading } = useOrders()
  const { t } = useTranslation()
  const { toast } = useToast()
  const prevPendingCount = useRef<number | null>(null)

  const pending = orders?.filter((o) => o.status === 'pending') ?? []
  const others = orders?.filter((o) => o.status !== 'pending') ?? []

  useEffect(() => {
    if (prevPendingCount.current === null) {
      prevPendingCount.current = pending.length
      return
    }
    if (pending.length > prevPendingCount.current) {
      toast({ variant: 'success', title: t('admin.orders.newOrderToast') })
    }
    prevPendingCount.current = pending.length
  }, [pending.length])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('admin.orders.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('admin.orders.subtitle')}</p>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">{t('admin.orders.loading')}</p>
      )}

      {!isLoading && orders?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">{t('admin.orders.empty')}</p>
        </div>
      )}

      {pending.length > 0 && (
        <section aria-labelledby="pending-heading">
          <h2 id="pending-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {t('admin.orders.pendingSection')} ({pending.length})
          </h2>
          <div className="space-y-4">
            {pending.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section aria-labelledby="history-heading">
          <h2 id="history-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {t('admin.orders.historySection')}
          </h2>
          <div className="space-y-4">
            {others.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
