import { useState } from 'react'
import { useParams } from 'react-router'
import { useMenu } from '@repo/queries'
import { Spinner } from '@repo/ui'
import { useTranslation, type Language } from '@repo/i18n'
import { ProductCard } from './ProductCard'
import type { MenuCategory } from '@repo/schemas'

const LANG_FLAGS: Record<Language, string> = { pt: '🇧🇷', en: '🇺🇸', es: '🇪🇸' }
const LANG_LABELS: Record<Language, string> = { pt: 'PT', en: 'EN', es: 'ES' }

function LanguageSelector() {
  const { lang, setLang, t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <div
      className="relative shrink-0"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false)
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <span>{LANG_FLAGS[lang]}</span>
        <span>{LANG_LABELS[lang]}</span>
        <svg className="h-3 w-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 rounded-lg bg-background shadow-lg ring-1 ring-border overflow-hidden z-50">
          {(['pt', 'en', 'es'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => { setLang(l); setOpen(false) }}
              className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-muted ${
                lang === l ? 'bg-muted text-primary font-medium' : 'text-foreground'
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

function WhatsAppWidget({ phone }: { phone: string }) {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const phoneDigits = phone.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${phoneDigits}`

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-72 rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-[#25D366] px-4 py-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xl">
              🤖
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{t('menu.whatsapp.assistant')}</p>
              <p className="text-xs text-white/80">{t('menu.whatsapp.online')}</p>
            </div>
          </div>
          <div className="px-4 py-4 space-y-4">
            <div className="flex gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366]/10 text-base">
                🤖
              </div>
              <div className="rounded-2xl rounded-tl-none bg-gray-100 px-3 py-2 text-sm text-gray-800">
                {t('menu.whatsapp.question')}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setOpen(false)}
                className="rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {t('menu.whatsapp.no')}
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#25D366] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#1ebe5d] transition-colors"
              >
                {t('menu.whatsapp.yes')}
              </a>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t('menu.whatsapp.ariaLabel')}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg hover:bg-[#1ebe5d] transition-colors"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </button>
    </div>
  )
}

export function MenuPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: menu, isLoading, isError } = useMenu(slug ?? '')
  const { t } = useTranslation()
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
          <h1 className="text-2xl font-bold">{t('menu.notFound.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('menu.notFound.subtitle')}
          </p>
        </div>
      </div>
    )
  }

  const { restaurant, categories, products, uncategorizedProducts } = menu
  const theme = restaurant.theme

  const query = search.trim().toLowerCase()

  const filteredCategories: MenuCategory[] = query ? [] : categories

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
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {restaurant.logoUrl && (
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-border shrink-0"
              />
            )}
            <div className="min-w-0">
              <h1 className="text-3xl font-bold truncate">{restaurant.name}</h1>
              <p className="text-muted-foreground mt-1">
                {t(totalItems !== 1 ? 'menu.items.other' : 'menu.items.one', { count: totalItems })}
              </p>
            </div>
          </div>
          <LanguageSelector />
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
            placeholder={t('menu.search')}
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
          filteredUncategorized.length === 0 ? (
            <div className="rounded-xl border border-border p-12 text-center">
              <p className="text-muted-foreground text-lg">
                {t('menu.noResults', { query: search })}
              </p>
              <button onClick={() => setSearch('')} className="mt-3 text-sm text-primary hover:underline">
                {t('menu.clearSearch')}
              </button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {t(
                  filteredUncategorized.length !== 1 ? 'menu.results.other' : 'menu.results.one',
                  { count: filteredUncategorized.length, query: search },
                )}
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredUncategorized.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )
        ) : (
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
                  <p className="text-sm text-muted-foreground">{t('menu.categoryEmpty')}</p>
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
                  <h2 className="text-xl font-bold mb-4">{t('menu.others')}</h2>
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
                <p className="text-muted-foreground text-lg">{t('menu.empty')}</p>
              </div>
            )}
          </div>
        )}

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          {t('menu.footer')} <span className="font-medium">Kozmo</span>
        </footer>
      </div>

      {restaurant.whatsappPhone && <WhatsAppWidget phone={restaurant.whatsappPhone} />}
    </div>
  )
}
