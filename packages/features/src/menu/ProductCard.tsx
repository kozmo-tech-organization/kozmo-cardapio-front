import React, { useState } from 'react'
import { Card, CardContent, Badge, Button, FormField, Label } from '@repo/ui'
import { useCreateReview } from '@repo/queries'
import type { MenuProduct } from '@repo/schemas'

interface ProductCardProps {
  product: MenuProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const createReview = useCreateReview()
  const [showReview, setShowReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({ clientName: '', comment: '', rating: 5 })
  const [reviewSent, setReviewSent] = useState(false)

  function setReviewField(field: string, value: any) {
    setReviewForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault()
    await createReview.mutateAsync({ productId: product.id, ...reviewForm })
    setReviewSent(true)
    setShowReview(false)
    setReviewForm({ clientName: '', comment: '', rating: 5 })
  }

  return (
    <Card className="overflow-hidden">
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
            <span className="flex items-center gap-1 text-sm font-medium text-yellow-600">
              ★ {product.averageRating}
              <span className="text-muted-foreground font-normal">({product.reviews.length})</span>
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground">{product.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">R$ {Number(product.price).toFixed(2)}</span>
          <Badge variant="outline">~{product.preparationTimeMinutes} min</Badge>
        </div>

        {product.reviews.length > 0 && (
          <div className="space-y-2 border-t pt-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avaliações</p>
            {product.reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{review.clientName}</span>
                  <span className="text-yellow-600">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
                <p className="text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        )}

        {!showReview && !reviewSent && (
          <Button variant="outline" size="sm" className="w-full" onClick={() => setShowReview(true)}>
            Avaliar produto
          </Button>
        )}

        {reviewSent && (
          <p className="text-center text-sm text-green-600">Avaliação enviada! Obrigado.</p>
        )}

        {showReview && (
          <form onSubmit={handleReviewSubmit} className="space-y-3 border-t pt-3">
            <p className="text-sm font-medium">Deixe sua avaliação</p>
            <FormField
              label="Seu nome"
              value={reviewForm.clientName}
              onChange={(e) => setReviewField('clientName', e.target.value)}
              required
              minLength={2}
            />
            <div className="space-y-1.5">
              <Label>Comentário</Label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewField('comment', e.target.value)}
                required
                minLength={5}
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Como foi sua experiência?"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nota</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewField('rating', star)}
                    className={`text-2xl transition-colors ${
                      star <= reviewForm.rating ? 'text-yellow-400' : 'text-muted-foreground/30'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={createReview.isPending}>
                Enviar
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowReview(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
