# Story 2.5: Excluir Transação

Status: done

## Story

As um Titular,
I want excluir uma transação da lista,
So that eu possa remover lançamentos incorretos ou desnecessários.

**FRs covered:** FR-8

## Acceptance Criteria

1. **Botão de excluir na tabela:** Cada linha da tabela exibe um botão de excluir para Titular.
2. **Confirmação:** Ao clicar em excluir, exibe diálogo "Tem certeza?" antes de prosseguir.
3. **Toast de sucesso:** Transação removida da lista com toast de sucesso.
4. **Toast de erro:** Se falhar, exibe toast de erro.
5. **Visualizador bloqueado:** Visualizador não vê botão de excluir.

## Tasks / Subtasks

- [x] API DELETE route exists (`api/transactions/$id.ts`)
- [x] `useDeleteTransaction` hook exists
- [x] `showActions` prop on TransactionTable
- [ ] Add confirmation dialog before delete (AlertDialog)
- [ ] Add toast feedback on success/error

## Dev Notes

Delete mechanism already implemented as part of 2-3. Missing confirmation dialog and toasts.

## Files to Modify

| File | Action | Why |
|---|---|---|
| `app/features/finance/components/TransactionTable.tsx` | UPDATE | Add confirmation dialog + toast |
