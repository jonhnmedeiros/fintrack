# FinTrack — Visão Geral do Projeto

## Propósito

FinTrack é uma aplicação web moderna de controle financeiro pessoal, permitindo que usuários gerenciem receitas, despesas, orçamentos, investimentos e metas em um único dashboard.

## Stack Tecnológica

| Categoria | Tecnologia | Versão | Finalidade |
|---|---|---|---|
| **Framework** | React | 18 | Interface de usuário |
| **SSR/Roteamento** | TanStack Start | v1 | SSR, rotas e API routes |
| **Router** | TanStack Router | v1 | Roteamento type-safe |
| **Server State** | TanStack Query | v5 | Cache e estado servidor |
| **ORM** | Prisma | v7 | ORM PostgreSQL |
| **Banco** | PostgreSQL | — | Dados persistentes |
| **Auth** | Auth.js (NextAuth) | v4 | Autenticação por credentials |
| **CSS** | Tailwind CSS | v3 | Estilização utilitária |
| **UI** | shadcn/ui | — | Componentes base Radix UI |
| **Estado Global** | Zustand | v4 | Estado persistido no cliente |
| **Formulários** | React Hook Form | v7 | Formulários performáticos |
| **Validação** | Zod | v4 | Schemas de validação |
| **Gráficos** | Recharts | v2 | Visualização de dados |
| **Tabelas** | TanStack Table | v8 | Tabelas com sort/filtro |
| **Testes** | Vitest + Playwright | — | Testes unitários e E2E |
| **CI/CD** | GitHub Actions | — | Integração contínua |

## Arquitetura

- **Tipo:** Monolith — Web App
- **Padrão:** Modular monolith com features isoladas
- **Renderização:** SSR via TanStack Start (Vinxi/Nitro)
- **Multi-tenancy:** Isolamento por `userId` em todas as queries
- **Estrutura:** Modular por features (`app/features/`)

## Estrutura do Repositório

```
/
├── app/               # Código fonte principal
│   ├── components/    # Componentes de UI e layout
│   ├── features/      # Módulos de negócio (5 domínios)
│   ├── lib/           # Utilitários e configurações
│   ├── routes/        # Rotas da aplicação
│   └── generated/     # Prisma client gerado
├── prisma/            # Schema e migrations
├── .github/           # CI/CD workflows
└── docs/              # Documentação do projeto
```

## Documentação Detalhada

- [Architecture](./architecture.md) — Decisões arquiteturais
- [Source Tree Analysis](./source-tree-analysis.md) — Estrutura de diretórios anotada
- [Component Inventory](./component-inventory.md) — Catálogo de componentes
- [API Contracts](./api-contracts.md) — Endpoints REST
- [Data Models](./data-models.md) — Modelos de dados
- [Development Guide](./development-guide.md) — Setup e comandos
- [Deployment Guide](./deployment-guide.md) — Deploy e infraestrutura
