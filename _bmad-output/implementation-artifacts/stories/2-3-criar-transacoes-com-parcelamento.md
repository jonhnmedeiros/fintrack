# Story 2.3: Criar Transações com Parcelamento

Status: done

## Story

As um Titular,
I want registrar transações financeiras com suporte a parcelamento no cartão de crédito,
So that eu possa controlar compras parceladas e receitas/despesas avulsas.

**FRs covered:** FR-8

## Acceptance Criteria

1. **Criação de transação simples:** Titular informa tipo, valor, descrição, categoria, data — transação salva, toast de sucesso.
2. **Criação com parcelamento:** Ao selecionar cartão de crédito com parcelas > 1, sistema gera N transações mensais com valores proporcionais.
3. **Validação de campos:** Tipo obrigatório, valor positivo obrigatório, data obrigatória, parcelas mínimo 1 (opcional), cartão exibido apenas para EXPENSE.
4. **Visualizador:** Não vê botão "Nova Transação" (UI gate + API 403).
5. **Indicação visual de parcelas:** Transações parceladas exibem "X/N" na tabela.

## Tasks / Subtasks

- [ ] Fix hooks (AC: #1, #2)
  - `useCreateTransaction` — adicionar `.ok` check + error throw
- [ ] Fix API routes (AC: #1, #2, #4)
  - POST `/api/transactions` — role check VISUALIZADOR → 403, try/catch
  - DELETE `/api/transactions/$id` — role check VISUALIZADOR → 403, try/catch
- [ ] Fix TransactionForm component (AC: #1, #2, #3)
  - Usar `createTransactionSchema` compartilhado ao invés de schema local
  - Adicionar `key` pattern para evitar stale defaults
  - Melhorar validação com feedback visual (errors)
  - Aplicar `.ok` check do hook no submit
- [ ] Fix TransactionTable (AC: #5)
  - Adicionar coluna ou badge "X/N" para transações parceladas

## Dev Notes

### Relevant Architecture Patterns

- **CRUD gate Visualizador:** `useUserRole()` hook existente
- **Error handling:** `.ok` check nos hooks, try/catch com mensagens amigáveis
- **Dialog pattern:** `key` para evitar stale defaults
- **Toast:** `toast.success()` / `toast.error()` via sonner

### Existing Infrastructure (pre-existing scaffolding)

- `app/routes/api/transactions/index.ts` — GET (list with filters) + POST (create)
- `app/routes/api/transactions/$id.ts` — DELETE
- `app/features/finance/api/transactions.ts` — `listTransactions`, `createTransaction` (já divide parcelas), `deleteTransaction`
- `app/features/finance/hooks/useTransactions.ts` — `useTransactions`, `useCreateTransaction`, `useDeleteTransaction`
- `app/features/finance/components/TransactionForm.tsx` — Dialog form (schema local, sem .ok check)
- `app/features/finance/components/TransactionTable.tsx` — Tabela (sem coluna de parcelas)
- `app/routes/transactions.tsx` — Página de listagem com filtros
- `app/features/finance/schemas.ts` — `createTransactionSchema` compartilhado

### Installed Libraries

- `@hookform/resolvers` (zodResolver)
- `react-hook-form`
- `sonner` (toast)
- `@tanstack/react-table` (TransactionTable)
- Componentes shadcn/ui: Button, Input, Label, Select, Dialog, Card

### Files to Create/Modify

| File | Action | Why |
|---|---|---|
| `app/features/finance/hooks/useTransactions.ts` | UPDATE | Error handling nos hooks |
| `app/routes/api/transactions/index.ts` | UPDATE | Role check + error handling |
| `app/routes/api/transactions/$id.ts` | UPDATE | Role check + error handling |
| `app/features/finance/components/TransactionForm.tsx` | UPDATE | Shared schema, key pattern, error display |
| `app/features/finance/components/TransactionTable.tsx` | UPDATE | Installment indicator column |

### Previous Story Intelligence (2-1, 2-2)

- **Key patterns estabelecidos:**
  - `key` para evitar stale defaults em Dialog
  - `.ok` check nos hooks, try/catch P2002/P2003/P2025 nas API routes
  - Role check: `session.user.role === 'VISUALIZADOR'` → 403
  - Toast com `sonner` via `toast.success()` / `toast.error()`
  - CRUD gate: `!isVisualizador` para ocultar ações
  - `onOpenChange` com `(open) => { if (!open) setState(null) }`
  - Error narrowing: `err: unknown` com instanceof + code check
- **Review findings aplicados:** P2025 handler, ZodError → 400, catch blocks com type narrowing
- **Navegação:** página acessível via sidebar, TransactionForm aberto por Dialog Trigger

### Backend Installment Logic (already exists)

```
createTransaction(userId, data):
  validated = createTransactionSchema.parse(data)
  if creditCardId && totalInstallments > 1:
    installmentAmount = amount / totalInstallments
    for i = 1..totalInstallments:
      create transaction with amount=installmentAmount, installmentNumber=i, date=date + (i-1) months
    return prisma.$transaction(all creates)
  else:
    return db.transaction.create({ data: validated })
```

### Testing

- Criação de transação simples
- Criação de transação parcelada (verificar N registros criados)
- Validação: tipo obrigatório, valor positivo, data obrigatória
- CRUD gate Visualizador

### Review Findings

**Patch (all fixed):**
- [x] [Review][Patch] Brazilian comma normalization: strip dots, replace comma [TransactionForm.tsx:102]
- [x] [Review][Patch] Error feedback added for type, date, totalInstallments [TransactionForm.tsx:97,126,147]
- [x] [Review][Patch] Category filter guarded against undefined type [TransactionForm.tsx:68]
- [x] [Review][Patch] Server schema: `totalInstallments` now `.int().min(1).max(48)` [schemas.ts:21]
- [x] [Review][Patch] totalInstallments=0 no longer silently erased [TransactionForm.tsx:146]
- [x] [Review][Patch] Installment badge guards against null [TransactionTable.tsx:40-44]
- [x] [Review][Patch] Value field uses `??` instead of `||` [TransactionForm.tsx:102]
- [x] [Review][Patch] Shared `createTransactionSchema` imported instead of local [TransactionForm.tsx:23,31,37]
- [x] [Review][Patch] Controlled Dialog with `key` pattern for stale defaults [TransactionForm.tsx:34-35,73,82]

**Defer (pre-existing, not introduced by this story):**
- [x] [Review][Defer] Month-end date overflow in installment splitting [api/transactions.ts:39] — `setMonth()` on Jan 31 → Mar 3. Use `date-fns addMonths()`.
- [x] [Review][Defer] `prisma.$transaction` may use different client instance than `userDb()` [api/transactions.ts:51] — use `db.$transaction()`.
- [x] [Review][Defer] Installment rounding error with fractional amounts [api/transactions.ts:35] — sum of N installments ≠ original amount.
- [x] [Review][Defer] Installment precision loss on small amounts with DECIMAL(10,2) [api/transactions.ts:35].
- [x] [Review][Defer] CSRF not implemented — pre-existing across all API routes.

## Dev Agent Record

### Agent Model Used

deepseek-v4-flash-free (opencode)

### Completion Notes List

- `useCreateTransaction` / `useDeleteTransaction` hooks — adicionado `.ok` check + error throw (padrão 2-1/2-2)
- API routes POST/DELETE `/api/transactions` — role check `VISUALIZADOR → 403` + try/catch com erro ZodError → 400, P2025 → 404
- `TransactionForm` — onSubmit com try/catch + toast.success/error; adicionado normalize vírgula-decimal pt-BR; esquema com validação de data obrigatória
- `TransactionTable` — nova coluna de parcelas: badge "X/N" ao lado da descrição; `showActions` prop para gated delete; tipo `TransactionType` com `installmentNumber`/`totalInstallments`
- `transactions.tsx` — gate Visualizador no botão "Nova Transação"; `showActions={!isVisualizador}` na tabela; `isError` state com mensagem de erro
- Build: passou sem novos erros

### File List

- `app/features/finance/hooks/useTransactions.ts` — UPDATE
- `app/routes/api/transactions/index.ts` — UPDATE
- `app/routes/api/transactions/$id.ts` — UPDATE
- `app/features/finance/components/TransactionForm.tsx` — UPDATE
- `app/features/finance/components/TransactionTable.tsx` — UPDATE
- `app/routes/transactions.tsx` — UPDATE