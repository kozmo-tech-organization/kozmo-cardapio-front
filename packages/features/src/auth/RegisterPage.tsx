import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useRegister } from '@repo/queries'
import { Button, FormField, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui'

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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Cadastrar restaurante</CardTitle>
          <CardDescription>Crie sua conta e comece a gerenciar seu cardápio digital</CardDescription>
        </CardHeader>
        <CardContent>
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
              label="E-mail"
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
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary underline underline-offset-4 hover:text-primary/80">
              Fazer login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
