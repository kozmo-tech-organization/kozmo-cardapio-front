import { useState } from 'react'
import {
  usePromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
  useSetPromotionProducts,
  useProducts,
} from '@repo/queries'
import { Button, Card, CardContent, CardHeader, CardTitle, FormField, useToast } from '@repo/ui'
import { useTranslation } from '@repo/i18n'
import type { Promotion } from '@repo/schemas'

type View = 'list' | 'form' | 'products'

interface FormState {
  name: string
  discountPercent: number
  active: boolean
}

const EMPTY_FORM: FormState = { name: '', discountPercent: 10, active: true }

export function PromotionsPage() {
  const { data: promotions = [], isLoading } = usePromotions()
  const { data: allProducts = [] } = useProducts()
  const createPromotion = useCreatePromotion()
  const updatePromotion = useUpdatePromotion()
  const deletePromotion = useDeletePromotion()
  const setProducts = useSetPromotionProducts()
  const { t } = useTranslation()
  const { toast } = useToast()

  const [view, setView] = useState<View>('list')
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [managingProducts, setManagingProducts] = useState<Promotion | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [search, setSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])

  function setField(field: keyof FormState, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setView('form')
  }

  function openEdit(promotion: Promotion) {
    setEditing(promotion)
    setForm({
      name: promotion.name,
      discountPercent: promotion.discountPercent,
      active: promotion.active,
    })
    setView('form')
  }

  function openProducts(promotion: Promotion) {
    setManagingProducts(promotion)
    setSelectedProductIds(promotion.productIds)
    setProductSearch('')
    setView('products')
  }

  function back() {
    setView('list')
    setEditing(null)
    setManagingProducts(null)
  }

  function handleError(err: unknown) {
    toast({ variant: 'error', title: t('admin.errors.generic'), description: t('admin.errors.genericDesc') })
    console.error(err)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editing) {
        await updatePromotion.mutateAsync({ id: editing.id, ...form })
        toast({ variant: 'success', title: t('admin.promotions.updatedSuccess') })
      } else {
        await createPromotion.mutateAsync(form)
        toast({ variant: 'success', title: t('admin.promotions.createdSuccess') })
      }
      back()
    } catch (err) {
      handleError(err)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('admin.promotions.confirmDelete'))) return
    try {
      await deletePromotion.mutateAsync(id)
      toast({ variant: 'success', title: t('admin.promotions.deletedSuccess') })
    } catch (err) {
      handleError(err)
    }
  }

  async function handleSaveProducts() {
    if (!managingProducts) return
    try {
      await setProducts.mutateAsync({
        promotionId: managingProducts.id,
        productIds: selectedProductIds,
      })
      toast({ variant: 'success', title: t('admin.promotions.productsSavedSuccess') })
      back()
    } catch (err) {
      handleError(err)
    }
  }

  function toggleProduct(id: string) {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const filteredPromotions = promotions.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  )

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()),
  )

  if (view === 'products' && managingProducts) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={back} className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t('admin.promotions.back')}
          </button>
        </div>

        <div>
          <h1 className="text-3xl font-bold">{t('admin.promotions.productsTitle')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('admin.promotions.productsSubtitle', { name: managingProducts.name })}
          </p>
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            <FormField
              label=""
              placeholder={t('admin.promotions.products.search')}
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />

            {allProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {t('admin.promotions.noProducts')}
              </p>
            ) : (
              <ul className="divide-y max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => {
                  const checked = selectedProductIds.includes(product.id)
                  return (
                    <li key={product.id}>
                      <label className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-muted/50 px-2 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProduct(product.id)}
                          className="h-4 w-4 accent-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            R$ {Number(product.price).toFixed(2)}
                          </p>
                        </div>
                      </label>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSaveProducts} loading={setProducts.isPending}>
            {selectedProductIds.length !== 1
              ? t('admin.promotions.saveProducts.other', { count: selectedProductIds.length })
              : t('admin.promotions.saveProducts.one', { count: selectedProductIds.length })}
          </Button>
          <Button variant="outline" onClick={back}>
            {t('admin.promotions.form.cancel')}
          </Button>
        </div>
      </div>
    )
  }

  if (view === 'form') {
    return (
      <div className="max-w-xl space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={back} className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t('admin.promotions.back')}
          </button>
        </div>

        <div>
          <h1 className="text-3xl font-bold">
            {editing ? t('admin.promotions.editTitle') : t('admin.promotions.newTitle')}
          </h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label={t('admin.promotions.form.name')}
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                required
                minLength={2}
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none">
                  {t('admin.promotions.form.discount')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={form.discountPercent}
                    onChange={(e) => setField('discountPercent', Number(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="w-16 text-center font-bold text-lg text-primary">
                    {form.discountPercent}%
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setField('active', e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm font-medium">{t('admin.promotions.form.active')}</span>
              </label>

              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={createPromotion.isPending || updatePromotion.isPending}>
                  {editing ? t('admin.promotions.form.save') : t('admin.promotions.form.create')}
                </Button>
                <Button type="button" variant="outline" onClick={back}>
                  {t('admin.promotions.form.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.promotions.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('admin.promotions.subtitle')}</p>
        </div>
        <Button onClick={openCreate}>{t('admin.promotions.new')}</Button>
      </div>

      <FormField
        label=""
        placeholder={t('admin.promotions.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading && (
        <p className="text-sm text-muted-foreground">{t('admin.promotions.loading')}</p>
      )}

      {!isLoading && promotions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">{t('admin.promotions.empty')}</p>
            <Button className="mt-4" onClick={openCreate}>
              {t('admin.promotions.createFirst')}
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && promotions.length > 0 && filteredPromotions.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t('admin.promotions.noResults', { query: search })}
        </p>
      )}

      <div className="grid gap-4">
        {filteredPromotions.map((promotion) => (
          <Card key={promotion.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {promotion.discountPercent}%
                  </div>
                  <div>
                    <CardTitle className="text-base">{promotion.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {promotion.productIds.length !== 1
                        ? t('admin.promotions.count.other', { count: promotion.productIds.length })
                        : t('admin.promotions.count.one', { count: promotion.productIds.length })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      promotion.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {promotion.active
                      ? t('admin.promotions.active')
                      : t('admin.promotions.inactive')}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => openProducts(promotion)}>
                  {t('admin.promotions.btn.products')}
                </Button>
                <Button size="sm" variant="outline" onClick={() => openEdit(promotion)}>
                  {t('admin.promotions.btn.edit')}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(promotion.id)}
                  loading={deletePromotion.isPending}
                >
                  {t('admin.promotions.btn.delete')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
