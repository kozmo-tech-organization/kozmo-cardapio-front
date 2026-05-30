import { useState } from 'react'
import { Card, CardContent, Badge, Button, FormField, Label } from '@repo/ui'
import { useCreateReview } from '@repo/queries'
import { useTranslation } from '@repo/i18n'
import type { MenuProduct, OptionGroup, SelectedOption } from '@repo/schemas'
import { useCart } from './CartContext'

interface OptionsModalProps {
  product: MenuProduct
  effectivePrice: number
  primaryColor: string
  onConfirm: (options: SelectedOption[], observation: string) => void
  onClose: () => void
}

function OptionsModal({ product, effectivePrice, primaryColor, onConfirm, onClose }: OptionsModalProps) {
  const [selected, setSelected] = useState<Record<string, string[]>>({})
  const [observation, setObservation] = useState('')

  function toggleOption(group: OptionGroup, itemId: string) {
    setSelected((prev) => {
      const current = prev[group.id] ?? []
      if (group.max === 1) {
        return { ...prev, [group.id]: current.includes(itemId) ? [] : [itemId] }
      }
      if (current.includes(itemId)) {
        return { ...prev, [group.id]: current.filter((id) => id !== itemId) }
      }
      if (current.length >= group.max) return prev
      return { ...prev, [group.id]: [...current, itemId] }
    })
  }

  function isValid() {
    return product.options.every((group) => {
      if (!group.required) return true
      return (selected[group.id]?.length ?? 0) >= group.min
    })
  }

  function handleConfirm() {
    const flat: SelectedOption[] = []
    for (const group of product.options) {
      const ids = selected[group.id] ?? []
      for (const itemId of ids) {
        const item = group.items.find((i) => i.id === itemId)
        if (item) flat.push({ groupId: group.id, groupName: group.name, itemId: item.id, itemName: item.name, priceAdd: item.priceAdd })
      }
    }
    onConfirm(flat, observation)
  }

  const extraTotal = Object.entries(selected).flatMap(([groupId, ids]) => {
    const group = product.options.find((g) => g.id === groupId)
    return ids.map((id) => group?.items.find((i) => i.id === id)?.priceAdd ?? 0)
  }).reduce((s, v) => s + v, 0)

  return (
    <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">{product.name}</h2>
            <p className="text-sm font-bold mt-0.5" style={{ color: primaryColor }}>
              R$ {(effectivePrice + extraTotal).toFixed(2).replace('.', ',')}
            </p>
          </div>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-700 transition-colors rounded">
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {product.options.map((group) => (
            <div key={group.id}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-800">{group.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${group.required ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                  {group.required ? 'Obrigatório' : 'Opcional'}
                  {group.max > 1 ? ` · até ${group.max}` : ''}
                </span>
              </div>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const isSelected = (selected[group.id] ?? []).includes(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleOption(group, item.id)}
                      className={`cursor-pointer w-full flex items-center justify-between rounded-xl border-2 px-4 py-2.5 text-sm transition-colors ${
                        isSelected ? 'border-transparent text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                      style={isSelected ? { backgroundColor: primaryColor } : {}}
                    >
                      <span className="font-medium">{item.name}</span>
                      {item.priceAdd > 0 && (
                        <span className={`text-xs font-semibold ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                          +R$ {item.priceAdd.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <div>
            <Label htmlFor="obs-field">Observação (opcional)</Label>
            <textarea
              id="obs-field"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={2}
              placeholder="Ex: sem cebola, bem passado..."
              className="mt-1.5 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          <Button
            className="w-full cursor-pointer"
            disabled={!isValid()}
            onClick={handleConfirm}
            style={{ backgroundColor: primaryColor, color: '#fff' }}
          >
            Adicionar · R$ {(effectivePrice + extraTotal).toFixed(2).replace('.', ',')}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface ProductCardProps {
  product: MenuProduct
  accentColor?: string
  primaryColor?: string
  discountPercent?: number
  ordersEnabled?: boolean
}

export function ProductCard({ product, accentColor, primaryColor, discountPercent, ordersEnabled }: ProductCardProps) {
  const createReview = useCreateReview()
  const { t } = useTranslation()
  const { addItem, removeItem, updateQuantity, items } = useCart()
  const [showOptions, setShowOptions] = useState(false)

  const effectivePrice = discountPercent
    ? Number(product.price) * (1 - discountPercent / 100)
    : Number(product.price)

  const cartItems = items.filter((i) => i.product.id === product.id)
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0)
  const [showReview, setShowReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({ clientName: '', comment: '', rating: 5 })
  const [reviewSent, setReviewSent] = useState(false)

  function setReviewField(field: string, value: unknown) {
    setReviewForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleReviewSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    await createReview.mutateAsync({ productId: product.id, ...reviewForm })
    setReviewSent(true)
    setShowReview(false)
    setReviewForm({ clientName: '', comment: '', rating: 5 })
  }

  function handleAddToCart() {
    if (product.options && product.options.length > 0) {
      setShowOptions(true)
    } else {
      addItem(product, effectivePrice)
    }
  }

  function handleOptionsConfirm(opts: SelectedOption[], obs: string) {
    addItem(product, effectivePrice, opts, obs)
    setShowOptions(false)
  }

  const btnColor = primaryColor || accentColor || '#f97316'

  return (
    <>
      <article aria-label={product.name}>
        <Card className="overflow-hidden h-full flex flex-col">
          {product.imageUrl ? (
            <div className="relative shrink-0">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-44 w-full object-cover"
              />
              {discountPercent && (
                <span
                  className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full text-white shadow"
                  style={{ backgroundColor: btnColor }}
                >
                  -{discountPercent}%
                </span>
              )}
              {product.averageRating && (
                <span
                  className="absolute top-2 right-2 flex items-center gap-0.5 text-xs font-bold bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm"
                  aria-label={`Nota ${product.averageRating} de 5`}
                >
                  <span aria-hidden="true">★ {product.averageRating}</span>
                </span>
              )}
            </div>
          ) : null}

          <CardContent className="p-4 flex flex-col flex-1 gap-3">
            <div>
              {!product.imageUrl && product.averageRating && (
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-base leading-snug">{product.name}</h3>
                  <span
                    className="flex items-center gap-1 text-sm font-medium text-yellow-600 shrink-0"
                    aria-label={`Nota ${product.averageRating} de 5`}
                  >
                    <span aria-hidden="true">★ {product.averageRating}</span>
                    <span className="text-muted-foreground font-normal" aria-hidden="true">
                      ({product.reviews.length})
                    </span>
                  </span>
                </div>
              )}
              {(product.imageUrl || !product.averageRating) && (
                <h3 className="font-semibold text-base leading-snug">{product.name}</h3>
              )}
              {product.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
              )}
            </div>

            <div className="flex items-end justify-between gap-2">
              <div className="flex flex-col">
                {discountPercent ? (
                  <>
                    <span className="text-xs text-muted-foreground line-through leading-none">
                      R$ {Number(product.price).toFixed(2)}
                    </span>
                    <span className="text-xl font-bold leading-tight" style={{ color: btnColor }}>
                      R$ {effectivePrice.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-bold" style={accentColor ? { color: accentColor } : {}}>
                    R$ {effectivePrice.toFixed(2)}
                  </span>
                )}
                {product.options && product.options.length > 0 && (
                  <span className="text-xs text-muted-foreground mt-0.5">+ opcionais</span>
                )}
              </div>
              <Badge variant="outline" className="shrink-0 mb-0.5">~{product.preparationTimeMinutes} min</Badge>
            </div>

            <div className="flex-1" />

            {ordersEnabled && product.inStock && (
              cartCount > 0 ? (
                <div className="space-y-1.5">
                  <div
                    className="flex items-center w-full rounded-xl overflow-hidden border-2"
                    style={{ borderColor: btnColor }}
                    role="group"
                    aria-label={`Quantidade de ${product.name} no carrinho`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const last = cartItems[cartItems.length - 1]
                        if (last) {
                          if (last.quantity <= 1) removeItem(last.cartKey)
                          else updateQuantity(last.cartKey, last.quantity - 1)
                        }
                      }}
                      aria-label={t('menu.cart.decrease')}
                      className="cursor-pointer flex-1 py-2.5 font-bold text-xl flex items-center justify-center transition-colors hover:bg-black/5"
                      style={{ color: btnColor }}
                    >
                      −
                    </button>
                    <span
                      className="font-bold text-sm px-3 py-2.5 text-white min-w-10 text-center"
                      aria-live="polite"
                      style={{ backgroundColor: btnColor }}
                    >
                      {cartCount}
                    </span>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      aria-label={t('menu.cart.increase')}
                      className="cursor-pointer flex-1 py-2.5 font-bold text-xl flex items-center justify-center transition-colors hover:bg-black/5"
                      style={{ color: btnColor }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  aria-label={t('menu.cart.addItem', { name: product.name })}
                  className="cursor-pointer w-full py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 shadow-sm"
                  style={{ backgroundColor: btnColor }}
                >
                  <span aria-hidden="true">+</span> {t('menu.cart.add')}
                </button>
              )
            )}

            {product.reviews.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t('menu.product.reviews')}
                </p>
                {product.reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{review.clientName}</span>
                      <span
                        className="text-yellow-600"
                        aria-label={`${review.rating} de 5 estrelas`}
                      >
                        <span aria-hidden="true">
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </span>
                      </span>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {!showReview && !reviewSent && (
              <Button variant="outline" size="sm" className="w-full" onClick={() => setShowReview(true)}>
                {t('menu.product.rate')}
              </Button>
            )}

            {reviewSent && (
              <p className="text-center text-sm text-green-600" role="status">
                {t('menu.product.reviewSent')}
              </p>
            )}

            {showReview && (
              <form onSubmit={handleReviewSubmit} className="space-y-3 border-t pt-3" noValidate>
                <p className="text-sm font-medium">{t('menu.product.leaveReview')}</p>
                <FormField
                  label={t('menu.product.yourName')}
                  value={reviewForm.clientName}
                  onChange={(e) => setReviewField('clientName', e.target.value)}
                  required
                  minLength={2}
                />
                <div className="space-y-1.5">
                  <Label htmlFor={`comment-${product.id}`}>{t('menu.product.comment')}</Label>
                  <textarea
                    id={`comment-${product.id}`}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewField('comment', e.target.value)}
                    required
                    minLength={5}
                    rows={2}
                    aria-required="true"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder={t('menu.product.commentPlaceholder')}
                  />
                </div>
                <fieldset className="space-y-1.5">
                  <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t('menu.product.rating')}
                  </legend>
                  <div className="flex gap-1" role="group" aria-label={t('menu.product.rating')}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewField('rating', star)}
                        aria-label={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
                        aria-pressed={star <= reviewForm.rating}
                        className={`cursor-pointer text-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded ${
                          star <= reviewForm.rating ? 'text-yellow-400' : 'text-muted-foreground/30'
                        }`}
                      >
                        <span aria-hidden="true">★</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" loading={createReview.isPending}>
                    {t('menu.product.submit')}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setShowReview(false)}>
                    {t('menu.product.cancel')}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </article>

      {showOptions && (
        <OptionsModal
          product={product}
          effectivePrice={effectivePrice}
          primaryColor={btnColor}
          onConfirm={handleOptionsConfirm}
          onClose={() => setShowOptions(false)}
        />
      )}
    </>
  )
}
