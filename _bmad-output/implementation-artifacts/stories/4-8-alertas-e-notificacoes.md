# Story 4.8: Alertas e Notificações

Status: done

## Story

As um Titular,
I want criar alertas de preço para meus ativos,
So that eu seja notificado quando atingirem determinados valores.

**FRs covered:** FR-15

## Acceptance Criteria

1. **Criar alerta:** Diálogo com seleção de ativo, tipo (preço/volume/dividendo/outro) e valor alvo.
2. **Listar alertas:** Exibe alertas ativos por ativo.
3. **Excluir alerta:** Confirmação para desativar alerta.
4. **Role gate:** Visualizador não vê ações de criar/excluir.
5. **Toast feedback:** Sucesso/erro em todas as operações.

## Tasks / Subtasks

- [x] Prisma schema, Zod schemas, server API
- [x] API routes (missing role check + error handling)
- [x] Hooks (missing .ok checks)
- [x] Add alerts dialog to investments page

## Files to Modify

| File | Action |
|---|---|
| `app/routes/api/alerts/index.ts` | UPDATE |
| `app/routes/api/alerts/$id.ts` | UPDATE |
| `app/features/investments/hooks/useAlerts.ts` | UPDATE |
| `app/routes/investments.tsx` | UPDATE |
