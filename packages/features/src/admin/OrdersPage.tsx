import { useEffect, useRef, useState } from 'react'
import { useOrders, useUpdateOrderStatus } from '@repo/queries'
import { useToast } from '@repo/ui'
import { useTranslation } from '@repo/i18n'
import type { Order, OrderStatus } from '@repo/schemas'

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  accepted:  'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready:     'bg-teal-100 text-teal-800',
  delivered: 'bg-green-100 text-green-800',
  rejected:  'bg-red-100 text-red-800',
}

const STATUS_NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  accepted: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
}

const STATUS_NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  accepted: '👨‍🍳 Em preparo',
  preparing: '🍽️ Pronto',
  ready: '✅ Entregue',
}

const PAGE_SIZE = 10

function OrderCard({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus()
  const { toast } = useToast()
  const { t } = useTranslation()

  async function handleStatus(status: OrderStatus) {
    try {
      await updateStatus.mutateAsync({ id: order.id, status })
      toast({ variant: 'success', title: t(`admin.orders.status.${status}`) })
    } catch {
      toast({ variant: 'error', title: t('admin.errors.generic') })
    }
  }

  const date = new Date(order.createdAt)
  const dateStr = date.toLocaleDateString('pt-BR')
  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const trackUrl = `${window.location.origin}/track/${order.id}`
  const nextStatus = STATUS_NEXT[order.status]
  const shortId = order.id.replace(/-/g, '').slice(0, 8).toUpperCase()

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-4 flex flex-wrap items-start justify-between gap-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
              #{shortId}
            </span>
            <p className="font-semibold text-foreground">{order.customerName}</p>
            <span className="text-muted-foreground text-sm">·</span>
            <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
              {t(`admin.orders.status.${order.status}`)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {dateStr} {t('admin.orders.at')} {timeStr}
            {' · '}
            {order.orderType === 'delivery' ? `🛵 ${t('admin.orders.delivery')}` : `🏪 ${t('admin.orders.pickup')}`}
          </p>
          {order.tableNumber && (
            <p className="text-xs text-muted-foreground mt-0.5">🪑 Mesa {order.tableNumber}</p>
          )}
          {order.deliveryAddress && (
            <p className="text-xs text-muted-foreground mt-0.5">📍 {order.deliveryAddress}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">
            R$ {Number(order.total).toFixed(2).replace('.', ',')}
          </p>
          {order.discountAmount > 0 && (
            <p className="text-xs text-green-600">
              Desconto: -R$ {Number(order.discountAmount).toFixed(2).replace('.', ',')}
              {order.couponCode ? ` (${order.couponCode})` : ''}
            </p>
          )}
        </div>
      </div>

      <div className="px-5 py-3 space-y-1">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-start justify-between text-sm gap-2">
            <div>
              <span className="text-foreground">
                <span className="font-medium">{item.quantity}x</span> {item.productName}
              </span>
              {item.selectedOptions && item.selectedOptions.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {item.selectedOptions.map((o) => o.itemName).join(', ')}
                </p>
              )}
              {item.observation && (
                <p className="text-xs text-muted-foreground italic">Obs: {item.observation}</p>
              )}
            </div>
            <span className="text-muted-foreground shrink-0">
              R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}
            </span>
          </div>
        ))}
      </div>

      <div className="px-5 pb-2">
        <a
          href={trackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline"
        >
          🔗 Link de acompanhamento
        </a>
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

      {nextStatus && (
        <div className="px-5 py-3 border-t border-border">
          <button
            onClick={() => handleStatus(nextStatus)}
            disabled={updateStatus.isPending}
            className="cursor-pointer w-full rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Avançar para: {STATUS_NEXT_LABEL[order.status]}
          </button>
        </div>
      )}
    </div>
  )
}

