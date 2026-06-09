import { useState, useRef } from 'react'
import { useCart } from './CartContext'
import { useTranslation } from '@repo/i18n'
import { Button, FormField, useToast } from '@repo/ui'
import { useCreateOrder, useValidateCoupon } from '@repo/queries'

interface CheckoutModalProps {
  restaurantId: string
  whatsappPhone: string
  deliveryEnabled: boolean
  tableEnabled: boolean
  primaryColor: string
  onClose: () => void
  onSuccess: (orderId: string) => void
}

function CheckoutModal({ restaurantId, whatsappPhone, deliveryEnabled, tableEnabled, primaryColor, onClose, onSuccess }: CheckoutModalProps) {
  const { items, subtotal, total, discountAmount, appliedCoupon, setAppliedCoupon, clear } = useCart()
  const { t } = useTranslation()
  const createOrder = useCreateOrder()
  const validateCoupon = useValidateCoupon()
  const { toast } = useToast()
  const submittingRef = useRef(false)
  const [couponInput, setCouponInput] = useState('')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    type: 'pickup' as 'pickup' | 'delivery',
    address: '',
    tableNumber: '',
  })

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return
    try {
      const result = await validateCoupon.mutateAsync({
        restaurantId,
        code: couponInput.trim(),
        orderTotal: subtotal,
      })
      if (result.valid) {
        setAppliedCoupon({ code: couponInput.trim().toUpperCase(), result })
        toast({ variant: 'success', title: `Cupom aplicado! Desconto: R$ ${result.discountAmount.toFixed(2).replace('.', ',')}` })
      } else {
        toast({ variant: 'error', title: result.message ?? 'Cupom inválido' })
      }
    } catch {
      toast({ variant: 'error', title: 'Erro ao validar cupom' })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true

    const isPickup = form.type === 'pickup'

    let createdOrder: import('@repo/schemas').Order
    try {
      createdOrder = await createOrder.mutateAsync({
        restaurantId,
        customerName: form.name,
        customerPhone: form.phone,
        orderType: form.type,
        deliveryAddress: !isPickup ? form.address : null,
        tableNumber: isPickup && tableEnabled ? form.tableNumber : null,
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          quantity: i.quantity,
          unitPrice: i.effectivePrice,
          selectedOptions: i.selectedOptions,
          observation: i.observation,
        })),
        total,
        discountAmount,
        couponCode: appliedCoupon?.code,
      })
    } catch {
      submittingRef.current = false
      toast({ variant: 'error', title: 'Erro ao registrar pedido', description: 'Tente novamente.' })
      return
    }

    if (!isPickup) {
      const now = new Date()
      const dateStr = now.toLocaleDateString('pt-BR')
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      const orderRef = createdOrder.id.replace(/-/g, '').slice(0, 8).toUpperCase()

      const lines: string[] = []
      lines.push(`*${t('menu.cart.whatsappGreeting')}*`)
      lines.push(`*${t('menu.cart.whatsappRef')}:* #${orderRef}`)
      lines.push(`*${t('menu.cart.whatsappDate')}:* ${dateStr} ${t('menu.cart.at')} ${timeStr}`)
      lines.push('')
      lines.push(`━━━━━━━━━━━━━━━━`)
      lines.push(`*${t('menu.cart.whatsappItems')}*`)
      lines.push(`━━━━━━━━━━━━━━━━`)
      for (const item of items) {
        const unitFmt = item.effectivePrice.toFixed(2).replace('.', ',')
        const totalFmt = (item.effectivePrice * item.quantity).toFixed(2).replace('.', ',')
        lines.push(`• ${item.quantity}x *${item.product.name}*`)
        if (item.selectedOptions.length > 0) {
          lines.push(`  ${item.selectedOptions.map((o) => o.itemName).join(', ')}`)
        }
        if (item.observation) {
          lines.push(`  Obs: ${item.observation}`)
        }
        lines.push(`  R$ ${unitFmt} cada = R$ ${totalFmt}`)
      }
      lines.push(`━━━━━━━━━━━━━━━━`)
      if (discountAmount > 0) {
        lines.push(`*Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}`)
        lines.push(`*Desconto (${appliedCoupon?.code}):* -R$ ${discountAmount.toFixed(2).replace('.', ',')}`)
      }
      lines.push(`*${t('menu.cart.whatsappTotal')}:* R$ ${total.toFixed(2).replace('.', ',')}`)
      lines.push(`━━━━━━━━━━━━━━━━`)
      lines.push('')
      lines.push(`*${t('menu.cart.whatsappName')}:* ${form.name}`)
      lines.push(`*${t('menu.cart.whatsappPhone')}:* ${form.phone}`)
      lines.push(`*${t('menu.cart.whatsappType')}:* ${t('menu.cart.delivery')}`)
      lines.push(`*${t('menu.cart.whatsappAddress')}:* ${form.address}`)

      const message = encodeURIComponent(lines.join('\n'))
      const phoneDigits = whatsappPhone.replace(/\D/g, '')
      window.open(`https://wa.me/${phoneDigits}?text=${message}`, '_blank', 'noopener,noreferrer')
    } else {
      toast({ variant: 'success', title: t('menu.cart.orderPlaced') })
    }

    submittingRef.current = false
    clear()
    onSuccess(createdOrder.id)
  }

  const isDelivery = deliveryEnabled && form.type === 'delivery'
  const needsTable = tableEnabled && form.type === 'pickup'
  const isValid =
    form.name.trim().length >= 2 &&
    form.phone.trim().length >= 8 &&
    (!isDelivery || form.address.trim().length >= 5) &&
    (!needsTable || form.tableNumber.trim().length >= 1)

  return (
    <div
      className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('menu.cart.checkoutTitle')}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{t('menu.cart.checkoutTitle')}</h2>
          <button
            onClick={onClose}
            aria-label={t('menu.cart.close')}
            className="cursor-pointer text-gray-400 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <FormField
            label={t('menu.cart.customerName')}
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            required
            minLength={2}
            placeholder={t('menu.cart.customerNamePlaceholder')}
          />
          <FormField
            label={t('menu.cart.customerPhone')}
            type="tel"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            required
            placeholder={t('menu.cart.customerPhonePlaceholder')}
          />

          {deliveryEnabled && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">{t('menu.cart.orderType')}</p>
              <div className="grid grid-cols-2 gap-2">
                {(['pickup', 'delivery'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setField('type', type)}
                    className={`cursor-pointer flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                      form.type === type
                        ? 'border-transparent text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                    style={form.type === type ? { backgroundColor: primaryColor } : {}}
                  >
                    <span aria-hidden="true">{type === 'pickup' ? '🏪' : '🛵'}</span>
                    {type === 'pickup' ? t('menu.cart.pickup') : t('menu.cart.delivery')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isDelivery && (
            <FormField
              label={t('menu.cart.address')}
              value={form.address}
              onChange={(e) => setField('address', e.target.value)}
              required
              minLength={5}
              placeholder={t('menu.cart.addressPlaceholder')}
            />
          )}

          {needsTable && (
            <FormField
              label={t('menu.cart.tableNumber')}
              value={form.tableNumber}
              onChange={(e) => setField('tableNumber', e.target.value)}
              required
              placeholder={t('menu.cart.tableNumberPlaceholder')}
            />
          )}

          {/* Coupon */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-700">{t('menu.cart.coupon')}</p>
            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                <div>
                  <span className="text-sm font-bold text-green-700">{appliedCoupon.code}</span>
                  <span className="text-xs text-green-600 ml-2">
                    -{appliedCoupon.result.discountAmount > 0
                      ? `R$ ${appliedCoupon.result.discountAmount.toFixed(2).replace('.', ',')}`
                      : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => { setAppliedCoupon(null); setCouponInput('') }}
                  className="cursor-pointer text-xs text-red-500 hover:text-red-700 ml-2"
                >
                  Remover
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder={t('menu.cart.couponPlaceholder')}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={!couponInput.trim() || validateCoupon.isPending}
                  className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {validateCoupon.isPending ? '...' : t('menu.cart.couponApply')}
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-1">
            {discountAmount > 0 && (
              <>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{t('menu.cart.subtotal')}</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-green-600">
                  <span>Desconto ({appliedCoupon?.code})</span>
                  <span>-R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">{t('menu.cart.total')}</span>
              <span className="text-xl font-bold text-gray-900">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>
            {isDelivery ? (
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={!isValid || createOrder.isPending}
                loading={createOrder.isPending}
                style={{ backgroundColor: '#25D366', color: '#fff' }}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white mr-2 shrink-0" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t('menu.cart.sendWhatsapp')}
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={!isValid || createOrder.isPending}
                loading={createOrder.isPending}
                style={{ backgroundColor: primaryColor, color: '#fff' }}
              >
                {t('menu.cart.confirmOrder')}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  restaurantId: string
  whatsappPhone: string
  deliveryEnabled: boolean
  tableEnabled: boolean
  primaryColor: string
  accentColor: string
  slug: string
}

export function CartDrawer({ open, onClose, restaurantId, whatsappPhone, deliveryEnabled, tableEnabled, primaryColor, accentColor, slug: _slug }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal, total, discountAmount, appliedCoupon, clear } = useCart()
  const { t } = useTranslation()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null)

  if (!open) return null

  if (completedOrderId) {
    const trackUrl = `${window.location.origin}/track/${completedOrderId}`
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setCompletedOrderId(null); onClose() }} aria-hidden="true" />
        <div className="relative w-full sm:w-96 bg-white rounded-2xl shadow-2xl p-6 space-y-4 text-center">
          <div className="text-5xl" aria-hidden="true">🎉</div>
          <h2 className="text-xl font-bold text-gray-900">{t('menu.cart.orderPlaced')}</h2>
          <p className="text-sm text-gray-500">{t('menu.cart.trackOrderHint')}</p>
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-600 break-all select-all">
            {trackUrl}
          </div>
          <div className="flex gap-2">
            <a
              href={trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white text-center"
              style={{ backgroundColor: primaryColor }}
            >
              {t('menu.cart.trackOrder')}
            </a>
            <button
              onClick={() => { setCompletedOrderId(null); onClose() }}
              className="cursor-pointer flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              {t('menu.cart.close')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end"
        role="dialog"
        aria-modal="true"
        aria-label={t('menu.cart.title')}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="relative flex flex-col w-full sm:w-96 bg-white shadow-2xl rounded-t-2xl sm:rounded-none max-h-[90vh] sm:max-h-screen">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <h2 className="text-lg font-bold text-gray-900">{t('menu.cart.title')}</h2>
            <button
              onClick={onClose}
              aria-label={t('menu.cart.close')}
              className="cursor-pointer text-gray-400 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <span className="text-5xl mb-4" aria-hidden="true">🛒</span>
              <p className="text-gray-500 text-sm">{t('menu.cart.empty')}</p>
            </div>
          ) : (
            <>
              <ul className="flex-1 overflow-y-auto divide-y divide-gray-100 px-5">
                {items.map((item) => (
                  <li key={item.cartKey} className="py-4 flex gap-3">
                    {item.product.imageUrl && (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-14 w-14 rounded-xl object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{item.product.name}</p>
                      {item.selectedOptions.length > 0 && (
                        <p className="text-xs text-gray-500 truncate">
                          {item.selectedOptions.map((o) => o.itemName).join(', ')}
                        </p>
                      )}
                      {item.observation && (
                        <p className="text-xs text-gray-400 italic truncate">Obs: {item.observation}</p>
                      )}
                      <p className="text-sm font-bold mt-0.5" style={{ color: accentColor }}>
                        R$ {(item.effectivePrice * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                          aria-label={t('menu.cart.decrease')}
                          className="cursor-pointer flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 text-sm"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                          aria-label={t('menu.cart.increase')}
                          className="cursor-pointer flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 text-sm"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.cartKey)}
                          aria-label={t('menu.cart.remove')}
                          className="cursor-pointer ml-auto text-red-400 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded text-xs"
                        >
                          {t('menu.cart.remove')}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="px-5 py-4 border-t border-gray-100 space-y-3 shrink-0">
                {discountAmount > 0 && (
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between text-gray-500">
                      <span>{t('menu.cart.subtotal')}</span>
                      <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex items-center justify-between text-green-600 font-medium">
                      <span>Cupom {appliedCoupon?.code}</span>
                      <span>-R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{t('menu.cart.total')}</span>
                  <span className="text-xl font-bold text-gray-900">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <Button
                  className="w-full cursor-pointer"
                  onClick={() => setCheckoutOpen(true)}
                  style={{ backgroundColor: primaryColor, color: '#fff' }}
                >
                  {t('menu.cart.checkout')}
                </Button>
                <button
                  onClick={() => { clear(); onClose() }}
                  className="cursor-pointer w-full text-xs text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded py-1"
                >
                  {t('menu.cart.clearCart')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {checkoutOpen && (
        <CheckoutModal
          restaurantId={restaurantId}
          whatsappPhone={whatsappPhone}
          deliveryEnabled={deliveryEnabled}
          tableEnabled={tableEnabled}
          primaryColor={primaryColor}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={(orderId) => {
            setCheckoutOpen(false)
            setCompletedOrderId(orderId)
          }}
        />
      )}
    </>
  )
}
