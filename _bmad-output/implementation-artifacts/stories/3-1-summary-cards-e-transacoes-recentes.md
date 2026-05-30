# Story 3.1: Summary Cards e Transações Recentes

Status: done

## Story

As um usuário,
I want ver cards de resumo financeiro e minhas transações mais recentes na dashboard,
So that eu possa ter uma visão rápida da minha situação financeira do mês.

**FRs covered:** FR-4

## Acceptance Criteria

1. **Resumo do mês:** Cards exibem receitas, despesas, saldo e total investido.
2. **Filtro por mês corrente:** Receitas/despesas refletem apenas o mês atual.
3. **Transações recentes:** Lista as 10 transações mais recentes.
4. **Loading state:** Esqueletos/carregamento enquanto dados chegam.
5. **Empty state:** Mensagem quando não há transações no mês.

## Tasks / Subtasks

- [ ] Add date-filtered fetching to useDashboardData (current month)
- [ ] Add loading state to SummaryCards
- [ ] Add empty state to SummaryCards
- [ ] Add empty state to RecentTransactions
- [ ] Add loading state to RecentTransactions

## Files to Modify

| File | Action |
|---|---|
| `app/features/dashboard/hooks/useDashboardData.ts` | UPDATE |
| `app/features/dashboard/components/SummaryCards.tsx` | UPDATE |
| `app/features/dashboard/components/RecentTransactions.tsx` | UPDATE |
