import { useState } from 'react'
import { useAccessibility } from './AccessibilityContext'
import { useTranslation } from '@repo/i18n'

export function AccessibilityToolbar() {
  const { fontScale, highContrast, increaseFontSize, decreaseFontSize, resetFontSize, toggleHighContrast } =
    useAccessibility()
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const atMin = fontScale <= 0.75
  const atMax = fontScale >= 1.5

  return (
    <>
      {/* Skip-to-content link: visible only on keyboard focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:rounded-lg focus:bg-orange-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        {t('a11y.skipToContent')}
      </a>

      <div
        role="region"
        aria-label={t('a11y.toolbar.label')}
        className="fixed bottom-6 left-4 z-50 flex flex-col items-start"
      >
        {/* Expanded panel */}
        {expanded && (
          <div
            id="a11y-panel"
            className="mb-2 flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
          >
            {/* Font size controls */}
            <div role="group" aria-label={t('a11y.fontSize.label')} className="flex items-center gap-1">
              <button
                onClick={decreaseFontSize}
                disabled={atMin}
                aria-label={t('a11y.fontSize.decrease')}
                aria-disabled={atMin}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                A-
              </button>
              <button
                onClick={resetFontSize}
                aria-label={t('a11y.fontSize.reset')}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                A
              </button>
              <button
                onClick={increaseFontSize}
                disabled={atMax}
                aria-label={t('a11y.fontSize.increase')}
                aria-disabled={atMax}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-base font-bold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                A+
              </button>
            </div>

            {/* High contrast toggle */}
            <button
              onClick={toggleHighContrast}
              aria-pressed={highContrast}
              aria-label={highContrast ? t('a11y.contrast.disable') : t('a11y.contrast.enable')}
              className={[
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                highContrast
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-100',
              ].join(' ')}
            >
              {/* Half-filled circle icon represents contrast */}
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
                focusable="false"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 1 0 20V2z" fill="currentColor" />
              </svg>
              {t('a11y.contrast.label')}
            </button>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="a11y-panel"
          aria-label={t('a11y.toolbar.toggle')}
          title={t('a11y.toolbar.toggle')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg text-gray-600 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          {/* Accessibility / person icon */}
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="12" cy="5" r="1" />
            <path d="M9 20l3-9 3 9" />
            <path d="M6 11.5h12" />
          </svg>
        </button>
      </div>
    </>
  )
}
