import { useState } from 'react'
import { z } from 'zod'
import { Mail, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useCreateInvite } from '../hooks/useInvites'

interface InviteFormProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function InviteForm({ open, onOpenChange }: InviteFormProps) {
  const createInvite = useCreateInvite()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const parsed = z.string().email().safeParse(email)
    if (!parsed.success) {
      setError('Email inválido')
      return
    }

    try {
      await createInvite.mutateAsync({ email: parsed.data })
      setEmail('')
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar convite')
    }
  }

  const handleClose = () => {
    setEmail('')
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar Visualizador</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Envie um convite por email para que outra pessoa possa acompanhar suas finanças.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email do convidado</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null) }}
                className="pl-9"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createInvite.isPending || !email}>
              {createInvite.isPending ? (
                'Enviando...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Convite
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
