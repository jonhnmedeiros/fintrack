# Story 4.7: Exportar Dados

Status: done

## Story

As um Titular,
I want exportar os dados da minha carteira,
So que eu possa levar os dados para outra corretora ou planilha.

**FRs covered:** FR-18

## Acceptance Criteria

1. **Botão Exportar:** Na página de investimentos, menu suspenso com opções CSV e JSON.
2. **CSV:** Arquivo com colunas: ticker, nome, tipo, mercado, data, operação, quantidade, preço, taxas.
3. **JSON:** Objeto aninhado com ativos e transações.
4. **Download:** Inicia automaticamente ao selecionar formato.

## Tasks / Subtasks

- [x] Criar API route GET `/api/investments/export?format=csv|json`
- [x] Adicionar botão Exportar com dropdown CSV/JSON
- [x] Handler de download via Blob + click

## Files Created

| File | Purpose |
|---|---|
| `app/routes/api/investments/export.ts` | API route: gera CSV ou JSON com dados da carteira |

## Files Modified

| File | Change |
|---|---|
| `app/routes/investments.tsx` | Added export button with DropdownMenu (CSV/JSON) |
