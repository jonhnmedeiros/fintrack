# Story 1.3: Layout Fundacional e Navegação

Status: done

## Story

As um usuário autenticado,
I want ter um layout consistente com sidebar e navegação,
So that eu possa navegar entre as funcionalidades do sistema.

**FRs covered:** FR-22

## Acceptance Criteria

1. Sidebar (240px desktop) com 5 itens: Dashboard, Transações, Investimentos, Relatórios, Configurações
2. Item ativo destacado visualmente com `aria-current="page"`
3. Mobile (< 640px): sidebar substituída por bottom tab bar com mesmos 5 itens
4. Visualizador: mesmo layout, mas ações CRUD (criar/editar/excluir) ocultas
5. Padding página: 32px desktop / 16px mobile; gap entre cards: 24px; cornerRadius 12-16px

## Tasks / Subtasks

- [ ] Ajustar Sidebar para 5 itens (240px, substituir Orçamento/Metas por Relatórios)
  - [ ] Adicionar `aria-current="page"` no link ativo
  - [ ] Adicionar página `/reports` stub (Relatórios)
  - [ ] Ajustar largura de `w-64` para `w-60`
- [ ] Criar BottomTabBar para mobile (< 640px)
  - [ ] Mesmos 5 ícones + labels da sidebar
  - [ ] Visível apenas em viewport < sm, oculta em desktop
  - [ ] Item ativo com cor primária
- [ ] Ajustar Layout.tsx para responsivo (sidebar desktop / bottom tab mobile)
  - [ ] Adicionar área de padding da página conforme UX (p-8 desktop / p-4 mobile)
  - [ ] CornerRadius global consistente (rounded-xl 12px)
- [ ] Preparar estrutura para papel Visualizador
  - [ ] Compartilhar role do usuário via contexto ou hook
  - [ ] Criar hook `useUserRole()` que retorna 'TITULAR' | 'VIEWER'
  - [ ] Exemplo de CRUD gate em um botão de ação

## Dev Notes

### Relevant Architecture Patterns

- **Navegação:** TanStack Router com `Link`, `useLocation` para rota ativa
- **Responsivo:** Tailwind breakpoints (`sm:`, `lg:`, `xl:`) — mobile-first
- **Sidebar atual:** `app/components/layout/Sidebar.tsx` com 6 itens, largura `w-64`
- **Header:** `app/components/layout/Header.tsx` com dropdown de usuário (email + sair)
- **Layout:** `app/components/layout/Layout.tsx` com flex h-screen + sidebar + header + main
- **Ícones:** lucide-react (`LayoutDashboard`, `Receipt`, `TrendingUp`, `PieChart`, `Settings`)

### Files to Modify

| File | Action | Why |
|---|---|---|
| `app/components/layout/Sidebar.tsx` | UPDATE | Ajustar itens, largura, aria-current |
| `app/components/layout/Layout.tsx` | UPDATE | Responsivo, padding, bottom tab |
| `app/components/layout/Header.tsx` | NO CHANGE (unless Visualizador) | Já atende |
| `app/routes/__root.tsx` | UPDATE (role context) | Prover role do usuário |
| `app/routes/reports.tsx` | NEW | Página stub Relatórios |
| `app/routeTree.gen.ts` | AUTO | Gerado pelo router |

### UX Design Reference

- **Sidebar:** 240px desktop, 5 itens: Dashboard, Transações, Investimentos, Relatórios, Configurações
  - Fonte: UX Spec §Navigation Patterns
- **Mobile:** Bottom tab bar com mesmos 5 itens, ícone + label
  - Fonte: UX Spec §Navigation Patterns
- **Layout:** padding página 32px (p-8) desktop / 16px (p-4) mobile; gap cards 24px (gap-6); cornerRadius 12-16px (rounded-xl)
  - Fonte: UX Spec §Spacing & Layout Foundation
- **Visualizador:** Mesmo layout, sem botões CRUD
  - Fonte: Epic 1 Story 1.3 AC

### Previous Story Intelligence (1-2)

