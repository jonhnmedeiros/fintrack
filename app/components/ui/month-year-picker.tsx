import { useState } from 'react'
import { addMonths, subMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface MonthYearPickerProps {
  month: number
  year: number
  onChange: (month: number, year: number) => void
  className?: string
}

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function MonthYearPicker({ month, year, onChange, className }: MonthYearPickerProps) {
  const [open, setOpen] = useState(false)
  const current = new Date(year, month - 1, 1)
  const label = capitalizeFirst(format(current, "MMMM 'de' yyyy", { locale: ptBR }))

  const goTo = (date: Date) => {
    onChange(date.getMonth() + 1, date.getFullYear())
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('justify-start text-left font-normal', className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => goTo(subMonths(current, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{label}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => goTo(addMonths(current, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const now = new Date()
              onChange(now.getMonth() + 1, now.getFullYear())
              setOpen(false)
            }}
          >
            Mês atual
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
