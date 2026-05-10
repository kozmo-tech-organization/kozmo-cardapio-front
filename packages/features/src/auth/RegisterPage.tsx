import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useRegister } from '@repo/queries'
import { Button, FormField } from '@repo/ui'

export function RegisterPage() {
  const navigate = useNavigate()
  const register = useRegister()
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
      setError(err?.message ?? 'Erro ao criar conta')
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
          <h1 className="text-xl font-bold text-gray-900">Kozmo</h1>
          <p className="text-sm text-gray-500">Crie sua conta gratuitamente</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Nome do restaurante"
            type="text"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Pizzaria do João"
            required
            minLength={2}
          />
          <FormField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="seu@restaurante.com"
            required
          />
          <FormField
            label="Senha"
            type="password"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" loading={register.isPending}>
            Criar conta
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-orange-500 hover:text-orange-600">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}
