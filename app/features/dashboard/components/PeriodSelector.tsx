import { useState } from 'react'
import { format, startOfMonth, endOfMonth, subMonths, startOfDay, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateRange {
  startDate: string
  endDate: string
}

interface PeriodSelectorProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

const PRESETS = [
  { label: 'Mês atual', key: 'this-month' },
  { label: 'Mês passado', key: 'last-month' },
  { label: 'Últimos 3 meses', key: 'last-3-months' },
  { label: 'Últimos 6 meses', key: 'last-6-months' },
  { label: 'Todo o período', key: 'all-time' },
  { label: 'Personalizado', key: 'custom' },
] as const

function getPresetRange(key: string): DateRange {
  const now = new Date()
  switch (key) {
    case 'this-month': {
      const start = startOfMonth(now)
      const end = endOfMonth(now)
      return { startDate: format(start, 'yyyy-MM-dd'), endDate: format(end, 'yyyy-MM-dd') }
    }
    case 'last-month': {
      const lastMonth = subMonths(now, 1)
      const start = startOfMonth(lastMonth)
      const end = endOfMonth(lastMonth)
      return { startDate: format(start, 'yyyy-MM-dd'), endDate: format(end, 'yyyy-MM-dd') }
    }
    case 'last-3-months': {
      const start = startOfMonth(subMonths(now, 2))
      const end = endOfMonth(now)
      return { startDate: format(start, 'yyyy-MM-dd'), endDate: format(end, 'yyyy-MM-dd') }
    }
    case 'last-6-months': {
      const start = startOfMonth(subMonths(now, 5))
      const end = endOfMonth(now)
      return { startDate: format(start, 'yyyy-MM-dd'), endDate: format(end, 'yyyy-MM-dd') }
    }
    case 'all-time':
      return { startDate: '2020-01-01', endDate: format(endOfMonth(now), 'yyyy-MM-dd') }
    default:
      return getPresetRange('this-month')
  }
}

function formatRangeLabel(range: DateRange): string {
  const start = new Date(range.startDate + 'T00:00:00')
  const end = new Date(range.endDate + 'T00:00:00')
  const startStr = format(start, "d 'de' MMM 'de' yyyy", { locale: ptBR })
  const endStr = format(end, "d 'de' MMM 'de' yyyy", { locale: ptBR })
  return `${startStr} — ${endStr}`
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(value.startDate + 'T00:00:00'),
    to: new Date(value.endDate + 'T00:00:00'),
  })

  const activePreset = PRESETS.find(p => {
    const presetRange = getPresetRange(p.key)
    return presetRange.startDate === value.startDate && presetRange.endDate === value.endDate
  })

  const handlePreset = (key: string) => {
    if (key === 'custom') {
      setCalendarOpen(true)
      return
    }
    onChange(getPresetRange(key))
  }

  const handleRangeSelect = (selected: { from?: Date; to?: Date } | undefined) => {
    if (!selected) return
    setRange(selected)
    if (selected.from && selected.to) {
      const from = startOfDay(selected.from)
      const to = startOfDay(selected.to)
      if (from > to) {
        onChange({
          startDate: format(to, 'yyyy-MM-dd'),
          endDate: format(from, 'yyyy-MM-dd'),
        })
      } else {
        onChange({
          startDate: format(from, 'yyyy-MM-dd'),
          endDate: format(to, 'yyyy-MM-dd'),
        })
      }
      setCalendarOpen(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {PRESETS.map(preset => (
        <Button
          key={preset.key}
          variant={activePreset?.key === preset.key ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePreset(preset.key)}
        >
          {preset.label}
        </Button>
      ))}

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={activePreset?.key === 'custom' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'justify-start text-left font-normal',
              !activePreset && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatRangeLabel(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="range"
            selected={range}
            onSelect={handleRangeSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
