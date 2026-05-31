---
title: 'shadcn/ui Audit and Fixes'
type: 'refactor'
created: '2026-05-31'
status: 'done'
baseline_commit: 'b0322764fe49e9fa74080573f64c264c78fd917b'
context:
  - '_bmad-output/project-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The recent chart migration to shadcn/ui Chart broke tooltip labels (ProfitChart, Allocation Donut) and the ExpenseByCategoryChart legend overflows with many categories. Additionally, several raw HTML elements across the app (`<button>`, `<input>`, `<label>`, bare `<div>` cards) bypass shadcn/ui components, creating visual inconsistency.

**Approach:** Fix the chart tooltip formatters to preserve labels with R$-formatted values, make the pie legend wrap correctly, then audit every file for raw HTML and replace with shadcn/ui equivalents (Button, Input, Label, Card, CardTitle/CardHeader).

## Boundaries & Constraints

**Always:**
- Every user-facing HTML element must use the shadcn/ui version where one exists
- Chart tooltips must show BOTH the category label AND the R$-formatted value
- Legend must not overflow or clip — wrap or truncate gracefully
- Use shadcn `className` props for fine-tuning (no duplicate inline styles)

**Ask First:**
- Removing a custom component in favor of shadcn (not covered here — all replacements are 1:1)
- Changing layout structure beyond component swap

**Never:**
- Do not add new shadcn components via CLI (only use what's already installed)
- Do not change business logic or data flow
- Do not replace page-level `<h1>` headings — they are semantic, not UI components

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Pie chart with 10+ categories | Many expense categories exist | Legend wraps to multiple rows without overflow or clipping | N/A |
| ProfitChart tooltip hover | User hovers a data point | Tooltip shows "Custo: R$ 1.234,00" and "Mercado: R$ 1.567,00" | N/A |
| Allocation Donut tooltip hover | User hovers a slice | Tooltip shows "Ações: R$ 5.000,00" instead of raw number | N/A |

</frozen-after-approval>

## Code Map

- `app/features/dashboard/components/ExpenseByCategoryChart.tsx` — PieChart with wrapping legend
- `app/features/investments/components/ProfitChart.tsx` — AreaChart tooltip formatter loses label
- `app/routes/investments.tsx` — Allocation Donut tooltip formatter loses label
- `app/features/finance/components/TransactionForm.tsx` — 3 raw `<button>` elements
- `app/routes/categories.tsx` — 3 raw `<button>`, 4 bare `<div>` card-like items
- `app/features/investments/components/BrokerNoteUpload.tsx` — raw `<input>`, raw `<label>`
- `app/routes/investments.tsx` — `<h3>` inside Card (Alocação, Distribuição)
- `app/features/investments/components/ProfitChart.tsx` — `<h3>` inside Card (Rentabilidade)

## Tasks & Acceptance

**Execution:**
- [x] `ExpenseByCategoryChart.tsx` — Add `flex-wrap` to `ChartLegendContent` className, ensure legend doesn't overflow
- [x] `ProfitChart.tsx` — Fix `ChartTooltipContent` formatter to render full row (label + R$ value), not just value
- [x] `investments.tsx` — Fix Allocation Donut `ChartTooltipContent` formatter to render full row (type label + R$ value)
- [x] `TransactionForm.tsx` — Replace 3 raw `<button>` (emoji tabs, emoji grid, color picker) with shadcn `Button variant="ghost"`
- [x] `categories.tsx` — Replace 3 raw `<button>` (emoji tabs, emoji grid, color picker) with shadcn `Button variant="ghost"`
- [x] `BrokerNoteUpload.tsx` — Replace raw `<input type="date">` and `<label>` with shadcn `Input` and `Label`
- [x] `investments.tsx` — Replace `<h3>` within Cards with `CardTitle` + `CardHeader` (Alocação, Distribuição sections)
- [x] `ProfitChart.tsx` — Replace `<h3>` within Card with `CardTitle` + `CardHeader`

**Acceptance Criteria:**
- Given any chart with tooltip, when hovering a data point, the tooltip shows both the series label and the R$-formatted value
- Given the expense pie chart with many categories, when rendered, the legend wraps to multiple rows without clipping
- Given any page with form elements, when inspected, every `<button>`, `<input>`, and `<label>` uses the shadcn/ui equivalent
- Given the investments and categories pages, when inspected, card-like sections use shadcn `Card` / `CardTitle` / `CardHeader`
- Given the build, when running `npm run build`, it completes without errors

## Verification

**Commands:**
- `npm run build` — expected: builds without errors
- `npm run dev` — expected: dev server starts, pages render without console errors

## Suggested Review Order

**Chart tooltip labels (ProfitChart)**

- Formatter now renders full row (label + R$ formatted value) instead of bare number, matching ExpenseByCategoryChart convention
  [`ProfitChart.tsx:112`](../../app/features/investments/components/ProfitChart.tsx#L112)

- Allocation Donut formatter uses TYPE_LABELS map to show "Ações: R$ 5.000,00" instead of raw number
  [`investments.tsx:558`](../../app/routes/investments.tsx#L558)

**Legend overflow fix**

- Added `flex-wrap justify-start gap-2` to ChartLegendContent so pie labels wrap to multiple rows
  [`ExpenseByCategoryChart.tsx:58`](../../app/features/dashboard/components/ExpenseByCategoryChart.tsx#L58)

**Raw `<button>` → `Button` (emoji picker, color picker)**

- Emoji tab buttons use `variant="ghost" size="sm"`, emoji grid uses `variant="ghost" size="icon"`
  [`TransactionForm.tsx:66`](../../app/features/finance/components/TransactionForm.tsx#L66)

- Color circle buttons use `variant="ghost" size="icon"` with `p-0` for zero-padding circles
  [`TransactionForm.tsx:364`](../../app/features/finance/components/TransactionForm.tsx#L364)

- Emoji tab and grid buttons replaced identically to TransactionForm.tsx pattern
  [`categories.tsx:97`](../../app/routes/categories.tsx#L97)

- Color circle buttons in category form dialog
  [`categories.tsx:222`](../../app/routes/categories.tsx#L222)

**Raw `<input>`/`<label>` → `Input`/`Label`**

- Date input uses shadcn Input (inherits full border/height/padding defaults), label uses Label component
  [`BrokerNoteUpload.tsx:111`](../../app/features/investments/components/BrokerNoteUpload.tsx#L111)

**Bare `<h3>` inside Card → `CardTitle` + `CardHeader`**

- "Rentabilidade" card gets CardHeader + CardContent structure, tooltip gap preserved
  [`ProfitChart.tsx:65`](../../app/features/investments/components/ProfitChart.tsx#L65)

- "Alocação por Tipo" and "Distribuição por Ativo" cards use CardHeader + CardTitle with consistent padding
  [`investments.tsx:541`](../../app/routes/investments.tsx#L541)
