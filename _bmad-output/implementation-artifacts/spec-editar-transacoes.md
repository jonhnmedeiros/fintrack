---
title: 'Editar Transações'
type: 'feature'
created: '2026-05-31'
baseline_commit: '5c5e1043048b369cfc756707aa4b0ac8f127b861'
status: 'in-review'
context:
  - '_bmad-output/project-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Transactions can be created and deleted but there is no way to edit them. Users must delete and recreate to correct mistakes.

**Approach:** Add a pencil icon to each transaction row in the table. Clicking it opens the existing `TransactionForm` dialog pre-filled with the transaction data, then submits a PUT request to update it.

## Boundaries & Constraints

**Always:**
- Reuse `TransactionForm` dialog for both create and edit — minimize code duplication
- Pre-fill ALL form fields from the existing transaction when editing
- PUT semantics (send all fields, not partial update)
- Follow existing patterns: 401/403 checks, `userDb().transaction.update()`, `queryClient.invalidateQueries`
- Edit only affects the single transaction record — no installment rebuilding
- Pencil icon next to the existing delete (trash) icon in the actions column

**Ask First:**
- Editing transaction `type` (INCOME ↔ EXPENSE) — may affect downstream logic
- Editing a transaction that is part of an installment series (changing `totalInstallments` or `creditCardId` on a single installment)

**Never:**
- Do NOT rebuild installment series on edit — edit the individual record only
- Do NOT change the delete flow
- Do NOT add new dependencies or UI primitives

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Edit all fields | User changes description, amount, date, category, and saves | Transaction record updated with new values; list re-fetches; dialog closes | API returns 400/500 → toast error |
| Cancel edit | User clicks pencil, then closes dialog without saving | No changes made; dialog closes | N/A |
| VISUALIZADOR role | User is Visualizador | Pencil icon hidden (same as delete/actions) | N/A |
| Transaction not found | Another user deletes the tx between open and save | API returns 404 | Toast "Transação não encontrada" |

</frozen-after-approval>

## Code Map

- `app/features/finance/schemas.ts` — `updateTransactionSchema` (same shape as create, no id/userId)
- `app/features/finance/api/transactions.ts` — `updateTransaction(userId, id, data)` business logic
- `app/routes/api/transactions/$id.ts` — `PUT` method handler
- `app/features/finance/hooks/useTransactions.ts` — `useUpdateTransaction()` mutation
- `app/features/finance/components/TransactionForm.tsx` — refactor to accept optional `editTx` prop for edit pre-fill
- `app/features/finance/components/TransactionTable.tsx` — add `onEdit` callback prop + pencil icon
- `app/routes/transactions.tsx` — wire `editTx` state: table `onEdit` → TransactionForm `editTx`

## Tasks & Acceptance

**Execution:**
- [x] `schemas.ts` — add `updateTransactionSchema` (omit id, userId; same shape as create)
- [x] `api/transactions.ts` — add `updateTransaction(userId, id, data)` using `db.transaction.update()`
- [x] `api/transactions/$id.ts` — add `PUT` handler with auth/role checks (same pattern as DELETE)
- [x] `hooks/useTransactions.ts` — add `useUpdateTransaction()` mutation, invalidates `['transactions']`
- [x] `TransactionTable.tsx` — add `onEdit` prop + pencil icon in actions column (before trash)
- [x] `TransactionForm.tsx` — refactor: accept optional `editTx` prop; when set, pre-fill form, hide trigger button, use update mutation on submit; when dialog closes, call `onEditDone()`
- [x] `transactions.tsx` — add `editTx` state; pass `onEdit` to table and `editTx` to form

**Acceptance Criteria:**
- Given any transaction row, when clicking the pencil icon, the edit dialog opens with all fields pre-filled
- Given the edit dialog, when saving with modified fields, the transaction is updated and the list re-fetches
- Given the edit dialog, when closing without saving, no changes are made
- Given a VISUALIZADOR user, when viewing transactions, the pencil icon is hidden
- Given the build, when running `npm run build`, it completes without errors

## Verification

**Commands:**
- `npm run build` — expected: builds without errors

## Suggested Review Order

**API handler + validation**

- Schema extends existing `transactionSchema` — same shape as create, no id/userId
  [`schemas.ts:45`](../../app/features/finance/schemas.ts#L45)

- PUT handler follows same 401/403/P2025 pattern as DELETE; delegates to `updateTransaction`
  [`$id.ts:7`](../../app/routes/api/transactions/$id.ts#L7)

- Business logic uses `userDb().transaction.update()` — auto-injects userId into data
  [`transactions.ts:73`](../../app/features/finance/api/transactions.ts#L73)

**Mutation hook**

- TanStack Query mutation invalidates `['transactions']` on success, matching create/delete pattern
  [`useTransactions.ts:48`](../../app/features/finance/hooks/useTransactions.ts#L48)

**Form component (edit mode)**

- `editTx` prop triggers `useEffect` pre-fill: opens dialog, resets form fields with existing values
  [`TransactionForm.tsx:128`](../../app/features/finance/components/TransactionForm.tsx#L128)

- Submit branches on `isEditing` — calls `updateMutation` with `{ id, data }` via PUT
  [`TransactionForm.tsx:207`](../../app/features/finance/components/TransactionForm.tsx#L207)

- Dialog open/close managed correctly: `setOpen(false)` on edit dismiss, `prevEditId` clears for re-open
  [`TransactionForm.tsx:243`](../../app/features/finance/components/TransactionForm.tsx#L243)

**Table + page wiring**

- Pencil icon in actions column passes full `TransactionType` (including `categoryId`, `creditCardId`) via `onEdit` callback
  [`TransactionTable.tsx:85`](../../app/features/finance/components/TransactionTable.tsx#L85)

- Page manages `editTx` state: table `onEdit=setEditTx`, form receives `editTx` + `onEditDone` clears it
  [`transactions.tsx:27`](../../app/routes/transactions.tsx#L27)
