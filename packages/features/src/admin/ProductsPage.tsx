import { useState } from 'react'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@repo/queries'
import { Button, Card, CardContent, Badge, FormField, Label, Input } from '@repo/ui'
import { useTranslation } from '@repo/i18n'
import type { Product, CreateProductInput } from '@repo/schemas'

const emptyForm: CreateProductInput = {
  name: '',
  price: 0,
  preparationTimeMinutes: 15,
  description: '',
  imageUrl: null,
  inStock: true,
}

export function ProductsPage() {
  const { data: products, isLoading } = useProducts()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()
  const { t } = useTranslation()

  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<CreateProductInput>(emptyForm)
  const [search, setSearch] = useState('')

  function setField(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function openCreate() {
    setForm(emptyForm)
    setEditingProduct(null)
    setShowForm(true)
  }

  function openEdit(product: Product) {
    setForm({
      name: product.name,
      price: product.price,
      preparationTimeMinutes: product.preparationTimeMinutes,
      description: product.description,
      imageUrl: product.imageUrl,
      inStock: product.inStock,
    })
    setEditingProduct(product)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingProduct) {
      await updateProduct.mutateAsync({ id: editingProduct.id, ...form })
    } else {
      await createProduct.mutateAsync(form)
    }
    setShowForm(false)
    setEditingProduct(null)
  }

  async function handleDelete(id: string) {
    if (!confirm(t('admin.products.confirmDelete'))) return
    await deleteProduct.mutateAsync(id)
  }

  const isPending = createProduct.isPending || updateProduct.isPending

  const filteredProducts = search.trim()
    ? products?.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.products.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('admin.products.subtitle')}</p>
        </div>
        <Button onClick={openCreate}>{t('admin.products.new')}</Button>
      </div>

      {!showForm && (
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.products.search')}
        />
      )}

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingProduct ? t('admin.products.editTitle') : t('admin.products.newTitle')}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label={t('admin.products.form.name')}
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                required
                className="sm:col-span-2"
              />
              <FormField
                label={t('admin.products.form.price')}
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setField('price', parseFloat(e.target.value))}
                required
              />
              <FormField
                label={t('admin.products.form.prepTime')}
                type="number"
                min="1"
                value={form.preparationTimeMinutes}
                onChange={(e) => setField('preparationTimeMinutes', parseInt(e.target.value))}
                required
              />
              <div className="sm:col-span-2 space-y-1.5">
                <Label>{t('admin.products.form.description')}</Label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  required
                  minLength={5}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder={t('admin.products.form.descriptionPlaceholder')}
                />
              </div>
              <FormField
                label={t('admin.products.form.imageUrl')}
                type="url"
                value={form.imageUrl ?? ''}
                onChange={(e) => setField('imageUrl', e.target.value || null)}
                placeholder="https://..."
                className="sm:col-span-2"
              />
              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={form.inStock}
                  onChange={(e) => setField('inStock', e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="inStock">{t('admin.products.form.inStock')}</Label>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" loading={isPending}>
                  {editingProduct ? t('admin.products.form.save') : t('admin.products.form.create')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  {t('admin.products.form.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">{t('admin.products.loading')}</p>
      ) : products?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">{t('admin.products.empty')}</p>
            <Button className="mt-4" onClick={openCreate}>{t('admin.products.addFirst')}</Button>
          </CardContent>
        </Card>
      ) : filteredProducts?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">{t('admin.products.noResults', { query: search })}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts?.map((product) => (
            <Card key={product.id}>
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-40 w-full rounded-t-xl object-cover"
                />
              )}
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{product.name}</h3>
                  <Badge variant={product.inStock ? 'success' : 'destructive'}>
                    {product.inStock ? t('admin.products.inStock') : t('admin.products.outOfStock')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">
                    R$ {Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ~{product.preparationTimeMinutes} min
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(product)} className="flex-1">
                    {t('admin.products.edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                    loading={deleteProduct.isPending}
                    className="flex-1"
                  >
                    {t('admin.products.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
