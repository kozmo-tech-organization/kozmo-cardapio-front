import { useState } from 'react'
import { useCustomers } from '@repo/queries'
import { useTranslation } from '@repo/i18n'

export function CustomersPage() {
  const { data: customers, isLoading } = useCustomers()
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const filtered = customers?.filter(
    (c) =>
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.customerPhone.includes(search),
  ) ?? []

  const totalRevenue = filtered.reduce((s, c) => s + c.totalSpent, 0)
  const totalOrders = filtered.reduce((s, c) => s + c.ordersCount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('admin.customers.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('admin.customers.subtitle')}</p>
      </div>

      {/* Summary cards */}
      {!isLoading && customers && customers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('admin.customers.stats.total')}</p>
            <p className="text-2xl font-bold mt-1">{customers.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('admin.customers.stats.orders')}</p>
            <p className="text-2xl font-bold mt-1">{totalOrders}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm col-span-2 sm:col-span-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('admin.customers.stats.revenue')}</p>
            <p className="text-2xl font-bold mt-1">R$ {totalRevenue.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.customers.search')}
          className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">{t('admin.customers.loading')}</p>}

      {!isLoading && customers?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">{t('admin.customers.empty')}</p>
        </div>
      )}

      {!isLoading && filtered.length === 0 && (search.length > 0) && (
        <p className="text-sm text-muted-foreground">{t('admin.customers.noResults')}</p>
      )}

      <div className="space-y-3">
        {filtered.map((customer) => {
          const lastDate = new Date(customer.lastOrderAt)
          const dateStr = lastDate.toLocaleDateString('pt-BR')
          const avgTicket = customer.ordersCount > 0 ? customer.totalSpent / customer.ordersCount : 0

          return (
            <div key={customer.customerPhone} className="rounded-2xl border border-border bg-card shadow-sm px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm" aria-hidden="true">
                    {customer.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{customer.customerName}</p>
                    <p className="text-sm text-muted-foreground">{customer.customerPhone}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 text-right text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('admin.customers.col.orders')}</p>
                  <p className="font-bold text-foreground">{customer.ordersCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('admin.customers.col.total')}</p>
                  <p className="font-bold text-foreground">R$ {customer.totalSpent.toFixed(2).replace('.', ',')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('admin.customers.col.avgTicket')}</p>
                  <p className="font-bold text-foreground">R$ {avgTicket.toFixed(2).replace('.', ',')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('admin.customers.col.lastOrder')}</p>
                  <p className="font-medium text-foreground">{dateStr}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