function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-sm text-muted-foreground">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          ‹
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis')
            acc.push(p)
            return acc
          }, [])
          .map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`e${i}`} className="px-1 text-muted-foreground text-sm">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={`cursor-pointer flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {p}
              </button>
            )
          )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Próxima página"
        >
          ›
        </button>
      </div>
    </div>
  )
}

const ACTIVE_STATUSES: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready']
const DONE_STATUSES: OrderStatus[] = ['delivered', 'rejected']

function applyFilters(
  orders: Order[],
  search: string,
  typeFilter: 'all' | 'pickup' | 'delivery',
  dateFrom: string,
  dateTo: string,
) {
  const q = search.trim().toLowerCase()
  const from = dateFrom ? new Date(dateFrom + 'T00:00:00') : null
  const to = dateTo ? new Date(dateTo + 'T23:59:59') : null

  return orders.filter((o) => {
    if (q) {
      const shortId = o.id.replace(/-/g, '').slice(0, 8).toLowerCase()
      if (!o.customerName.toLowerCase().includes(q) && !shortId.includes(q)) return false
    }
    if (typeFilter !== 'all' && o.orderType !== typeFilter) return false
    const created = new Date(o.createdAt)
    if (from && created < from) return false
    if (to && created > to) return false
    return true
  })
}

export function OrdersPage() {
  const { data: orders, isLoading } = useOrders()
  const { t } = useTranslation()
  const { toast } = useToast()
  const prevPendingCount = useRef<number | null>(null)

  // Draft — o que o usuário está digitando/selecionando
  const [draft, setDraft] = useState({ search: '', typeFilter: 'all' as 'all' | 'pickup' | 'delivery', dateFrom: '', dateTo: '' })
  // Applied — só muda ao clicar em Pesquisar
  const [applied, setApplied] = useState({ search: '', typeFilter: 'all' as 'all' | 'pickup' | 'delivery', dateFrom: '', dateTo: '' })
  const [historyPage, setHistoryPage] = useState(1)

  const hasFilters = applied.search.trim() !== '' || applied.typeFilter !== 'all' || applied.dateFrom !== '' || applied.dateTo !== ''

  function handleSearch() {
    setApplied({ ...draft })
    setHistoryPage(1)
  }

  function handleClear() {
    const empty = { search: '', typeFilter: 'all' as const, dateFrom: '', dateTo: '' }
    setDraft(empty)
    setApplied(empty)
    setHistoryPage(1)
  }

  function setDraftField<K extends keyof typeof draft>(field: K, value: typeof draft[K]) {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  const allActive = orders?.filter((o) => ACTIVE_STATUSES.includes(o.status)) ?? []
  const allDone = orders?.filter((o) => DONE_STATUSES.includes(o.status)) ?? []
  const pending = allActive.filter((o) => o.status === 'pending')

  const filteredActive = applyFilters(allActive, applied.search, applied.typeFilter, applied.dateFrom, applied.dateTo)
  const filteredDone = applyFilters(allDone, applied.search, applied.typeFilter, applied.dateFrom, applied.dateTo)

  const pagedDone = filteredDone.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE)

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

  const totalFiltered = filteredActive.length + filteredDone.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('admin.orders.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('admin.orders.subtitle')}</p>
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl border border-border bg-card shadow-sm p-4 space-y-3">
        {/* Row 1: search + type */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={draft.search}
              onChange={(e) => setDraftField('search', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar por nome ou código (#ABC12345)"
              className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <select
            value={draft.typeFilter}
            onChange={(e) => setDraftField('typeFilter', e.target.value as 'all' | 'pickup' | 'delivery')}
            className="cursor-pointer h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shrink-0"
          >
            <option value="all">Todos os tipos</option>
            <option value="pickup">🏪 Retirada</option>
            <option value="delivery">🛵 Delivery</option>
          </select>
        </div>

        {/* Row 2: dates + action buttons on the right */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">De</label>
              <input
                type="date"
                value={draft.dateFrom}
                onChange={(e) => setDraftField('dateFrom', e.target.value)}
                max={draft.dateTo || undefined}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Até</label>
              <input
                type="date"
                value={draft.dateTo}
                onChange={(e) => setDraftField('dateTo', e.target.value)}
                min={draft.dateFrom || undefined}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 sm:self-end">
            {hasFilters && (
              <p className="text-xs text-muted-foreground mr-1 hidden sm:block">
                {totalFiltered === 0 ? 'Nenhum resultado' : `${totalFiltered} encontrado${totalFiltered !== 1 ? 's' : ''}`}
              </p>
            )}
            <button
              onClick={handleClear}
              className="cursor-pointer h-9 rounded-lg border border-border px-4 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Limpar
            </button>
            <button
              onClick={handleSearch}
              className="cursor-pointer flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Pesquisar
            </button>
          </div>
        </div>

        {hasFilters && (
          <p className="text-xs text-muted-foreground sm:hidden">
            {totalFiltered === 0 ? 'Nenhum resultado' : `${totalFiltered} encontrado${totalFiltered !== 1 ? 's' : ''}`}
          </p>
        )}
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">{t('admin.orders.loading')}</p>
      )}

      {!isLoading && orders?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">{t('admin.orders.empty')}</p>
        </div>
      )}

      {!isLoading && hasFilters && totalFiltered === 0 && orders && orders.length > 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">Nenhum pedido corresponde aos filtros aplicados.</p>
          <button onClick={handleClear} className="cursor-pointer mt-3 text-sm text-primary hover:underline">
            Limpar filtros
          </button>
        </div>
      )}

      {filteredActive.length > 0 && (
        <section aria-labelledby="active-heading">
          <h2 id="active-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {t('admin.orders.activeSection')} ({filteredActive.length})
          </h2>
          <div className="space-y-4">
            {filteredActive.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}

      {filteredDone.length > 0 && (
        <section aria-labelledby="history-heading">
          <h2 id="history-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {t('admin.orders.historySection')} ({filteredDone.length})
          </h2>
          <div className="space-y-4">
            {pagedDone.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
          <Pagination
            page={historyPage}
            total={filteredDone.length}
            pageSize={PAGE_SIZE}
            onChange={setHistoryPage}
          />
        </section>
      )}
    </div>
  )
}
