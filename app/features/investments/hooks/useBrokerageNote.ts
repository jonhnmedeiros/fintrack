import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ParseResult, ParsedOperation } from '../api/brokerage-note'

export function useParseBrokerNote() {
  const [parsing, setParsing] = useState(false)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const parse = useCallback(async (file: File) => {
    setParsing(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/brokerage-notes/parse', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao processar PDF')

      if (data.broker === 'UNKNOWN') {
        setError('Não reconhecemos esse formato. Notas da BTG e Inter são suportadas.')
        return
      }

      if (!data.operations?.length) {
        setError('Nenhuma operação encontrada no PDF')
        return
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar PDF')
    } finally {
      setParsing(false)
    }
  }, [])

  const reset = useCallback(() => {
    setParsing(false)
    setResult(null)
    setError(null)
  }, [])

  return { parse, reset, parsing, result, error }
}

export function useImportBrokerNote() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      operations,
      date,
    }: {
      operations: ParsedOperation[]
      date?: string
    }) => {
      const res = await fetch('/api/brokerage-notes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operations, date }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro ao importar nota' }))
        throw new Error(err.error || 'Erro ao importar nota')
      }
      return res.json()
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['assets'] })
      qc.invalidateQueries({ queryKey: ['investment-transactions'] })
      const extra = data.skipped ? ` (${data.skipped} já existiam e foram ignoradas)` : ''
      toast.success(`${data.created} operações importadas com sucesso!${extra}`)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Erro ao importar nota')
    },
  })
}
