import { useParams } from 'react-router'
import { useMenu } from '@repo/queries'
import { Spinner } from '@repo/ui'
import { ProductCard } from './ProductCard'

export function MenuPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: menu, isLoading, isError } = useMenu(slug ?? '')

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
        <div className="mb-8 flex items-center gap-4">
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

        {products.length === 0 ? (
          <div className="rounded-xl border border-border p-12 text-center">
            <p className="text-muted-foreground text-lg">
              Nenhum item disponível no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Cardápio digital por <span className="font-medium">Kozmo</span>
        </footer>
      </div>
    </div>
  )
}
