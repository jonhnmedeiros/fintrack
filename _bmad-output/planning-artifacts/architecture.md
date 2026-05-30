---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - source: "PRD"
    type: "product-requirement"
    path: "_bmad-output/planning-artifacts/prds/prd-FinTrack-2026-05-25/prd.md"
  - source: "Architecture (existing)"
    type: "reference"
    path: "docs/architecture.md"
  - source: "API Contracts"
    type: "reference"
    path: "docs/api-contracts.md"
  - source: "Data Models"
    type: "reference"
    path: "docs/data-models.md"
  - source: "Source Tree Analysis"
    type: "reference"
    path: "docs/source-tree-analysis.md"
  - source: "Component Inventory"
    type: "reference"
    path: "docs/component-inventory.md"
  - source: "Development Guide"
    type: "reference"
    path: "docs/development-guide.md"
  - source: "Deployment Guide"
    type: "reference"
    path: "docs/deployment-guide.md"
  - source: "Project Overview"
    type: "reference"
    path: "docs/project-overview.md"
workflowType: "architecture"
project_name: "FinTrack"
user_name: "Jonathan"
date: "2026-05-25"
lastStep: 8
status: "complete"
completedAt: "2026-05-25"
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- 24 FRs across 7 feature groups: Dashboard, Transações, Cartão de Crédito, Orçamentos, Investimentos, Multiusuário, Alertas e Notificações
- Dashboards agregam dados financeiros com gráficos (Recharts)
- Investimentos exigem cálculo de preço médio, importação de PDF e cotação externa
- Transações com parcelamento em cartão de crédito
- Orçamentos por categoria com progresso mensal
- Multiusuário com dois papéis (Titular + Visualizador read-only)

**Non-Functional Requirements:**
- SSR com hidratação (TanStack Start)
- Isolamento de dados por userId
- Sessão via JWT (Auth.js)
- Performance em queries agregadas para dashboards

### Scale & Complexity

- **Complexidade:** Média — múltiplas features, mas padrões arquiteturais bem estabelecidos
- **Domínio técnico:** Full-stack SSR (monólito modular)
- **Componentes arquiteturais estimados:** 9 (Auth, Dashboard, Transações, Cartão de Crédito, Orçamentos, Investimentos, Cotações, Notificações, Multiusuário)

### Technical Constraints & Dependencies

- TanStack Router pinned at v1.120.20
- Auth.js v4 com PrismaAdapter e Credentials Provider
- Código Prisma server-only excluído do bundle client
- Dados isolados por userId via padrão tenant-db

### Cross-Cutting Concerns Identified

- Session/Auth — todas as operações validam sessão
- Data isolation — userId em todas as queries
- Cálculos financeiros — preço médio, agregados, rentabilidade
- Importação de PDF — parsing server-side específico por corretora
- Cotação externa — API gratuita para preços de ativos

## Starter Template Evaluation

Projeto brownfield — stack já estabelecido e em produção:

| Camada | Tecnologia | Versão |
|---|---|---|
| Runtime | Node + TypeScript | 5 |
| SSR/Router | TanStack Start + Router | v1 (pinned 1.120.20) |
| UI | React + shadcn/ui + Tailwind CSS | 18 / v3 |
| Gráficos | Recharts | v2 |
| ORM | Prisma + PostgreSQL | v7 |
| Auth | Auth.js (NextAuth) + bcryptjs | v4 |
| Estado servidor | TanStack Query | v5 |
| Estado cliente | Zustand | v4 |
| Validação | Zod | v4 |
| Testes | Vitest + Playwright | — |

Nenhuma decisão de starter necessária. Seguir com stack atual.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

| Decisão | Escolha | Versão |
|---|---|---|
| PDF Parsing | parser-de-notas-de-corretagem (npm) | latest |
| API de Cotações | Brasil API | gratuita |
| Email Service | Resend | free tier / $20 |
| Alerts Scheduling | Trigger pós-transação | — |
| Cache de Cotações | PostgreSQL com TTL | — |

### Data Architecture

**Database:** PostgreSQL via Prisma v7 (já estabelecido)
**Cache de Cotações:** Tabela `AssetQuote` com colunas `ticker`, `price`, `updatedAt`. TTL de 15 minutos antes de buscar da API externa. Sem Redis necessário para o volume do MVP.

### PDF Parsing

- **Biblioteca:** `parser-de-notas-de-corretagem` — pacote TypeScript/JS especializado em notas de corretagem brasileiras (padrão B3/Sinacor)
- **Suporte:** Inter (nativo). BTG Pactual usa Sinacor — testar compatibilidade; se necessário, fallback com `pdf.js-extract` + parser customizado
- **Pipeline:** Upload PDF → server action → parser-de-notas-de-corretagem → extração de operações → criação de InvestmentTransactions → recálculo de preço médio

