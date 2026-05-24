# FinTrack — Controle Financeiro & Investimentos

Aplicação moderna de controle financeiro pessoal construída com React 18, TanStack Start (SSR), Tailwind CSS e Prisma.

## 🚀 Tech Stack

| Biblioteca | Versão | Uso |
|---|---|---|
| **React** | 18 | UI Framework |
| **TanStack Start** | v1 | SSR, rotas e API routes |
| **TanStack Router** | v1 | Roteamento type-safe |
| **TanStack Query** | v5 | Server state & cache |
| **TanStack Table** | v8 | Tabelas com sorting, filtros e paginação |
| **Zustand** | v4 | Estado global persistido |
| **Recharts** | v2 | Gráficos (área, pizza, barras) |
| **Tailwind CSS** | v3 | Estilização utilitária |
| **date-fns** | v3 | Manipulação de datas |
| **Lucide React** | — | Ícones |
| **Prisma** | ORM | Banco de dados PostgreSQL |
| **Auth.js (NextAuth)** | v4 | Autenticação com credenciais |
| **TypeScript** | v5 | Tipagem estática |

## 📦 Instalação

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

## 🏗️ Estrutura do Projeto

```
app/
├── components/
│   ├── layout/
│   │   └── Layout.tsx          # Sidebar + navegação
│   └── ui/                     # shadcn/ui components
├── features/
│   ├── finance/                # Módulo financeiro
│   │   ├── api/                # API routes (via TanStack Start)
│   │   ├── hooks/              # TanStack Query hooks
│   │   └── schemas/            # Zod schemas
│   └── investments/            # Módulo de investimentos
├── lib/
│   ├── auth.ts                 # Auth.js configuration
│   ├── db.ts                   # Prisma client
│   ├── tenant-db.ts            # Multi-tenant database helper
│   └── utils.ts                # Utilitários (formatação, helpers)
├── routes/                     # TanStack Start routes
│   ├── api/                    # API endpoints
│   ├── __root.tsx              # Root route with auth guard
│   ├── index.tsx               # Dashboard page
│   ├── login.tsx               # Login page
│   └── ...                     # Other pages
├── prisma/                     # Prisma schema and migrations
│   └── schema.prisma
└── ...                         # Configuration files
```

## 📱 Funcionalidades

### Autenticação
- Login com email e senha (Auth.js/Credentials)
- Proteção de rotas com middleware
- Isolamento de dados por usuário (multi-tenancy)

### Dashboard
- Saldo total de todas as contas
- Receitas e despesas do mês
- Gráfico de fluxo de caixa (6 meses)
- Pizza de despesas por categoria
- Transações recentes

### Transações
- Tabela com **TanStack Table** (sorting, filtros, paginação)
- Filtro por tipo (Receita / Despesa / Transferência)
- Busca full-text
- Deletar transação
- Cores por categoria
- Suporte a parcelamento de cartão de crédito

### Cartões de Crédito
- Cadastro e gerenciamento de cartões
- Visualização de limite e faturamento
- Integração com transações (parcelamento)

### Orçamento
- Limite mensal por categoria
- Barra de progresso com alertas (atenção / excedido)
- Visão geral do mês

### Investimentos
- Portfolio completo (ações, ETFs, FIIs, Tesouro, CDB, cripto)
- Resultado por ativo (valor atual vs preço médio)
- Gráfico de alocação por tipo
- Ordenação por qualquer coluna
- Alertas de preço e volume

### Metas
- Progresso visual com cor customizada
- Prazo com contagem regressiva
- Status (concluída / urgente)

### Notificações
- Sistema de notificações no app
- Marcar como lido/notificado

## 🔧 Próximos Passos

1. **Testes**: Implementar testes unitários e E2E com Vitest e Playwright
2. **CI/CD**: Configurar GitHub Actions para testes e builds automáticos
3. **Documentação**: Expandir esta documentação com mais detalhes
4. **Melhorias de UX**: Adicionar animações, loading states e tratamento de erros
5. **Importação de Dados**: Permitir importação de extratos bancários e corretoras

## 📄 Scripts

```bash
npm run dev      # Servidor de desenvolvimento com vinxi
npm run build    # Build de produção
npm run start    # Iniciar servidor de produção
npm run test     # Executar testes Vitest
npm run test:e2e # Executar testes E2E Playwright
npm run lint     # Executar ESLint
```

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.