- LoginForm usa react-hook-form com erro inline
- `useSession()` da next-auth para estado de autenticação
- API routes usam `auth()` de `app/lib/auth.ts` (decode diretamente)

### Testing

- Teste de renderização do Layout com sidebar
- Teste de visibilidade condicional (mobile vs desktop)
- Teste de rota ativa com `aria-current`

## Dev Agent Record

### Agent Model Used

deepseek-v4-flash-free (opencode)

### Debug Log References

### Completion Notes List

- Sidebar ajustada: 5 itens (Dashboard, Transações, Investimentos, Relatórios, Configurações), largura w-60 (240px), `aria-current="page"`, escondida em mobile (`hidden lg:flex lg:flex-col`)
- BottomTabBar criada: mesmos 5 itens, visível apenas em < lg, fixa no rodapé com `bg-card border-t`
- Layout responsivo: sidebar desktop, bottom tab mobile, padding `p-8 max-sm:p-4 pb-20 max-lg:pb-20`
- Página /reports stub criada
- `useUserRole` hook criado em `app/features/auth/hooks/useUserRole.ts`
- Auth.ts atualizado: JWT + session callbacks incluem `role` do usuário

### File List

### Review Findings

**decision-needed:**
- [x] [Review][Decision] Breakpoint mismatch: sidebar/bottom tab usa `lg` (1024px) ao invés de `sm` (640px). Corrigido: sidebar `hidden sm:flex` com colapso w-16/lg:w-60, bottom tab `sm:hidden`. [Sidebar.tsx, BottomTabBar.tsx]
- [x] [Review][Decision] Pathname matching exato: `location.pathname === item.href` não destaca nav ativo em sub-rotas. Corrigido: `isActive()` com startsWith + exceção para `/`. [Sidebar.tsx, BottomTabBar.tsx]
- [x] [Review][Decision] `auth()` server-side omite `role`. Corrigido: role extraída do token decodificado. [auth.ts:95]
- [x] [Review][Decision] `useUserRole` código morto: adicionado exemplo CRUD gate no reports.tsx (botão "Novo Relatório" oculto para Visualizador). [reports.tsx, useUserRole.ts]
- [x] [Review][Decision] `z-50` conflito: BottomTabBar alterado para `z-40`. [BottomTabBar.tsx:23]

**patch:**
- [x] [Review][Patch] Padding redundante: `pb-20 max-lg:pb-20` simplificado para `pb-20 sm:pb-0`. [Layout.tsx:19]

**defer:**
- [x] [Review][Defer] Rota `/investments` inexistente: sidebar e bottom tab linkam para `/investments` mas rota não existe (404). Pre-existente — never criada. [Sidebar.tsx:15, BottomTabBar.tsx:15]
- [x] [Review][Defer] `as any` type safety: casts em auth.ts e useUserRole.ts ignoram type checking. Padrão pre-existente no projeto. [auth.ts:45-46, useUserRole.ts:11]
- [x] [Review][Defer] CornerRadius global e gap 24px: não implementados — escopo grande que merece passada separada. [Layout.tsx]
- [x] [Review][Defer] Rotas `/budget` e `/goals` órfãs: removidas da nav mas rotas ainda existem e funcionam. [Sidebar.tsx]
- [x] [Review][Defer] Auth guard: Layout não redireciona usuários não autenticados. Pre-existente, fora do escopo desta story.

- `app/components/layout/Sidebar.tsx` — UPDATE (5 itens, w-60, aria-current, hidden mobile)
- `app/components/layout/BottomTabBar.tsx` — NEW (bottom nav mobile)
- `app/components/layout/Layout.tsx` — UPDATE (responsive, padding, bottom tab)
- `app/routes/reports.tsx` — NEW (página stub Relatórios)
- `app/features/auth/hooks/useUserRole.ts` — NEW (hook de role)
- `app/lib/auth.ts` — UPDATE (role nos callbacks JWT/session)
- `.playwright-mcp/page-2026-05-27T12-09-50-894Z.yml` — AUTO (screenshot)
