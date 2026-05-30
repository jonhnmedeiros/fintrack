# Story 4.2: Gerenciar Ativos

Status: done

## Story

As um Titular,
I want gerenciar meus ativos de investimento (ações, ETFs, FIIS, etc.),
So that eu possa acompanhar minha carteira e registrar transações.

**FRs covered:** FR-10, FR-11

## Acceptance Criteria

1. **Listar ativos:** Grid de cards mostrando ticker, tipo, quantidade, preço médio, total investido e P&L.
2. **Criar ativo:** Dialog com formulário (ticker, nome, tipo, mercado).
3. **Excluir ativo:** Confirmação antes de excluir.
4. **Registrar transação:** Dialog para cada ativo (compra/venda/dividendo/taxa).
5. **Visualizar transações:** Tabela de transações por ativo.
6. **Excluir transação:** Confirmação antes de excluir.
7. **Role gate:** Visualizador não vê ações de criar/excluir.
8. **Toast feedback:** Sucesso/erro em todas as operações.

## Tasks

- [x] Prisma schema, Zod schemas, server API functions
- [x] React Query hooks (scaffolded)
- [ ] Create DELETE route for investment-transactions
- [ ] Fix API routes (role check, error handling)
- [ ] Fix hooks (.ok checks)
- [ ] Build investments page

## Files to Modify/Create

| File | Action |
|---|---|
| `app/routes/api/investment-transactions/$id.ts` | CREATE |
| `app/routes/api/assets/index.ts` | UPDATE |
| `app/routes/api/assets/$id.ts` | UPDATE |
| `app/routes/api/investment-transactions/index.ts` | UPDATE |
| `app/features/investments/hooks/useAssets.ts` | UPDATE |
| `app/features/investments/hooks/useInvestmentTransactions.ts` | UPDATE |
| `app/routes/investments.tsx` | CREATE |
