# Story 2.2: Gerenciar Cartões de Crédito

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As um Titular,
I want criar e excluir cartões de crédito,
So that eu possa vincular transações a cartões específicos.

**FRs covered:** FR-11

## Acceptance Criteria

1. **Criação de cartão:** Titular informa nome, limite, dia de fechamento e dia de vencimento — cartão salvo vinculado ao usuário, toast de sucesso.
2. **Exclusão de cartão:** Titular confirma exclusão — cartão removido, transações vinculadas mantêm referência nula.
3. **Visualizador:** Não vê botões de criar/excluir cartões (UI gate + API 403).

## Tasks / Subtasks

- [ ] Criar página `/credit-cards` (AC: #1, #2)
  - `app/routes/credit-cards.tsx` — NEW
  - Lista de cartões com: nome, limite formatado, dia fechamento, dia vencimento
  - Cada cartão: nome + badge "Fecha dia X" + "Vence dia Y" + "Limite R$ Z" + botão excluir
  - Botão "Novo Cartão" no header → Dialog de criação
  - Form: nome (input), limite (input number step 0.01), dia fechamento (input number 1-31), dia vencimento (input number 1-31)
  - Validação: nome obrigatório, limite opcional, dias opcionais 1-31
  - Delete dialog com confirmação
  - Toast de sucesso/erro
  - Se Visualizador: ocultar ações CRUD
- [ ] Fix hooks existentes (AC: #1, #2)
  - `useCreateCreditCard` — adicionar `.ok` check + error throw
  - `useDeleteCreditCard` — adicionar `.ok` check + error throw
- [ ] Fix API routes (AC: #1, #2, #3)
  - POST `/api/credit-cards` — try/catch P2002, role check VISUALIZADOR → 403
  - DELETE `/api/credit-cards/$id` — try/catch P2003, role check VISUALIZADOR → 403

## Dev Notes

### Relevant Architecture Patterns

- **TanStack Router file routes:** `app/routes/credit-cards.tsx` com `createFileRoute('/credit-cards')`
- **API layer existe:** CRUD em `app/features/finance/api/credit-cards.ts` + `app/routes/api/credit-cards/index.ts` (GET/POST) + `app/routes/api/credit-cards/$id.ts` (DELETE)
- **Hooks existentes:** `useCreditCards()`, `useCreateCreditCard()`, `useDeleteCreditCard()` em `app/features/finance/hooks/useCreditCards.ts`
- **Zod schema:** `creditCardSchema` em `app/features/finance/schemas.ts` — name (min1 max50), billingDay (1-31?), closingDay (1-31?), limit (number?)
- **CRUD gate Visualizador:** `useUserRole()` hook existente
- **Dialog/DeleteDialog pattern:** seguir mesmo padrão do `categories.tsx`

### Files to Create/Modify

| File | Action | Why |
|---|---|---|
| `app/routes/credit-cards.tsx` | NEW | Página CRUD cartões de crédito |
| `app/features/finance/hooks/useCreditCards.ts` | UPDATE | Error handling nos hooks |
| `app/routes/api/credit-cards/index.ts` | UPDATE | Role check + error handling |
| `app/routes/api/credit-cards/$id.ts` | UPDATE | Role check + error handling |

### CreditCard Model (Prisma)

```prisma
model CreditCard {
  id          String       @id @default(cuid())
  name        String
  billingDay  Int?         // dia de vencimento
  closingDay  Int?         // dia de fechamento
  limit       Decimal?
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
}
```

### Existing API Endpoints

| Method | Route | Function | Auth |
|---|---|---|---|
| GET | `/api/credit-cards` | `listCreditCards(userId)` | `auth(request)` → session.user.id |
| POST | `/api/credit-cards` | `createCreditCard(userId, data)` | `auth(request)` → session.user.id |
| DELETE | `/api/credit-cards/$id` | `deleteCreditCard(userId, id)` | `auth(request)` → session.user.id |

### Existing Hooks (before this story)

```ts
useCreditCards()            // GET → list query
useCreateCreditCard()       // POST → create mutation (sem .ok check)
useDeleteCreditCard()       // DELETE → delete mutation (sem .ok check)
```

### Form Schema (createCreditCardSchema)

```ts
export const createCreditCardSchema = creditCardSchema.omit({ id: true, userId: true })
// Result: { name: string, billingDay?: number, closingDay?: number, limit?: number }
```

### Previous Story Intelligence (2-1)

- **Key patterns estabelecidos em 2-1:**
  - `key={editCategory?.id ?? 'create'}` para evitar stale defaults em Dialog
  - Error handling: `.ok` check nos hooks, try/catch P2002/P2003/P2025 nas API routes
  - Role check: `session.user.role === 'VISUALIZADOR'` → 403
  - Toast com `sonner` via `toast.success()` / `toast.error()`
  - CRUD gate: `!isVisualizador` para ocultar ações
  - `onOpenChange` com `(open) => { if (!open) setState(null) }`
  - Type guard ao invés de non-null assertion
- **Review findings aplicados:** todos os patches de 2-1 devem ser replicados aqui
- **Navegação:** página standalone acessível via URL direta `/credit-cards`, sem link no sidebar

### Testing

- Renderização da página /credit-cards
- Criação de cartão com validação (nome obrigatório, dias 1-31)
- Exclusão com confirmação
- CRUD gate Visualizador

## Dev Agent Record

### Agent Model Used

deepseek-v4-flash-free (opencode)

### Debug Log References

### Completion Notes List

- Hooks `useCreateCreditCard` / `useDeleteCreditCard` atualizados com `.ok` check + error throw
- API routes POST/DELETE: role check `VISUALIZADOR → 403` + try/catch P2003
- Página `/credit-cards` criada:
  - Cards grid (responsive md:grid-cols-2 lg:grid-cols-3)
  - Cada card: ícone + nome + dia fechamento/vencimento + limite formatado
  - Botão "Novo Cartão" → Dialog com nome, dias, limite
  - Delete dialog com confirmação
  - Empty state ("Nenhum cartão cadastrado")
  - CRUD gate Visualizador
  - Toast de sucesso/erro
- Build: passou sem erros

### File List

- `app/routes/credit-cards.tsx` — NEW
- `app/features/finance/hooks/useCreditCards.ts` — UPDATE
- `app/routes/api/credit-cards/index.ts` — UPDATE
- `app/routes/api/credit-cards/$id.ts` — UPDATE
