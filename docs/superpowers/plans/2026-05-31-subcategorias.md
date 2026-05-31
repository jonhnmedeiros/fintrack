# Subcategorias Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 2-level subcategory support (parent → child) with emoji icons, hierarchical display in transaction form and categories page.

**Architecture:** Self-referencing `parentId` on existing Category model. Flat list from API, frontend groups by parent. Existing `icon` field used for emoji. Max 2 levels enforced in API.

**Tech Stack:** Prisma, TanStack Query, shadcn/ui Select (Radix), Zod

---

## Chunk 1: Schema & Migration

### Task 1: Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma:77-89`
- Run: `npx prisma generate`

- [ ] **Step 1: Add `parentId` field and self-relation to Category model**

```prisma
model Category {
  id          String       @id @default(cuid())
  name        String
  type        CategoryType
  color       String?
  icon        String?
  userId      String
  parentId    String?                       // NEW
  parent      Category?    @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: Cascade)  // NEW
  children    Category[]   @relation("CategoryHierarchy")  // NEW
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  budgets     Budget[]

  @@unique([userId, id])
  @@unique([userId, name, type])
  @@unique([userId, parentId, name, type])   // NEW
}
```

- [ ] **Step 2: Generate Prisma client and create migration**

Run:
```bash
npx prisma generate
npx prisma migrate dev --name add_parent_id_to_category
```

Expected: Migration created and applied. Client regenerated.

- [ ] **Step 3: Verify migration**

Run:
```bash
npx prisma migrate status
```

Expected: "Database up to date"

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add parentId and self-relation to Category model"
```

---

## Chunk 2: API Layer (Schemas + tenant-db + routes)

### Task 2: Update Zod schemas

**Files:**
- Modify: `app/features/finance/schemas.ts:3-10`

- [ ] **Step 1: Add `parentId` to categorySchema**

```typescript
export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  userId: z.string(),
})
```

- [ ] **Step 2: Commit**

```bash
git add app/features/finance/schemas.ts
git commit -m "feat: add parentId to category schema"
```

### Task 3: Update tenant-db API functions

**Files:**
- Modify: `app/features/finance/api/categories.ts:1-24`

- [ ] **Step 1: Update `listCategories` to include children relation**

```typescript
export async function listCategories(userId: string) {
  const db = userDb(userId)
  return db.category.findMany({
    orderBy: { name: 'asc' },
    include: { children: { orderBy: { name: 'asc' } } },
  })
}
```

- [ ] **Step 2: Update `createCategory` to validate max 2 levels**

```typescript
import { userDb } from '@/lib/tenant-db'
import { createCategorySchema } from '../schemas'
import { z } from 'zod'

export async function listCategories(userId: string) {
  const db = userDb(userId)
  return db.category.findMany({
    orderBy: { name: 'asc' },
  })
}

export async function createCategory(userId: string, data: unknown) {
  const validated = createCategorySchema.parse(data)
  const db = userDb(userId)
  // Validate max 2 levels
  if (validated.parentId) {
    const parent = await db.category.findUnique({ where: { id: validated.parentId } })
    if (!parent) throw new Error('Categoria pai não encontrada')
    if (parent.parentId) throw new Error('Não é permitido criar subcategoria de uma subcategoria')
  }
  return db.category.create({ data: validated })
}

export async function updateCategory(userId: string, id: string, data: unknown) {
  const validated = createCategorySchema.partial().parse(data)
  const db = userDb(userId)
  return db.category.update({ where: { id }, data: validated })
}

