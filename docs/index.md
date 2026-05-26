# Índice de Documentação do Projeto

## FinTrack — Controle Financeiro & Investimentos

### Visão Geral

- **Tipo:** Monolith — Web App (SSR)
- **Linguagem Principal:** TypeScript 5
- **Framework:** React 18 + TanStack Start v1
- **Arquitetura:** Modular monolith por features
- **Database:** PostgreSQL via Prisma v7

### Quick Reference

- **Entry Points:** `app/client.tsx`, `app/ssr.tsx`
- **Tech Stack:** React 18, TanStack Start/Router/Query v1/v5, Prisma v7, Auth.js v4, Tailwind CSS v3, shadcn/ui, Zustand v4, Recharts v2
- **Testes:** Vitest (unit) + Playwright (E2E)
- **CI/CD:** GitHub Actions

### Documentação Gerada

- [Project Overview](./project-overview.md) — Visão geral do projeto
- [Architecture](./architecture.md) — Decisões arquiteturais
- [Source Tree Analysis](./source-tree-analysis.md) — Estrutura de diretórios anotada
- [Component Inventory](./component-inventory.md) — Catálogo de componentes UI
- [API Contracts](./api-contracts.md) — Endpoints REST detalhados
- [Data Models](./data-models.md) — Modelos de dados e relacionamentos
- [Development Guide](./development-guide.md) — Setup e comandos
- [Deployment Guide](./deployment-guide.md) — Deploy e infraestrutura

### Documentação Existente

- [README.md](../README.md) — Documentação principal do projeto

### Getting Started

```bash
git clone <repo>
npm install
cp .env.example .env  # Configurar DATABASE_URL e AUTH_SECRET
npx prisma migrate dev
npm run dev            # http://localhost:3000
```

Para build de produção:

```bash
npm run build
node .output/server/index.mjs
```
