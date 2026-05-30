import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

const STORAGE_KEY = 'kozmo-a11y'
const FONT_SCALE_MIN = 0.75
const FONT_SCALE_MAX = 1.5
const FONT_SCALE_DEFAULT = 1
const FONT_SCALE_STEP = 0.125

interface AccessibilityState {
  fontScale: number
  highContrast: boolean
}

interface AccessibilityContextValue extends AccessibilityState {
  increaseFontSize: () => void
  decreaseFontSize: () => void
  resetFontSize: () => void
  toggleHighContrast: () => void
}

const defaultState: AccessibilityState = {
  fontScale: FONT_SCALE_DEFAULT,
  highContrast: false,
}

function loadPreferences(): AccessibilityState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<AccessibilityState>
      return {
        fontScale: typeof parsed.fontScale === 'number' ? parsed.fontScale : FONT_SCALE_DEFAULT,
        highContrast: typeof parsed.highContrast === 'boolean' ? parsed.highContrast : false,
      }
    }
  } catch {}
  return defaultState
}

// Applies preferences to the document root immediately (CSS variable + class)
function applyToDocument(state: AccessibilityState) {
  document.documentElement.style.setProperty('--font-scale', String(state.fontScale))
  document.documentElement.classList.toggle('high-contrast', state.highContrast)
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(loadPreferences)

  useEffect(() => {
    applyToDocument(state)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  function increaseFontSize() {
    setState((prev) => ({
      ...prev,
      fontScale: Math.min(FONT_SCALE_MAX, parseFloat((prev.fontScale + FONT_SCALE_STEP).toFixed(3))),
    }))
  }

  function decreaseFontSize() {
    setState((prev) => ({
      ...prev,
      fontScale: Math.max(FONT_SCALE_MIN, parseFloat((prev.fontScale - FONT_SCALE_STEP).toFixed(3))),
    }))
  }

  function resetFontSize() {
    setState((prev) => ({ ...prev, fontScale: FONT_SCALE_DEFAULT }))
  }

  function toggleHighContrast() {
    setState((prev) => ({ ...prev, highContrast: !prev.highContrast }))
  }

  return (
    <AccessibilityContext.Provider
      value={{ ...state, increaseFontSize, decreaseFontSize, resetFontSize, toggleHighContrast }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility(): AccessibilityContextValue {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error('useAccessibility must be used inside AccessibilityProvider')
  return ctx
}
