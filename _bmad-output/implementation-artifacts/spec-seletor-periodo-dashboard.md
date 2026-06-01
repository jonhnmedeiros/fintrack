---
title: 'Seletor de Período na Dashboard'
type: 'feature'
created: '2026-05-31'
baseline_commit: 'd1e797ed8908b4335cae3cb3b131087ece65a7b6'
status: 'done'
context:
  - '_bmad-output/project-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The dashboard always shows the current month's data. Users cannot view a different date range or compare periods.

**Approach:** Add a date period selector at the top of the dashboard. Default to current month. Support presets ("Este mês", "Últimos 3 meses", "Últimos 6 meses", "Todo o período") and a custom range via shadcn/ui `Calendar` popover with `react-day-picker`. All dashboard components (summary cards, charts, top expenses, recent transactions) update to the selected range.

## Boundaries & Constraints

**Always:**
- Install `react-day-picker` and shadcn Calendar component
- Default to current month on first load
- Presets: "Este mês", "Últimos 3 meses", "Últimos 6 meses", "Todo o período"
- Custom range: Calendar popover with start/end date selection
- All dashboard components must respond to the selected range
- Use `date-fns` (already installed) for date calculations
- `queryKey` must include the date range for automatic cache invalidation
- PT-BR locale for all date labels

**Ask First:**
- "Todo o período" — use the user's first transaction date as start, or a fixed date (e.g., 2020-01-01)?

**Never:**
- Do NOT change existing API routes — reuse `/api/transactions?startDate=&endDate=`
- Do NOT add new API endpoints
- Do NOT break existing component props interfaces

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Default load | User opens dashboard | Current month data shown, "Este mês" selected | N/A |
| Preset selection | User clicks "Últimos 6 meses" | All components refetch with 6-month range | N/A |
| Custom range | User selects start + end dates via Calendar | All components refetch with custom range | N/A |
| No transactions in range | Selected period has no data | Empty states shown in all components | N/A |
| End date before start | User selects end before start in custom | Swap dates automatically | N/A |

</frozen-after-approval>

## Code Map

- `app/components/ui/calendar.tsx` — new shadcn Calendar component (via CLI or manual)
- `app/features/dashboard/components/PeriodSelector.tsx` — new component: presets + custom calendar popover
- `app/features/dashboard/hooks/useDashboardData.ts` — accept optional date range parameter
- `app/routes/index.tsx` — add period state, wire selector to hook and all components

## Tasks & Acceptance

**Execution:**
- [x] Install `react-day-picker` dependency
- [x] `calendar.tsx` — add shadcn Calendar component
- [x] `PeriodSelector.tsx` — create component with presets dropdown + custom calendar popover for start/end dates
- [x] `useDashboardData.ts` — accept optional `{ startDate, endDate }` parameter, use in query keys and API URLs
- [x] `index.tsx` — add period state, render PeriodSelector, pass range to useDashboardData

**Acceptance Criteria:**
- Given the dashboard page, when first loaded, current month data is shown with "Este mês" selected
- Given the period selector, when selecting a preset, all components refetch and display data for that range
- Given the period selector, when selecting custom dates, all components refetch with the custom range
- Given the build, when running `npm run build`, it completes without errors

## Verification

**Commands:**
- `npm run build` — expected: builds without errors

## Suggested Review Order

**Calendar component**

- shadcn Calendar wrapper around react-day-picker with ptBR locale and Tailwind styling
  [`calendar.tsx:1`](../../app/components/ui/calendar.tsx#L1)

**Period selector UI**

- Presets compute date ranges using date-fns; custom range uses Calendar popover in range mode
  [`PeriodSelector.tsx:28`](../../app/features/dashboard/components/PeriodSelector.tsx#L28)

- Active preset detection by comparing current range values; auto-swap if end < start
  [`PeriodSelector.tsx:52`](../../app/features/dashboard/components/PeriodSelector.tsx#L52)

**Data hook**

- Accepts optional dateRange parameter; falls back to current month; queryKey includes range
  [`useDashboardData.ts:9`](../../app/features/dashboard/hooks/useDashboardData.ts#L9)

**Page wiring**

- Period state initialized to current month; PeriodSelector onChange updates all components via hook
  [`index.tsx:17`](../../app/routes/index.tsx#L17)
