import { useState } from 'react'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useSetCategoryProducts,
  useProducts,
} from '@repo/queries'
import { Button, Card, CardContent, FormField, Label } from '@repo/ui'
import type { Category, CreateCategoryInput } from '@repo/schemas'

const emptyForm: CreateCategoryInput = {
  title: '',
  subtitle: null,
  imageUrl: null,
  order: 0,
}

type View = 'list' | 'form' | 'products'

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories()
  const { data: products } = useProducts()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const setProducts = useSetCategoryProducts()

  const [view, setView] = useState<View>('list')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [managingCategory, setManagingCategory] = useState<Category | null>(null)
  const [form, setForm] = useState<CreateCategoryInput>(emptyForm)
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())

  function setField(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function openCreate() {
    setForm(emptyForm)
    setEditingCategory(null)
    setView('form')
  }

  function openEdit(category: Category) {
    setForm({
      title: category.title,
      subtitle: category.subtitle,
      imageUrl: category.imageUrl,
      order: category.order,
    })
    setEditingCategory(category)
    setView('form')
  }

  function openManageProducts(category: Category) {
    setManagingCategory(category)
    setSelectedProductIds(new Set(category.productIds))
    setView('products')
  }

  function cancelForm() {
    setView('list')
    setEditingCategory(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingCategory) {
      await updateCategory.mutateAsync({ id: editingCategory.id, ...form })
    } else {
      await createCategory.mutateAsync(form)
    }
    setView('list')
    setEditingCategory(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return
    await deleteCategory.mutateAsync(id)
  }

  async function handleSaveProducts() {
    if (!managingCategory) return
    await setProducts.mutateAsync({
      categoryId: managingCategory.id,
      productIds: Array.from(selectedProductIds),
    })
    setView('list')
    setManagingCategory(null)
  }

  function toggleProduct(productId: string) {
    setSelectedProductIds((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  const isPending = createCategory.isPending || updateCategory.isPending

  if (view === 'form') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={cancelForm}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← Voltar
          </button>
          <h1 className="text-3xl font-bold">
            {editingCategory ? 'Editar categoria' : 'Nova categoria'}
          </h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Título"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                required
                className="sm:col-span-2"
              />
              <FormField
                label="Subtítulo"
                value={form.subtitle ?? ''}
                onChange={(e) => setField('subtitle', e.target.value || null)}
                placeholder="Ex: Feitos na brasa com o melhor carvão"
                className="sm:col-span-2"
              />
              <FormField
                label="URL da imagem"
                type="url"
                value={form.imageUrl ?? ''}
                onChange={(e) => setField('imageUrl', e.target.value || null)}
                placeholder="https://..."
                className="sm:col-span-2"
              />
              <FormField
                label="Ordem de exibição"
                type="number"
                min="0"
                value={form.order}
                onChange={(e) => setField('order', parseInt(e.target.value) || 0)}
              />
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" loading={isPending}>
                  {editingCategory ? 'Salvar alterações' : 'Criar categoria'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (view === 'products' && managingCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('list')}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← Voltar
          </button>
          <div>
            <h1 className="text-3xl font-bold">Produtos da categoria</h1>
            <p className="text-muted-foreground mt-1">
              Selecione quais produtos pertencem à categoria "{managingCategory.title}"
            </p>
          </div>
        </div>

        {!products || products.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Nenhum produto cadastrado. Crie produtos primeiro.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const selected = selectedProductIds.has(product.id)
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => toggleProduct(product.id)}
                    className={`text-left rounded-xl border p-4 transition-all ${
                      selected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center ${
                          selected ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`}
                      >
                        {selected && (
                          <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="currentColor">
                            <path d="M8.5 2.5L4 7 1.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-20 w-full rounded-lg object-cover mb-2"
                          />
                        )}
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {Number(product.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSaveProducts} loading={setProducts.isPending}>
                Salvar ({selectedProductIds.size} produto{selectedProductIds.size !== 1 ? 's' : ''})
              </Button>
              <Button variant="outline" onClick={() => setView('list')}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground mt-1">
            Organize seus produtos por categoria no cardápio
          </p>
        </div>
        <Button onClick={openCreate}>+ Nova categoria</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando categorias...</p>
      ) : categories?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Nenhuma categoria criada ainda.</p>
            <Button className="mt-4" onClick={openCreate}>
              Criar primeira categoria
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {categories?.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {category.imageUrl && (
                    <img
                      src={category.imageUrl}
                      alt={category.title}
                      className="h-14 w-14 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">
                        #{category.order}
                      </span>
                      <h3 className="font-semibold">{category.title}</h3>
                    </div>
                    {category.subtitle && (
                      <p className="text-sm text-muted-foreground truncate">{category.subtitle}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {category.productIds.length} produto{category.productIds.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openManageProducts(category)}
                    >
                      Produtos
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(category)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(category.id)}
                      loading={deleteCategory.isPending}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
