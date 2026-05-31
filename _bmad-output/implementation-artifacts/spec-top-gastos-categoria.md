---
title: 'Top Gastos por Categoria na Dashboard'
type: 'feature'
created: '2026-05-31'
baseline_commit: '29788a206ff94aca7ad2eca568b7ec602c62aa1a'
status: 'done'
context:
  - '_bmad-output/project-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The dashboard shows a pie chart of expenses by category but no ranked list of the top spending categories. Users can't quickly see which categories consume the most budget this month.

**Approach:** Add a new `TopExpensesByCategory` component below the chart grid. It uses the existing `currentMonthTransactions` data, filters expenses, groups by category with subcategory hierarchy, and renders a ranked list with amounts and percentages.

## Boundaries & Constraints

**Always:**
- Use existing `currentMonthTransactions` data — no new API calls or hooks
- Group expenses by category; show subcategories indented under their parent
- Show top 5 categories by total amount
- Display amount in R$ and percentage of total expenses
- Use shadcn `Card`, `CardHeader`, `CardTitle`, `CardContent` pattern
- Follow existing component pattern: accept `transactions` + `isLoading` props
- Show skeleton when loading, empty state when no data

**Ask First:**
- Placement: below chart grid vs inside `ExpenseByCategoryChart`

**Never:**
- Do NOT add new API routes or hooks
- Do NOT change existing chart components
- Do NOT add new dependencies

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Month with expenses | Current month has expense transactions | Top 5 categories ranked by total, with subcategories indented | N/A |
| No expenses this month | No expense transactions in current month | Empty state: "Nenhuma despesa neste mês" | N/A |
| Loading state | Transactions query still pending | Skeleton placeholder matching card height | N/A |
| Categories without subcategories | All expenses are top-level categories | Flat list of top 5 categories | N/A |
| Many subcategories | Parent category has many subcategories | Parent total shown, subcategories listed indented | N/A |

</frozen-after-approval>

## Code Map

- `app/features/dashboard/components/TopExpensesByCategory.tsx` — new component: ranked list of top 5 expense categories with subcategory hierarchy
- `app/routes/index.tsx` — import and place component below chart grid

## Tasks & Acceptance

**Execution:**
- [x] `TopExpensesByCategory.tsx` — create component: filter expenses, group by category, show top 5 with subcategories, amounts in R$, percentage of total
- [x] `index.tsx` — import and render `TopExpensesByCategory` below chart grid, pass `currentMonthTransactions` data

**Acceptance Criteria:**
- Given current month expenses, when viewing the dashboard, a ranked list shows the top 5 expense categories with R$ amounts and percentages
- Given a category with subcategories, when viewing the list, subcategories appear indented under their parent
- Given no expenses this month, when viewing the dashboard, an empty state message is shown
- Given the build, when running `npm run build`, it completes without errors

## Verification

**Commands:**
- `npm run build` — expected: builds without errors

## Suggested Review Order

**Component — expense grouping logic**

- Filter expenses, group by category ID, build parent-child tree with totals
  [`TopExpensesByCategory.tsx:28`](../../app/features/dashboard/components/TopExpensesByCategory.tsx#L28)

- Top 5 parents sorted by `totalWithChildren`, subcategories sorted by individual total
  [`TopExpensesByCategory.tsx:43`](../../app/features/dashboard/components/TopExpensesByCategory.tsx#L43)

**Component — UI rendering**

- Ranked list with number badge, category name, R$ amount, and percentage
  [`TopExpensesByCategory.tsx:55`](../../app/features/dashboard/components/TopExpensesByCategory.tsx#L55)

- Subcategories indented under parent with `ml-7`, same amount + percentage format
  [`TopExpensesByCategory.tsx:73`](../../app/features/dashboard/components/TopExpensesByCategory.tsx#L73)

**Page wiring**

- Component placed below chart grid, uses existing `currentMonthTransactions` data
  [`index.tsx:55`](../../app/routes/index.tsx#L55)
