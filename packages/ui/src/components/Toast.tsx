import * as RadixToast from '@radix-ui/react-toast'
import { createContext, useCallback, useContext, useState } from 'react'

type ToastVariant = 'default' | 'error' | 'success'

interface ToastItem {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextValue {
  toast: (opts: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const variantStyles: Record<ToastVariant, string> = {
  default: 'bg-white border border-gray-200 text-gray-900',
  error: 'bg-red-50 border border-red-200 text-red-900',
  success: 'bg-green-50 border border-green-200 text-green-900',
}

const indicatorStyles: Record<ToastVariant, string> = {
  default: 'bg-gray-400',
  error: 'bg-red-500',
  success: 'bg-green-500',
}

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((opts: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, ...opts }])
  }, [])

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToast.Provider swipeDirection="right" duration={5000}>
        {children}
        {toasts.map((t) => {
          const variant = t.variant ?? 'default'
          return (
            <RadixToast.Root
              key={t.id}
              open
              onOpenChange={(open) => { if (!open) dismiss(t.id) }}
              className={`relative overflow-hidden flex items-start gap-3 rounded-xl shadow-lg p-4 pr-8 max-w-sm w-full pointer-events-auto
                data-[state=open]:animate-in data-[state=open]:slide-in-from-right-5
                data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-5
                data-[state=closed]:fade-out-80 ${variantStyles[variant]}`}
            >
              <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${indicatorStyles[variant]}`} />
              <div className="flex-1 space-y-0.5">
                <RadixToast.Title className="text-sm font-semibold leading-snug">
                  {t.title}
                </RadixToast.Title>
                {t.description && (
                  <RadixToast.Description className="text-xs opacity-80 leading-snug">
                    {t.description}
                  </RadixToast.Description>
                )}
              </div>
              <RadixToast.Close
                onClick={() => dismiss(t.id)}
                className="absolute right-2.5 top-2.5 rounded text-gray-400 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400"
                aria-label="Fechar"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
                </svg>
              </RadixToast.Close>
              <div
                className={`absolute bottom-0 left-0 h-[3px] ${indicatorStyles[variant]} opacity-70`}
                style={{ animation: 'toast-shrink 5s linear forwards' }}
              />
            </RadixToast.Root>
          )
        })}
        <RadixToast.Viewport className="fixed top-4 right-4 z-100 flex flex-col gap-2 w-full max-w-sm outline-none" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  )
}
