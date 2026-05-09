import { useState } from 'react'
import { useParams } from 'react-router'
import { useMenu } from '@repo/queries'
import { Spinner } from '@repo/ui'
import { ProductCard } from './ProductCard'

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

  const { restaurant, products } = menu
  const theme = restaurant.theme

  const filtered = search.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products

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
            <p className="text-muted-foreground mt-1">{products.length} itens disponíveis</p>
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

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border p-12 text-center">
            {search ? (
              <>
                <p className="text-muted-foreground text-lg">
                  Nenhum item encontrado para "<strong>{search}</strong>".
                </p>
                <button onClick={() => setSearch('')} className="mt-3 text-sm text-primary hover:underline">
                  Limpar busca
                </button>
              </>
            ) : (
              <p className="text-muted-foreground text-lg">Nenhum item disponível no momento.</p>
            )}
          </div>
        ) : (
          <>
            {search && (
              <p className="mb-4 text-sm text-muted-foreground">
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para "{search}"
              </p>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Cardápio digital por <span className="font-medium">MenuPro</span>
        </footer>
      </div>
    </div>
  )
}
