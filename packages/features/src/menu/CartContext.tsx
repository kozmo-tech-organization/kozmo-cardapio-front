import { createContext, useContext, useState, type ReactNode } from 'react'
import type { MenuProduct, SelectedOption, ValidateCouponResult } from '@repo/schemas'

export interface CartItem {
  product: MenuProduct
  quantity: number
  effectivePrice: number
  selectedOptions: SelectedOption[]
  observation: string
  cartKey: string
}

interface AppliedCoupon {
  code: string
  result: ValidateCouponResult
}

interface CartContextValue {
  items: CartItem[]
  addItem: (product: MenuProduct, effectivePrice: number, selectedOptions?: SelectedOption[], observation?: string) => void
  removeItem: (cartKey: string) => void
  updateQuantity: (cartKey: string, quantity: number) => void
  clear: () => void
  subtotal: number
  discountAmount: number
  total: number
  count: number
  appliedCoupon: AppliedCoupon | null
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void
}

const CartContext = createContext<CartContextValue | null>(null)

function makeCartKey(productId: string, selectedOptions: SelectedOption[], observation: string) {
  const optKey = selectedOptions.map((o) => `${o.groupId}:${o.itemId}`).sort().join('|')
  return `${productId}__${optKey}__${observation}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)

  function addItem(product: MenuProduct, effectivePrice: number, selectedOptions: SelectedOption[] = [], observation = '') {
    const optionsPrice = selectedOptions.reduce((sum, o) => sum + o.priceAdd, 0)
    const finalPrice = effectivePrice + optionsPrice
    const cartKey = makeCartKey(product.id, selectedOptions, observation)

    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === cartKey)
      if (existing) {
        return prev.map((i) =>
          i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prev, { product, quantity: 1, effectivePrice: finalPrice, selectedOptions, observation, cartKey }]
    })
  }

  function removeItem(cartKey: string) {
    setItems((prev) => prev.filter((i) => i.cartKey !== cartKey))
  }

  function updateQuantity(cartKey: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(cartKey)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.cartKey === cartKey ? { ...i, quantity } : i)),
    )
  }

  function clear() {
    setItems([])
    setAppliedCoupon(null)
  }

  const subtotal = items.reduce((sum, i) => sum + i.effectivePrice * i.quantity, 0)
  const discountAmount = appliedCoupon?.result?.discountAmount ?? 0
  const total = Math.max(0, subtotal - discountAmount)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, subtotal, discountAmount, total, count, appliedCoupon, setAppliedCoupon }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
