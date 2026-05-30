# Story 4.6: Gráfico de Rentabilidade

Status: done

## Story

As um Titular,
I want ver um gráfico comparando valor investido vs valor de mercado ao longo do tempo,
So que eu veja claramente se estou ganhando ou perdendo dinheiro.

**FRs covered:** FR-5

## Acceptance Criteria

1. **Gráfico:** AreaChart (Recharts) com duas curvas: custo (azul) e valor de mercado (verde).
2. **Summary:** Exibe ganho/perda atual em R$ e % no topo do card.
3. **Empty state:** "Adicione investimentos para ver o gráfico de rentabilidade" quando sem dados.
4. **Loading:** Spinner animado enquanto carrega.

## Tasks / Subtasks

- [x] Criar API route GET `/api/investments/profitability` (cálculo server-side)
- [x] Criar hook `useProfitability`
- [x] Criar componente `ProfitChart` com AreaChart
- [x] Adicionar ProfitChart na página de investimentos

## Files Created

| File | Purpose |
|---|---|
| `app/routes/api/investments/profitability.ts` | Server API: calcula custo vs valor de mercado por mês |
| `app/features/investments/hooks/useProfitability.ts` | Client hook |
| `app/features/investments/components/ProfitChart.tsx` | Recharts AreaChart component |

## Files Modified

| File | Change |
|---|---|
| `app/routes/investments.tsx` | Added ProfitChart after allocation section |
