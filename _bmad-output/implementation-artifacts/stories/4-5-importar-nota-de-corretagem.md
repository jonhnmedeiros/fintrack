# Story 4.5: Importar Nota de Corretagem

Status: done

## Story

As um Titular,
I want importar um PDF de nota de corretagem,
So que as operações de compra/venda sejam registradas automaticamente.

**FRs covered:** FR-17

**UX-DRs:** UX-DR-5 (BrokerNoteUpload)

## Acceptance Criteria

1. **Dialog:** Botão "Importar Nota" na página de investimentos → abre dialog com dropzone para PDF.
2. **Upload + parse:** PDF selecionado → enviado ao servidor → texto extraído com `pdf-parse` → parser identifica corretora (BTG/Inter) e extrai operações.
3. **Preview:** Exibe lista de operações extraídas (ticker, COMPRA/VENDA, quantidade, preço) com data editável.
4. **Corretora não suportada:** Se formato não reconhecido, exibe mensagem "Não reconhecemos esse formato. Notas da BTG e Inter são suportadas."
5. **Confirmação:** Ao confirmar, assets são upserted e transações criadas; toast "X operações importadas com sucesso!"
6. **Role gate:** Visualizador não vê o botão de importar.

## Tasks / Subtasks

- [x] Instalar `pdf-parse` para extração de texto de PDFs
- [x] Criar parser de notas (detecta BTG/Inter, regex para operações)
- [x] Criar API route POST `/api/brokerage-notes/parse` (upload + parse)
- [x] Criar API route POST `/api/brokerage-notes/import` (confirma + cria transações)
- [x] Criar hooks `useParseBrokerNote` + `useImportBrokerNote`
- [x] Criar componente `BrokerNoteUpload` (dialog upload → preview → confirm)
- [x] Integrar na página de investimentos

## Files Created

| File | Purpose |
|---|---|
| `app/features/investments/api/brokerage-note.ts` | Server-side PDF parse + text parser (BTG/Inter) |
| `app/features/investments/hooks/useBrokerageNote.ts` | Client hooks for parse/import flow |
| `app/features/investments/components/BrokerNoteUpload.tsx` | Upload dialog with dropzone + preview + confirm |
| `app/routes/api/brokerage-notes/parse.ts` | POST endpoint: receive PDF, return parsed operations |
| `app/routes/api/brokerage-notes/import.ts` | POST endpoint: confirm and create investment transactions |

## Files Modified

| File | Change |
|---|---|
| `app/routes/investments.tsx` | Added "Importar Nota" button + BrokerNoteUpload dialog |
| `package.json` | Added `pdf-parse` dependency |
