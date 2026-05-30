import { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useCurrentRestaurant } from '@repo/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { useTranslation } from '@repo/i18n'

function TableQRCode({ tableNumber, menuUrl, slug }: { tableNumber: number; menuUrl: string; slug: string }) {
  const tableUrl = `${menuUrl}?mesa=${tableNumber}`
  const qrRef = useRef<SVGSVGElement>(null)

  function downloadQR() {
    const svg = qrRef.current
    if (!svg) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const canvas = document.createElement('canvas')
    canvas.width = 300
    canvas.height = 340
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, 300, 340)
      ctx.drawImage(img, 25, 25, 250, 250)
      ctx.fillStyle = '#111'
      ctx.font = 'bold 18px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`Mesa ${tableNumber}`, 150, 310)
      const a = document.createElement('a')
      a.download = `mesa-${tableNumber}-${slug}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)))
  }

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-sm font-bold text-foreground">Mesa {tableNumber}</p>
      <QRCodeSVG ref={qrRef as React.RefObject<SVGSVGElement>} value={tableUrl} size={120} />
      <button
        onClick={downloadQR}
        className="cursor-pointer mt-1 flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
        Baixar
      </button>
    </div>
  )
}

export function ViewMenuPage() {
  const { data: restaurant } = useCurrentRestaurant()
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(true)
  const [tablesInput, setTablesInput] = useState('')

  const menuUrl = restaurant?.slug
    ? `${window.location.origin}/menu/${restaurant.slug}`
    : ''

  const tablesCount = restaurant?.tablesCount ?? 0

  function copyLink() {
    navigator.clipboard.writeText(menuUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tableNumbers = tablesCount > 0 ? Array.from({ length: tablesCount }, (_, i) => i + 1) : []

  const previewCount = parseInt(tablesInput, 10)
  const previewNumbers = !isNaN(previewCount) && previewCount > 0
    ? Array.from({ length: Math.min(previewCount, 50) }, (_, i) => i + 1)
    : tableNumbers

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('admin.viewMenu.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('admin.viewMenu.subtitle')}</p>
      </div>

      {restaurant?.slug && (
        <div className="flex gap-3 flex-wrap">
          <a
            href={`/print/${restaurant.slug}?format=simple`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect width="12" height="8" x="6" y="14" />
            </svg>
            {t('admin.viewMenu.printSimple')}
          </a>
          <a
            href={`/print/${restaurant.slug}?format=digital`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect width="12" height="8" x="6" y="14" />
            </svg>
            {t('admin.viewMenu.printDigital')}
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('admin.viewMenu.linkTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground break-all select-all">
              {menuUrl}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="cursor-pointer flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                {copied ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-green-500">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
                {copied ? t('admin.viewMenu.copied') : t('admin.viewMenu.copy')}
              </button>
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M15 3h6v6" />
                  <path d="M10 14 21 3" />
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                </svg>
                {t('admin.viewMenu.open')}
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t('admin.viewMenu.qrCode')}</CardTitle>
            <button
              onClick={() => setShowQr((v) => !v)}
              className="cursor-pointer flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              {showQr ? t('admin.viewMenu.hideQr') : t('admin.viewMenu.showQr')}
            </button>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            {showQr ? (
              <QRCodeSVG value={menuUrl} size={180} />
            ) : (
              <div className="flex h-45 w-45 items-center justify-center rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground">
                {t('admin.viewMenu.qrHidden')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table QR Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('admin.viewMenu.tableQrTitle')}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{t('admin.viewMenu.tableQrSubtitle')}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 max-w-xs">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                {t('admin.viewMenu.tablesCountLabel')}
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={tablesInput || tablesCount.toString()}
                onChange={(e) => setTablesInput(e.target.value)}
                placeholder="0"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('admin.viewMenu.tablesCountHint')}
              </p>
            </div>
          </div>

          {previewNumbers.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground text-sm">{t('admin.viewMenu.noTables')}</p>
            </div>
          )}

          {previewNumbers.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {previewNumbers.map((n) => (
                <TableQRCode
                  key={n}
                  tableNumber={n}
                  menuUrl={menuUrl}
                  slug={restaurant?.slug ?? ''}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
