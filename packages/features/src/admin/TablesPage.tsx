import { useState, useEffect, useRef } from 'react'
import { useTables, useCreateTable, useDeleteTable, useCurrentRestaurant } from '@repo/queries'
import { useTranslation } from '@repo/i18n'
import { useToast } from '@repo/ui'
import type { Table } from '@repo/schemas'

function QRCodeCanvas({ url, size = 160 }: { url: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let cancelled = false
    import('qrcode').then((QRCode) => {
      if (cancelled || !canvasRef.current) return
      QRCode.toCanvas(canvasRef.current, url, { width: size, margin: 1, errorCorrectionLevel: 'M' })
    })
    return () => { cancelled = true }
  }, [url, size])

  return <canvas ref={canvasRef} width={size} height={size} />
}

function downloadQR(table: Table, url: string) {
  const canvas = document.createElement('canvas')
  const size = 400
  canvas.width = size
  canvas.height = size + 60
  const ctx = canvas.getContext('2d')!

  import('qrcode').then((QRCode) => {
    QRCode.toCanvas(canvas, url, { width: size, margin: 2 }, () => {
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, size, size, 60)
      ctx.fillStyle = '#111827'
      ctx.font = 'bold 20px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`Mesa ${table.number} — ${table.name}`, size / 2, size + 36)

      const a = document.createElement('a')
      a.download = `mesa-${table.number}-${table.name.replace(/\s+/g, '-').toLowerCase()}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    })
  })
}

export function TablesPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: restaurant } = useCurrentRestaurant()
  const { data: tables, isLoading } = useTables()
  const createTable = useCreateTable()
  const deleteTable = useDeleteTable()

  const primaryColor = restaurant?.theme?.primaryColor || '#f97316'

  const [form, setForm] = useState({ name: '', number: '' })
  const [showForm, setShowForm] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)

  const menuBaseUrl = restaurant?.slug
    ? `${window.location.origin}/menu/${restaurant.slug}`
    : ''

  function getQrUrl(table: Table) {
    return `${menuBaseUrl}?tableId=${table.id}`
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const num = parseInt(form.number)
    if (!form.name.trim() || isNaN(num) || num < 1) return
    try {
      await createTable.mutateAsync({ name: form.name.trim(), number: num })
      setForm({ name: '', number: '' })
      setShowForm(false)
      toast({ variant: 'success', title: t('admin.tables.createdSuccess') })
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? ''
      if (msg.includes('número')) {
        toast({ variant: 'error', title: t('admin.tables.duplicateNumber') })
      } else if (msg.includes('nome')) {
        toast({ variant: 'error', title: t('admin.tables.duplicateName') })
      } else {
        toast({ variant: 'error', title: t('admin.errors.generic') })
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('admin.tables.confirmDelete'))) return
    try {
      await deleteTable.mutateAsync(id)
      if (selectedTable?.id === id) setSelectedTable(null)
      toast({ variant: 'success', title: t('admin.tables.deletedSuccess') })
    } catch {
      toast({ variant: 'error', title: t('admin.errors.generic') })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.tables.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('admin.tables.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          {t('admin.tables.new')}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">{t('admin.tables.newTitle')}</h2>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
            <div className="w-32">
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t('admin.tables.form.number')}</label>
              <input
                type="number"
                min={1}
                value={form.number}
                onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                placeholder="1"
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t('admin.tables.form.name')}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={t('admin.tables.form.namePlaceholder')}
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={createTable.isPending}
                className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                {createTable.isPending ? '...' : t('admin.tables.form.create')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                {t('admin.tables.form.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t('admin.tables.loading')}</p>
      ) : !tables?.length ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-muted-foreground text-sm">{t('admin.tables.empty')}</p>
          <button
            onClick={() => setShowForm(true)}
            className="cursor-pointer mt-3 text-sm font-medium hover:underline"
            style={{ color: primaryColor }}
          >
            {t('admin.tables.createFirst')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`rounded-xl border bg-card p-4 shadow-sm transition-all cursor-pointer hover:shadow-md ${
                selectedTable?.id === table.id ? 'ring-2' : 'border-border'
              }`}
              style={selectedTable?.id === table.id ? { borderColor: primaryColor, outlineColor: primaryColor, boxShadow: `0 0 0 2px ${primaryColor}33` } : {}}
              onClick={() => setSelectedTable(selectedTable?.id === table.id ? null : table)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    #{table.number}
                  </span>
                  <p className="mt-1.5 font-semibold text-sm">{table.name}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(table.id) }}
                  aria-label={t('admin.tables.delete')}
                  className="cursor-pointer text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>

              {selectedTable?.id === table.id && menuBaseUrl && (
                <div className="mt-3 flex flex-col items-center gap-3 border-t border-border pt-3">
                  <QRCodeCanvas url={getQrUrl(table)} size={140} />
                  <p className="text-xs text-muted-foreground text-center break-all">{getQrUrl(table)}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadQR(table, getQrUrl(table)) }}
                    className="cursor-pointer w-full rounded-lg text-white text-xs font-semibold py-2 hover:opacity-90 transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {t('admin.tables.downloadQr')}
                  </button>
                </div>
              )}

              {selectedTable?.id !== table.id && (
                <p className="text-xs text-muted-foreground mt-2">{t('admin.tables.clickToQr')}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
