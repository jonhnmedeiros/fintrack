# Arquitetura do FinTrack

## Resumo Executivo

O FinTrack é uma aplicação web full-stack construída com **TanStack Start** (anteriormente @tanstack/start), que fornece SSR (Server-Side Rendering) via Vinxi/Nitro. O projeto segue uma arquitetura de **monólito modular** onde as funcionalidades de negócio são organizadas em módulos independentes dentro de `app/features/`.

## Padrão Arquitetural

- **Renderização:** SSR com hidratação no cliente (TanStack Start)
- **Roteamento:** File-based routing via TanStack Router (type-safe)
- **API:** API routes co-localizadas com as rotas (TanStack Start server functions)
- **Estado do Servidor:** TanStack Query para cache e sincronização
- **Estado Local:** Zustand para estado global do cliente
- **Multi-tenancy:** Filtro por `userId` em todas as consultas (via `tenant-db.ts`)

## Fluxo de Dados

```
Browser → TanStack Router → Route (página)
  ├── SSR: Server-side render → HTML
  └── Client: TanStack Query → API Route (server) → Prisma → PostgreSQL
```

```
API Route → Auth.js (session check) → tenant-db (userId filter) → Prisma → PostgreSQL
```

## Stack Tecnológica

| Camada | Tecnologia | Detalhes |
|---|---|---|
| **Frontend** | React 18 + TypeScript 5 | Componentes funcionais com hooks |
| **SSR/Router** | TanStack Start v1 + Router v1 | Vinxi/Nitro para build SSR |
| **Estado Servidor** | TanStack Query v5 | `useQuery`, `useMutation` por feature |
| **Estado Cliente** | Zustand v4 | Store global de sidebar/UI |
| **UI** | shadcn/ui (Radix) + Tailwind CSS v3 | Design system utilitário |
| **ORM** | Prisma v7 | Geração de cliente + migrations |
| **Banco** | PostgreSQL | Schema com 10 modelos |
| **Auth** | Auth.js (NextAuth v4) + bcryptjs | Credenciais com hash de senha |
| **Validação** | Zod v4 | Schemas de API e formulários |

## Decisões Arquiteturais

### Modular Monolith
Features são isoladas em `app/features/` com seus próprios `api/`, `hooks/` e `components/`. Cada feature é auto-contida, facilitando eventual extração para microsserviços.

### SSR com TanStack Start
- SSR gera HTML completo no servidor para melhor SEO e performance percebida
- Vinxi compila 3 bundles: client, SSR e server (Nitro)
- API routes rodam no servidor Nitro em produção

### Multi-tenancy por Filtro
Dados são isolados por `userId` em todas as consultas. O helper `tenant-db.ts` força o filtro automaticamente.

### API Routes Server-only
Código Prisma (server-only) é excluído do bundle client via Rollup `external` no `app.config.ts`.

## Restrições Técnicas

- `@tanstack/react-router` está **pinned** na versão `1.120.20` para compatibilidade com `router-core@1.130.17`
- Cliente Prisma é gerado para `app/generated/prisma/` e excluído do bundle client
- Tokens de autenticação e senhas são gerenciados via Auth.js + bcrypt

## Tópicos Relacionados

- [Source Tree Analysis](./source-tree-analysis.md)
- [Data Models](./data-models.md)
- [API Contracts](./api-contracts.md)
- [Development Guide](./development-guide.md)
