# Design Doc: FinTrack — Controle Financeiro & Investimentos

## 1. Overview

"FinTrack" é uma aplicação pessoal de controle financeiro e gestão de investimentos. O sistema permite registrar receitas e despesas, gerenciar cartões de crédito, acompanhar investimentos com indicadores avançados, visualizar dashboards personalizados e receber notificações in-app.

**Stack:** React 18 SSR (TanStack Start), TanStack Router, Query, Table, Tailwind CSS, shadcn/ui, Zustand, Recharts, Prisma, PostgreSQL, Auth.js.

## 2. Architecture & Structure

**Framework:** TanStack Start (SSR, Roteamento, API Routes, Streaming).
**ORM:** Prisma (TypeScript-first, excelente suporte a PostgreSQL).
**Auth:** Auth.js (NextAuth) com adapter Prisma.
**State:** Zustand (estado local/cliente), TanStack Query (estado de servidor/cache).
**UI:** Tailwind CSS + shadcn/ui + Recharts.

**Estrutura de Pastas (`src/`):**

```text
src/
├── app/                 # TanStack Start app
│   ├── routes/          # Rotas type-safe
│   ├── components/      # UI compartilhada (Button, Input, Layout, Charts)
│   └── lib/             # Utils, db.ts (Prisma client), auth.ts
├── features/            # Módulos por domínio (Feature Sliced Design)
│   ├── auth/            # Config Auth.js, callbacks, providers
│   ├── finance/         # Transações, categorias, cartões, orçamentos
│   ├── investments/     # Ativos, corretoras, indicadores, alertas
│   ├── dashboard/       # Gráficos, relatórios, net worth
│   └── notifications/   # Sistema de alertas in-app
└── types/               # Tipos globais compartilhados
```

**Isolamento Multi-tenant:**
Todas as queries ao banco incluem `where: { userId: context.user.id }`. O `userId` é injetado via contexto do TanStack Start em cada requisição, garantindo que um usuário nunca acesse dados de outro.

**Fluxo de Dados:**
1.  **SSR:** TanStack Start renderiza a página no servidor, pré-carregando dados iniciais via TanStack Query (`dehydrate`).
2.  **Client:** React hydrata a UI. Interações usam TanStack Query para fetching e Zustand para estado local.
3.  **Mutations:** Formulários enviam dados para API Routes do TanStack Start, que validam e usam Prisma para escrever no Postgres.

## 3. Esquema do Banco de Dados (Prisma)

```prisma
// Auth.js (NextAuth)
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  categories    Category[]
  transactions  Transaction[]
  creditCards   CreditCard[]
  budgets       Budget[]
  assets        Asset[]
  investmentTransactions InvestmentTransaction[]
  alerts        Alert[]
  notifications Notification[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

// Financeiro
enum CategoryType {
  INCOME
  EXPENSE
}

model Category {
  id          String       @id @default(cuid())
  name        String
  type        CategoryType
  color       String?
  icon        String?
  userId      String
  transactions Transaction[]
  budgets     Budget[]
  @@unique([userId, id])
  @@unique([userId, name, type])
}

enum TransactionType {
  INCOME
  EXPENSE
  TRANSFER
}

model Transaction {
  id                String       @id @default(cuid())
  type              TransactionType
  amount            Decimal
  description       String?
  date              DateTime
  categoryId        String?
  category          Category?    @relation(fields: [categoryId], references: [id])
  creditCardId      String?
  creditCard        CreditCard?  @relation(fields: [creditCardId], references: [id])
  installmentNumber Int?
  totalInstallments Int?
  userId            String
}

model CreditCard {
  id          String       @id @default(cuid())
  name        String
  billingDay  Int?
  closingDay  Int?
  limit       Decimal?
  userId      String
  transactions Transaction[]
}

model Budget {
  id         String   @id @default(cuid())
  categoryId String
  amount     Decimal
  month      Int
  year       Int
  userId     String
  category   Category @relation(fields: [categoryId], references: [id])
  @@unique([userId, categoryId, month, year])
}

// Investimentos
enum AssetType {
  STOCK
  ETF
  CRYPTO
  FIIS
  BOND
  OTHER
}

model Asset {
  id          String    @id @default(cuid())
  ticker      String
  name        String?
  type        AssetType
  market      String?
  userId      String
  transactions InvestmentTransaction[]
  alerts      Alert[]
  @@unique([userId, ticker])
}

enum InvTransactionType {
  BUY
  SELL
  DIVIDEND
  TAX
}

model InvestmentTransaction {
  id        String          @id @default(cuid())
  type      InvTransactionType
  quantity  Decimal
  price     Decimal
  fees      Decimal?        @default(0)
  taxes     Decimal?        @default(0)
  date      DateTime
  assetId   String
  asset     Asset           @relation(fields: [assetId], references: [id], onDelete: Cascade)
  userId    String
}

enum AlertType {
  PRICE
  VOLUME
  DIVIDEND
  OTHER
}

model Alert {
  id          String    @id @default(cuid())
  type        AlertType
  targetPrice Decimal?
  message     String
  active      Boolean   @default(true)
  assetId     String?
  asset       Asset?    @relation(fields: [assetId], references: [id], onDelete: Cascade)
  userId      String
}

// Notificações In-App
model Notification {
  id     String   @id @default(cuid())
  title  String
  body   String
  read   Boolean  @default(false)
  userId String
}
```

## 4. Funcionalidades & Fluxos