### Authentication & Security

- **Auth:** Auth.js (NextAuth v4) + Credentials Provider + JWT (já estabelecido)
- **Cadastro:** email + senha, bcrypt hash, sem confirmação de email
- **Isolamento:** userId em todas as queries via tenant-db (já estabelecido)
- **Papéis:** Titular (CRUD) e Visualizador (read-only)

### API & Communication Patterns

- **API:** REST via TanStack Start server functions (já estabelecido)
- **Validação:** Zod v4 (já estabelecido)
- **Documentação:** Auto-documentada pelos tipos TypeScript + contratos em `docs/api-contracts.md`

### Frontend Architecture

- **UI:** React 18 + shadcn/ui + Tailwind CSS v3 (já estabelecido)
- **Gráficos:** Recharts v2 (já estabelecido)
- **Estado servidor:** TanStack Query v5 (já estabelecido)
- **Estado cliente:** Zustand v4 (já estabelecido)

### Infrastructure & Deployment

- **Hosting:** Node SSR via Nitro (já estabelecido)
- **Email:** Resend — SDK TypeScript-first, free tier 3K emails/mês
- **Alertas:** Trigger pós-transação — ao criar/atualizar InvestmentTransaction, verificar alertas do ativo e gerar Notification

### Decision Impact Analysis

**Implementation Sequence:**
1. Configurar Brasil API + cache de cotações (AssetQuote)
2. Implementar parser-de-notas-de-corretagem + pipeline de importação
3. Configurar Resend + fluxo de convite do Visualizador
4. Implementar trigger de alertas

**Cross-Component Dependencies:**
- Importação de PDF → cria InvestmentTransactions → recalcula preço médio
- API de cotações → alimenta dashboard (FR-5, FR-6) e carteira (FR-16)
- Alerta trigger → depende de Asset quotado → Notification para o usuário
- Resend → depende de fluxo de cadastro + FR-21 (convidar Visualizador)

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

Baseado em análise do código existente. As convenções já estão estabelecidas e devem ser seguidas por todos os agentes.

### Naming Patterns

**Database Naming Conventions:**
- Modelos: PascalCase singular (`Transaction`, `CreditCard`, `InvestmentTransaction`)
- Campos: camelCase (`categoryId`, `installmentNumber`, `billingDay`)
- Enums: UPPER_SNAKE_CASE (`INCOME`, `BUY`, `SELL`, `STOCK`)
- IDs: `String @id @default(cuid())`
- Únicos: `@@unique([userId, ticker])`
- Exceção: campos legados do Auth.js usam snake_case (`refresh_token`, `access_token`)

**API Naming Conventions:**
- Endpoints RESTful, plural (`/api/transactions`, `/api/credit-cards`)
- DELETE retorna `new Response(null, { status: 204 })`
- Erro: `new Response('mensagem', { status })` — texto plano, sem envelope JSON

**Code Naming Conventions:**
- Componentes UI compartilhados: kebab-case (`button.tsx`, `dropdown-menu.tsx`)
- Componentes de layout/feature: PascalCase (`Sidebar.tsx`, `TransactionTable.tsx`)
- Hooks: camelCase prefix `use` (`useTransactions.ts`)
- API modules em features: kebab-case (`transactions.ts`)
- Variáveis/parâmetros: camelCase
- Constantes/PascalCase enums

### Structure Patterns

**Project Organization:**
```
app/
  features/{feature}/
    api/            -- Server-side modules (calls Prisma)
    hooks/          -- TanStack Query hooks
    components/     -- Feature-specific components
    __tests__/      -- Tests co-localizados
  routes/
    api/{resource}/ -- API endpoints
  components/
    layout/         -- Layout components
    ui/             -- shadcn/ui primitives
  lib/              -- Shared (auth, db, tenant-db, utils)
```

**Route Organization:**
- Páginas em `app/routes/{page}.tsx`
- API em `app/routes/api/{resource}/index.ts`
- DELETE em `app/routes/api/{resource}/$id.ts`

### Format Patterns

**API Response Formats:**
- Sucesso: `Response.json(data)` (200 implícito)
- DELETE sucesso: `new Response(null, { status: 204 })`
- Erro: `new Response('mensagem', { status })`
- Sem envelope JSON padronizado para erros (manter consistência atual)

