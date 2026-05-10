import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useLogin } from '@repo/queries'
import { Button, FormField, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await login.mutateAsync({ email, password })
      navigate('/admin')
    } catch (err: any) {
      setError(err?.message ?? 'Credenciais inválidas')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Entrar no painel</CardTitle>
          <CardDescription>Digite seu e-mail e senha para acessar o painel do restaurante</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@restaurante.com"
              required
              autoComplete="email"
            />
            <FormField
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" loading={login.isPending}>
              Entrar
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link to="/register" className="text-primary underline underline-offset-4 hover:text-primary/80">
              Cadastrar restaurante
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
