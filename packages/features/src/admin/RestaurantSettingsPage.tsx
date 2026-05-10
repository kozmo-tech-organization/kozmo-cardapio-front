import React, { useState, useEffect } from 'react'
import { useCurrentRestaurant, useUpdateRestaurant } from '@repo/queries'
import { Button, FormField, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui'

export function RestaurantSettingsPage() {
  const { data: restaurant } = useCurrentRestaurant()
  const updateRestaurant = useUpdateRestaurant()

  const [form, setForm] = useState({
    name: '',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    accentColor: '#ff6b35',
    logoUrl: '',
    bannerUrl: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (restaurant?.theme) {
      setForm({
        name: restaurant.name,
        primaryColor: restaurant.theme.primaryColor,
        secondaryColor: restaurant.theme.secondaryColor,
        accentColor: restaurant.theme.accentColor,
        logoUrl: restaurant.logoUrl ?? '',
        bannerUrl: restaurant.bannerUrl ?? '',
      })
    }
  }, [restaurant])

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await updateRestaurant.mutateAsync({
      name: form.name,
      theme: {
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        accentColor: form.accentColor,
      },
      logoUrl: form.logoUrl || null,
      bannerUrl: form.bannerUrl || null,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!restaurant?.theme) {
    return <p className="text-muted-foreground text-sm">Carregando configurações...</p>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações do restaurante</h1>
        <p className="text-muted-foreground mt-1">Personalize o seu cardápio virtual</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Nome do restaurante"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              required
              minLength={2}
            />
            <FormField
              label="URL do logo"
              type="url"
              value={form.logoUrl}
              onChange={(e) => setField('logoUrl', e.target.value)}
              placeholder="https://..."
            />
            <FormField
              label="URL do banner"
              type="url"
              value={form.bannerUrl}
              onChange={(e) => setField('bannerUrl', e.target.value)}
              placeholder="https://..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tema e cores</CardTitle>
            <CardDescription>Personalize as cores do seu cardápio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Cor primária</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setField('primaryColor', e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border border-input"
                  />
                  <span className="text-sm text-muted-foreground">{form.primaryColor}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Cor secundária</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.secondaryColor}
                    onChange={(e) => setField('secondaryColor', e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border border-input"
                  />
                  <span className="text-sm text-muted-foreground">{form.secondaryColor}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Cor de destaque</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={(e) => setField('accentColor', e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border border-input"
                  />
                  <span className="text-sm text-muted-foreground">{form.accentColor}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={updateRestaurant.isPending}>
            Salvar alterações
          </Button>
          {saved && <p className="text-sm text-green-600">Salvo com sucesso!</p>}
        </div>
      </form>
    </div>
  )
}
