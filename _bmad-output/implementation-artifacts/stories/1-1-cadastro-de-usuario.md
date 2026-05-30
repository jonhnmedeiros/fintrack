# Story 1.1: Cadastro de Usuário

Status: in-progress

## Story

As a visitante,
I want criar uma conta com email e senha,
So that eu possa acessar o sistema como Titular.

**FRs covered:** FR-19, FR-22 (parcial — schema role)

## Acceptance Criteria

1. Visitante acessa `/register`, vê formulário com email + senha
2. Email válido + senha ≥ 6 caracteres → conta criada, hash bcrypt, papel `Titular`
3. Após criar conta: usuário autenticado automaticamente (JWT) e redirecionado a `/`
4. Email já existente → erro amigável "Este email já está em uso" (422)
5. Senha < 6 caracteres → validação inline: "Mínimo 6 caracteres"
6. Email inválido → validação inline: "Email inválido"
7. Role column adicionada ao model User no schema Prisma com enum `UserRole { TITULAR VISUALIZADOR }`

## Tasks

- [x] Schema: adicionar `role` ao model User + enum `UserRole` (AC: #7)
  - [x] `prisma/schema.prisma` — adicionar enum `UserRole { TITULAR VISUALIZADOR }` e campo `role UserRole @default(TITULAR)` no model User
  - [x] Executar `prisma migrate dev --name add-user-role`
- [x] API: criar server function de registro (AC: #2, #4)
  - [x] `app/features/auth/api/register.ts` — server function `registerUser(email, password)` que valida com Zod, verifica unicidade, cria User com bcrypt hash, retorna user id
  - [x] `app/routes/api/auth/register.ts` — route handler POST
  - [x] Erro email duplicado → `new Response('Este email já está em uso', { status: 422 })`
- [x] Route: criar `app/routes/register.tsx` (AC: #1)
  - [x] Rota pública (sem proteção de auth), layout centralizado com Card
  - [x] Renderiza `RegisterForm`
- [x] Component: criar `app/features/auth/components/RegisterForm.tsx` (AC: #1, #3, #4, #5, #6)
  - [x] react-hook-form + zodResolver, schema `{ email: z.string().email('Email inválido'), password: z.string().min(6, 'Mínimo 6 caracteres') }`
  - [x] Submit → POST `/api/auth/register` → se ok, `signIn('credentials', ...)` + redirect `/`
  - [x] Erro retornado → exibe mensagem inline no formulário
  - [x] Link "Já tem conta? Entrar" no CardFooter
  - [x] Segue mesmo pattern visual do `LoginForm.tsx` (Card, Input, Label, Button)
- [x] Atualizar `app/components/ui/card.tsx` — adicionar export `CardFooter`
- [x] Atualizar `app/routes/__root.tsx` — não necessário (mesmo padrão do login)

## Dev Notes

### Stack & Libraries
- TanStack Start (file-based routing): `createFileRoute('/register')`
- Auth.js (NextAuth v4) + `@auth/prisma-adapter` + Credentials Provider + JWT + bcryptjs
- react-hook-form + `@hookform/resolvers/zod`
- shadcn/ui primitives: Card, Input, Label, Button

### Files to Create
| File | Purpose |
|---|---|
| `app/routes/register.tsx` | Register page route (wrapper) |
| `app/features/auth/components/RegisterForm.tsx` | Register form component |
| `app/features/auth/api/register.ts` | Server function `registerUser` |

### Files to Modify
| File | Change |
|---|---|
| `prisma/schema.prisma` | Add `UserRole` enum + `role` field to User |
| `app/lib/auth.ts` | Optionally export `signUp` helper (or keep inline) |

### Implementation Rules

1. **Pattern consistency** — RegisterForm deve espelhar LoginForm: Card w-full max-w-md, form space-y-4, Label+Input+error text
2. **Auto-login** — Após criar conta no server, chamar `signIn('credentials', { email, password, redirect: false })` no client e redirecionar com `window.location.href = '/'`
3. **Role default** — `TITULAR` no schema, sem expor ao usuário no cadastro
4. **Sem confirmação de email** — conta fica ativa imediatamente
5. **Erros em texto plano** — API retorna `new Response('mensagem', { status })` sem envelope JSON

### Testing
- Verificar rota `/register` carrega sem auth
- Validar: email duplicado retorna 422
- Validar: senha < 6 caracteres trava no frontend (validação inline)
- Validar: após submit bem-sucedido, usuário é redirecionado a `/`

### References
- [Source: architecture.md#Section - Authentication & Security] Auth.js + credentials + bcrypt + sem confirmação
- [Source: architecture.md#Section - Implementation Patterns] Naming conv.: kebab-case features, PascalCase components
- [Source: epics.md#Story 1.1] ACs originais
- [Source: prd.md#FR-19] Email único, hash bcrypt, auto-auth
- [Source: ux-design-specification.md#Section - Component Implementation Strategy] shadcn/ui base, Tailwind, lucide-react
- Pattern file: `app/features/auth/components/LoginForm.tsx` — espelhar estrutura

## Dev Agent Record

### Agent Model Used

opencode with deepseek-v4-flash-free

### Debug Log References

- typecheck: pre-existing TS errors across project (tenant-db, routes, test files), não relacionados a esta story
- `CardFooter` não existia no card.tsx — adicionado para seguir padrão shadcn/ui

### Completion Notes List

- Schema: `UserRole` enum + `role` field adicionados, migrate executado com sucesso
- API: `registerUser()` valida com Zod, verifica email único, cria user com bcrypt hash (10 rounds)
- Route: `/register` criada com layout centralizado (Card w-full max-w-md), rota pública
- Component: `RegisterForm` espelha `LoginForm` — react-hook-form + zodResolver, auto-login via `signIn`, redireciona para `/`
- CardFooter: adicionado ao componente `card.tsx` (faltava no shadcn/ui original)
- Code review patches: email normalization (trim+lowercase), try/catch onSubmit, password max 128, login link on signIn error

### File List

| File | Status |
|---|---|
| `prisma/schema.prisma` | modified |
| `app/features/auth/api/register.ts` | created |
| `app/routes/api/auth/register.ts` | created |
| `app/routes/register.tsx` | created |
| `app/features/auth/components/RegisterForm.tsx` | created |
| `app/components/ui/card.tsx` | modified |
| `app/routeTree.gen.ts` | modified (auto-generated) |
| `_bmad-output/implementation-artifacts/deferred-work.md` | created (review deferred items) |

### Review Findings

- [x] [Review][Decision] **Email enumeration oracle** — Risco aceito pelo usuário. Mantida mensagem específica "Este email já está em uso" (melhor UX).

- [x] [Review][Patch] **Normalizar email antes de salvar** — Adicionado `.toLowerCase().trim()` no email antes de salvar e buscar no banco. `app/features/auth/api/register.ts`

- [x] [Review][Patch] **Adicionar try/catch no onSubmit** — Envolvido fetch/signIn em try/catch com fallback "Erro de conexão". `app/features/auth/components/RegisterForm.tsx`

- [x] [Review][Patch] **Adicionar max-length na senha** — Adicionado `.max(128)` no server e client. `app/features/auth/api/register.ts` + `app/features/auth/components/RegisterForm.tsx`

- [x] [Review][Patch] **Link para /login no erro de signIn** — Se conta é criada mas signIn falha, mensagem inclui link para `/login`. `app/features/auth/components/RegisterForm.tsx`

- [x] [Review][Defer] **TOCTOU race condition** — Concorrência no registro pode burlar unique check. Pre-existing pattern em todo o projeto (find-then-create). `app/features/auth/api/register.ts` — deferred, pre-existing

- [x] [Review][Defer] **Zod sem try/catch na API** — `registerSchema.parse()` lança ZodError não tratado. Pre-existing pattern em todas as rotas API do projeto.

- [x] [Review][Defer] **Schema Zod duplicado** — registerSchema definido no server e no client. Mesmo pattern do LoginForm. Divergência requer refatoração global (shared schemas).

- [x] [Review][Defer] **Dynamic import** — `await import()` na route handler. Pre-existing pattern em todas as rotas API.

- [x] [Review][Defer] **Hard redirect** — `window.location.href` ao invés de `router.navigate`. Mesmo pattern do LoginForm.

- [x] [Review][Defer] **Sem rate limiting** — Pre-existing gap em todos os endpoints.

- [x] [Review][Defer] **Sem CSRF** — Pre-existing pattern. Todas as rotas API não têm proteção CSRF.
