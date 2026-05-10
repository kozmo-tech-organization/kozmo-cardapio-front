import { Link } from 'react-router'
import { useCurrentRestaurant, useMenu } from '@repo/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'text-base' : 'text-sm'
  return (
    <span className={cls}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  )
}

function RatingBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-4 text-right text-muted-foreground">{label}</span>
      <span className="text-yellow-400 text-xs">★</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-muted-foreground text-xs">{count}</span>
    </div>
  )
}

export function DashboardPage() {
  const { data: restaurant } = useCurrentRestaurant()
  const { data: menu } = useMenu(restaurant?.slug ?? '')

  const products = menu?.products ?? []

  const inStockCount = products.filter((p) => p.inStock).length
  const outOfStockCount = products.length - inStockCount

  const allReviews = products.flatMap((p) => p.reviews ?? [])
  const totalReviews = allReviews.length
  const globalAvg = totalReviews > 0
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: allReviews.filter((r) => r.rating === star).length,
  }))

  const topRated = [...products]
    .filter((p) => (p.reviews?.length ?? 0) > 0)
    .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
    .slice(0, 5)

  const recentReviews = [...allReviews]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((r) => ({
      ...r,
      productName: products.find((p) => p.id === r.productId)?.name ?? '—',
    }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo, {restaurant?.name}</h1>
        <p className="text-muted-foreground mt-1">Gerencie seu cardápio digital em um só lugar</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Produtos</p>
              <p className="text-3xl font-bold">{products.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Em estoque</p>
              <p className="text-3xl font-bold text-green-600">{inStockCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Avaliações</p>
              <p className="text-3xl font-bold">{totalReviews}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Nota média</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-bold">{globalAvg > 0 ? globalAvg.toFixed(1) : '—'}</p>
                {globalAvg > 0 && <span className="text-yellow-400 text-lg">★</span>}
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição de avaliações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {totalReviews === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma avaliação recebida ainda.</p>
            ) : (
              ratingCounts.map(({ star, count }) => (
                <RatingBar key={star} label={String(star)} count={count} max={totalReviews} />
              ))
            )}
            {totalReviews > 0 && (
              <p className="pt-2 text-xs text-muted-foreground">
                Média geral: <strong>{globalAvg.toFixed(1)} ★</strong> de {totalReviews} avaliação{totalReviews !== 1 ? 'ões' : ''}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Produtos mais bem avaliados</CardTitle>
          </CardHeader>
          <CardContent>
            {topRated.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma avaliação recebida ainda.</p>
            ) : (
              <div className="space-y-3">
                {topRated.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-4">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={p.averageRating ?? 0} />
                        <span className="text-xs text-muted-foreground">
                          {(p.averageRating ?? 0).toFixed(1)} · {p.reviews.length} avaliação{p.reviews.length !== 1 ? 'ões' : ''}
                        </span>
                      </div>
                    </div>
                    <div
                      className="h-1.5 w-20 rounded-full bg-muted overflow-hidden"
                      title={`${((p.averageRating ?? 0) / 5 * 100).toFixed(0)}%`}
                    >
                      <div
                        className="h-full rounded-full bg-yellow-400"
                        style={{ width: `${((p.averageRating ?? 0) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {recentReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avaliações recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {recentReviews.map((review) => (
                <div key={review.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{review.clientName}</span>
                        <span className="text-xs text-muted-foreground">em {review.productName}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <StarRating rating={review.rating} />
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="font-semibold mb-1">Link do cardápio</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Compartilhe com seus clientes ou gere um QR Code
            </p>
            <code className="block rounded-lg bg-muted px-3 py-2 text-sm break-all">
              {window.location.origin}/menu/{restaurant?.slug}
            </code>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-3">
            <h2 className="font-semibold">Ações rápidas</h2>
            <div className="flex flex-col gap-2">
              <Link to="/admin/products" className="text-sm text-primary hover:underline">
                + Adicionar produto
              </Link>
              <Link to="/admin/settings" className="text-sm text-primary hover:underline">
                Configurar tema do restaurante
              </Link>
              <a
                href={`/menu/${restaurant?.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Ver cardápio como cliente →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
