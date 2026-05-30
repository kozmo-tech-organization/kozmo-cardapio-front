import { useState, useEffect, useCallback } from 'react'
import { useCurrentRestaurant } from '@repo/queries'
import { Card, CardContent } from '@repo/ui'
import { useTranslation } from '@repo/i18n'

type EventType = 'work' | 'vacation' | 'note' | 'closed'

interface CalendarEvent {
  id: string
  date: string // ISO date yyyy-mm-dd
  type: EventType
  title: string
}

const EVENT_COLORS: Record<EventType, { bg: string; text: string; dot: string }> = {
  work:     { bg: 'bg-green-100 dark:bg-green-900/40',   text: 'text-green-800 dark:text-green-300',   dot: 'bg-green-500' },
  vacation: { bg: 'bg-blue-100 dark:bg-blue-900/40',    text: 'text-blue-800 dark:text-blue-300',    dot: 'bg-blue-500' },
  note:     { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-300', dot: 'bg-yellow-500' },
  closed:   { bg: 'bg-red-100 dark:bg-red-900/40',      text: 'text-red-800 dark:text-red-300',      dot: 'bg-red-500' },
}

function toISODate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function storageKey(restaurantId: string) {
  return `kozmo_calendar_${restaurantId}`
}

function loadEvents(restaurantId: string): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(storageKey(restaurantId))
    return raw ? (JSON.parse(raw) as CalendarEvent[]) : []
  } catch {
    return []
  }
}

function saveEvents(restaurantId: string, events: CalendarEvent[]) {
  localStorage.setItem(storageKey(restaurantId), JSON.stringify(events))
}

interface DayModalProps {
  date: string
  events: CalendarEvent[]
  onClose: () => void
  onSave: (event: Omit<CalendarEvent, 'id'>) => void
  onDelete: (id: string) => void
  t: (key: string) => string
}

