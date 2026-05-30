# Story 4.4: Visualizar Carteira de Investimentos

Status: done

## Story

As um usuário,
I want visualizar a alocação da minha carteira de investimentos,
So that eu possa entender a distribuição por tipo de ativo e tomar decisões.

**FRs covered:** FR-12

## Acceptance Criteria

1. **Alocação por tipo:** Gráfico de pizza mostrando distribuição por tipo de ativo (ações, ETFs, FIIS, etc.).
2. **Breakdown por ativo:** Lista com percentual de cada ativo na carteira.
3. **Total da carteira:** Valor total investido no topo.
4. **Número de ativos:** Card com contagem de ativos na carteira.

## Tasks / Subtasks

- [x] Asset cards with position info (from 4-2)
- [x] Portfolio total invested (from 4-2)
- [ ] Add allocation pie chart by asset type
- [ ] Add breakdown list by asset
- [ ] Add diversification summary cards

## Files to Modify

| File | Action |
|---|---|
| `app/routes/investments.tsx` | UPDATE |
