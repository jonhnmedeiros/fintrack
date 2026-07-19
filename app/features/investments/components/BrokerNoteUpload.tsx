import { useEffect, useRef, useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { useParseBrokerNote, useImportBrokerNote } from '../hooks/useBrokerageNote'

interface BrokerNoteUploadProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function BrokerNoteUpload({ open, onOpenChange }: BrokerNoteUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { parse, reset, parsing, result, error } = useParseBrokerNote()
  const importNote = useImportBrokerNote()
  const [fileName, setFileName] = useState<string | null>(null)
  const [importDate, setImportDate] = useState(
    () => new Date().toISOString().split('T')[0]
  )

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    await parse(file)
  }

  // A nota traz a própria "Data pregão" — usamos ela como padrão em vez da
  // data de hoje, para não datar errado uma importação de nota antiga.
  useEffect(() => {
    if (result?.date) setImportDate(result.date)
  }, [result])

  const handleImport = async () => {
    if (!result?.operations.length) return
    await importNote.mutateAsync({
      operations: result.operations,
      date: importDate || undefined,
    })
    handleClose()
  }

  const handleClose = () => {
    reset()
    setFileName(null)
    onOpenChange(false)
  }

  const brokerLabel: Record<string, string> = {
    BTG: 'BTG Pactual',
    INTER: 'Banco Inter',
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Nota de Corretagem</DialogTitle>
        </DialogHeader>

        {!result && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">
                {parsing ? 'Processando...' : 'Clique para selecionar o PDF'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Notas da BTG Pactual e Banco Inter são suportadas
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {parsing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4 animate-pulse" />
                Extraindo dados do PDF...
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium">{fileName}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {brokerLabel[result.broker] || result.broker}
              </span>
            </div>

            <div className="text-sm">
              <Label className="block font-medium mb-1">Data das operações</Label>
              <Input
                type="date"
                value={importDate}
                onChange={(e) => setImportDate(e.target.value)}
              />
            </div>

            <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
              {result.operations.map((op, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{op.ticker}</span>
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        op.type === 'BUY'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {op.type === 'BUY' ? 'COMPRA' : 'VENDA'}
                    </span>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{op.quantity}x {formatCurrency(op.price)}</div>
                    {op.total > 0 && <div className="font-medium">{formatCurrency(op.total)}</div>}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm font-medium">
              <span>Total de operações</span>
              <span>{result.operations.length}</span>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleImport} disabled={importNote.isPending}>
                {importNote.isPending ? 'Importando...' : 'Confirmar Importação'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