**1. Controle Financeiro (Intermediário + Cartão)**
*   **Fluxo:** Usuário cria categorias -> Adiciona transações (receita/despesa) -> Define orçamentos mensais.
*   **Cartão de Crédito:** Ao registrar uma compra no cartão, o sistema cria parcelas automáticas nas datas futuras. O limite do cartão é atualizado.
*   **Orçamentos:** Teto por categoria. O dashboard mostra barras de progresso e alertas in-app quando o limite se aproxima ou é ultrapassado.

**2. Investimentos (Avançado)**
*   **Fluxo:** Usuário cadastra ativos (ticker, tipo, mercado) -> Registra operações (Compra, Venda, Dividendos, IR) -> Sistema calcula preço médio e P/L.
*   **Indicadores:** Cálculo automático de Dividend Yield, P/L Realizado/Virtual, Alocação por setor/tipo.
*   **Alertas:** Usuário cria alertas de preço para ativos. O sistema verifica e dispara notificação in-app quando atingido.
*   **Importação:** Estrutura preparada para futura importação de extratos B3/corretoras (CSV/OFX).

**3. Dashboards & Relatórios (Avançado)**
*   **Dashboard Principal:** Visão geral do patrimônio líquido (Finanças + Investimentos), fluxo de caixa (6 meses), despesas por categoria (pizza), metas de orçamento.
*   **Relatórios:** Filtros por período e categoria. Exportação de relatórios em PDF usando `@react-pdf/renderer` (renderização client-side, sem dependência de servidor).
*   **Performance:** Gráfico comparativo da carteira de investimentos vs. CDI/SELIC.

**4. Notificações In-App**
*   Sistema centralizado de notificações.
*   Gatilhos: Orçamento excedido, alerta de preço atingido, resumo mensal pronto.
*   Ícone de sino no layout principal com contagem de não lidas.

## 5. Autenticação & Segurança

**Auth.js (NextAuth) Configuration:**
*   **Provider:** Credentials (Email + Senha).
*   **Storage:** Database via Prisma Adapter.
*   **Session Strategy:** JWT (JSON Web Tokens) por padrão, com `user` object populado via callbacks.
*   **Session Expiry:** 30 dias (renovável).

**Segurança & Multi-tenancy:**
*   **Isolamento de Dados (RLS Lógico):**
    *   Nenhuma query ao banco é executada sem o filtro `where: { userId: <current_user_id> }`.
    *   Isso é garantido por uma camada de abstração no backend (ex: `dbFactory(userId).transaction.findMany()`).
    *   Mesmo que um componente frontend envie um ID de transação de outro usuário, o backend rejeitará a operação se o `userId` não bater.
*   **Proteção de Rotas:**
    *   TanStack Router com `beforeLoad` guard. Rotas protegidas redirecionam para `/login` se não autenticado.
*   **Validação de Input:**
    *   Zod para validação estrita de todos os inputs de formulários e payloads de API.
*   **CSRF:**
    *   Como usamos JWT com Auth.js, CSRF é mitigado via `SameSite=Lax` no cookie do token + verificação de `Origin` header no servidor para todas as mutações.

## 6. UI/UX & Design System

**1. Design Tokens & Tema**
*   **Tailwind CSS:** Utilitário para estilização rápida e consistente.
*   **Tema:** Suporte nativo a **Light/Dark mode**. O toggle é persistido no `localStorage`.
*   **Cores:** Variáveis semânticas (ex: `--color-success`, `--color-danger`, `--color-warning`) para garantir acessibilidade e consistência, especialmente em gráficos financeiros (verde/vermelho).

**2. Layout**
*   **Desktop:** Sidebar fixa à esquerda com navegação principal (Dashboard, Transações, Investimentos, Orçamentos, Configurações).
*   **Mobile:** Bottom Navigation Bar ou Drawer menu. Layout responsivo prioriza a usabilidade em telas menores.
*   **Header:** Barra superior com título da página, notificações (sininho) e menu do usuário.

**3. Componentes Core**
*   **UI Primitivos:** **shadcn/ui** (Radix + Tailwind) para toda a interface.
*   **Gráficos:** Recharts, estilizados via shadcn/ui Chart component.
*   **Formulários:** **React Hook Form** + **Zod** para validação. Feedback visual imediato para erros.
*   **Tabelas:** **TanStack Table**. Suporte a virtualização (para listas longas de transações), ordenação, filtros e paginação.

**4. Interações**
*   **Feedback:** Toast notifications para ações (ex: "Transação criada com sucesso").
*   **Loading States:** Skeletons nas tabelas e gráficos enquanto os dados são carregados via SSR/TanStack Query.

## 7. Testes & Deploy

**1. Estratégia de Testes**
*   **Unit & Integration:** **Vitest** + **React Testing Library**.
    *   Foco em testar lógica de negócio (ex: cálculo de preço médio, parcelas de cartão) e componentes isolados.
*   **End-to-End (E2E):** **Playwright**.
    *   Crucial para fluxos críticos: autenticação, criação de transações, navegação entre rotas protegidas.
    *   Testes rodarão contra um banco de dados de teste (Postgres).
*   **Type Checking:** TypeScript estrito (`strict: true`) rodando no build e no pre-commit hook.

**2. Deploy & Infraestrutura**
*   **Plataforma:** **Vercel** ou **Railway**. Ambos suportam bem TanStack Start (SSR Node.js).
*   **Banco de Dados:** **Supabase** ou **Neon**. Postgres serverless, fácil de escalar para projetos pessoais.
*   **CI/CD:** **GitHub Actions**.
    *   Pipeline: `lint` -> `typecheck` -> `test` -> `build`.
    *   **Migrations:** `prisma migrate deploy` rodado no startup da aplicação (ou no pipeline de deploy, antes de iniciar o servidor).
    *   Deploy automático no push para `main`.
