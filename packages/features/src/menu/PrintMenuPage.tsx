import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { useMenu } from '@repo/queries'
import { Spinner } from '@repo/ui'
import type { MenuCategory, MenuProduct } from '@repo/schemas'

type PrintFormat = 'digital' | 'simple'

// ─── Formato digital ────────────────────────────────────────────────────────

function DigitalProductItem({ product, discountMap, accentColor, primaryColor }: {
  product: MenuProduct
  discountMap: Map<string, number>
  accentColor: string
  primaryColor: string
}) {
  const discountPercent = discountMap.get(product.id)
  const effectivePrice = discountPercent
    ? Number(product.price) * (1 - discountPercent / 100)
    : Number(product.price)

  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-20 w-20 rounded-xl object-cover shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{product.name}</p>
        {product.description && (
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {discountPercent ? (
            <>
              <span className="text-xs text-gray-400 line-through">
                R$ {Number(product.price).toFixed(2).replace('.', ',')}
              </span>
              <span className="font-bold text-base" style={{ color: primaryColor }}>
                R$ {effectivePrice.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: primaryColor }}>
                -{discountPercent}%
              </span>
            </>
          ) : (
            <span className="font-bold text-base" style={{ color: accentColor }}>
              R$ {effectivePrice.toFixed(2).replace('.', ',')}
            </span>
          )}
          {product.preparationTimeMinutes && (
            <span className="text-xs text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">
              ~{product.preparationTimeMinutes} min
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function DigitalFormat({ restaurant, categories, uncategorizedProducts, discountMap }: {
  restaurant: ReturnType<typeof useMenu>['data'] extends undefined ? never : ReturnType<typeof useMenu>['data']['restaurant']
  categories: MenuCategory[]
  uncategorizedProducts: MenuProduct[]
  discountMap: Map<string, number>
}) {
  const { primaryColor, accentColor, fontFamily } = restaurant.theme

  return (
    <div style={{ fontFamily: fontFamily || 'Inter' }}>
      {/* Header */}
      <div
        className="rounded-2xl p-6 mb-6 flex items-center gap-4"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)` }}
      >
        {restaurant.logoUrl && (
          <img
            src={restaurant.logoUrl}
            alt={restaurant.name}
            className="h-16 w-16 rounded-xl object-cover border-2 border-white/40 shrink-0"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">{restaurant.name}</h1>
        </div>
      </div>

      {/* Categories */}
      {categories.map((category) => (
        <section key={category.id} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            {category.imageUrl && (
              <img src={category.imageUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
            )}
            <h2 className="text-lg font-bold text-gray-900">{category.title}</h2>
            <div className="h-px flex-1" style={{ backgroundColor: `${primaryColor}40` }} />
          </div>
          {category.subtitle && (
            <p className="text-sm text-gray-500 mb-3">{category.subtitle}</p>
          )}
          {category.products.map((p) => (
            <DigitalProductItem
              key={p.id}
              product={p}
              discountMap={discountMap}
              accentColor={accentColor}
              primaryColor={primaryColor}
            />
          ))}
        </section>
      ))}

      {/* Uncategorized */}
      {uncategorizedProducts.length > 0 && (
        <section className="mb-8">
          {categories.length > 0 && (
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-bold text-gray-900">Outros</h2>
              <div className="h-px flex-1" style={{ backgroundColor: `${primaryColor}40` }} />
            </div>
          )}
          {uncategorizedProducts.map((p) => (
            <DigitalProductItem
              key={p.id}
              product={p}
              discountMap={discountMap}
              accentColor={accentColor}
              primaryColor={primaryColor}
            />
          ))}
        </section>
      )}
    </div>
  )
}

// ─── Formato simples ─────────────────────────────────────────────────────────

function SimpleProductItem({ product, discountMap }: {
  product: MenuProduct
  discountMap: Map<string, number>
}) {
  const discountPercent = discountMap.get(product.id)
  const effectivePrice = discountPercent
    ? Number(product.price) * (1 - discountPercent / 100)
    : Number(product.price)

  return (
    <div className="flex items-baseline gap-1 py-1.5">
      <span className="font-medium text-gray-900 text-sm shrink-0">{product.name}</span>
      <span className="flex-1 border-b border-dotted border-gray-300 mx-2 mb-1" />
      <div className="flex items-center gap-1.5 shrink-0">
        {discountPercent && (
          <span className="text-xs text-gray-400 line-through">
            R$ {Number(product.price).toFixed(2).replace('.', ',')}
          </span>
        )}
        <span className={`text-sm font-bold ${discountPercent ? 'text-red-600' : 'text-gray-900'}`}>
          R$ {effectivePrice.toFixed(2).replace('.', ',')}
        </span>
      </div>
    </div>
  )
}

function SimpleFormat({ restaurant, categories, uncategorizedProducts, discountMap }: {
  restaurant: ReturnType<typeof useMenu>['data'] extends undefined ? never : ReturnType<typeof useMenu>['data']['restaurant']
  categories: MenuCategory[]
  uncategorizedProducts: MenuProduct[]
  discountMap: Map<string, number>
}) {
  return (
    <div className="font-sans">
      {/* Header */}
      <div className="text-center mb-8 pb-4 border-b-2 border-gray-900">
        {restaurant.logoUrl && (
          <img src={restaurant.logoUrl} alt={restaurant.name} className="h-16 w-16 rounded-full object-cover mx-auto mb-3" />
        )}
        <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
          {restaurant.name}
        </h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="h-px w-16 bg-gray-400" />
          <span className="text-xs text-gray-500 uppercase tracking-widest">Cardápio</span>
          <div className="h-px w-16 bg-gray-400" />
        </div>
      </div>

      {/* Categories */}
      {categories.map((category) => (
        <section key={category.id} className="mb-6">
          <h2 className="font-bold text-base uppercase tracking-wider text-gray-700 border-b border-gray-300 pb-1 mb-2">
            {category.title}
          </h2>
          {category.products.map((p) => (
            <SimpleProductItem key={p.id} product={p} discountMap={discountMap} />
          ))}
        </section>
      ))}

      {uncategorizedProducts.length > 0 && (
        <section className="mb-6">
          {categories.length > 0 && (
            <h2 className="font-bold text-base uppercase tracking-wider text-gray-700 border-b border-gray-300 pb-1 mb-2">
              Outros
            </h2>
          )}
          {uncategorizedProducts.map((p) => (
            <SimpleProductItem key={p.id} product={p} discountMap={discountMap} />
          ))}
        </section>
      )}

      <p className="text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-200">
        Cardápio digital por Kozmo
      </p>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export function PrintMenuPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const format = (searchParams.get('format') as PrintFormat) ?? 'simple'
  const { data: menu, isLoading, isError } = useMenu(slug ?? '')
  const [printing, setPrinting] = useState(false)

  function switchFormat(f: PrintFormat) {
    setSearchParams({ format: f })
  }

  function handlePrint() {
    setPrinting(true)
    setTimeout(() => {
      window.print()
      setPrinting(false)
    }, 100)
  }

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
        <p className="text-gray-500">Cardápio não encontrado.</p>
      </div>
    )
  }

  const { restaurant, categories, uncategorizedProducts, promotions } = menu
  const activeCategories = categories.filter((c) => c.products.length > 0)

  const discountMap = new Map<string, number>()
  for (const promo of promotions) {
    for (const pid of promo.productIds) {
      const existing = discountMap.get(pid) ?? 0
      if (promo.discountPercent > existing) discountMap.set(pid, promo.discountPercent)
    }
  }

  return (
    <>
      {/* Controles — ocultos na impressão */}
      <style>{`
        @media print {
          .print-controls { display: none !important; }
          body { margin: 0; }
        }
      `}</style>

      <div className="print-controls bg-gray-100 border-b border-gray-200 px-6 py-3 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <span className="text-sm font-medium text-gray-700">Formato:</span>
        <div className="flex gap-2">
          {([
            { value: 'simple', label: 'Simples (Lanchonete)' },
            { value: 'digital', label: 'Digital' },
          ] as { value: PrintFormat; label: string }[]).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => switchFormat(value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                format === value
                  ? 'bg-gray-900 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={handlePrint}
          disabled={printing}
          className="ml-auto flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect width="12" height="8" x="6" y="14" />
          </svg>
          Imprimir
        </button>
      </div>

      {/* Conteúdo imprimível */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {format === 'digital' ? (
          <DigitalFormat
            restaurant={restaurant}
            categories={activeCategories}
            uncategorizedProducts={uncategorizedProducts}
            discountMap={discountMap}
          />
        ) : (
          <SimpleFormat
            restaurant={restaurant}
            categories={activeCategories}
            uncategorizedProducts={uncategorizedProducts}
            discountMap={discountMap}
          />
        )}
      </div>
    </>
  )
}
