---
project_name: 'FinTrack'
user_name: 'Jonathan'
date: '2026-05-30'
sections_completed:
  - technology_stack
  - language_rules
  - framework_rules
  - testing_rules
  - code_quality_rules
  - workflow_rules
  - critical_rules
status: 'complete'
rule_count: 42
optimized_for_llm: true
---

# Project Context for AI Agents

_Critical rules and patterns AI agents must follow when implementing code in this project._

---

## Technology Stack & Versions

| Camada | Tecnologia | Versão |
|---|---|---|
| Runtime | Node + TypeScript | v5.5.3 |
| Framework SSR | TanStack Start | v1.120.20 (pinned) |
| Router | TanStack Router | v1.120.20 (pinned) |
| UI | React + Tailwind CSS | v18 / v3.4.7 |
| UI Primitives | shadcn/ui (Radix) | — |
| ORM | Prisma + PostgreSQL | v7.8.0 |
| Auth | NextAuth v4 + bcryptjs | v4.24.14 |
| Server State | TanStack Query | v5 |
| Client State | Zustand | v4.5.4 |
| Charts | Recharts | v2.12.7 |
| Form | React Hook Form + Zod | v4.4.3 |
| Tables | TanStack Table | v8 |
| Email | Resend | v6.12.4 |
| PDF | pdf-parse | v2.4.5 (PDFParse class) |
| Tests | Vitest + Testing Library + MSW | v4.1.7 / v16 / v2 |
| E2E | Playwright | latest |

**Pinned versions** (package.json overrides): `@tanstack/react-router`, `@tanstack/router-plugin`, `@tanstack/router-devtools`, `@tanstack/start` — must stay at 1.120.20. Do not upgrade without explicit approval.

---

## Critical Implementation Rules

### Language-Specific Rules

- **TypeScript** `strict: true` in tsconfig.json.
- **Named exports only**: `export function ComponentName()`, never `export default`.
- **`@/` alias** for all app imports (e.g., `@/features/finance/hooks/useCategories`), never relative paths.
- **Async/await** over raw Promise chains.
- **No `any`** — prefer `unknown` + type narrowing. Existing implicit `any` in API route files (`request`, `params`) is a pre-existing pattern, do not propagate.
- **Zod v4** (`z.object`, `z.string()`, etc.) for validation — not Yup, not Joi.

### Framework-Specific Rules

**TanStack Start / Router:**
- File-based routing in `app/routes/` — pages as `.tsx`, API routes as `.ts` with `APIRoute` export.
- API route pattern: `export const APIRoute = { path: '...', methods: { GET: ..., POST: ..., DELETE: ... } }`.
- Route file pattern: `export const Route = createFileRoute('/path')({})` + `export const APIRoute = { ... }`.
- `app.config.ts` excludes `app/features/`, `app/lib/auth|db|tenant-db`, and `app/generated/prisma/` from client bundle — server-only functions cannot be imported in client components.
- Position calc inline (do not import `calcPL` from features — excluded from client bundle).

**React:**
- React 18 (no automatic JSX transform issues).
- Components use PascalCase (`TransactionTable.tsx`, `Sidebar.tsx`).
- Hooks use camelCase with `use` prefix (`useCategories.ts`).
- UI primitives (shadcn/ui) in `app/components/ui/` — kebab-case filenames (`button.tsx`, `dropdown-menu.tsx`).
- Feature components in `app/features/{feature}/components/`.
- TanStack Query hooks in `app/features/{feature}/hooks/`.
- `sonner` for toasts (Toaster in `__root.tsx`).
- `recharts` for charts (dashboard, profitability).

**NextAuth v4:**
- Credentials provider only. JWT sessions (no database sessions).
- Auth config in `app/lib/auth.ts` — `auth()` returns session with `{ user: { id, role, viewerOfId, email, name } }`.
- JWT callback in `auth.ts:49` fetches `role` and `viewerOfId` from DB on every call.
- Session type augmentation in `app/types/next-auth.d.ts` adds `role` and `viewerOfId` to `Session.user`.
- Auth handler (`app/lib/auth-handler.ts`) adapts NextAuth for TanStack Start — dispatches `handlers.GET` or `handlers.POST` based on `request.method`.
- Catch-all route at `app/routes/api/auth/$.tsx` delegates to `mockNextAuthHandler`.
- Register endpoint at `app/routes/api/register.ts` (NOT `/api/auth/register` — avoid catch-all conflict).