export async function deleteCategory(userId: string, id: string) {
  const db = userDb(userId)
  return db.category.delete({ where: { id } })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/features/finance/api/categories.ts
git commit -m "feat: update category API with parentId validation"
```

---

## Chunk 3: Categories Page UI

### Task 4: Update categories page with hierarchy + emoji

**Files:**
- Modify: `app/routes/categories.tsx`

- [ ] **Step 1: Separate categories into parents and children in the component**

Add grouping logic after the `useCategories()` call:
```typescript
const { data: categories, isLoading, isError } = useCategories()

type CategoryWithChildren = Category & { children: Category[] }

const groupedCategories = (categories as Category[] | undefined)?.reduce<{
  income: CategoryWithChildren[]
  expense: CategoryWithChildren[]
}>(
  (acc, cat) => {
    if (!cat.parentId) {
      const group = { ...cat, children: (categories as Category[]).filter(c => c.parentId === cat.id) }
      if (cat.type === 'INCOME') acc.income.push(group)
      else acc.expense.push(group)
    }
    return acc
  },
  { income: [], expense: [] }
) ?? { income: [], expense: [] }
```

- [ ] **Step 2: Update `CategoryDialog` to support subcategory creation + emoji icon picker**

Add `parentCategory` prop to `CategoryDialog`. When `parentCategory` is set, lock type/color to parent's values, show emoji picker.

Add emoji selector component:
```typescript
const EMOJIS = ['🍕', '🛒', '🥡', '🏠', '💡', '📡', '⛽', '🚌', '🎬', '👕', '💊', '🐾', '📚', '💻', '🎮', '🏋️', '✈️', '🎁', '☕', '🍺']

function EmojiPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {EMOJIS.map(emoji => (
        <button
          key={emoji}
          type="button"
          onClick={() => onChange(emoji === value ? '' : emoji)}
          className={`h-9 w-9 rounded-lg text-lg flex items-center justify-center border transition-all ${
            value === emoji ? 'border-foreground bg-accent scale-110' : 'border-transparent hover:bg-accent'
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
```

Update the form dialog to show emoji picker when creating/editing subcategories. When `parentCategory` is provided:
- Hide Type selector (inherits from parent)
- Pre-fill color from parent
- Show emoji picker above the name input
- Submit includes `parentId: parentCategory.id`

- [ ] **Step 3: Update category list display to render hierarchy**

```tsx
{group.income.map(cat => (
  <div key={cat.id}>
    {/* Parent row */}
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#3b82f6' }} />
        <span className="text-sm font-medium">{cat.name}</span>
      </div>
      {!isVisualizador && (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => openSubCreate(cat)}>
            <Plus className="h-3 w-3 mr-1" /> Sub
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(cat)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
    {/* Children */}
    {cat.children.map(child => (
      <div key={child.id} className="flex items-center justify-between p-3 pl-10 rounded-lg border bg-card/50 ml-4 mt-1">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: child.color || cat.color }} />
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
```

- [ ] **Step 4: Update delete dialog to mention subcategories when deleting a parent**

When `deleteTarget` has children, update the warning text:
```tsx
<p className="text-sm text-muted-foreground">
  Excluir a categoria <strong>{category.name}</strong> removerá a referência nas transações existentes
  {category.children?.length > 0 && ` e também excluirá ${category.children.length} subcategoria${category.children.length > 1 ? 's' : ''}.`}
  Esta ação não pode ser desfeita.
</p>
```

- [ ] **Step 5: Commit**

```bash
git add app/routes/categories.tsx
git commit -m "feat: hierarchical categories page with subcategories and emoji picker"
```

---

## Chunk 4: Transaction Form

### Task 5: Update category select to use grouped SelectLabel pattern

**Files:**
- Modify: `app/features/finance/components/TransactionForm.tsx`

- [ ] **Step 1: Group categories by parent and render with SelectGroup/SelectLabel**

Replace the current category Select content:
```tsx
import {
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'
```

Wait — need to check if shadcn's Select exports SelectGroup and SelectLabel. Check the component file.

If they exist, update the render:

```tsx
// Group categories
const grouped = (categories as any[] | undefined)?.reduce<{ parent: any; children: any[] }[]>((acc, cat) => {
  if (!cat.parentId) {
    acc.push({ parent: cat, children: [] })
  } else {
    const group = acc.find(g => g.parent.id === cat.parentId)
    if (group) group.children.push(cat)
  }
  return acc
}, []) ?? []

// In the JSX:
<SelectContent>
  {grouped.map(group => (
    <SelectGroup key={group.parent.id}>
      <SelectLabel className="text-xs font-semibold text-muted-foreground px-2 py-1">
        {group.parent.name}
      </SelectLabel>
      {group.children.map(child => (
        <SelectItem key={child.id} value={child.id}>
          {child.icon ? `${child.icon} ` : ''}{child.name}
        </SelectItem>
      ))}
    </SelectGroup>
  ))}
</SelectContent>
```

- [ ] **Step 2: Commit**

```bash
git add app/features/finance/components/TransactionForm.tsx
git commit -m "feat: group subcategories under parent headers in transaction form"
```

---

## Chunk 5: Seed & Cleanup

### Task 6: Update seed data

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Add parent categories and subcategories with emoji icons**

Add subcategories for existing parent categories. Example:
```typescript
const categories = [
  // Parents
  { id: 'cat-alimentacao', name: 'Alimentação', type: 'EXPENSE', color: '#ef4444' },
  { id: 'cat-moradia', name: 'Moradia', type: 'EXPENSE', color: '#f97316' },
  { id: 'cat-transporte', name: 'Transporte', type: 'EXPENSE', color: '#eab308' },
  // Children
  { id: 'cat-restaurante', name: 'Restaurante', type: 'EXPENSE', color: '#ef4444', icon: '🍕', parentId: 'cat-alimentacao' },
  { id: 'cat-supermercado', name: 'Supermercado', type: 'EXPENSE', color: '#ef4444', icon: '🛒', parentId: 'cat-alimentacao' },
  { id: 'cat-aluguel', name: 'Aluguel', type: 'EXPENSE', color: '#f97316', icon: '🏠', parentId: 'cat-moradia' },
  { id: 'cat-gasolina', name: 'Gasolina', type: 'EXPENSE', color: '#eab308', icon: '⛽', parentId: 'cat-transporte' },
]
```

- [ ] **Step 2: Re-seed the database**

```bash
npx prisma db seed
```

- [ ] **Step 3: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat: update seed with subcategories and emoji icons"
```

---

## Chunk 6: Verify

### Task 7: Run tests and dev check

- [ ] **Step 1: Run test suite**

```bash
npx vitest run
```

Expected: 11+ tests passing (existing tests + any new ones)

- [ ] **Step 2: Build check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No type errors (or only pre-existing ones)

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: verify subcategories implementation"
```
