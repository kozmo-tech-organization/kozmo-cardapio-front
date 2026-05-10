import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useRegister } from '@repo/queries'
import { Button, FormField } from '@repo/ui'
import { useTranslation } from '@repo/i18n'

export function RegisterPage() {
  const navigate = useNavigate()
  const register = useRegister()
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await register.mutateAsync(form)
      navigate('/admin')
    } catch (err: any) {
      setError(err?.message ?? t('auth.register.defaultError'))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-orange-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Kozmo Cardápio Digital</h1>
          <p className="text-sm text-gray-500">{t('auth.register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label={t('auth.register.restaurantName')}
            type="text"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder={t('auth.register.restaurantNamePlaceholder')}
            required
            minLength={2}
          />
          <FormField
            label={t('auth.register.email')}
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder={t('auth.register.emailPlaceholder')}
            required
          />
          <FormField
            label={t('auth.register.password')}
            type="password"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            placeholder={t('auth.register.passwordPlaceholder')}
            required
            minLength={6}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" loading={register.isPending}>
            {t('auth.register.submit')}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          {t('auth.register.hasAccount')}{' '}
          <Link to="/login" className="font-medium text-orange-500 hover:text-orange-600">
            {t('auth.register.login')}
          </Link>
        </p>
      </div>
    </div>
  )
}
