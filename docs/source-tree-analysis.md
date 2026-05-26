# Análise da Árvore de Diretórios

## Estrutura Completa

```
/
├── app/                              # Código fonte principal
│   ├── client.tsx                    # 🟢 Entry point — Client mount
│   ├── ssr.tsx                       # 🟢 Entry point — SSR handler
│   ├── routeTree.gen.ts              # 🔧 Gerado — Árvore de rotas
│   ├── globals.css                   # Estilos globais Tailwind
│   ├── app.config.ts                 # Config TanStack Start
│   │
│   ├── components/                   # Componentes reutilizáveis
│   │   ├── layout/
│   │   │   └── Layout.tsx            # Sidebar + navegação
│   │   └── ui/                       # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── select.tsx
│   │
│   ├── features/                     # Módulos de negócio
│   │   ├── auth/                     # Autenticação
│   │   │   └── components/
│   │   ├── dashboard/                # Dashboard
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── finance/                  # 💰 Núcleo financeiro
│   │   │   ├── api/                  # API routes (server)
│   │   │   ├── hooks/                # TanStack Query hooks
│   │   │   ├── components/           # UI financeira
│   │   │   └── __tests__/            # Testes unitários
│   │   ├── investments/              # Investimentos
│   │   │   ├── api/                  # API routes (server)
│   │   │   └── hooks/                # TanStack Query hooks
│   │   └── notifications/            # Notificações
│   │       ├── api/                  # API routes (server)
│   │       └── hooks/                # TanStack Query hooks
│   │
│   ├── lib/                          # Biblioteca compartilhada
│   │   ├── auth.ts                   # Auth.js configuration
│   │   ├── db.ts                     # Prisma client singleton
│   │   ├── tenant-db.ts              # Multi-tenant helper
│   │   ├── utils.ts                  # Utilitários (formatação)
│   │   └── __tests__/                # Testes
│   │
│   ├── routes/                       # 🟢 TanStack Routes
│   │   ├── __root.tsx                # Root layout + auth guard
│   │   ├── index.tsx                 # Dashboard (página inicial)
│   │   ├── login.tsx                 # Login page
│   │   ├── budget.tsx                # Orçamentos
│   │   ├── transactions.tsx          # Transações
│   │   ├── goals.tsx                 # Metas
│   │   ├── settings.tsx              # Configurações
│   │   └── api/                      # API endpoints (9 grupos)
│   │       ├── auth/
│   │       ├── budgets/
│   │       ├── categories/
│   │       ├── transactions/
│   │       ├── credit-cards/
│   │       ├── assets/
│   │       ├── investment-transactions/
│   │       ├── alerts/
│   │       └── notifications/
│   │
│   └── generated/
│       └── prisma/                   # 🔧 Gerado — Prisma v7 client
│
├── prisma/                           # Schema do banco
│   └── schema.prisma                 # 10 modelos de dados
│
├── .github/
│   └── workflows/
│       └── ci.yml                    # CI/CD pipeline
│
├── docs/                             # Documentação gerada
│
├── design-artifacts/                 # WDS design artifacts
│
├── _bmad/                            # BMad Method config
├── .agents/                          # Agentes de skills
└── .opencode/                        # OpenCode config
```

## Diretórios Críticos

| Diretório | Propósito | Entry Points |
|---|---|---|
| `app/routes/` | Rotas TanStack (páginas + API) | `__root.tsx`, `index.tsx` |
| `app/features/` | Módulos de negócio isolados | `finance/`, `investments/` |
| `app/lib/` | Config compartilhada | `auth.ts`, `db.ts` |
| `app/components/` | UI reutilizável | `ui/`, `layout/` |
| `prisma/` | Schema e dados | `schema.prisma` |
