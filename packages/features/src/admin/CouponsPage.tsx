import { useState } from 'react'
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '@repo/queries'
import { Button, FormField, useToast } from '@repo/ui'
import { useTranslation } from '@repo/i18n'
import type { Coupon, CreateCouponInput } from '@repo/schemas'

interface CouponFormProps {
  initial?: Coupon
  onSave: (data: CreateCouponInput) => Promise<void>
  onCancel: () => void
  loading: boolean
}

function CouponForm({ initial, onSave, onCancel, loading }: CouponFormProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    code: initial?.code ?? '',
    discountType: (initial?.discountType ?? 'percent') as 'percent' | 'fixed',
    discountValue: initial?.discountValue?.toString() ?? '',
    minOrderAmount: initial?.minOrderAmount?.toString() ?? '',
    maxUses: initial?.maxUses?.toString() ?? '',
    expiresAt: initial?.expiresAt ? initial.expiresAt.slice(0, 16) : '',
    active: initial?.active ?? true,
  })

  function setField(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSave({
      code: form.code.toUpperCase().trim(),
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue),
      minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
      maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      active: form.active,
    })
  }

  const isValid =
    form.code.trim().length >= 2 &&
    form.discountValue.trim() !== '' &&
    !isNaN(parseFloat(form.discountValue)) &&
    parseFloat(form.discountValue) > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label={t('admin.coupons.form.code')}
        value={form.code}
        onChange={(e) => setField('code', e.target.value.toUpperCase())}
        required
        minLength={2}
        maxLength={20}
        placeholder="EX: DESCONTO10"
        className="uppercase"
      />

      <div className="space-y-1.5">
        <p className="text-sm font-medium leading-none">{t('admin.coupons.form.discountType')}</p>
        <div className="grid grid-cols-2 gap-2">
          {(['percent', 'fixed'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setField('discountType', type)}
              className={`cursor-pointer rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                form.discountType === type
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {type === 'percent' ? `% ${t('admin.coupons.form.percent')}` : `R$ ${t('admin.coupons.form.fixed')}`}
            </button>
          ))}
        </div>
      </div>

      <FormField
        label={form.discountType === 'percent' ? t('admin.coupons.form.discountPercent') : t('admin.coupons.form.discountFixed')}
        type="number"
        value={form.discountValue}
        onChange={(e) => setField('discountValue', e.target.value)}
        required
        min={0.01}
        step={0.01}
        placeholder={form.discountType === 'percent' ? '10' : '5.00'}
      />

      <FormField
        label={t('admin.coupons.form.minOrderAmount')}
        type="number"
        value={form.minOrderAmount}
        onChange={(e) => setField('minOrderAmount', e.target.value)}
        min={0}
        step={0.01}
        placeholder={t('admin.coupons.form.minOrderAmountPlaceholder')}
      />

      <FormField
        label={t('admin.coupons.form.maxUses')}
        type="number"
        value={form.maxUses}
        onChange={(e) => setField('maxUses', e.target.value)}
        min={1}
        step={1}
        placeholder={t('admin.coupons.form.maxUsesPlaceholder')}
      />

      <div className="space-y-1.5">
        <label className="text-sm font-medium leading-none">{t('admin.coupons.form.expiresAt')}</label>
        <input
          type="datetime-local"
          value={form.expiresAt}
          onChange={(e) => setField('expiresAt', e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
          onClick={() => setField('active', !form.active)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${form.active ? 'bg-primary' : 'bg-input'}`}
          role="switch"
          aria-checked={form.active}
          tabIndex={0}
          onKeyDown={(e) => e.key === ' ' && setField('active', !form.active)}
        >
          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
        <span className="text-sm font-medium">{t('admin.coupons.form.active')}</span>
      </label>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={!isValid || loading} loading={loading} className="flex-1">
          {initial ? t('admin.coupons.form.save') : t('admin.coupons.form.create')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('admin.coupons.form.cancel')}
        </Button>
      </div>
    </form>
  )
}

