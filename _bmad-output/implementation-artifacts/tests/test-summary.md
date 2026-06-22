# Test Automation Summary

## Generated Tests

### E2E Tests (Playwright) — Gestão Financeira

- [x] `app/e2e/transactions.spec.ts` — cria, edita e exclui uma transação de despesa; filtra transações por tipo
- [x] `app/e2e/categories.spec.ts` — cria, edita e exclui uma categoria de despesa
- [x] `app/e2e/budget.spec.ts` — cria, edita e exclui um orçamento
- [x] `app/e2e/utils/auth.ts` — helper de login (usuário seed `teste@teste.com`) e helper `selectByLabel` para Selects shadcn/Radix não vinculados via `htmlFor`

All 4 tests pass against the dev server with a seeded local Postgres DB (`npx tsx prisma/seed.ts`).

## Code changes made to support testing

- Added `aria-label` to icon-only Editar/Excluir buttons in `TransactionTable.tsx`, `categories.tsx`, and `budget.tsx` — these had no accessible name (icon-only `Pencil`/`Trash2`), making them unreachable for screen readers and for resilient test selectors.
- Installed `@playwright/test` as a devDependency — `playwright.config.ts` and the `test:e2e` script referenced it but it was never added to `package.json`.

## Coverage

- Transações: criar (despesa), editar, excluir, filtrar por tipo — covered. Receita/Transferência creation and parcelamento (cartão de crédito) not yet covered.
- Categorias: criar (despesa), editar, excluir — covered. Subcategorias and emoji/cor selection not covered.
- Orçamentos: criar, editar, excluir — covered.
- Not covered yet (out of this round's scope): autenticação (cadastro/login/logout), dashboard, cartões de crédito, investimentos, multiusuário, API route tests (Vitest).

## Next Steps

- Run `npm run test:e2e` in CI (currently no CI configured per `project-context.md`).
- Add API-level tests (Vitest) for `app/routes/api/transactions`, `/categories`, `/budgets` — status codes, validation, and the VISUALIZADOR 403 rule.
- Extend E2E coverage to auth flows and credit-card-installment transactions.
