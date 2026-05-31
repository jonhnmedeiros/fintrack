import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Tag, Plus, Pencil, Trash2, CircleX, CircleCheck, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
})

type CategoryFormData = z.infer<typeof categoryFormSchema>

const CATEGORY_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#84cc16',
  '#f43f5e', '#d946ef', '#0ea5e9', '#10b981', '#f59e0b',
]

const randomColor = () => CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)]

interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  color: string | null
  icon: string | null
  parentId: string | null
  userId: string
}

const EMOJIS = [
  '🍕','🛒','🥡','🍔','🌮','🥗','🍣','🍜','🍝','🍰','🍩','🍪','🍫','🍿','🥤','☕','🍺','🍷','🥂','🧊',
  '🏠','💡','📡','🔧','🪴','🖼️','🛋️','🚿','🛁','🧹','🔑','🔒','🗝️','🧰','🪣',
  '🚗','🚌','⛽','🚕','🚙','🚐','🏍️','✈️','🚂','🚢','🛴','🅿️','🚲','🛵','🚁','🚀',
  '🎬','🎮','🎯','🎪','🎭','🎨','🎵','🎸','🎹','🎧','📷','🎥','🎪','🎤','🎼','🎲',
  '👕','👗','👔','👟','👠','👒','👜','💼','🧢','👖','👙','👘','🧤','🧣','👞',
  '💊','🏥','💉','🩺','❤️','💪','🦷','👁️','🧠','🫀','🩸','🦴','👂','👃',
  '🐾','🐶','🐱','🐼','🐸','🦊','🐻','🐨','🐝','🌻','🌸','🌺','🌿','🌵','🍀','🐟','🐠','🦋','🐞',
  '💻','📱','🖥️','⌚','📸','🎧','🕹️','⌨️','🖱️','📀','💾','📷','📹','☎️',
  '🏋️','⚽','🏀','⚾','🎾','🏐','🏓','⛳','🏄','🚴','🥊','🤸','🎿','🏊','🤿',
  '✈️','🗺️','🧳','🏖️','🏔️','🏝️','🗽','🗼','⛺','🌋','🏯','🎡','🏰','🌉',
  '💰','💳','💵','💴','💶','💷','💎','📊','📈','💹','🏦','🧾','📉',
  '🎁','🎉','🎊','🎀','📚','✏️','📌','🕐','📅','📋','✂️','📎','📮','📦','🎈',
]

function EmojiPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
          {value ? (
            <span className="text-lg">{value}</span>
          ) : (
            <span className="text-muted-foreground flex items-center gap-2">
              <Smile className="h-4 w-4" /> Selecione
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="flex flex-wrap gap-1">
          {EMOJIS.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => onChange(value === emoji ? '' : emoji)}
              className={`h-9 w-9 rounded-lg text-lg flex items-center justify-center transition-all hover:bg-accent ${
                value === emoji ? 'bg-accent ring-2 ring-ring' : ''
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function CategoryDialog({
  open,
  onOpenChange,
  editCategory,
  parentCategory,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editCategory?: Category | null
  parentCategory?: Category | null
}) {
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const isEditing = !!editCategory
  const isSubCategory = !!parentCategory
  const showTypeSelector = !isSubCategory && !(isEditing && editCategory?.parentId)

  const { handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: editCategory
      ? { name: editCategory.name, type: editCategory.type, color: editCategory.color || randomColor() || undefined, icon: editCategory.icon || '', parentId: editCategory.parentId || undefined }
      : parentCategory
        ? { name: '', color: parentCategory.color || undefined, type: parentCategory.type, parentId: parentCategory.id, icon: '' }
        : { name: '', type: undefined, color: randomColor(), icon: '' },
  })

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const payload: Record<string, unknown> = { name: data.name, color: data.color, icon: data.icon }
      if (data.type) payload.type = data.type
      if (data.parentId) payload.parentId = data.parentId

      if (isEditing && editCategory) {
        await updateCategory.mutateAsync({ id: editCategory.id, ...payload })
        toast.success('Categoria atualizada com sucesso')
      } else {
        await createCategory.mutateAsync(payload)
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
          <DialogTitle>
            {isEditing
              ? 'Editar Categoria'
              : isSubCategory
                ? `Nova Subcategoria de ${parentCategory?.name}`
                : 'Nova Categoria'}
          </DialogTitle>
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

          {showTypeSelector && (
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
          )}

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    (watch('color') || CATEGORY_COLORS[0]) === color
                      ? 'border-foreground scale-110 ring-2 ring-offset-1 ring-foreground/30'
                      : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ícone</Label>
            <EmojiPicker value={watch('icon') || ''} onChange={(v) => setValue('icon', v)} />
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
  childrenCount = 0,
}: {
  category: Category
  open: boolean
  onOpenChange: (v: boolean) => void
  childrenCount?: number
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
          {childrenCount > 0 && ` Também excluirá ${childrenCount} subcategoria${childrenCount > 1 ? 's' : ''}.`}
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
  const [parentForSub, setParentForSub] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const groupedIncome = (categories as Category[] | undefined)
    ?.filter(c => c.type === 'INCOME' && !c.parentId)
    .map(parent => ({
      ...parent,
      children: (categories as Category[]).filter(c => c.parentId === parent.id),
    })) ?? []

  const groupedExpense = (categories as Category[] | undefined)
    ?.filter(c => c.type === 'EXPENSE' && !c.parentId)
    .map(parent => ({
      ...parent,
      children: (categories as Category[]).filter(c => c.parentId === parent.id),
    })) ?? []

  const getChildrenCount = (cat: Category) => {
    return (categories as Category[] | undefined)?.filter(c => c.parentId === cat.id).length ?? 0
  }

  const openCreate = () => {
    setEditCategory(null)
    setParentForSub(null)
    setDialogOpen(true)
  }

  const openSubCreate = (parent: Category) => {
    setParentForSub(parent)
    setEditCategory(null)
    setDialogOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditCategory(cat)
    setParentForSub(null)
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
            {groupedIncome.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma categoria de receita</p>
            )}
            {groupedIncome.map(parent => (
              <div key={parent.id}>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: parent.color || '#3b82f6' }} />
                    <span className="text-sm font-medium">{parent.name}</span>
                  </div>
                  {!isVisualizador && (
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => openSubCreate(parent)}>
                        <Plus className="h-3 w-3 mr-1" /> Sub
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(parent)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(parent)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
                {parent.children.map(child => (
                  <div key={child.id} className="flex items-center justify-between p-3 pl-10 rounded-lg border bg-card/50 ml-4 mt-1.5">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: child.color || parent.color || '#3b82f6' }} />
                      <span className="text-sm">{child.icon ? `${child.icon} ` : ''}{child.name}</span>
                    </div>
                    {!isVisualizador && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(child)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(child)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-red-600 font-medium text-sm">
              <CircleX className="h-4 w-4" />
              Despesas
            </div>
            {groupedExpense.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma categoria de despesa</p>
            )}
            {groupedExpense.map(parent => (
              <div key={parent.id}>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: parent.color || '#3b82f6' }} />
                    <span className="text-sm font-medium">{parent.name}</span>
                  </div>
                  {!isVisualizador && (
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => openSubCreate(parent)}>
                        <Plus className="h-3 w-3 mr-1" /> Sub
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(parent)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(parent)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
                {parent.children.map(child => (
                  <div key={child.id} className="flex items-center justify-between p-3 pl-10 rounded-lg border bg-card/50 ml-4 mt-1.5">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: child.color || parent.color || '#3b82f6' }} />
                      <span className="text-sm">{child.icon ? `${child.icon} ` : ''}{child.name}</span>
                    </div>
                    {!isVisualizador && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(child)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(child)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </Card>
        </div>
      )}

      <CategoryDialog
        key={(editCategory?.id ?? parentForSub?.id) ?? 'create'}
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) { setEditCategory(null); setParentForSub(null) } }}
        editCategory={editCategory}
        parentCategory={parentForSub}
      />

      {deleteTarget && (
        <DeleteDialog
          category={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
          childrenCount={getChildrenCount(deleteTarget)}
        />
      )}
    </div>
  )
}
