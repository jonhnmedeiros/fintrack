# Inventário de Componentes

## shadcn/ui Components (Radix UI)

| Componente | Arquivo | Tipo | Props |
|---|---|---|---|
| **Button** | `app/components/ui/button.tsx` | Botão | `variant`, `size`, `asChild` |
| **Card** | `app/components/ui/card.tsx` | Container | `Card`, `CardHeader`, `CardTitle`, `CardContent` |
| **Dialog** | `app/components/ui/dialog.tsx` | Modal | `DialogTrigger`, `DialogContent`, `DialogTitle` |
| **DropdownMenu** | `app/components/ui/dropdown-menu.tsx` | Menu | `DropdownMenuTrigger`, `DropdownMenuContent` |
| **Input** | `app/components/ui/input.tsx` | Campo texto | `type`, `placeholder`, `disabled` |
| **Label** | `app/components/ui/label.tsx` | Rótulo | `htmlFor`, `children` |
| **Select** | `app/components/ui/select.tsx` | Dropdown | `SelectTrigger`, `SelectContent`, `SelectItem` |
| **Popover** | `app/components/ui/popover.tsx` | Overlay posicionado | `PopoverTrigger`, `PopoverContent` |
| **Calendar** | `app/components/ui/calendar.tsx` | Calendário (react-day-picker v10) | `mode`, `selected`, `onSelect`, `numberOfMonths` |

## Componentes de Data (compostos)

| Componente | Arquivo | Descrição |
|---|---|---|
| **DatePicker** | `app/components/ui/date-picker.tsx` | Popover + Calendar para seleção de data única (substitui `<input type="date">` nativo, evita bugs no Safari) |
| **MonthYearPicker** | `app/components/ui/month-year-picker.tsx` | Popover com navegação mês a mês, usado em Orçamentos |
| **PeriodSelector** | `app/components/ui/period-selector.tsx` | Popover de seleção de intervalo de datas com presets (Mês atual, Últimos 3 meses, etc.) — presets em coluna lateral + calendário responsivo (1 mês mobile / 2 desktop). Usado em Dashboard e Transações |

## Componentes de Layout

| Componente | Arquivo | Descrição |
|---|---|---|
| **Layout** | `app/components/layout/Layout.tsx` | Sidebar fixa + header + content area |

## Componentes por Feature

### Auth
| Componente | Descrição |
|---|---|
| `app/features/auth/components/*` | Login form, proteção de rota |

### Dashboard
| Componente | Descrição |
|---|---|
| `app/features/dashboard/components/*` | Charts (Recharts), cards de resumo |

### Finance
| Componente | Descrição |
|---|---|
| `app/features/finance/components/*` | Tabelas, formulários, cards financeiros |
| `app/routes/wallets.tsx` | Página CRUD de Contas/Carteiras (`/wallets`) — cria, edita, exclui contas e mostra o saldo calculado de cada uma |

### Investments
| Componente | Descrição |
|---|---|
| `app/features/investments/hooks/*` | Hooks (componentes na pasta de hooks) |

## Hooks compartilhados

| Hook | Arquivo | Descrição |
|---|---|---|
| **useMediaQuery** | `app/hooks/useMediaQuery.ts` | Wrapper de `window.matchMedia` para responsividade condicional em componentes (ex: número de meses exibidos no `PeriodSelector`) |

## Padrões

- **Design System:** shadcn/ui baseado em Radix UI + Tailwind CSS
- **Styling:** `cn()` utility (clsx + tailwind-merge)
- **Ícones:** Lucide React
- **Cores:** CSS variables no `globals.css` (dark/light via `next-themes`)
