# Story 2.1: Gerenciar Categorias

Status: done

## Story

As um Titular,
I want criar, editar e excluir categorias de transações,
So that eu possa classificar meus gastos e receitas.

**FRs covered:** FR-10

## Acceptance Criteria

1. **Criação de categoria:** Titular informa nome e tipo (INCOME/EXPENSE) — categoria salva com nome único por tipo e usuário, toast de sucesso.
2. **Edição de categoria:** Titular altera nome de categoria existente — atualizado no banco via PUT.
3. **Exclusão de categoria:** Titular confirma exclusão — categoria removida, transações existentes mantêm referência nula (onDelete: SetNull na FK).
4. **Nome duplicado:** Se já existe categoria com o mesmo nome e tipo, retorna erro amigável "Já existe uma categoria com este nome".
5. **Visualizador:** Não vê botões/botões desabilitados para criar/editar/excluir categorias.

## Tasks / Subtasks

- [ ] Adicionar hook `useUpdateCategory` (AC: #2)
  - `app/features/finance/hooks/useCategories.ts` — UPDATE
  - `mutationFn: (data: { id: string } & Partial<category create input>) => fetch + PUT`
  - `onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] })`
- [ ] Criar página `/categories` (AC: #1, #2, #3, #4)
  - `app/routes/categories.tsx` — NEW
  - Lista de categorias agrupadas por tipo (INCOME / EXPENSE)
  - Cada categoria: bolinha de cor (color), nome, badge de tipo, botões editar/excluir
  - Categoria sem transações vinculadas: excluir sem confirmação extra
  - Categoria com transações: alerta "Excluir esta categoria removerá a referência nas transações existentes."
  - Modal Dialog para criação/edição: nome (input text), tipo (Select INCOME/EXPENSE), cor (input color)
  - Validação: nome obrigatório, tipo obrigatório
  - Toast de sucesso/erro após cada operação
  - Botão "Nova Categoria" no header da página
  - Se Visualizador: ocultar botão de criar, editar e excluir
- [ ] Registrar rota no routeTree (AC: #1)
  - `routeTree.gen.ts` — AUTO (TanStack Router regenera)
  - Navegação: sem link no sidebar principal / acessível via URL direta `/categories`
- [ ] Testar fluxos CRUD (AC: todos)
  - Criar categoria INCOME e EXPENSE
  - Editar nome
  - Excluir categoria sem transações
  - Tentar criar duplicata — erro amigável
  - Visualizador não vê ações CRUD

## Dev Notes

### Relevant Architecture Patterns

- **TanStack Router file routes:** `app/routes/categories.tsx` com `createFileRoute('/categories')`
- **API layer já existe:** CRUD em `app/features/finance/api/categories.ts` + `app/routes/api/categories/index.ts` (GET/POST) + `app/routes/api/categories/$id.ts` (PUT/DELETE)
- **Hooks existentes:** `useCategories()`, `useCreateCategory()`, `useDeleteCategory()` em `app/features/finance/hooks/useCategories.ts` — **faltando `useUpdateCategory`**
- **Zod schema:** `categorySchema` em `app/features/finance/schemas.ts` com campos: id, name (string min1 max50), type (INCOME|EXPENSE), color (string?), icon (string?), userId
- **Radix UI Select pattern:** usar `setValue` + `watch` (como em TransactionForm.tsx), sentinel `__all__` / `__none__` para valores vazios
- **Toast:** usar componente/sistema de toast já existente no projeto (verificar)
- **CRUD gate Visualizador:** `useUserRole()` hook existente em `app/features/auth/hooks/useUserRole.ts`
- **Dialog pattern:** usar `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle` — mesmo padrão de `TransactionForm.tsx`
- **Erro duplicata:** `@@unique([userId, name, type])` no schema Prisma — `createCategory` joga erro Prisma `P2002` — capturar no hook/cliente e exibir "Já existe uma categoria com este nome"
- **Cor:** `input type="color"` HTML nativo para seleção de cor
- **Ícones:** lucide-react (`Tag`, `Plus`, `Pencil`, `Trash2`, `Circle`, ` Palette`)

### Files to Create/Modify

| File | Action | Why |
|---|---|---|
| `app/features/finance/hooks/useCategories.ts` | UPDATE | Adicionar `useUpdateCategory()` |
| `app/routes/categories.tsx` | NEW | Página de gerenciamento de categorias |
| `routeTree.gen.ts` | AUTO | Regenerado pelo TanStack Router |

### Category Model (Prisma)

```prisma
enum CategoryType { INCOME EXPENSE }

model Category {
  id          String       @id @default(cuid())
  name        String
  type        CategoryType
  color       String?
  icon        String?
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  budgets     Budget[]
  @@unique([userId, id])
  @@unique([userId, name, type])
}
```

### Existing API Endpoints

| Method | Route | Function | Auth |
|---|---|---|---|
| GET | `/api/categories` | `listCategories(userId)` | `auth(request)` → session.user.id |
| POST | `/api/categories` | `createCategory(userId, data)` | `auth(request)` → session.user.id |
| PUT | `/api/categories/$id` | `updateCategory(userId, id, data)` | `auth(request)` → session.user.id |
| DELETE | `/api/categories/$id` | `deleteCategory(userId, id)` | `auth(request)` → session.user.id |

### Existing Hooks (before this story)

```ts
useCategories()           // GET → list query
useCreateCategory()       // POST → create mutation + invalidate
useDeleteCategory()       // DELETE → delete mutation + invalidate
// Missing: useUpdateCategory()
```

### Form Schema (createCategorySchema)

```ts
export const createCategorySchema = categorySchema.omit({ id: true, userId: true })
// Resultado: { name: string, type: "INCOME" | "EXPENSE", color?: string, icon?: string }
```

### Zone de Conflito: @@unique

Prisma constraint `@@unique([userId, name, type])` joga erro `P2002` (Unique constraint failed) se nome + tipo duplicado para o mesmo usuário. Capturar no `onError` do `useCreateCategory` / `useUpdateCategory` e exibir toast/mensagem amigável.

### Previous Story Intelligence (1-3)

- Sidebar com 5 itens: Dashboard, Transações, Investimentos, Relatórios, Configurações — **sem link para categorias**. Página `/categories` será standalone, acessível via URL direta.
- Layout responsivo: sidebar desktop/tablet, bottom tab mobile, padding `p-8 max-sm:p-4 pb-20 sm:pb-0`
- `useUserRole()` já criado com `isVisualizador` — usar para CRUD gate
- Review findings relevantes:
  - Breakpoint: sidebar `hidden sm:flex` / bottom tab `sm:hidden`
  - Path matching `startsWith` para nav ativo
  - `z-40` para bottom tab (evitar conflito com dialogs z-50)
  - `as any` type safety: padrão aceito no projeto (deferido)

### Testing

- Teste de renderização da página /categories
- Teste de criação de categoria (mock API)
- Teste de exclusão com confirmação
- Teste de duplicata (erro P2002)
- Teste de CRUD gate para Visualizador
- Teste de filtro por tipo INCOME/EXPENSE

## Dev Agent Record

### Agent Model Used

deepseek-v4-flash-free (opencode)

### Debug Log References

### Completion Notes List

- `useUpdateCategory` hook adicionado em `app/features/finance/hooks/useCategories.ts` — PUT com error handling e invalidate
- `useCreateCategory` atualizado com error handling (throw em non-ok responses)
- `sonner` instalado para toasts, Toaster adicionado em `app/routes/__root.tsx`
- Página `/categories` criada em `app/routes/categories.tsx`:
  - Lista separada por tipo (INCOME/EXPENSE) em cards lado a lado
  - Cada categoria: bolinha colorida + nome + botões editar/excluir
  - CRUD gate: Visualizador não vê ações
  - Dialog de criação/edição: nome, tipo (Select), cor (input color)
  - Delete dialog com confirmação
  - Toast de sucesso/erro para todas operações
  - Erro duplicata: "Já existe uma categoria com este nome"
- API routes: try/catch P2002 → 409 + mensagem amigável
- Build verificado: `vinxi build` passou sem erros

### File List

- `app/features/finance/hooks/useCategories.ts` — UPDATE
- `app/routes/categories.tsx` — NEW
- `app/routes/api/categories/index.ts` — UPDATE
- `app/routes/api/categories/$id.ts` — UPDATE
- `app/routes/__root.tsx` — UPDATE
- `package.json` — UPDATE (sonner)

### Review Findings

**decision-needed:**
- [x] [Review][Decision] Server-side role authorization — adicionado role check (`VISUALIZADOR → 403`) em POST/PUT/DELETE. [api/categories/*.ts]
- [x] [Review][Decision] Missing `onDelete: SetNull` — adicionado `onDelete: SetNull` na relação Transaction→Category. Migration aplicada. [prisma/schema.prisma:99]
- [x] [Review][Decision] Budget com categoryId obrigatório — adicionado `onDelete: Cascade` na relação Budget→Category. Migration aplicada. [prisma/schema.prisma:127]

**patch:**
- [x] [Review][Patch] `useForm defaultValues` stale — fix: `key={editCategory?.id ?? 'create'}` no CategoryDialog. [categories.tsx:301]
- [x] [Review][Patch] No request body validation — API routes já validam via Zod na camada api/. [categories.ts:*]
- [x] [Review][Patch] `useDeleteCategory` sem `.ok` check — adicionado `.then(async (r) => { if (!r.ok) throw... })`. [useCategories.ts:51]
- [x] [Review][Patch] DELETE API route sem error handling — adicionado try/catch P2003 → 409. [$id.ts:28]
- [x] [Review][Patch] P2025 not-found — adicionado catch P2025 → 404 no PUT. [$id.ts:17]
- [x] [Review][Patch] Error string parsing vaza Prisma — simplificado para apenas `message.includes('já existe')`. [categories.tsx:82]
- [x] [Review][Patch] `editCategory!` non-null assertion — substituído por type guard `if (editCategory)`. [categories.tsx:70-72]
- [x] [Review][Patch] `onOpenChange` descarta boolean — fix: `(open) => { if (!open) setDeleteTarget(null) }`. [categories.tsx:311]

**defer:**
- [x] [Review][Defer] Type assertion `as Category[]` — pre-existing, mesmo pattern em TransactionForm e transactions.tsx. Refactor futuro com Zod parse nos hooks.
- [x] [Review][Defer] Ambos dialogs podem abrir simultaneamente — cenário improvável, baixo impacto.