**Prisma + Multi-tenancy:**
- `app/lib/db.ts` — Prisma client singleton.
- `app/lib/tenant-db.ts` — `userDb` auto-injects `userId` on `.create()`. All queries filter by `userId`.
- `getEffectiveUserId(user)` returns `user.viewerOfId ?? user.id` — used in all 10 GET routes for Visualizador data sharing.
- Mutations check `user.role === 'VISUALIZADOR'` → return 403.
- Generated client at `app/generated/prisma/` — run `npx prisma generate` after schema changes.
- Unique constraints: `Category[userId, name, type]`, `Budget[userId, categoryId, month, year]`, `Asset[userId, ticker]`, `Invite[invitedById, email]`.

**API Routes (REST):**
- Sucesso: `Response.json(data)` (200 implícito).
- DELETE sucesso: `new Response(null, { status: 204 })`.
- Erro autenticação: `new Response('Unauthorized', { status: 401 })`.
- Erro validação: `new Response('mensagem', { status })` — texto plano, sem envelope JSON.
- Erro negócio (role): `Response.json({ error: 'Acesso negado' }, { status: 403 })`.
- Erro único (P2002): `Response.json({ error: 'Já existe...' }, { status: 409 })`.
- Erro não encontrado (P2025): `Response.json({ error: '...não encontrada' }, { status: 404 })`.
- Erro vínculo (P2003): `Response.json({ error: '...possui vínculos...' }, { status: 409 })`.

### Testing Rules

- **Vitest** with jsdom environment (`vitest.config.ts` configurado).
- **MSW v2** API: `http.get` / `http.post` / `http.delete`, `HttpResponse.json()` — NOT v1 `rest.get` / `ctx.json`.
- **RTL v16** wrapper pattern: function wrapper (not arrow-fn-returning-arrow-fn):
  ```tsx
  function wrapper({ children }: { children: React.ReactNode }) {
    return <TestQueryClientWrapper>{children}</TestQueryClientWrapper>
  }
  renderHook(() => useHook(), { wrapper })
  ```
- **TestQueryClientWrapper** from `test-utils.tsx` (retry: false).
- Tests co-localized in `__tests__/` next to the code they test.
- Use `waitFor` instead of deprecated `waitForNextUpdate`.
- Mock `next-auth/react` globally in `vitest.setup.ts`.

### Code Quality & Style Rules

- **Tailwind CSS v3** with `clsx` + `tailwind-merge` via `cn()` utility.
- shadcn/ui colors defined as CSS variables in `globals.css` (`--background`, `--popover`, etc.) and mapped in `tailwind.config.js`.
- Formatting: `Intl.DateTimeFormat('pt-BR')` for dates, `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` for currency — use `formatDate()` / `formatCurrency()` from `app/lib/utils.ts`.
- Portuguese (PT-BR) locale for all UI text.
- Components use `asChild` pattern from Radix when wrapping triggers.
- `cn(importedClass, className)` pattern for component className merging.

### Development Workflow Rules

- Environment via `.env` (no `.env.local`).
- Scripts: `npm run dev` (vinxi), `npm run build`, `npm run start`, `npm test`, `npm run test:e2e`.
- Prisma: `npx prisma migrate dev` after schema changes, then `npx prisma generate`.
- Seed: `npx prisma db seed` — test user `teste@teste.com` / `123456` (role TITULAR).
- No CI/CD configured yet (ESLint v9 broken — no config).
- No CSRF, rate limiting, or TOCTOU protection (pre-existing infra gaps — document but do not add without request).

### Critical Don't-Miss Rules

- **Prisma client must be regenerated** (`npx prisma generate`) after every schema change — stale generated client causes runtime errors.
- **Server-only imports**: Do not import from `app/features/`, `app/lib/auth`, `app/lib/db`, `app/lib/tenant-db`, `app/generated/prisma/` in client components — they are excluded from the client bundle via `app.config.ts`.
- **Auth route order**: `/api/auth/$` catch-all matches BEFORE `/api/auth/register`. Register endpoint moved to `/api/register`. New auth-adjacent endpoints MUST be outside `/api/auth/` path.
- **Visualizador role**: All mutations must return 403 for `role === 'VISUALIZADOR'`. GET routes use `getEffectiveUserId(user)` to read from the TITULAR's data.
- **PDF parsing**: `pdf-parse` v2 uses `PDFParse` class with `{ data: buffer }` input — NOT v1 `pdf()` function.
- **Seed data**: Deleting/recreating the seed user will cascade-delete all their data (transactions, categories, budgets, etc.).
- **`close()` on connection**: Do NOT call `prisma.$disconnect()` in route handlers or hooks — connection lifecycle is managed by the singleton in `db.ts`.

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code in this project
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns or rules emerge

**For Humans:**
- Keep this file lean and focused on what AI agents need to know
- Update when technology stack or patterns change
- Review quarterly to remove rules that become obvious over time

Last Updated: 2026-05-30
