import { useState } from 'react'
import { Input } from '@/components/ui/input'

interface CurrencyInputProps {
  value: number | undefined
  onChange: (value: number) => void
  placeholder?: string
  className?: string
}

/**
 * Campo de valor em reais: digita "1234,56", mostra "R$ 1.234,56" ao sair
 * do campo. O texto exibido só é atualizado pelos próprios handlers (não por
 * um efeito reagindo a `value`), senão cada tecla digitada reformataria o
 * campo em cima da digitação. Para resetar o valor por fora (ex: editando
 * outra transação), monte um novo componente com `key` diferente.
 */
export function CurrencyInput({ value, onChange, placeholder = '0,00', className }: CurrencyInputProps) {
  const [display, setDisplay] = useState(() =>
    value != null ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''
  )

  return (
    <Input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      className={className}
      value={display}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^\d,]/g, '')
        const parts = raw.split(',')
        const cleaned = parts[0] + (parts.length > 1 ? ',' + parts.slice(1).join('') : '')
        setDisplay(cleaned)
        onChange(parseFloat(cleaned.replace(',', '.')) || 0)
      }}
      onFocus={() => {
        setDisplay(value != null ? String(value).replace('.', ',') : '')
      }}
      onBlur={() => {
        setDisplay(value != null ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '')
      }}
    />
  )
}
