import { useState } from 'react'
import { useParams } from 'react-router'
import { useMenu } from '@repo/queries'
import { Spinner } from '@repo/ui'
import { ProductCard } from './ProductCard'
import type { MenuCategory } from '@repo/schemas'

export function MenuPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: menu, isLoading, isError } = useMenu(slug ?? '')
  const [search, setSearch] = useState('')

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !menu) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold">Cardápio não encontrado</h1>
          <p className="text-muted-foreground mt-2">
            Este link de cardápio não existe ou foi removido.
          </p>
        </div>
      </div>
    )
  }

  const { restaurant, categories, products, uncategorizedProducts } = menu
  const theme = restaurant.theme

  const query = search.trim().toLowerCase()

  const filteredCategories: MenuCategory[] = query
    ? []
    : categories

  const filteredUncategorized = query
    ? products.filter((p) => p.name.toLowerCase().includes(query))
    : uncategorizedProducts

  const totalItems = products.length

  return (
    <div
      className="min-h-screen bg-background"
      style={{
        '--color-primary': theme.primaryColor,
        '--color-accent': theme.accentColor,
      } as React.CSSProperties}
    >
      {restaurant.bannerUrl && (
        <div className="h-48 w-full overflow-hidden sm:h-64">
          <img src={restaurant.bannerUrl} alt={restaurant.name} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          {restaurant.logoUrl && (
            <img
              src={restaurant.logoUrl}
              alt={restaurant.name}
              className="h-16 w-16 rounded-full object-cover border-2 border-border"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
            <p className="text-muted-foreground mt-1">{totalItems} itens disponíveis</p>
          </div>
        </div>

        <div className="relative mb-6">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar no cardápio..."
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-4 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>

        {query ? (
          /* Modo busca: exibe todos os produtos filtrados em flat list */
          filteredUncategorized.length === 0 ? (
            <div className="rounded-xl border border-border p-12 text-center">
              <p className="text-muted-foreground text-lg">
                Nenhum item encontrado para "<strong>{search}</strong>".
              </p>
              <button onClick={() => setSearch('')} className="mt-3 text-sm text-primary hover:underline">
                Limpar busca
              </button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {filteredUncategorized.length} resultado{filteredUncategorized.length !== 1 ? 's' : ''} para "{search}"
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredUncategorized.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )
        ) : (
          /* Modo normal: categorias + não categorizados */
          <div className="space-y-10">
            {filteredCategories.map((category) => (
              <section key={category.id}>
                <div className="flex items-center gap-3 mb-4">
                  {category.imageUrl && (
                    <img
                      src={category.imageUrl}
                      alt={category.title}
                      className="h-12 w-12 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{category.title}</h2>
                    {category.subtitle && (
                      <p className="text-sm text-muted-foreground">{category.subtitle}</p>
                    )}
                  </div>
                </div>

                {category.products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum item nesta categoria.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {category.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </section>
            ))}

            {uncategorizedProducts.length > 0 && (
              <section>
                {categories.length > 0 && (
                  <h2 className="text-xl font-bold mb-4">Outros</h2>
                )}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {uncategorizedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {categories.length === 0 && uncategorizedProducts.length === 0 && (
              <div className="rounded-xl border border-border p-12 text-center">
                <p className="text-muted-foreground text-lg">Nenhum item disponível no momento.</p>
              </div>
            )}
          </div>
        )}

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Cardápio digital por <span className="font-medium">Kozmo</span>
        </footer>
      </div>
    </div>
  )
}
