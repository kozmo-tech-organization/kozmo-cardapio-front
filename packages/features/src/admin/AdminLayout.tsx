import { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router'
import { useCurrentRestaurant, useLogout, useOrders, useWaiterCalls } from '@repo/queries'
import { useOrdersSocket } from './useOrdersSocket'
import { useWaiterCallsSocket } from './useWaiterCallsSocket'
import { useTranslation, type Language } from '@repo/i18n'

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

const NAV_KEYS = [
  {
    to: '/admin',
    labelKey: 'admin.nav.dashboard',
    exact: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true" focusable="false">
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
      </svg>
    ),
  },
  {
    to: '/admin/products',
    labelKey: 'admin.nav.products',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true" focusable="false">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
  },
  {
    to: '/admin/categories',
    labelKey: 'admin.nav.categories',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true" focusable="false">
        <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z" />
        <path d="M6 9.01V9" />
        <path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19" />
      </svg>
    ),
  },
  {
    to: '/admin/promotions',
    labelKey: 'admin.nav.promotions',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true" focusable="false">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    to: '/admin/reports',
    labelKey: 'admin.nav.reports',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true" focusable="false">
        <line x1="18" x2="18" y1="20" y2="10" />
        <line x1="12" x2="12" y1="20" y2="4" />
        <line x1="6" x2="6" y1="20" y2="14" />
      </svg>
    ),
  },
  {
    to: '/admin/calendar',
    labelKey: 'admin.nav.calendar',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true" focusable="false">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
      </svg>
    ),
  },
  {
    to: '/admin/orders',
    labelKey: 'admin.nav.orders',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true" focusable="false">
        <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z" />
        <path d="M6 9.01V9" />
        <rect x="13" y="2" width="9" height="9" rx="1" />
        <path d="m16 6 1.5 1.5L20 5" />
      </svg>
    ),
  },
  {
    to: '/admin/tables',
    labelKey: 'admin.nav.tables',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true" focusable="false">
        <rect x="3" y="3" width="18" height="7" rx="1" />
        <path d="M3 10v8" />
        <path d="M21 10v8" />
        <path d="M3 14h18" />
      </svg>
    ),
  },
  {
    to: '/admin/waiter-calls',
    labelKey: 'admin.nav.waiterCalls',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true" focusable="false">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    to: '/admin/coupons',
    labelKey: 'admin.nav.coupons',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true" focusable="false">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path d="M13 5v2" />
        <path d="M13 17v2" />
        <path d="M13 11v2" />
      </svg>
    ),
  },
  {
    to: '/admin/customers',
    labelKey: 'admin.nav.customers',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true" focusable="false">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: '/admin/visualizar',
    labelKey: 'admin.nav.view',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true" focusable="false">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    to: '/admin/settings',
    labelKey: 'admin.nav.settings',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true" focusable="false">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
] as const

const LANG_FLAGS: Record<Language, string> = { pt: '🇧🇷', en: '🇺🇸', es: '🇪🇸' }
const LANG_LABELS: Record<Language, string> = { pt: 'PT', en: 'EN', es: 'ES' }

function LanguageSelector() {
  const { lang, setLang, t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false)
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t(`lang.${lang}`)}
        className="cursor-pointer flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        <span aria-hidden="true">{LANG_FLAGS[lang]}</span>
        <span>{LANG_LABELS[lang]}</span>
        <svg
          className="h-3 w-3 ml-auto"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
          focusable="false"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('lang.pt')}
          className="absolute bottom-full left-0 mb-1 w-36 rounded-lg bg-white shadow-lg ring-1 ring-black/10 overflow-hidden z-50"
        >
          {(['pt', 'en', 'es'] as Language[]).map((l) => (
            <li key={l} role="option" aria-selected={lang === l}>
              <button
                onClick={() => { setLang(l); setOpen(false) }}
                className={`cursor-pointer flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:bg-orange-50 ${
                  lang === l ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-700'
                }`}
              >
                <span aria-hidden="true">{LANG_FLAGS[l]}</span>
                <span>{t(`lang.${l}`)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function AdminLayout() {
  const { data: restaurant } = useCurrentRestaurant()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function isActive(item: (typeof NAV_KEYS)[number]) {
    return 'exact' in item && item.exact
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to)
  }

  useOrdersSocket()
  useWaiterCallsSocket()
  const { data: orders } = useOrders()
  const { data: waiterCalls } = useWaiterCalls()
  const pendingCount = orders?.filter((o) => o.status === 'pending').length ?? 0
  const pendingWaiterCallsCount = waiterCalls?.filter((c) => c.status === 'pending').length ?? 0

  const primaryColor = restaurant?.theme?.primaryColor || '#f97316'
  const primaryHsl = hexToHsl(primaryColor)
  const accentHsl = restaurant?.theme?.accentColor ? hexToHsl(restaurant.theme.accentColor) : primaryHsl

  const sidebarContent = (
    <>
      <div
        className="flex h-16 shrink-0 items-center gap-3 px-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.15)' }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white font-bold text-sm"
          aria-hidden="true"
        >
          K
        </div>
        <span className="font-bold text-white text-lg tracking-wide">Kozmo</span>
      </div>

      <nav aria-label={t('admin.nav.dashboard')} className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_KEYS.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              aria-current={active ? 'page' : undefined}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              style={
                active
                  ? { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }
                  : { color: 'rgba(255,255,255,0.7)' }
              }
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)'
                if (!active) (e.currentTarget as HTMLElement).style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = ''
                if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'
              }}
            >
              {item.icon}
              {t(item.labelKey)}
              {item.to === '/admin/orders' && pendingCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-white/30 px-1.5 text-xs font-bold text-white">
                  {pendingCount}
                </span>
              )}
              {item.to === '/admin/waiter-calls' && pendingWaiterCallsCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-white/30 px-1.5 text-xs font-bold text-white">
                  {pendingWaiterCallsCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div
        className="shrink-0 border-t p-3 space-y-2"
        style={{ borderColor: 'rgba(255,255,255,0.15)' }}
      >
        <LanguageSelector />
        <div className="px-2.5 py-1.5" aria-live="polite">
          <p className="text-xs text-white/50 truncate">{restaurant?.name}</p>
          <p className="text-xs text-white/50 truncate">{restaurant?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-red-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true" focusable="false">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
          {t('admin.layout.logout')}
        </button>
      </div>
    </>
  )

  const themeVars = {
    '--primary': primaryHsl,
    '--ring': primaryHsl,
    '--accent': accentHsl,
  } as React.CSSProperties

  return (
    <div className="flex min-h-screen bg-background" style={themeVars}>
      {/* Desktop sidebar */}
      <aside
        aria-label="Navegação do painel"
        className="hidden lg:flex w-60 shrink-0 flex-col fixed inset-y-0 left-0 z-30"
        style={{ backgroundColor: primaryColor }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        aria-label="Navegação do painel"
        aria-hidden={!mobileOpen}
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-60 flex flex-col transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: primaryColor }}
      >
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <header className="lg:hidden flex h-14 items-center gap-3 border-b border-border bg-card px-4 shadow-sm">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-sidebar"
            className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true" focusable="false">
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-md text-white font-bold text-xs"
              style={{ backgroundColor: primaryColor }}
              aria-hidden="true"
            >K</div>
            <span className="font-bold text-foreground">Kozmo</span>
          </div>
        </header>

        <main id="main-content" className="flex-1 p-6 lg:p-8" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
