# FinTrack

**Controle financeiro pessoal com módulo de investimentos e suporte multi-usuário.**

Aplicação SSR construída com TanStack Start, PostgreSQL e autenticação via NextAuth.js.

## Stack

| Camada | Tecnologia |
|---|---|
| **Framework** | TanStack Start (SSR) + React 18 |
| **Roteamento** | TanStack Router (type-safe, file-based) |
| **Estado servidor** | TanStack Query (v5) |
| **ORM** | Prisma + PostgreSQL |
| **Autenticação** | NextAuth v4 (Credentials, JWT) |
| **UI** | Tailwind CSS + shadcn/ui |
| **Tabelas** | TanStack Table (v8) |
| **Gráficos** | Recharts |
| **Ícones** | Lucide React |
| **Formulários** | React Hook Form + Zod |
| **Testes** | Vitest + Testing Library + MSW |
| **E2E** | Playwright |

## Funcionalidades

### Módulo Financeiro
- **Dashboard** com saldo total, receitas/despesas do mês, fluxo de caixa (6 meses), pizza de despesas por categoria e transações recentes
- **Transações** com CRUD completo, busca full-text, filtros por tipo/data/categoria, parcelamento em cartão de crédito e ordenação por coluna
- **Categorias** personalizáveis por tipo (receita/despesa)
- **Cartões de Crédito** com limite, dia de fechamento e faturamento
- **Orçamento mensal** por categoria com progresso visual e alertas

### Investimentos
- **Carteira completa** com suporte a ações, ETFs, FIIs, Tesouro Direto, CDB e criptomoedas
- **Preço médio** e resultado por ativo (valor atual vs. custo total)
- **Nota de corretagem** — parser de PDF (BTG / Inter) com extração automática de operações
- **Gráfico de rentabilidade** comparando saldo acumulado vs. valor investido
- **Alertas** configuráveis por ativo (preço alvo, variação)
- **Exportação** de dados da carteira
- Posição calculada automaticamente (FIFO para cálculo de preço médio)

### Multi-usuário
- Convite por email (via Resend) com token de 7 dias
- Papel **Visualizador** — acesso somente leitura a dados financeiros
- Compartilhamento de dados entre titular e visualizadores
- Geração de relatórios

### Infraestrutura
- Proteção de rotas com middleware de autenticação
- Isolamento de dados por usuário (multi-tenancy)
- Geração de senha aleatória para visualizadores
- Tratamento de erros em formulários e loading states com skeleton/spinner

## Começando

### Pré-requisitos

- Node.js 20+
- PostgreSQL rodando localmente (porta 5432)

### Instalação

```bash
# Clonar
git clone https://github.com/seu-usuario/fintrack.git
cd fintrack

# Dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações de banco e email

# Migrations + seed
npx prisma migrate dev
npx prisma db seed

# Iniciar dev server
npm run dev
```

Acesse `http://localhost:3000`. Usuário de teste: `teste@teste.com` / `123456`.

### Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (vinxi) |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm test` | Testes unitários (Vitest) |
| `npm run test:e2e` | Testes E2E (Playwright) |
| `npm run lint` | ESLint |
| `npx prisma studio` | Interface do banco de dados |

## Estrutura

```
app/
├── components/
│   ├── layout/           # Sidebar, Header, BottomTabBar
│   └── ui/               # shadcn/ui primitives
├── features/
│   ├── auth/             # Login, registro, hooks
│   ├── finance/          # Transações, categorias, cartões, orçamento
│   ├── dashboard/        # Home page com gráficos e resumo
│   ├── investments/      # Carteira, notas, rentabilidade, alertas
│   └── settings/         # Convites, perfil
├── lib/
│   ├── auth.ts           # Configuração NextAuth
│   ├── auth-handler.ts   # Adaptador NextAuth para TanStack Start
│   ├── db.ts             # Prisma client singleton
│   ├── tenant-db.ts      # Helpers de multi-tenancy
│   └── email.ts          # Resend integration
├── routes/               # File-based TanStack Router
│   └── api/              # API endpoints
└── types/                # Augmentação de tipos NextAuth

prisma/
├── schema.prisma         # Modelo de dados (13 models)
└── migrations/           # Migrations versionadas
```

## Modelo de Dados

13 modelos Prisma: `User`, `Account`, `Session`, `Category`, `Transaction`, `CreditCard`, `Budget`, `Asset`, `InvestmentTransaction`, `Alert`, `Notification`, `Invite`, `PriceHistory`.

- Categorias e orçamentos são exclusivos por usuário
- Transações vinculadas a categorias e cartões de crédito
- Ativos com cotação e posição calculada por preço médio
- Convites expiram em 7 dias; visualizadores têm acesso read-only

## Licença

MIT
