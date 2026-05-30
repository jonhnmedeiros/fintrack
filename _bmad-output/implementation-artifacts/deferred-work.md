# Deferred Work

## Deferred from: code review of 1-1-cadastro-de-usuario (2026-05-26)

- **TOCTOU race condition** — Concorrência no registro pode burlar unique check. Pre-existing pattern em todo o projeto (find-then-create). Requer refatoração global com upsert ou transação Prisma.
- **Zod sem try/catch na API** — `registerSchema.parse()` lança ZodError não tratado. Pre-existing pattern em todas as rotas API do projeto.
- **Schema Zod duplicado** — registerSchema definido no server e no client. Mesmo pattern do LoginForm. Divergência requer refatoração global (shared schemas).
- **Dynamic import** — `await import()` na route handler. Pre-existing pattern em todas as rotas API.
- **Hard redirect** — `window.location.href` ao invés de `router.navigate`. Mesmo pattern do LoginForm.
- **Sem rate limiting** — Pre-existing gap em todos os endpoints.
- **Sem CSRF** — Pre-existing pattern. Todas as rotas API não têm proteção CSRF.

## Deferred from: code review of 1-3-layout-fundacional-e-navegacao (2026-05-27)

- Rota `/investments` inexistente: sidebar e bottom tab linkam para `/investments` mas rota nunca foi criada (404)
- `as any` type safety: casts em auth.ts e useUserRole.ts ignoram type checking — padrão pre-existente
- CornerRadius global e gap 24px: não implementados — escopo grande para passada separada
- Rotas `/budget` e `/goals` órfãs: removidas da nav mas rotas ainda existem e funcionam
- Auth guard: Layout não redireciona não autenticados — pre-existente, fora do escopo desta story

## Deferred from: code review of 2-3-criar-transacoes-com-parcelamento (2026-05-27)

- **Month-end date overflow in installment splitting** — `setMonth()` on Jan 31 → Mar 3. Backend `api/transactions.ts:39` should use `date-fns addMonths()`.
- **`prisma.$transaction` may use different client instance** — `userDb()` vs imported `prisma` client. Use `db.$transaction()` for atomicity.
- **Installment rounding error** — Sum of N fractional installments ≠ original amount. Use cents integer math.
- **Installment precision loss** — DECIMAL column may truncate small installment values.
- **CSRF not implemented** — Pre-existing across all API routes.
