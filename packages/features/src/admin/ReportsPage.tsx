import { useMemo } from 'react'
import { useOrders } from '@repo/queries'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui'
import { useTranslation } from '@repo/i18n'
import type { Order } from '@repo/schemas'

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number) {
  return value.toFixed(2).replace('.', ',')
}

function fmtCurrency(value: number) {
  return `R$ ${fmt(value)}`
}

function dateKey(iso: string) {
  return iso.slice(0, 10) // "YYYY-MM-DD"
}

function last30Days() {
  const days: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function last7DayKeys() {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function useReportData(orders: Order[]) {
  return useMemo(() => {
    const accepted = orders.filter((o) => o.status !== 'rejected')
    const days = last30Days()

    // Daily buckets
    const byDay: Record<string, { count: number; revenue: number }> = {}
    for (const d of days) byDay[d] = { count: 0, revenue: 0 }

    for (const o of accepted) {
      const k = dateKey(o.createdAt)
      if (byDay[k]) {
        byDay[k].count++
        byDay[k].revenue += Number(o.total)
      }
    }

    const dailyData = days.map((d) => ({
      date: d,
      label: new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      ...byDay[d],
    }))

    const totalOrders = accepted.length
    const totalRevenue = accepted.reduce((s, o) => s + Number(o.total), 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const todayKey = new Date().toISOString().slice(0, 10)
    const todayData = byDay[todayKey] ?? { count: 0, revenue: 0 }

    // 7-day averages for projection
    const last7 = last7DayKeys()
    const last7Revenue = last7.reduce((s, k) => s + (byDay[k]?.revenue ?? 0), 0)
    const last7Orders = last7.reduce((s, k) => s + (byDay[k]?.count ?? 0), 0)
    const avgDailyRevenue = last7Revenue / 7
    const avgDailyOrders = last7Orders / 7

    // Projections
    const projRevenue30 = avgDailyRevenue * 30
    const projOrders30 = Math.round(avgDailyOrders * 30)

    // Top products
    const productMap: Record<string, { name: string; count: number; revenue: number }> = {}
    for (const o of accepted) {
      for (const item of o.items) {
        if (!productMap[item.productId]) {
          productMap[item.productId] = { name: item.productName, count: 0, revenue: 0 }
        }
        productMap[item.productId].count += item.quantity
        productMap[item.productId].revenue += item.unitPrice * item.quantity
      }
    }
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const maxDayCount = Math.max(...dailyData.map((d) => d.count), 1)
    const maxDayRevenue = Math.max(...dailyData.map((d) => d.revenue), 1)

    return {
      dailyData,
      totalOrders,
      totalRevenue,
      avgOrderValue,
      todayData,
      projRevenue30,
      projOrders30,
      topProducts,
      maxDayCount,
      maxDayRevenue,
      avgDailyRevenue,
    }
  }, [orders])
}

// ─── Gráfico de barras CSS ────────────────────────────────────────────────────

function BarChart({
  data,
  valueKey,
  maxValue,
  color,
  formatValue,
  showEvery = 5,
}: {
  data: { date: string; label: string; count: number; revenue: number }[]
  valueKey: 'count' | 'revenue'
  maxValue: number
  color: string
  formatValue: (v: number) => string
  showEvery?: number
}) {
  return (
    <div className="flex items-end gap-px h-40 w-full">
      {data.map((d, i) => {
        const value = d[valueKey]
        const pct = maxValue > 0 ? (value / maxValue) * 100 : 0
        const showLabel = i % showEvery === 0 || i === data.length - 1
        return (
          <div key={d.date} className="flex flex-col items-center flex-1 gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-10 hidden group-hover:flex flex-col items-center">
              <div className="rounded bg-gray-900 px-2 py-1 text-xs text-white whitespace-nowrap shadow-lg">
                {d.label}: {formatValue(value)}
              </div>
              <div className="w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
            </div>
            {/* Bar */}
            <div className="w-full flex-1 flex items-end">
              <div
                className="w-full rounded-t transition-all"
                style={{
                  height: `${Math.max(pct, value > 0 ? 2 : 0)}%`,
                  backgroundColor: color,
                  opacity: value > 0 ? 1 : 0.15,
                }}
              />
            </div>
            {/* Label */}
            {showLabel && (
              <span className="text-[9px] text-muted-foreground rotate-0 truncate w-full text-center leading-tight">
                {d.label}
              </span>
            )}
            {!showLabel && <span className="text-[9px] h-3" />}
          </div>
        )
      })}
    </div>
  )
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 truncate">{label}</p>
          <p className="text-2xl font-bold truncate">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${color}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export function ReportsPage() {
  const { data: orders = [], isLoading } = useOrders()
  const { t } = useTranslation()
  const r = useReportData(orders)

  function handlePrint() {
    window.print()
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t('admin.reports.loading')}</p>
  }

  return (
    <>
      <style>{`@media print { .no-print { display: none !important; } }`}</style>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t('admin.reports.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('admin.reports.subtitle')}</p>
          </div>
          <button
            onClick={handlePrint}
            className="cursor-pointer no-print flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect width="12" height="8" x="6" y="14" />
            </svg>
            {t('admin.reports.print')}
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label={t('admin.reports.totalOrders')}
            value={String(r.totalOrders)}
            sub={t('admin.reports.last30days')}
            color="bg-blue-100 text-blue-600"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z"/><path d="M6 9.01V9"/></svg>}
          />
          <StatCard
            label={t('admin.reports.totalRevenue')}
            value={fmtCurrency(r.totalRevenue)}
            sub={t('admin.reports.last30days')}
            color="bg-green-100 text-green-600"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          />
          <StatCard
            label={t('admin.reports.avgTicket')}
            value={fmtCurrency(r.avgOrderValue)}
            sub={t('admin.reports.perOrder')}
            color="bg-orange-100 text-orange-500"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M3 3h18"/><path d="M3 12h18"/><path d="M3 21h18"/></svg>}
          />
          <StatCard
            label={t('admin.reports.today')}
            value={fmtCurrency(r.todayData.revenue)}
            sub={`${r.todayData.count} ${t('admin.reports.orders')}`}
            color="bg-violet-100 text-violet-600"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('admin.reports.ordersChart')}</CardTitle>
              <CardDescription>{t('admin.reports.last30days')}</CardDescription>
            </CardHeader>
            <CardContent>
              {r.totalOrders === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">{t('admin.reports.noData')}</p>
              ) : (
                <BarChart
                  data={r.dailyData}
                  valueKey="count"
                  maxValue={r.maxDayCount}
                  color="#3b82f6"
                  formatValue={(v) => `${v} ${t('admin.reports.orders')}`}
                  showEvery={5}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('admin.reports.revenueChart')}</CardTitle>
              <CardDescription>{t('admin.reports.last30days')}</CardDescription>
            </CardHeader>
            <CardContent>
              {r.totalRevenue === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">{t('admin.reports.noData')}</p>
              ) : (
                <BarChart
                  data={r.dailyData}
                  valueKey="revenue"
                  maxValue={r.maxDayRevenue}
                  color="#22c55e"
                  formatValue={fmtCurrency}
                  showEvery={5}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Projection + Top products */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Projection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('admin.reports.projection')}</CardTitle>
              <CardDescription>{t('admin.reports.projectionDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {r.avgDailyRevenue === 0 ? (
                <p className="text-sm text-muted-foreground">{t('admin.reports.noDataProjection')}</p>
              ) : (
                <>
                  <div className="flex items-center justify-between rounded-xl bg-green-50 border border-green-100 px-4 py-4">
                    <div>
                      <p className="text-xs text-green-700 font-medium uppercase tracking-wide">{t('admin.reports.proj30Revenue')}</p>
                      <p className="text-2xl font-bold text-green-700 mt-0.5">{fmtCurrency(r.projRevenue30)}</p>
                    </div>
                    <span className="text-3xl" aria-hidden="true">📈</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-100 px-4 py-4">
                    <div>
                      <p className="text-xs text-blue-700 font-medium uppercase tracking-wide">{t('admin.reports.proj30Orders')}</p>
                      <p className="text-2xl font-bold text-blue-700 mt-0.5">{r.projOrders30} {t('admin.reports.orders')}</p>
                    </div>
                    <span className="text-3xl" aria-hidden="true">🎯</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-orange-50 border border-orange-100 px-4 py-4">
                    <div>
                      <p className="text-xs text-orange-700 font-medium uppercase tracking-wide">{t('admin.reports.dailyAvg')}</p>
                      <p className="text-2xl font-bold text-orange-700 mt-0.5">{fmtCurrency(r.avgDailyRevenue)}</p>
                    </div>
                    <span className="text-3xl" aria-hidden="true">📊</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('admin.reports.projectionNote')}</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Top products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('admin.reports.topProducts')}</CardTitle>
              <CardDescription>{t('admin.reports.topProductsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {r.topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">{t('admin.reports.noData')}</p>
              ) : (
                <div className="space-y-3">
                  {r.topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-orange-400"
                            style={{ width: `${(p.count / (r.topProducts[0]?.count ?? 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">{p.count}x</p>
                        <p className="text-xs text-muted-foreground">{fmtCurrency(p.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
