# FinTrack — Controle Financeiro & Investimentos

Aplicação moderna de controle financeiro pessoal construída com React, TanStack e Tailwind CSS.

## 🚀 Tech Stack

| Biblioteca | Versão | Uso |
|---|---|---|
| **React** | 18 | UI Framework |
| **TanStack Router** | v1 | Roteamento type-safe |
| **TanStack Query** | v5 | Server state & cache |
| **TanStack Table** | v8 | Tabelas com sorting, filtros e paginação |
| **Zustand** | v4 | Estado global persistido |
| **Recharts** | v2 | Gráficos (área, pizza, barras) |
| **Tailwind CSS** | v3 | Estilização utilitária |
| **date-fns** | v3 | Manipulação de datas |
| **Lucide React** | — | Ícones |
| **Vite** | v5 | Build tool |
| **TypeScript** | v5 | Tipagem estática |

## 📦 Instalação

```bash
npm install
npm run dev
```

Acesse: http://localhost:5173

## 🏗️ Estrutura do Projeto

```
src/
├── components/
│   └── layout/
│       └── Layout.tsx          # Sidebar + navegação
├── hooks/
│   └── useQueries.ts           # Hooks TanStack Query
├── lib/
│   ├── mockData.ts             # Dados de exemplo
│   ├── router.tsx              # TanStack Router config
│   └── utils.ts                # Utilitários (formatação, helpers)
├── pages/
│   ├── DashboardPage.tsx       # Visão geral + gráficos
│   ├── TransactionsPage.tsx    # Tabela com TanStack Table
│   ├── InvestmentsPage.tsx     # Carteira de investimentos
│   ├── BudgetPage.tsx          # Orçamento por categoria
│   └── GoalsPage.tsx           # Metas financeiras
├── store/
│   └── useFinanceStore.ts      # Zustand store (persistido)
├── types/
│   └── index.ts                # TypeScript types
├── index.css                   # Tailwind + custom components
└── main.tsx                    # Entry point + providers
```

## 📱 Funcionalidades

### Dashboard
- Saldo total de todas as contas
- Receitas e despesas do mês
- Gráfico de fluxo de caixa (6 meses)
- Pizza de despesas por categoria
- Transações recentes
- Progresso das metas

### Transações
- Tabela com **TanStack Table** (sorting, filtros, paginação)
- Filtro por tipo (Receita / Despesa / Transferência)
- Busca full-text
- Deletar transação
- Cores por categoria

### Investimentos
- Portfolio completo (ações, FIIs, Tesouro, CDB, cripto)
- Resultado por ativo (valor atual vs preço médio)
- Gráfico de alocação por tipo
- Ordenação por qualquer coluna

### Orçamento
- Limite mensal por categoria
- Barra de progresso com alertas (atenção / excedido)
- Visão geral do mês

### Metas
- Progresso visual com cor customizada
- Prazo com contagem regressiva
- Status (concluída / urgente)

## 🔧 Extensão Sugerida

### Conectar API real
Substituir o Zustand store + mock data por chamadas reais:

```typescript
// hooks/useQueries.ts
export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => api.get('/transactions').then(r => r.data),
  })
}
```

### Adicionar formulário de nova transação
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

const qc = useQueryClient()
const mutation = useMutation({
  mutationFn: (data: Partial<Transaction>) => api.post('/transactions', data),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
})
```

### Adicionar autenticação
TanStack Router suporta `beforeLoad` para guards de rota:

```typescript
const protectedRoute = createRoute({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) throw redirect({ to: '/login' })
  },
})
```

## 📄 Scripts

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
```