function DayModal({ date, events, onClose, onSave, onDelete, t }: DayModalProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<EventType>('note')

  const dateObj = new Date(date + 'T12:00:00')
  const formatted = dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  function handleAdd() {
    if (!title.trim()) return
    onSave({ date, type, title: title.trim() })
    setTitle('')
    setType('note')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') onClose()
  }

  const EVENT_TYPE_KEYS: EventType[] = ['work', 'vacation', 'note', 'closed']

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-xl bg-card shadow-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-base capitalize">{formatted}</h2>
          <button
            onClick={onClose}
            className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
            aria-label={t('admin.calendar.close')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {events.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('admin.calendar.events')}</p>
              {events.map((ev) => (
                <div key={ev.id} className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 ${EVENT_COLORS[ev.type].bg}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${EVENT_COLORS[ev.type].dot}`} />
                    <span className={`text-sm font-medium truncate ${EVENT_COLORS[ev.type].text}`}>{ev.title}</span>
                    <span className={`text-xs shrink-0 ${EVENT_COLORS[ev.type].text} opacity-70`}>{t(`admin.calendar.type.${ev.type}`)}</span>
                  </div>
                  <button
                    onClick={() => onDelete(ev.id)}
                    className="cursor-pointer shrink-0 flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label={t('admin.calendar.deleteEvent')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                      <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('admin.calendar.addEvent')}</p>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPE_KEYS.map((typeKey) => (
                <button
                  key={typeKey}
                  onClick={() => setType(typeKey)}
                  className={`cursor-pointer flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                    type === typeKey
                      ? `${EVENT_COLORS[typeKey].bg} ${EVENT_COLORS[typeKey].text} border-transparent ring-2 ring-offset-1 ring-${typeKey === 'work' ? 'green' : typeKey === 'vacation' ? 'blue' : typeKey === 'note' ? 'yellow' : 'red'}-400`
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${EVENT_COLORS[typeKey].dot}`} />
                  {t(`admin.calendar.type.${typeKey}`)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('admin.calendar.titlePlaceholder')}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                autoFocus
              />
              <button
                onClick={handleAdd}
                disabled={!title.trim()}
                className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                {t('admin.calendar.add')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CalendarPage() {
  const { data: restaurant } = useCurrentRestaurant()
  const { t, lang } = useTranslation()

  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const restaurantId = restaurant?.id ?? 'default'

  useEffect(() => {
    setEvents(loadEvents(restaurantId))
  }, [restaurantId])

  const eventsMap = events.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = []
    acc[ev.date].push(ev)
    return acc
  }, {})

  function handleSaveEvent(data: Omit<CalendarEvent, 'id'>) {
    const newEvent: CalendarEvent = { ...data, id: crypto.randomUUID() }
    const updated = [...events, newEvent]
    setEvents(updated)
    saveEvents(restaurantId, updated)
  }

  function handleDeleteEvent(id: string) {
    const updated = events.filter((ev) => ev.id !== id)
    setEvents(updated)
    saveEvents(restaurantId, updated)
  }

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1) }
    else setCurrentMonth((m) => m - 1)
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1) }
    else setCurrentMonth((m) => m + 1)
  }

  function goToday() {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
  }

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7
  const cells: { day: number; month: 'prev' | 'current' | 'next'; dateStr: string }[] = []

  for (let i = 0; i < totalCells; i++) {
    if (i < firstDayOfMonth) {
      const day = daysInPrevMonth - firstDayOfMonth + 1 + i
      const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
      cells.push({ day, month: 'prev', dateStr: toISODate(prevYear, prevMonthIdx, day) })
    } else if (i < firstDayOfMonth + daysInMonth) {
      const day = i - firstDayOfMonth + 1
      cells.push({ day, month: 'current', dateStr: toISODate(currentYear, currentMonth, day) })
    } else {
      const day = i - firstDayOfMonth - daysInMonth + 1
      const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear
      cells.push({ day, month: 'next', dateStr: toISODate(nextYear, nextMonthIdx, day) })
    }
  }

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString(
    lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'pt-BR',
    { month: 'long', year: 'numeric' }
  )

  const weekDays = lang === 'en'
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : lang === 'es'
    ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    : ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const todayStr = toISODate(today.getFullYear(), today.getMonth(), today.getDate())

  const selectedEvents = selectedDate ? (eventsMap[selectedDate] ?? []) : []

  const legendTypes: EventType[] = ['work', 'vacation', 'note', 'closed']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('admin.calendar.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('admin.calendar.subtitle')}</p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label={t('admin.calendar.prevMonth')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <h2 className="text-base font-semibold capitalize min-w-40 text-center">{monthName}</h2>
              <button
                onClick={nextMonth}
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label={t('admin.calendar.nextMonth')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 flex-wrap">
                {legendTypes.map((type) => (
                  <span key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={`h-2.5 w-2.5 rounded-full ${EVENT_COLORS[type].dot}`} />
                    {t(`admin.calendar.type.${type}`)}
                  </span>
                ))}
              </div>
              <button
                onClick={goToday}
                className="cursor-pointer rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                {t('admin.calendar.today')}
              </button>
            </div>
          </div>

          {/* Week day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {weekDays.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {cells.map((cell, idx) => {
              const isToday = cell.dateStr === todayStr && cell.month === 'current'
              const isCurrent = cell.month === 'current'
              const dayEvents = eventsMap[cell.dateStr] ?? []
              const isLastRow = idx >= cells.length - 7

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`cursor-pointer group relative min-h-20 p-2 text-left border-b border-r border-border transition-colors
                    ${isLastRow ? 'border-b-0' : ''}
                    ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''}
                    ${isCurrent ? 'hover:bg-muted/50' : 'bg-muted/20 hover:bg-muted/40'}
                  `}
                  aria-label={`${cell.dateStr}${dayEvents.length > 0 ? `, ${dayEvents.length} ${t('admin.calendar.eventsCount')}` : ''}`}
                >
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors
                      ${isToday ? 'bg-primary text-primary-foreground' : ''}
                      ${!isToday && isCurrent ? 'text-foreground group-hover:bg-muted' : ''}
                      ${!isCurrent ? 'text-muted-foreground/50' : ''}
                    `}
                  >
                    {cell.day}
                  </span>

                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        className={`flex items-center gap-1 rounded px-1 py-0.5 ${EVENT_COLORS[ev.type].bg}`}
                      >
                        <span className={`hidden sm:block h-1.5 w-1.5 rounded-full shrink-0 ${EVENT_COLORS[ev.type].dot}`} />
                        <span className={`text-xs truncate leading-tight ${EVENT_COLORS[ev.type].text}`}>{ev.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-xs text-muted-foreground pl-1">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <DayModal
          date={selectedDate}
          events={selectedEvents}
          onClose={() => setSelectedDate(null)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          t={t}
        />
      )}
    </div>
  )
}
