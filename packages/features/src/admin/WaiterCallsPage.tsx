import { useWaiterCalls, useUpdateWaiterCallStatus, useCurrentRestaurant } from '@repo/queries'
import { useWaiterCallsSocket } from './useWaiterCallsSocket'
import { useTranslation } from '@repo/i18n'
import { useToast } from '@repo/ui'
import type { WaiterCall, WaiterCallStatus } from '@repo/schemas'

const STATUS_COLORS: Record<WaiterCallStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  waiting: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
}

const STATUS_ORDER: WaiterCallStatus[] = ['pending', 'accepted', 'waiting', 'completed', 'declined']

function WaiterCallCard({ call, primaryColor }: { call: WaiterCall; primaryColor: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const updateStatus = useUpdateWaiterCallStatus()

  const isActive = call.status === 'pending' || call.status === 'accepted' || call.status === 'waiting'
  const date = new Date(call.createdAt)
  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const dateStr = date.toLocaleDateString('pt-BR')

  async function handleStatus(status: WaiterCallStatus) {
    try {
      await updateStatus.mutateAsync({ id: call.id, status })
    } catch {
      toast({ variant: 'error', title: t('admin.errors.generic') })
    }
  }

  return (
    <div className={`rounded-xl border bg-card p-4 shadow-sm transition-all ${isActive ? 'border-border' : 'border-border opacity-60'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm"
            style={{ backgroundColor: primaryColor }}
          >
            {call.tableNumber}
          </div>
          <div>
            <p className="font-semibold text-sm">{call.tableName}</p>
            <p className="text-xs text-muted-foreground">{t('admin.waiterCalls.tableLabel')} #{call.tableNumber}</p>
          </div>
        </div>
        <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[call.status]}`}>
          {t(`admin.waiterCalls.status.${call.status}`)}
        </span>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">{dateStr} {t('admin.orders.at')} {timeStr}</p>

      {isActive && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          {call.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatus('accepted')}
                disabled={updateStatus.isPending}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                {t('admin.waiterCalls.accept')}
              </button>
              <button
                onClick={() => handleStatus('waiting')}
                disabled={updateStatus.isPending}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground border border-border hover:bg-muted disabled:opacity-50 transition-colors"
              >
                {t('admin.waiterCalls.waiting')}
              </button>
              <button
                onClick={() => handleStatus('declined')}
                disabled={updateStatus.isPending}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold text-destructive border border-destructive/30 hover:bg-destructive/10 disabled:opacity-50 transition-colors"
              >
                {t('admin.waiterCalls.decline')}
              </button>
            </>
          )}
          {(call.status === 'accepted' || call.status === 'waiting') && (
            <button
              onClick={() => handleStatus('completed')}
              disabled={updateStatus.isPending}
              className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              {t('admin.waiterCalls.complete')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function WaiterCallsPage() {
  const { t } = useTranslation()
  const { data: restaurant } = useCurrentRestaurant()
  const { data: calls, isLoading } = useWaiterCalls()
  useWaiterCallsSocket()

  const primaryColor = restaurant?.theme?.primaryColor || '#f97316'

  const activeCalls = calls?.filter((c) => ['pending', 'accepted', 'waiting'].includes(c.status)) ?? []
  const historyCalls = calls?.filter((c) => ['completed', 'declined'].includes(c.status)) ?? []

  const sortedActive = [...activeCalls].sort((a, b) =>
    STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('admin.waiterCalls.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('admin.waiterCalls.subtitle')}</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t('admin.waiterCalls.loading')}</p>
      ) : (
        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {t('admin.waiterCalls.activeSection')}
              </h2>
              {activeCalls.length > 0 && (
                <span
                  className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {activeCalls.length}
                </span>
              )}
            </div>
            {sortedActive.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">{t('admin.waiterCalls.noActiveCalls')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedActive.map((call) => (
                  <WaiterCallCard key={call.id} call={call} primaryColor={primaryColor} />
                ))}
              </div>
            )}
          </section>

          {historyCalls.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                {t('admin.waiterCalls.historySection')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {historyCalls.slice(0, 20).map((call) => (
                  <WaiterCallCard key={call.id} call={call} primaryColor={primaryColor} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
