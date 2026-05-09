import { Link, Outlet, useNavigate, useLocation } from 'react-router'
import { useCurrentRestaurant, useLogout } from '@repo/queries'
import { Button } from '@repo/ui'

const navItems = [
  { to: '/admin', label: 'Dashboard', exact: true },
  { to: '/admin/products', label: 'Produtos' },
  { to: '/admin/settings', label: 'Configurações' },
]

export function AdminLayout() {
  const { data: restaurant } = useCurrentRestaurant()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <span className="font-bold text-lg">Kozmo</span>
              <nav className="hidden items-center gap-1 sm:flex">
                {navItems.map((item) => {
                  const isActive = item.exact
                    ? location.pathname === item.to
                    : location.pathname.startsWith(item.to)
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted-foreground sm:block">
                {restaurant?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
