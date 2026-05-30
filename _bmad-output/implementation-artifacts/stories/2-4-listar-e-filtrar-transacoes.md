# Story 2.4: Listar e Filtrar Transações

Status: ready-for-dev

## Story

As um Titular,
I want visualizar minhas transações em uma lista com filtros,
So that eu possa encontrar rapidamente transações específicas por tipo, categoria e período.

**FRs covered:** FR-7

## Acceptance Criteria

1. **Filtro padrão por mês corrente:** Ao entrar na página, o filtro de mês já vem preenchido com o mês atual.
2. **Barra de resumo:** Exibe totais de receitas, despesas e saldo do período filtrado.
3. **Categoria respeita tipo:** Filtro de categoria só mostra categorias compatíveis com o tipo selecionado.
4. **Estado vazio:** Quando não há transações no período, exibe mensagem "Nenhuma transação encontrada".
5. **Valores coloridos:** Despesas em vermelho, receitas em verde.

## Tasks / Subtasks

- [ ] Default month filter to current month (AC: #1)
- [ ] Add summary bar with income/expense/balance totals (AC: #2)
- [ ] Filter categories by selected type (AC: #3)
- [ ] Add empty state (AC: #4)

## Dev Notes

### Relevant Architecture Patterns

- Página `/transactions` já existe com `TransactionTable` e `TransactionForm`
- `useTransactions(filters)` hook já aceita `type`, `categoryId`, `startDate`, `endDate`
- `useCategories()` retorna todas as categorias com `type` (INCOME/EXPENSE)
- Transações vêm com `type` e `amount` para cálculo de resumo

### Previous Story Intelligence (2-3)

- `TransactionForm` agora importa `createTransactionSchema` compartilhado
- `.ok` check nos hooks de criação/exclusão
- Role check e error handling nas API routes
- `showActions` prop no TransactionTable

### Files to Create/Modify

| File | Action | Why |
|---|---|---|
| `app/routes/transactions.tsx` | UPDATE | Default month filter, summary bar, category type filter, empty state |

## Dev Agent Record

### Agent Model Used

deepseek-v4-flash-free (opencode)

### Completion Notes List



### File List



