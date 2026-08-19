import { PiggyBank } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useCategories } from '@/features/finance/hooks/useCategories'
import { useInvestPreferences, useUpdateInvestPreferences } from '../hooks/usePreferences'

interface Category {
  id: string
  name: string
  type: string
}

export function InvestCategoryPreferences() {
  const { data: categoriesData } = useCategories()
  const { data: prefs, isLoading } = useInvestPreferences()
  const updatePrefs = useUpdateInvestPreferences()

  const categories = (Array.isArray(categoriesData) ? categoriesData : []) as Category[]
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE')
  const incomeCategories = categories.filter((c) => c.type === 'INCOME')

  const handleChange = async (field: 'investExpenseCategoryId' | 'investIncomeCategoryId', value: string) => {
    try {
      await updatePrefs.mutateAsync({ [field]: value === '__none__' ? null : value })
      toast.success('Preferência salva')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Investimentos</CardTitle>
            <p className="text-sm text-muted-foreground">
              Categoria aplicada automaticamente aos débitos/créditos lançados na conta ao registrar transações de investimento
            </p>
          </div>
          <PiggyBank className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Categoria para débitos (compra, aporte, taxa)</Label>
          <Select
            disabled={isLoading}
            value={prefs?.investExpenseCategoryId || '__none__'}
            onValueChange={(v) => handleChange('investExpenseCategoryId', v)}
          >
            <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Nenhuma</SelectItem>
              {expenseCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Categoria para créditos (venda, resgate, dividendo)</Label>
          <Select
            disabled={isLoading}
            value={prefs?.investIncomeCategoryId || '__none__'}
            onValueChange={(v) => handleChange('investIncomeCategoryId', v)}
          >
            <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Nenhuma</SelectItem>
              {incomeCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