**Data Exchange Formats:**
- Datas: ISO strings no banco (Prisma DateTime)
- Datas na UI: `Intl.DateTimeFormat('pt-BR')` via `formatDate()` em `utils.ts`
- Moeda: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` via `formatCurrency()`
- Percentual: `formatPercent()` em `utils.ts`
- Valores decimais: Decimal do Prisma (4 casas para preço de ativos)

### Process Patterns

**Error Handling:**
- Autenticação: retornar 401 com texto plano
- Validação: Zod schemas nos API modules (`createTransactionSchema.parse()`)
- Erros não tratados: propagam como 500

**Loading States:**
- TanStack Query gerencia loading/error states
- Componentes usam `isPending`, `isError`, `data` do hook pattern

### Enforcement Guidelines

**All AI Agents MUST:**
- Usar named exports (`export function ComponentName`)
- Co-localizar testes em `__tests__/` na mesma pasta do código testado
- Usar `@/` alias para imports (ex: `@/features/finance/hooks/useTransactions`)
- Seguir PascalCase para componentes React
- Seguir camelCase para hooks, variáveis e campos Prisma
- Usar formato de data/moeda via utils.ts (não criar formatação própria)

## Project Structure & Boundaries

### Complete Project Directory Structure

```
fintrack/
├── package.json
├── tsconfig.json
├── app.config.ts
├── .env.example
├── .gitignore
├── postcss.config.cjs
├── tailwind.config.cjs
├── vite.config.ts
│
├── app/
│   ├── client.tsx                       # Entry — Client mount
│   ├── ssr.tsx                          # Entry — SSR handler
│   ├── routeTree.gen.ts                 # Gerado — Rotas
│   ├── globals.css                      # Tailwind globals
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx               # Sidebar + nav
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── ui/                          # shadcn/ui primitives
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── select.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   └── components/
│   │   │       ├── LoginForm.tsx
│   │   │       └── RegisterForm.tsx     # 🆕 Cadastro
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── SummaryCards.tsx
│   │   │   │   ├── CashFlowChart.tsx
│   │   │   │   └── ExpenseByCategoryChart.tsx
│   │   │   └── hooks/
│   │   │       └── useDashboardData.ts
│   │   │
│   │   ├── finance/
│   │   │   ├── __tests__/
│   │   │   │   ├── useCategories.test.tsx
│   │   │   │   ├── useCategories.unit.test.tsx
│   │   │   │   ├── useCategories.simple.test.tsx
│   │   │   │   └── test-utils.tsx
│   │   │   ├── api/
│   │   │   │   ├── transactions.ts
│   │   │   │   ├── categories.ts
│   │   │   │   ├── budgets.ts
│   │   │   │   └── credit-cards.ts
│   │   │   ├── components/
│   │   │   │   ├── TransactionTable.tsx
│   │   │   │   └── TransactionForm.tsx
│   │   │   └── hooks/
│   │   │       ├── useTransactions.ts
│   │   │       ├── useCategories.ts
│   │   │       └── useBudgets.ts
│   │   │
│   │   ├── investments/
│   │   │   ├── api/
│   │   │   │   ├── assets.ts
│   │   │   │   ├── alerts.ts
│   │   │   │   ├── investment-transactions.ts
│   │   │   │   └── brokerage-note.ts    # 🆕 Parser PDF (parser-de-notas-de-corretagem)
│   │   │   ├── hooks/
│   │   │   │   ├── useAssets.ts
│   │   │   │   ├── useAlerts.ts
│   │   │   │   ├── useInvestmentTransactions.ts
│   │   │   │   └── useBrokerageNoteImport.ts  # 🆕
│   │   │   └── components/
│   │   │       └── BrokerageNoteUpload.tsx    # 🆕 Upload + preview
│   │   │
│   │   └── notifications/
│   │       ├── api/
│   │       │   └── notifications.ts
│   │       └── hooks/
│   │           └── useNotifications.ts
│   │
│   ├── lib/
│   │   ├── __tests__/
│   │   │   └── utils.test.ts
│   │   ├── auth.ts                     # Auth.js config
│   │   ├── db.ts                       # Prisma client singleton
│   │   ├── tenant-db.ts                # Multi-tenant helper
│   │   ├── utils.ts                    # cn(), formatCurrency(), formatDate(), formatPercent()
│   │   ├── email.ts                    # 🆕 Resend SDK
│   │   └── quotes.ts                   # 🆕 Brasil API + cache AssetQuote
│   │
│   ├── routes/
│   │   ├── __root.tsx                  # Root layout + SessionProvider
│   │   ├── index.tsx                   # Dashboard
│   │   ├── login.tsx                   # Login
│   │   ├── register.tsx                # 🆕 Cadastro
│   │   ├── transactions.tsx
│   │   ├── budget.tsx
│   │   ├── goals.tsx                   # Stubbed (v2)
│   │   ├── settings.tsx                # Stubbed (v2)
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login.ts
│   │       │   ├── logout.ts
│   │       │   └── register.ts         # 🆕
│   │       ├── budgets/
│   │       │   └── index.ts
│   │       ├── categories/
│   │       │   └── index.ts
│   │       ├── transactions/
│   │       │   ├── index.ts
│   │       │   └── $id.ts
│   │       ├── credit-cards/
│   │       │   └── index.ts
│   │       ├── assets/
│   │       │   └── index.ts
│   │       ├── investment-transactions/
│   │       │   └── index.ts
│   │       ├── alerts/
│   │       │   └── index.ts
│   │       ├── notifications/
│   │       │   └── index.ts
│   │       └── brokerage-note/
│   │           └── index.ts            # 🆕 Upload endpoint
│   │
│   └── generated/
│       └── prisma/                     # Gerado — Prisma v7 client
│
├── prisma/
│   └── schema.prisma                   # 12 modelos (+ AssetQuote, + papel User)
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docs/                               # Documentação
├── _bmad/                              # BMad config
├── .agents/                            # Skills
└── _bmad-output/                       # Planning & implementation artifacts
```

### Architectural Boundaries

**Frontend → API:**
- TanStack Query hooks em `features/*/hooks/` chamam API routes
- API routes em `routes/api/*/` delegam para módulos em `features/*/api/`
- Módulos de API chamam Prisma via `lib/db.ts` + `lib/tenant-db.ts`

**Data Flow (Importação PDF):**
```
Upload → routes/api/brokerage-note/ → features/investments/api/brokerage-note.ts
  → parser-de-notas-de-corretagem → extração → criação InvestmentTransactions
  → recalculo preço médio → retorno
```

**Data Flow (Cotações):**
```
Componente → useQuery → server function → lib/quotes.ts
  → check cache AssetQuote (TTL 15min)
  → se expirado: fetch Brasil API → atualiza AssetQuote → retorna
```

**Data Flow (Alerta trigger):**
```
Criação de InvestmentTransaction → trigger verifica Alert do Asset
  → se condição satisfeita → cria Notification
```

### Requirements to Structure Mapping

| FRs | Módulo | Diretório |
|---|---|---|
| FR-1 a FR-6 | Dashboard | `features/dashboard/` |
| FR-7 a FR-10 | Transações | `features/finance/` |
| FR-11 | Cartão de Crédito | `features/finance/` |
| FR-12, FR-13 | Orçamentos | `features/finance/` |
| FR-14 a FR-18 | Investimentos | `features/investments/` |
| FR-19 a FR-22 | Auth/Multiusuário | `features/auth/` + `lib/email.ts` |
| FR-23, FR-24 | Alertas | `features/investments/` + `features/notifications/` |

### Integration Points

**External:**
- Brasil API (cotações) → `lib/quotes.ts`
- Resend (email) → `lib/email.ts`

**Internal:**
- Alert trigger: `api/investment-transactions.ts` → verifica `Alert` → cria `Notification`
- Importação PDF: `api/brokerage-note.ts` → `api/investment-transactions.ts` (create)
- Cotações: `lib/quotes.ts` → `AssetQuote` cache → API externa

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** Todas as tecnologias são compatíveis e já rodam em produção. TanStack Start + React 18, Prisma + PostgreSQL, Auth.js, shadcn/ui.

**Pattern Consistency:** Monólito modular por feature — naming conventions e estrutura de diretórios consistentes com o stack.

**Structure Alignment:** Estrutura de diretórios existente suporta todas as novas decisões (PDF parser, cotações, email, alertas).

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:** 24/24 FRs cobertos arquiteturalmente:

| FRs | Cobertura | Módulo |
|---|---|---|
| FR-1 a FR-6 | ✅ | Dashboard |
| FR-7 a FR-13 | ✅ | Finance |
| FR-14 a FR-18 | ✅ | Investments |
| FR-19 a FR-22 | ✅ | Auth |
| FR-23, FR-24 | ✅ | Notifications |

### Implementation Readiness Validation ✅

**Decision Completeness:** Stack existente + 5 novas decisões documentadas (PDF parser, Brasil API, Resend, trigger alertas, cache PostgreSQL).

**Structure Completeness:** Árvore completa com todos os diretórios e arquivos novos mapeados (`🆕`).

### Gap Analysis Results

| Gap | Tipo | Resolução |
|---|---|---|
| Schema Prisma: AssetQuote + papel User | Menor | Resolver na implementação das estórias |
| Nenhum gap crítico | — | — |

### Checklist de Completude

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — stack existente e testado em produção

**Key Strengths:**
- Arquitetura existente validada pelo código rodando
- Decisões novas bem isoladas (parser PDF, cotações, email)
- Padrões consistentes já estabelecidos
- 100% dos FRs cobertos

### Implementation Handoff

**AI Agent Guidelines:**
- Seguir todas as decisões arquiteturais documentadas
- Usar implementation patterns consistentes
- Respeitar estrutura de diretórios e boundaries
- Consultar este documento para decisões de arquitetura

**First Implementation Priority:**
- Schema: AssetQuote + papel de usuário → parser PDF → cadastro + login → dashboard → ...