export function CouponsPage() {
  const { data: coupons, isLoading } = useCoupons()
  const createCoupon = useCreateCoupon()
  const updateCoupon = useUpdateCoupon()
  const deleteCoupon = useDeleteCoupon()
  const { toast } = useToast()
  const { t } = useTranslation()

  const [mode, setMode] = useState<'list' | 'new' | 'edit'>('list')
  const [editing, setEditing] = useState<Coupon | null>(null)

  async function handleCreate(data: CreateCouponInput) {
    try {
      await createCoupon.mutateAsync(data)
      toast({ variant: 'success', title: t('admin.coupons.createdSuccess') })
      setMode('list')
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? ''
      toast({ variant: 'error', title: msg.includes('already exists') ? t('admin.coupons.duplicateCode') : t('admin.errors.generic') })
    }
  }

  async function handleUpdate(data: CreateCouponInput) {
    if (!editing) return
    try {
      await updateCoupon.mutateAsync({ id: editing.id, ...data })
      toast({ variant: 'success', title: t('admin.coupons.updatedSuccess') })
      setMode('list')
      setEditing(null)
    } catch {
      toast({ variant: 'error', title: t('admin.errors.generic') })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('admin.coupons.confirmDelete'))) return
    try {
      await deleteCoupon.mutateAsync(id)
      toast({ variant: 'success', title: t('admin.coupons.deletedSuccess') })
    } catch {
      toast({ variant: 'error', title: t('admin.errors.generic') })
    }
  }

  function formatDiscount(coupon: Coupon) {
    return coupon.discountType === 'percent'
      ? `${coupon.discountValue}%`
      : `R$ ${Number(coupon.discountValue).toFixed(2).replace('.', ',')}`
  }

  if (mode === 'new') {
    return (
      <div className="space-y-6 max-w-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => setMode('list')} className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t('admin.coupons.back')}
          </button>
          <h1 className="text-2xl font-bold">{t('admin.coupons.newTitle')}</h1>
        </div>
        <CouponForm onSave={handleCreate} onCancel={() => setMode('list')} loading={createCoupon.isPending} />
      </div>
    )
  }

  if (mode === 'edit' && editing) {
    return (
      <div className="space-y-6 max-w-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => { setMode('list'); setEditing(null) }} className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t('admin.coupons.back')}
          </button>
          <h1 className="text-2xl font-bold">{t('admin.coupons.editTitle')}</h1>
        </div>
        <CouponForm initial={editing} onSave={handleUpdate} onCancel={() => { setMode('list'); setEditing(null) }} loading={updateCoupon.isPending} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.coupons.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('admin.coupons.subtitle')}</p>
        </div>
        <Button onClick={() => setMode('new')} className="shrink-0">
          {t('admin.coupons.new')}
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">{t('admin.coupons.loading')}</p>}

      {!isLoading && coupons?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground mb-3">{t('admin.coupons.empty')}</p>
          <Button variant="outline" onClick={() => setMode('new')}>{t('admin.coupons.createFirst')}</Button>
        </div>
      )}

      <div className="space-y-3">
        {coupons?.map((coupon) => (
          <div key={coupon.id} className="rounded-2xl border border-border bg-card shadow-sm px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base font-mono tracking-widest">{coupon.code}</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {coupon.active ? t('admin.coupons.active') : t('admin.coupons.inactive')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {formatDiscount(coupon)}
                  {coupon.minOrderAmount !== null && ` · Mínimo R$ ${Number(coupon.minOrderAmount).toFixed(2)}`}
                  {coupon.maxUses !== null && ` · ${coupon.usesCount}/${coupon.maxUses} usos`}
                  {coupon.expiresAt && ` · Expira ${new Date(coupon.expiresAt).toLocaleDateString('pt-BR')}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditing(coupon); setMode('edit') }}>
                {t('admin.coupons.btn.edit')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(coupon.id)} className="text-red-600 hover:text-red-700 hover:border-red-300">
                {t('admin.coupons.btn.delete')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
