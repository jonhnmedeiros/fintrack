import { useState } from 'react'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { type DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMediaQuery } from '@/hooks/useMediaQuery'
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
  const isDesktop = useMediaQuery('(min-width: 640px)')
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

  // O react-day-picker retorna {from, to} já "completo" (from === to) logo no
  // primeiro clique de uma seleção nova, então não dá para usar apenas a forma
  // do objeto para saber se o usuário já terminou de escolher o range. Controlamos
  // isso explicitamente: o 1º clique define só o início; o 2º clique conclui.
  const [pickingEnd, setPickingEnd] = useState(false)
  const [hoverDate, setHoverDate] = useState<Date | undefined>(undefined)

  const handleRangeSelect = (selected: DateRange | undefined) => {
    if (!selected?.from) {
      setRange(undefined)
      setPickingEnd(false)
      return
    }

    if (!pickingEnd) {
      setRange({ from: selected.from, to: undefined })
      setPickingEnd(true)
      setHoverDate(undefined)
      return
    }

    const endDate = selected.to ?? selected.from
    const anchor = range?.from ?? selected.from
    const from = anchor <= endDate ? anchor : endDate
    const to = anchor <= endDate ? endDate : anchor
    setRange({ from, to })
    onChange({
      startDate: format(from, 'yyyy-MM-dd'),
      endDate: format(to, 'yyyy-MM-dd'),
    })
    setOpen(false)
    setPickingEnd(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      // Reseta a seleção local ao abrir para sempre começar um novo range do zero.
      setRange(undefined)
      setPickingEnd(false)
      setHoverDate(undefined)
    }
  }

  // Enquanto o usuário está escolhendo a data final (após o 1º clique), destaca
  // visualmente o intervalo entre o início e o dia sob o cursor — via `modifiers`,
  // sem tocar em `selected` (que é o que a lib usa para decidir o que o clique faz).
  const previewRange =
    pickingEnd && range?.from && hoverDate
      ? hoverDate < range.from
        ? { from: hoverDate, to: range.from }
        : { from: range.from, to: hoverDate }
      : undefined

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'justify-start text-left font-normal',
            !value.startDate && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{formatRangeLabel(value)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-col gap-1 border-b sm:border-b-0 sm:border-r p-2 sm:w-40 shrink-0">
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="justify-start whitespace-nowrap"
                onClick={() => handlePreset(preset.getValue)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Calendar
            mode="range"
            defaultMonth={range?.from ?? new Date(value.startDate + 'T00:00:00')}
            selected={range}
            onSelect={handleRangeSelect}
            onDayMouseEnter={(date) => pickingEnd && setHoverDate(date)}
            onDayMouseLeave={() => pickingEnd && setHoverDate(undefined)}
            modifiers={previewRange ? { rangePreview: previewRange } : undefined}
            modifiersClassNames={{ rangePreview: 'bg-accent text-accent-foreground rounded-none' }}
            numberOfMonths={isDesktop ? 2 : 1}
            className="p-3"
            locale={ptBR}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
