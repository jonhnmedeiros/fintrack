# Story 3.2: Gráficos da Dashboard

Status: done

## Story

As um usuário,
I want visualizar gráficos de fluxo de caixa e gastos por categoria na dashboard,
So that eu possa identificar tendências e onde estou gastando mais.

**FRs covered:** FR-5, FR-6

## Acceptance Criteria

1. **Fluxo de caixa:** Gráfico de área mostrando receitas vs despesas dos últimos 6 meses.
2. **Gastos por categoria:** Gráfico de pizza mostrando despesas do mês corrente agrupadas por categoria.
3. **Meses ordenados:** Eixo X do fluxo de caixa ordenado cronologicamente.
4. **Empty state:** Gráfico mostra mensagem quando não há dados no período.

## Tasks / Subtasks

- [ ] Sort months chronologically in CashFlowChart
- [ ] Add date filtering for current month in ExpenseByCategoryChart
- [ ] Add loading state per chart
- [ ] Add empty state per chart

## Files to Modify

| File | Action |
|---|---|
| `app/features/dashboard/hooks/useDashboardData.ts` | UPDATE |
| `app/features/dashboard/components/CashFlowChart.tsx` | UPDATE |
| `app/features/dashboard/components/ExpenseByCategoryChart.tsx` | UPDATE |
