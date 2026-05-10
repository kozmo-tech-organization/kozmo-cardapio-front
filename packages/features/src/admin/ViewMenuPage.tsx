import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useCurrentRestaurant } from '@repo/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { useTranslation } from '@repo/i18n'

export function ViewMenuPage() {
  const { data: restaurant } = useCurrentRestaurant()
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(true)

  const menuUrl = restaurant?.slug
    ? `${window.location.origin}/menu/${restaurant.slug}`
    : ''

  function copyLink() {
    navigator.clipboard.writeText(menuUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('admin.viewMenu.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('admin.viewMenu.subtitle')}</p>
      </div>

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
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
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
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
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
    </div>
  )
}
