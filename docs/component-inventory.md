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

### Investments
| Componente | Descrição |
|---|---|
| `app/features/investments/hooks/*` | Hooks (componentes na pasta de hooks) |

## Padrões

- **Design System:** shadcn/ui baseado em Radix UI + Tailwind CSS
- **Styling:** `cn()` utility (clsx + tailwind-merge)
- **Ícones:** Lucide React
- **Cores:** CSS variables no `globals.css` (dark/light via `next-themes`)
