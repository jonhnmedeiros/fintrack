import { useState } from 'react'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { type DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateRangeValue {
  startDate: string
  endDate: string
}

interface PeriodSelectorProps {
  value: DateRangeValue
  onChange: (range: DateRangeValue) => void
}

const PRESETS = [
  { label: 'Mês atual', getValue: () => {
    const now = new Date()
    return { from: startOfMonth(now), to: endOfMonth(now) }
  }},
  { label: 'Mês passado', getValue: () => {
    const last = subMonths(new Date(), 1)
    return { from: startOfMonth(last), to: endOfMonth(last) }
  }},
  { label: 'Últimos 3 meses', getValue: () => {
    const now = new Date()
    return { from: startOfMonth(subMonths(now, 2)), to: endOfMonth(now) }
  }},
  { label: 'Últimos 6 meses', getValue: () => {
    const now = new Date()
    return { from: startOfMonth(subMonths(now, 5)), to: endOfMonth(now) }
  }},
  { label: 'Todo o período', getValue: () => {
    const now = new Date()
    return { from: new Date('2020-01-01'), to: endOfMonth(now) }
  }},
]

function formatRangeLabel(range: DateRangeValue): string {
  const start = new Date(range.startDate + 'T00:00:00')
  const end = new Date(range.endDate + 'T00:00:00')
  return `${format(start, "d 'de' MMM 'de' yyyy", { locale: ptBR })} — ${format(end, "d 'de' MMM 'de' yyyy", { locale: ptBR })}`
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(value.startDate + 'T00:00:00'),
    to: new Date(value.endDate + 'T00:00:00'),
  })

  const handlePreset = (getValue: () => { from: Date; to: Date }) => {
    const { from, to } = getValue()
    setRange({ from, to })
    onChange({
      startDate: format(from, 'yyyy-MM-dd'),
      endDate: format(to, 'yyyy-MM-dd'),
    })
    setOpen(false)
  }

  const handleRangeSelect = (selected: DateRange | undefined) => {
    if (!selected?.from || !selected?.to) {
      setRange(selected)
      return
    }
    const from = selected.from > selected.to ? selected.to : selected.from
    const to = selected.from > selected.to ? selected.from : selected.to
    setRange({ from, to })
    onChange({
      startDate: format(from, 'yyyy-MM-dd'),
      endDate: format(to, 'yyyy-MM-dd'),
    })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'justify-start text-left font-normal',
            !value.startDate && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatRangeLabel(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="border rounded-lg bg-background">
          <Calendar
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={handleRangeSelect}
            numberOfMonths={2}
            className="p-3"
            locale={ptBR}
          />
          <div className="flex flex-wrap gap-2 border-t p-3">
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                className="flex-1 min-w-[100px]"
                onClick={() => handlePreset(preset.getValue)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
