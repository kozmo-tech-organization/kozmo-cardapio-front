import { Link } from 'react-router'
import { useCurrentRestaurant, useProducts } from '@repo/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'

export function DashboardPage() {
  const { data: restaurant } = useCurrentRestaurant()
  const { data: products } = useProducts()

  const inStockCount = products?.filter((p) => p.inStock).length ?? 0
  const outOfStockCount = (products?.length ?? 0) - inStockCount

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo, {restaurant?.name}</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seu cardápio digital em um só lugar
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{products?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{inStockCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fora de estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{outOfStockCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold mb-2">Link do cardápio</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Compartilhe este link com seus clientes ou gere um QR Code
            </p>
            <code className="block rounded bg-muted px-3 py-2 text-sm break-all">
              {window.location.origin}/menu/{restaurant?.slug}
            </code>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-3">
            <h2 className="font-semibold">Ações rápidas</h2>
            <div className="flex flex-col gap-2">
              <Link
                to="/admin/products"
                className="text-sm text-primary hover:underline"
              >
                + Adicionar produto
              </Link>
              <Link
                to="/admin/settings"
                className="text-sm text-primary hover:underline"
              >
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
