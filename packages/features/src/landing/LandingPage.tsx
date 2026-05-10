import { Link } from 'react-router'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-orange-50">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">Kozmo</span>
        </div>
        <Link
          to="/login"
          className="flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Entrar
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
          </svg>
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-16 text-center">
        <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          Seu cardápio digital{' '}
          <span className="text-orange-500">profissional</span>
        </h1>
        <p className="mx-auto mt-6 max-w-sm text-base text-gray-500">
          Crie um cardápio online bonito e funcional em minutos. Compartilhe por link ou QR Code.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/register"
            className="flex items-center gap-2 rounded-full bg-orange-500 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Começar Grátis
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Já tenho conta
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 text-left shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 text-orange-500">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <path d="M9 7h6M9 11h6M9 15h4" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="mb-1.5 text-base font-semibold">Mobile-First</h3>
            <p className="text-sm leading-relaxed text-gray-500">
              Interface moderna que funciona perfeitamente em qualquer dispositivo.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 text-left shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 text-orange-500">
                <path strokeLinecap="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
            </div>
            <h3 className="mb-1.5 text-base font-semibold">Avaliações</h3>
            <p className="text-sm leading-relaxed text-gray-500">
              Receba feedback dos clientes diretamente pelo cardápio.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 text-left shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 text-orange-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <h3 className="mb-1.5 text-base font-semibold">Gestão Fácil</h3>
            <p className="text-sm leading-relaxed text-gray-500">
              Painel administrativo intuitivo para gerenciar produtos e categorias.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} MenuPro · Todos os direitos reservados
      </footer>
    </div>
  )
}
