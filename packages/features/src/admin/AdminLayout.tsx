import { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router'
import { useCurrentRestaurant, useLogout } from '@repo/queries'
import { Button } from '@repo/ui'
import { useTranslation, type Language } from '@repo/i18n'

const NAV_KEYS = [
  {
    to: '/admin',
    labelKey: 'admin.nav.dashboard',
    exact: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z" />
        <path d="M6 9.01V9" />
        <path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19" />
      </svg>
    ),
  },
  {
    to: '/admin/visualizar',
    labelKey: 'admin.nav.view',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    to: '/admin/settings',
    labelKey: 'admin.nav.settings',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
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
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-orange-100 hover:bg-white/15 transition-colors"
      >
        <span>{LANG_FLAGS[lang]}</span>
        <span>{LANG_LABELS[lang]}</span>
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 rounded-lg bg-white shadow-lg ring-1 ring-black/5 overflow-hidden z-50">
          {(['pt', 'en', 'es'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => { setLang(l); setOpen(false) }}
              className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-orange-50 ${
                lang === l ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-700'
              }`}
            >
              <span>{LANG_FLAGS[l]}</span>
              <span>{t(`lang.${l}`)}</span>
            </button>
          ))}
        </div>
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-orange-500 shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <span className="font-bold text-lg text-white tracking-wide">Kozmo</span>

              <nav className="hidden items-center gap-1 sm:flex">
                {NAV_KEYS.map((item) => {
                  const active = isActive(item)
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-white text-orange-600'
                          : 'text-orange-100 hover:bg-white/15 hover:text-white'
                      }`}
                    >
                      {item.icon}
                      {t(item.labelKey)}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-orange-100 sm:block">
                {restaurant?.email}
              </span>
              <div className="hidden sm:flex items-center gap-2">
                <LanguageSelector />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="bg-white text-orange-600 border-white hover:bg-orange-50 hover:text-orange-700"
                >
                  {t('admin.layout.logout')}
                </Button>
              </div>

              <button
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Menu"
                className="sm:hidden flex h-9 w-9 items-center justify-center rounded-md text-white hover:bg-white/15 transition-colors"
              >
                {mobileOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="sm:hidden border-t border-white/20 bg-orange-500 px-4 pb-4 pt-2">
            <nav className="flex flex-col gap-1">
              {NAV_KEYS.map((item) => {
                const active = isActive(item)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-white text-orange-600'
                        : 'text-orange-100 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {t(item.labelKey)}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-3">
              <span className="text-xs text-orange-100 truncate">{restaurant?.email}</span>
              <div className="flex items-center gap-2">
                <LanguageSelector />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="bg-white text-orange-600 border-white hover:bg-orange-50 hover:text-orange-700"
                >
                  {t('admin.layout.logout')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
