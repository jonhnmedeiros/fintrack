# Story 5.2: Compartilhar Dados com Visualizador

Status: done

## Story

As um Visualizador,
I want ver os dados financeiros do Titular que me convidou,
So que eu possa acompanhar as finanças sem precisar criar meus próprios registros.

**FRs covered:** FR-22

## Acceptance Criteria

1. **GET routes:** Todas as rotas de leitura resolvem o `effectiveUserId` via `viewerOfId` para Visualizadores.
2. **userDb:** As queries escopadas por `userId` usam o ID do Titular quando o usuário é Visualizador.
3. **Direct Prisma queries:** Rotas com queries diretas (`export.ts`, `profitability.ts`) também resolvem o userId correto.
4. **403 gate:** Mutations continuam bloqueadas para Visualizador.
5. **Zero DB overhead:** Resolução usa `session.user.viewerOfId` já presente no JWT — sem consulta extra.

## Tasks

- [x] Adicionar `getEffectiveUserId(user)` helper em `tenant-db.ts`
- [x] Atualizar 8 routes com `userDb`: transactions, categories, credit-cards, budgets, assets, investment-transactions, notifications, alerts
- [x] Atualizar `investments/export.ts` e `investments/profitability.ts` (queries Prisma diretas)

## Files Modified

| File | Change |
|---|---|
| `app/lib/tenant-db.ts` | `getEffectiveUserId()` helper + deprecate `viewerDb()` |
| `app/routes/api/transactions/index.ts` | GET: `getEffectiveUserId(session.user)` |
| `app/routes/api/categories/index.ts` | GET: `getEffectiveUserId(session.user)` |
| `app/routes/api/credit-cards/index.ts` | GET: `getEffectiveUserId(session.user)` |
| `app/routes/api/budgets/index.ts` | GET: `getEffectiveUserId(session.user)` |
| `app/routes/api/assets/index.ts` | GET: `getEffectiveUserId(session.user)` |
| `app/routes/api/investment-transactions/index.ts` | GET: `getEffectiveUserId(session.user)` |
| `app/routes/api/notifications/index.ts` | GET: `getEffectiveUserId(session.user)` |
| `app/routes/api/alerts/index.ts` | GET: `getEffectiveUserId(session.user)` |
| `app/routes/api/investments/export.ts` | `userId: effectiveUserId` |
| `app/routes/api/investments/profitability.ts` | `userId: effectiveUserId` |
