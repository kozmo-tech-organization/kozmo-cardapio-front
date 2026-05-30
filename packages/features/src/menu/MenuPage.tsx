import { useState } from 'react'
import { useParams } from 'react-router'
import { useMenu } from '@repo/queries'
import { Spinner } from '@repo/ui'
import { useTranslation, type Language } from '@repo/i18n'
import { ProductCard } from './ProductCard'
import { CartProvider, useCart } from './CartContext'
import { CartDrawer } from './CartDrawer'
import type { MenuCategory, MenuProduct } from '@repo/schemas'

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
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t(`lang.${lang}`)}
        className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 backdrop-blur-sm px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <span aria-hidden="true">{LANG_FLAGS[lang]}</span>
        <span>{LANG_LABELS[lang]}</span>
        <svg
          className="h-3 w-3 opacity-70"
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
          aria-label={t(`lang.${lang}`)}
          className="absolute right-0 top-full mt-1 w-36 rounded-lg bg-white shadow-xl ring-1 ring-black/10 overflow-hidden z-50"
        >
          {(['pt', 'en', 'es'] as Language[]).map((l) => (
            <li key={l} role="option" aria-selected={lang === l}>
              <button
                onClick={() => { setLang(l); setOpen(false) }}
                className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:bg-gray-50 ${
                  lang === l ? 'font-semibold text-gray-900' : 'text-gray-600'
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

function WhatsAppWidget({ phone }: { phone: string }) {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const phoneDigits = phone.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${phoneDigits}`

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('menu.whatsapp.assistant')}
          className="w-72 rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-[#25D366] px-4 py-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xl" aria-hidden="true">🤖</div>
            <div>
              <p className="text-sm font-semibold text-white">{t('menu.whatsapp.assistant')}</p>
              <p className="text-xs text-white/80">{t('menu.whatsapp.online')}</p>
            </div>
          </div>
          <div className="px-4 py-4 space-y-4">
            <div className="flex gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366]/10 text-base" aria-hidden="true">🤖</div>
              <p className="rounded-2xl rounded-tl-none bg-gray-100 px-3 py-2 text-sm text-gray-800">
                {t('menu.whatsapp.question')}
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                {t('menu.whatsapp.no')}
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#25D366] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#1ebe5d] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
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
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg hover:bg-[#1ebe5d] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white" aria-hidden="true" focusable="false">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </button>
    </div>
  )
}

function MenuContent() {
  const { slug } = useParams<{ slug: string }>()
  const { data: menu, isLoading, isError } = useMenu(slug ?? '')
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const { count } = useCart()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Carregando cardápio">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !menu) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold">{t('menu.notFound.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('menu.notFound.subtitle')}</p>
        </div>
      </main>
    )
  }

  const { restaurant, categories, products, uncategorizedProducts, promotions } = menu
  const { primaryColor, accentColor, secondaryColor, fontFamily } = restaurant.theme

  // Build a map of productId → highest discountPercent across active promotions
  const discountMap = new Map<string, number>()
  for (const promo of promotions) {
    for (const pid of promo.productIds) {
      const existing = discountMap.get(pid) ?? 0
      if (promo.discountPercent > existing) discountMap.set(pid, promo.discountPercent)
    }
  }

  const query = search.trim().toLowerCase()

  let displayCategories: MenuCategory[]
  let displayUncategorized: MenuProduct[]

  if (query) {
    displayCategories = []
    displayUncategorized = products.filter((p) => p.name.toLowerCase().includes(query))
  } else if (selectedCategoryId === null) {
    displayCategories = categories
    displayUncategorized = uncategorizedProducts
  } else {
    const cat = categories.find((c) => c.id === selectedCategoryId)
    displayCategories = cat ? [cat] : []
    displayUncategorized = []
  }

  const hasContent =
    displayCategories.some((c) => c.products.length > 0) || displayUncategorized.length > 0

  return (
    <div
      id="main-content"
      className="min-h-screen bg-background"
      style={{ fontFamily: fontFamily || 'Inter' }}
    >
      {/* Hero header */}
      <header
        style={restaurant.bannerUrl ? undefined : { background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)` }}
        className="relative"
      >
        {restaurant.bannerUrl && (
          <div className="absolute inset-0" aria-hidden="true">
            <img
              src={restaurant.bannerUrl}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-10 sm:py-14">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {restaurant.logoUrl && (
                <img
                  src={restaurant.logoUrl}
                  alt={`Logo de ${restaurant.name}`}
                  className="h-20 w-20 rounded-2xl object-cover border-2 border-white/40 shadow-lg shrink-0"
                />
              )}
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-sm">
                  {restaurant.name}
                </h1>
                <p className="mt-1 text-white/80 text-sm" aria-live="polite">
                  {t(
                    products.length !== 1 ? 'menu.items.other' : 'menu.items.one',
                    { count: products.length },
                  )}
                </p>
              </div>
            </div>
            <LanguageSelector />
          </div>

          {/* Search */}
          <div className="relative mt-6">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
            <input
              id="menu-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('menu.search')}
              aria-label={t('menu.search')}
              className="w-full rounded-xl bg-white/95 backdrop-blur-sm py-3 pl-10 pr-10 text-sm text-gray-800 shadow-lg placeholder:text-gray-400 focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Limpar busca"
                className="cursor-pointer absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded"
              >
                <span aria-hidden="true">✕</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Category navigation */}
      {!query && categories.length > 0 && (
        <nav
          aria-label={t('menu.allCategories')}
          className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm"
        >
          <div className="mx-auto max-w-4xl px-4">
            <div role="tablist" className="flex gap-1 overflow-x-auto py-3 scrollbar-none">
              <button
                role="tab"
                aria-selected={selectedCategoryId === null}
                onClick={() => setSelectedCategoryId(null)}
                className="cursor-pointer shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                style={
                  selectedCategoryId === null
                    ? { backgroundColor: primaryColor, color: secondaryColor || '#fff' }
                    : { backgroundColor: 'transparent', color: '#6b7280' }
                }
              >
                {t('menu.allCategories')}
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={selectedCategoryId === cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className="cursor-pointer shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                  style={
                    selectedCategoryId === cat.id
                      ? { backgroundColor: primaryColor, color: secondaryColor || '#fff' }
                      : { backgroundColor: 'transparent', color: '#6b7280' }
                  }
                >
                  {cat.imageUrl && (
                    <img
                      src={cat.imageUrl}
                      alt=""
                      aria-hidden="true"
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  )}
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Content */}
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
        {query ? (
          /* Search results */
          displayUncategorized.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm" role="status">
              <p className="text-gray-500 text-lg">{t('menu.noResults', { query: search })}</p>
              <button
                onClick={() => setSearch('')}
                className="cursor-pointer mt-3 text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded"
                style={{ color: accentColor }}
              >
                {t('menu.clearSearch')}
              </button>
            </div>
          ) : (
            <section aria-label={t('menu.results.other', { count: displayUncategorized.length, query: search })}>
              <p className="mb-4 text-sm text-gray-500" role="status" aria-live="polite">
                {t(
                  displayUncategorized.length !== 1 ? 'menu.results.other' : 'menu.results.one',
                  { count: displayUncategorized.length, query: search },
                )}
              </p>
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 list-none p-0">
                {displayUncategorized.map((product) => (
                  <li key={product.id}>
                    <ProductCard product={product} accentColor={accentColor} primaryColor={primaryColor} discountPercent={discountMap.get(product.id)} ordersEnabled={restaurant.ordersEnabled} />
                  </li>
                ))}
              </ul>
            </section>
          )
        ) : (
          /* Category view */
          <div className="space-y-10">
            {displayCategories.map((category) => (
              <section key={category.id} aria-labelledby={`cat-${category.id}`}>
                <div className="flex items-center gap-3 mb-5">
                  {category.imageUrl && (
                    <img
                      src={category.imageUrl}
                      alt=""
                      aria-hidden="true"
                      className="h-12 w-12 rounded-xl object-cover shadow-sm shrink-0"
                    />
                  )}
                  <div>
                    <h2 id={`cat-${category.id}`} className="text-xl font-bold text-gray-900">
                      {category.title}
                    </h2>
                    {category.subtitle && (
                      <p className="text-sm text-gray-500 mt-0.5">{category.subtitle}</p>
                    )}
                  </div>
                  <div
                    className="ml-3 h-px flex-1"
                    style={{ backgroundColor: `${primaryColor}30` }}
                    aria-hidden="true"
                  />
                </div>

                {category.products.length === 0 ? (
                  <p className="text-sm text-gray-400">{t('menu.categoryEmpty')}</p>
                ) : (
                  <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 list-none p-0">
                    {category.products.map((product) => (
                      <li key={product.id}>
                        <ProductCard product={product} accentColor={accentColor} primaryColor={primaryColor} discountPercent={discountMap.get(product.id)} ordersEnabled={restaurant.ordersEnabled} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {displayUncategorized.length > 0 && (
              <section aria-labelledby="others-heading">
                {displayCategories.length > 0 && (
                  <div className="flex items-center gap-3 mb-5">
                    <h2 id="others-heading" className="text-xl font-bold text-gray-900">
                      {t('menu.others')}
                    </h2>
                    <div
                      className="h-px flex-1"
                      style={{ backgroundColor: `${primaryColor}30` }}
                      aria-hidden="true"
                    />
                  </div>
                )}
                <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 list-none p-0">
                  {displayUncategorized.map((product) => (
                    <li key={product.id}>
                      <ProductCard product={product} accentColor={accentColor} primaryColor={primaryColor} discountPercent={discountMap.get(product.id)} ordersEnabled={restaurant.ordersEnabled} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!hasContent && (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm" role="status">
                <p className="text-gray-400 text-lg">{t('menu.empty')}</p>
              </div>
            )}
          </div>
        )}

        <footer className="mt-14 text-center text-xs text-gray-400 pb-6">
          {t('menu.footer')} <span className="font-semibold text-gray-500">Kozmo</span>
        </footer>
      </main>

      {restaurant.ordersEnabled && restaurant.whatsappPhone && (
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          restaurantId={restaurant.id}
          whatsappPhone={restaurant.whatsappPhone}
          deliveryEnabled={restaurant.deliveryEnabled}
          tableEnabled={restaurant.tableEnabled}
          primaryColor={primaryColor}
          accentColor={accentColor}
          slug={restaurant.slug}
        />
      )}

      {restaurant.ordersEnabled && restaurant.whatsappPhone && count > 0 && (
        <div
          className={`fixed z-40 transition-all duration-300 ${restaurant.whatsappPhone ? 'bottom-24' : 'bottom-6'} right-6`}
        >
          <button
            onClick={() => setCartOpen(true)}
            aria-label={t('menu.cart.openCart', { count })}
            className="cursor-pointer flex items-center gap-2 rounded-full px-5 py-3 text-white font-semibold shadow-xl hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ backgroundColor: primaryColor }}
          >
            <span aria-hidden="true">🛒</span>
            <span>{t('menu.cart.viewCart')}</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: accentColor }}>
              {count}
            </span>
          </button>
        </div>
      )}

      {restaurant.whatsappPhone && <WhatsAppWidget phone={restaurant.whatsappPhone} />}
    </div>
  )
}

export function MenuPage() {
  return (
    <CartProvider>
      <MenuContent />
    </CartProvider>
  )
}
