# Story 2.6: Gerenciar Orçamentos

Status: done

## Story

As um Titular,
I want definir orçamentos mensais por categoria,
So that eu possa controlar meus gastos e visualizar o progresso ao longo do mês.

**FRs covered:** FR-9

## Acceptance Criteria

1. **Listar orçamentos:** Exibe orçamentos em cards com nome da categoria, valor orçado, valor gasto e barra de progresso.
2. **Filtro por mês/ano:** Permite selecionar mês e ano para visualizar orçamentos.
3. **Criar/editar orçamento:** Diálogo com seleção de categoria (despesas), valor, mês e ano.
4. **Excluir orçamento:** Confirmação antes de excluir com toast de sucesso.
5. **Barra de progresso:** Visual com cores (verde < 80%, amarelo 80-100%, vermelho > 100%).
6. **Role gate:** Visualizador não vê botões de criar/editar/excluir.
7. **Toast feedback:** Sucesso/erro em todas as operações.

## Tasks / Subtasks

- [x] Prisma schema exists
- [x] Zod schemas exist
- [x] Basic API routes exist (no role check or error handling)
- [x] Basic hooks exist (no .ok checks)
- [x] Basic page exists (read-only cards)
- [ ] Update server API to include spent amounts
- [ ] Add role check + error handling to API routes
- [ ] Add .ok checks to hooks
- [ ] Rewrite page with full CRUD, progress bar, month filter

## Files to Modify

| File | Action | Why |
|---|---|---|
| `app/features/finance/api/budgets.ts` | UPDATE | Add spent amount aggregation |
| `app/routes/api/budgets/index.ts` | UPDATE | Role check + error handling |
| `app/routes/api/budgets/$id.ts` | UPDATE | Role check + error handling |
| `app/features/finance/hooks/useBudgets.ts` | UPDATE | .ok checks in mutations |
| `app/routes/budget.tsx` | REWRITE | Full CRUD with progress bar |
