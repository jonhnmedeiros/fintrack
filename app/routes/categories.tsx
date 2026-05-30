import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Tag, Plus, Pencil, Trash2, CircleX, CircleCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/features/finance/hooks/useCategories'
import { useUserRole } from '@/features/auth/hooks/useUserRole'

export const Route = createFileRoute('/categories')({
  component: CategoriesPage,
})

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Máximo de 50 caracteres'),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().optional(),
})

type CategoryFormData = z.infer<typeof categoryFormSchema>

interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  color: string | null
  icon: string | null
  userId: string
}

function CategoryDialog({
  open,
  onOpenChange,
  editCategory,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editCategory?: Category | null
}) {
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const isEditing = !!editCategory

  const { handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: editCategory
      ? { name: editCategory.name, type: editCategory.type, color: editCategory.color || '#3b82f6' }
      : { name: '', type: undefined, color: '#3b82f6' },
  })

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEditing && editCategory) {
        await updateCategory.mutateAsync({ id: editCategory.id, ...data })
        toast.success('Categoria atualizada com sucesso')
      } else {
        await createCategory.mutateAsync(data)
        toast.success('Categoria criada com sucesso')
      }
      reset()
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro inesperado'
      if (message.includes('já existe')) {
        toast.error('Já existe uma categoria com este nome')
      } else {
        toast.error(message)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={watch('name') || ''}
              onChange={(e) => setValue('name', e.target.value)}
              placeholder="Ex: Alimentação"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={watch('type') || ''}
              onValueChange={(v) => setValue('type', v as 'INCOME' | 'EXPENSE')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Receita</SelectItem>
                <SelectItem value="EXPENSE">Despesa</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={watch('color') || '#3b82f6'}
                onChange={(e) => setValue('color', e.target.value)}
                className="h-10 w-16 rounded-md border border-input bg-background px-1 cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">
                {watch('color') || '#3b82f6'}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createCategory.isPending || updateCategory.isPending}
          >
            {createCategory.isPending || updateCategory.isPending
              ? 'Salvando...'
              : isEditing
                ? 'Atualizar'
                : 'Criar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteDialog({
  category,
  open,
  onOpenChange,
}: {
  category: Category
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const deleteCategory = useDeleteCategory()

  const handleDelete = async () => {
    try {
      await deleteCategory.mutateAsync(category.id)
      toast.success('Categoria excluída com sucesso')
      onOpenChange(false)
    } catch {
      toast.error('Erro ao excluir categoria')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Categoria</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Excluir a categoria <strong>{category.name}</strong> removerá a referência nas transações existentes.
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteCategory.isPending}>
            {deleteCategory.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CategoriesPage() {
  const { data: categories, isLoading, isError } = useCategories()
  const { isVisualizador } = useUserRole()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const incomeCategories = (categories as Category[] | undefined)?.filter((c) => c.type === 'INCOME') ?? []
  const expenseCategories = (categories as Category[] | undefined)?.filter((c) => c.type === 'EXPENSE') ?? []

  const openCreate = () => {
    setEditCategory(null)
    setDialogOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditCategory(cat)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Categorias</h1>
            <p className="text-sm text-muted-foreground">Gerencie as categorias de transações</p>
          </div>
        </div>
        {!isVisualizador && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="p-12 text-center text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="mt-3 text-sm">Carregando</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border-2 border-dashed border-red-200 p-12 text-center text-red-500">
          <p className="text-lg font-medium">Erro ao carregar categorias</p>
          <p className="text-sm">Tente novamente mais tarde.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
              <CircleCheck className="h-4 w-4" />
              Receitas
            </div>
            {incomeCategories.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma categoria de receita</p>
            )}
            {incomeCategories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
                {!isVisualizador && (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(cat)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-red-600 font-medium text-sm">
              <CircleX className="h-4 w-4" />
              Despesas
            </div>
            {expenseCategories.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma categoria de despesa</p>
            )}
            {expenseCategories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
                {!isVisualizador && (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(cat)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </Card>
        </div>
      )}

      <CategoryDialog
        key={editCategory?.id ?? 'create'}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editCategory={editCategory}
      />

      {deleteTarget && (
        <DeleteDialog
          category={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        />
      )}
    </div>
  )
}
