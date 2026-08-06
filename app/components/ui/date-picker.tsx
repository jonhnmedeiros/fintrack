import { useEffect, useState } from 'react'
import { format, isValid, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

// Aplica a máscara dd/MM/aaaa enquanto o usuário digita, inserindo "/"
// automaticamente após o dia e o mês.
function applyDateMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)
  if (digits.length <= 2) return day
  if (digits.length <= 4) return `${day}/${month}`
  return `${day}/${month}/${year}`
}

// Aceita ano com 2 ou 4 dígitos (dd/MM/aa ou dd/MM/aaaa). Para 2 dígitos,
// usa o mesmo pivô comum do Excel: 00–49 → 2000–2049, 50–99 → 1950–1999.
function parseTypedDate(text: string): Date | null {
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/)
  if (!match) return null
  const [, d, m, y] = match
  const year = y.length === 2 ? (parseInt(y, 10) <= 49 ? `20${y}` : `19${y}`) : y
  const date = parse(`${d.padStart(2, '0')}/${m.padStart(2, '0')}/${year}`, 'dd/MM/yyyy', new Date())
  return isValid(date) ? date : null
}

export function DatePicker({ value, onChange, placeholder = 'dd/mm/aaaa', className }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = value ? new Date(value + 'T00:00:00') : undefined
  const [text, setText] = useState(selected ? format(selected, 'dd/MM/yyyy') : '')

  // Mantém o texto digitado em sincronia quando a data muda por fora
  // (ex: selecionada no calendário, ou o form deu reset/preencheu editando).
  useEffect(() => {
    setText(selected ? format(selected, 'dd/MM/yyyy') : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const commitTyped = () => {
    if (!text) {
      onChange('')
      return
    }
    const parsed = parseTypedDate(text)
    if (parsed) {
      onChange(format(parsed, 'yyyy-MM-dd'))
    } else {
      // Digitação inválida/incompleta: volta a mostrar o último valor válido.
      setText(selected ? format(selected, 'dd/MM/yyyy') : '')
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn('relative flex items-center', className)}>
        <Input
          value={text}
          onChange={(e) => setText(applyDateMask(e.target.value))}
          onBlur={commitTyped}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commitTyped()
            }
          }}
          placeholder={placeholder}
          inputMode="numeric"
          className={cn('pr-9', !value && 'text-muted-foreground')}
        />
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label="Abrir calendário"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (date) {
              onChange(format(date, 'yyyy-MM-dd'))
              setOpen(false)
            }
          }}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
}
