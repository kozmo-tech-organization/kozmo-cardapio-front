import React, { useState, useEffect } from 'react'
import { useCurrentRestaurant, useUpdateRestaurant } from '@repo/queries'
import { Button, FormField, Card, CardContent, CardHeader, CardTitle, CardDescription, useToast } from '@repo/ui'
import { useTranslation } from '@repo/i18n'

export function RestaurantSettingsPage() {
  const { data: restaurant } = useCurrentRestaurant()
  const updateRestaurant = useUpdateRestaurant()
  const { t } = useTranslation()
  const { toast } = useToast()

  const [form, setForm] = useState({
    name: '',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    accentColor: '#ff6b35',
    logoUrl: '',
    bannerUrl: '',
    whatsappPhone: '',
  })
  useEffect(() => {
    if (restaurant?.theme) {
      setForm({
        name: restaurant.name,
        primaryColor: restaurant.theme.primaryColor,
        secondaryColor: restaurant.theme.secondaryColor,
        accentColor: restaurant.theme.accentColor,
        logoUrl: restaurant.logoUrl ?? '',
        bannerUrl: restaurant.bannerUrl ?? '',
        whatsappPhone: restaurant.whatsappPhone ?? '',
      })
    }
  }, [restaurant])

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateRestaurant.mutateAsync({
        name: form.name,
        theme: {
          primaryColor: form.primaryColor,
          secondaryColor: form.secondaryColor,
          accentColor: form.accentColor,
        },
        logoUrl: form.logoUrl || null,
        bannerUrl: form.bannerUrl || null,
        whatsappPhone: form.whatsappPhone || null,
      })
      toast({ variant: 'success', title: t('admin.settings.savedToast') })
    } catch {
      toast({ variant: 'error', title: t('admin.errors.generic'), description: t('admin.errors.genericDesc') })
    }
  }

  if (!restaurant?.theme) {
    return <p className="text-muted-foreground text-sm">{t('admin.settings.loading')}</p>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('admin.settings.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('admin.settings.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.settings.basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label={t('admin.settings.restaurantName')}
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              required
              minLength={2}
            />
            <FormField
              label={t('admin.settings.logoUrl')}
              type="url"
              value={form.logoUrl}
              onChange={(e) => setField('logoUrl', e.target.value)}
              placeholder="https://..."
            />
            <FormField
              label={t('admin.settings.bannerUrl')}
              type="url"
              value={form.bannerUrl}
              onChange={(e) => setField('bannerUrl', e.target.value)}
              placeholder="https://..."
            />
            <FormField
              label={t('admin.settings.whatsappPhone')}
              type="tel"
              value={form.whatsappPhone}
              onChange={(e) => setField('whatsappPhone', e.target.value)}
              placeholder={t('admin.settings.whatsappPhonePlaceholder')}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.settings.themeColors')}</CardTitle>
            <CardDescription>{t('admin.settings.customizeColors')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Live preview */}
            <div className="rounded-xl overflow-hidden border border-border shadow-sm">
              <div
                className="h-16 flex items-center px-4 gap-3"
                style={{
                  background: `linear-gradient(135deg, ${form.primaryColor} 0%, ${form.accentColor} 100%)`,
                }}
              >
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  K
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{form.name || 'Meu Restaurante'}</p>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full text-white border border-white/30 bg-white/10 shrink-0"
                  style={{ color: form.secondaryColor }}
                >
                  Todas
                </span>
              </div>
              <div className="bg-card p-3 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">Produto exemplo</p>
                  <p className="text-xs text-muted-foreground">Descrição do produto</p>
                </div>
                <span className="text-base font-bold" style={{ color: form.accentColor }}>
                  R$ 29,90
                </span>
              </div>
            </div>

            {/* Color pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('admin.settings.primaryColor')}</label>
                <p className="text-xs text-muted-foreground">{t('admin.settings.primaryColorHint')}</p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setField('primaryColor', e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-input"
                  />
                  <span className="text-sm font-mono text-muted-foreground">{form.primaryColor}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('admin.settings.accentColor')}</label>
                <p className="text-xs text-muted-foreground">{t('admin.settings.accentColorHint')}</p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={(e) => setField('accentColor', e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-input"
                  />
                  <span className="text-sm font-mono text-muted-foreground">{form.accentColor}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('admin.settings.secondaryColor')}</label>
                <p className="text-xs text-muted-foreground">{t('admin.settings.secondaryColorHint')}</p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.secondaryColor}
                    onChange={(e) => setField('secondaryColor', e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-input"
                  />
                  <span className="text-sm font-mono text-muted-foreground">{form.secondaryColor}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={updateRestaurant.isPending}>
            {t('admin.settings.save')}
          </Button>
        </div>
      </form>
    </div>
  )
}
