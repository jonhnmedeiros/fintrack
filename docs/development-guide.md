# Guia de Desenvolvimento

## Pré-requisitos

- Node.js 18+
- npm 9+
- PostgreSQL 14+

## Setup Inicial

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais PostgreSQL e AUTH_SECRET

# 3. Rodar migrations do Prisma
npx prisma migrate dev --name init

# 4. (Opcional) Seed de dados iniciais
npx prisma db seed
```

## Comandos de Desenvolvimento

```bash
npm run dev           # Servidor de desenvolvimento (Vinxi, porta 3000)
npm run build         # Build de produção (client + SSR + server)
npm run start         # Iniciar servidor de produção (Nitro)
```

## Testes

```bash
npm run test          # Vitest (testes unitários)
npm run test:e2e      # Playwright (testes E2E)
```

## Lint

```bash
npm run lint          # ESLint
```

## Estrutura de Features

Cada feature em `app/features/` segue o padrão:

```
finance/
├── api/              # API routes (server-side)
│   ├── budgets.ts
│   ├── categories.ts
│   └── transactions.ts
├── hooks/            # TanStack Query hooks
│   ├── useBudgets.ts
│   ├── useCategories.ts
│   └── useTransactions.ts
├── components/       # Componentes React da feature
└── __tests__/        # Testes unitários
```

## Convenções

- **TypeScript:** Strict mode, tipos explícitos
- **CSS:** Tailwind CSS com classes utilitárias
- **Componentes:** Funcionais com hooks (React 18)
- **Query:** TanStack Query v5 (useQuery + useMutation)
- **Estado:** Zustand para estado global do cliente
- **Validação:** Zod schemas em `app/features/*/schemas/`
- **API:** Server functions via TanStack Start

## Tópicos Relacionados

- [Architecture](./architecture.md)
- [API Contracts](./api-contracts.md)
- [Deployment Guide](./deployment-guide.md)
