import { useState } from 'react'
import { Card, CardContent, Badge, Button, FormField, Label } from '@repo/ui'
import { useCreateReview } from '@repo/queries'
import { useTranslation } from '@repo/i18n'
import type { MenuProduct } from '@repo/schemas'

interface ProductCardProps {
  product: MenuProduct
  accentColor?: string
  primaryColor?: string
  discountPercent?: number
}

export function ProductCard({ product, accentColor, primaryColor, discountPercent }: ProductCardProps) {
  const createReview = useCreateReview()
  const { t } = useTranslation()
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

  return (
    <article aria-label={product.name}>
      <Card className="overflow-hidden h-full">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-48 w-full object-cover"
          />
        )}
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            {product.averageRating && (
              <span
                className="flex items-center gap-1 text-sm font-medium text-yellow-600"
                aria-label={`Nota ${product.averageRating} de 5, ${product.reviews.length} ${product.reviews.length === 1 ? t('admin.dashboard.review.one') : t('admin.dashboard.review.other')}`}
              >
                <span aria-hidden="true">★ {product.averageRating}</span>
                <span className="text-muted-foreground font-normal" aria-hidden="true">
                  ({product.reviews.length})
                </span>
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground">{product.description}</p>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {discountPercent ? (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    R$ {Number(product.price).toFixed(2)}
                  </span>
                  <span
                    className="text-xl font-bold"
                    style={primaryColor ? { color: primaryColor } : {}}
                  >
                    R$ {(Number(product.price) * (1 - discountPercent / 100)).toFixed(2)}
                  </span>
                  <span
                    className="text-xs font-semibold px-1.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: primaryColor || '#f97316' }}
                  >
                    -{discountPercent}%
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold" style={accentColor ? { color: accentColor } : {}}>
                  R$ {Number(product.price).toFixed(2)}
                </span>
              )}
            </div>
            <Badge variant="outline">~{product.preparationTimeMinutes} min</Badge>
          </div>

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
                      aria-hidden="false"
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
                      className={`text-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded ${
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
  )
}
