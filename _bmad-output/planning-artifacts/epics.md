---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - source: "PRD"
    type: "product-requirement"
    path: "_bmad-output/planning-artifacts/prds/prd-FinTrack-2026-05-25/prd.md"
  - source: "Architecture"
    type: "architecture"
    path: "_bmad-output/planning-artifacts/architecture.md"
  - source: "UX Design"
    type: "ux-design"
    path: "_bmad-output/planning-artifacts/ux-design-specification.md"
---

# FinTrack - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for FinTrack, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- **FR-1**: Visualizar cards de resumo financeiro (Receitas, Despesas, Saldo, Total investido)
- **FR-2**: Visualizar gráfico de fluxo de caixa (AreaChart receitas vs despesas últimos 6 meses)
- **FR-3**: Visualizar gráfico de despesas por categoria (PieChart)
- **FR-4**: Visualizar 10 transações recentes na dashboard
- **FR-5**: Visualizar gráfico de rentabilidade dos investimentos (curva custo vs mercado)
- **FR-6**: Exibir cotações atuais dos ativos (ticker, preço, variação)
- **FR-7**: Listar transações com filtros (tipo, período, categoria)
- **FR-8**: Criar transação com parcelamento opcional
- **FR-9**: Excluir transação (incluindo todas as parcelas)
- **FR-10**: Gerenciar categorias (CRUD, tipo INCOME/EXPENSE)
- **FR-11**: Gerenciar cartões de crédito (nome, limite, fechamento, vencimento)
- **FR-12**: Gerenciar orçamentos mensais (categoria, valor limite, mês, ano)
- **FR-13**: Visualizar progresso do orçamento (barra de progresso)
- **FR-14**: Gerenciar ativos da carteira (ticker, nome, tipo, mercado)
- **FR-15**: Registrar transações de investimento (BUY, SELL, DIVIDEND, TAX)
- **FR-16**: Visualizar carteira de investimentos (posição, preço médio, rentabilidade)
- **FR-17**: Importar nota de corretagem (PDF)
- **FR-18**: Exportar dados de investimentos (CSV/JSON)
- **FR-19**: Cadastro de usuário (email + senha)
- **FR-20**: Login (email + senha, JWT)
- **FR-21**: Convidar visualizador (email + link)
- **FR-22**: Isolamento de dados por userId
- **FR-23**: Gerenciar alertas de ativos (PRICE/VOLUME/DIVIDEND/OTHER)
- **FR-24**: Visualizar notificações

### Non-Functional Requirements

- **NFR-1**: SSR com hidratação (TanStack Start)
- **NFR-2**: Isolamento de dados por userId em todas as queries
- **NFR-3**: Sessão via JWT (Auth.js v4 + PrismaAdapter + Credentials Provider)
- **NFR-4**: Performance em queries agregadas para dashboards
- **NFR-5**: Stack brownfield — seguir convenções existentes (named exports, PascalCase componentes, camelCase hooks, @/ alias)
- **NFR-6**: Zod validation em todos os inputs
- **NFR-7**: Decimal Prisma (4 casas) para preço de ativos
- **NFR-8**: Testes co-localizados em `__tests__/`

### Additional Requirements (Architecture)

- Schema Prisma: criar modelo `AssetQuote` (ticker, price, updatedAt) + papel User (Titular/Visualizador)
- Implementar `parser-de-notas-de-corretagem` + pipeline de importação de PDF
- Configurar Brasil API + cache de cotações via AssetQuote (TTL 15 min)
- Configurar Resend SDK em `lib/email.ts` + fluxo de convite do Visualizador
- Implementar trigger de alertas pós-transação de investimento
- Cadastro email + senha sem confirmação
- Dois papéis: Titular (CRUD) e Visualizador (read-only)
- Páginas `goals.tsx` e `settings.tsx` stubbed (v2)
- Estrutura de diretórios: seguir `app/features/{feature}/{api,hooks,components}/` e `app/routes/api/{resource}/`

### UX Design Requirements

- **UX-DR-1**: Implementar SummaryCard (ícone + label + valor formatado BRL + variação %, variants default/highlight, states loading/empty)
- **UX-DR-2**: Implementar TransactionCard (CategoryIcon + descrição + valor cor por tipo + data + badge categoria, clique → detalhes)
- **UX-DR-3**: Implementar QuickActionModal (Dialog: input valor com máscara + select categoria top 5 + descrição opcional + confirmar)
- **UX-DR-4**: Implementar FAB (botão "+" circular 56px, canto inferior direito, apenas para Titular, gira 45° ao abrir)
- **UX-DR-5**: Implementar BrokerNoteUpload (Dialog: upload PDF + preview operações + confirmar/cancelar, states: empty/uploading/parsing/preview/error)
- **UX-DR-6**: Implementar CategoryIcon (Lucide icon + cor circular, tamanhos sm/md/lg, aria-hidden)
- **UX-DR-7**: Implementar CashFlowChart (Recharts BarChart receitas vs despesas, variants monthly/yearly, paleta success/danger)
- **UX-DR-8**: Implementar ExpenseByCategoryChart (Recharts PieChart distribuição despesas, cores distintas por fatia)
- **UX-DR-9**: Implementar AssetCard (código + nome + quantidade + preço médio + cotação + rentabilidade, states loading/error)
- **UX-DR-10**: Implementar InviteForm (Dialog: input email + enviar, validação email válido + diferente do próprio)
- **UX-DR-11**: Implementar sistema de botões (primary azul, secondary outline, ghost, danger vermelho, FAB, icon button)
- **UX-DR-12**: Implementar feedback patterns (Sonner toast success/error/info, Skeleton loading, empty state ilustração + texto, AlertDialog confirmação)
- **UX-DR-13**: Implementar form patterns (máscara monetária R$, validação inline, submit desabilitado até preencher, auto-foco, asterisco obrigatório)
- **UX-DR-14**: Implementar navigation patterns (sidebar 240px desktop, bottom tab 5 itens mobile, Tabs sub-navegação)
- **UX-DR-15**: Implementar modal patterns (Dialog ação rápida, AlertDialog destruição, Sheet detalhes, DropdownMenu ações)
- **UX-DR-16**: Implementar responsive design mobile-first (breakpoints sm/md/lg/xl/2xl, single column → sidebar + grid)
- **UX-DR-17**: Implementar accessibility WCAG AA (contraste 4.5:1, keyboard nav, aria-*, focus visible 2px, touch targets 44px, reduced motion, skip link)
- **UX-DR-18**: Implementar mensagens amigáveis em português claro (erro: "Algo deu errado", empty: "Nenhuma transação ainda")
- **UX-DR-19**: Implementar layout arejado (padding página 32px desktop/16px mobile, gap cards 24px, cornerRadius 12-16px)

### FR Coverage Map

| FR | Epic | Descrição |
|---|---|---|
| FR-19 | Epic 1 | Cadastro de usuário |
| FR-20 | Epic 1 | Login |
| FR-22 | Epic 1 | Isolamento de dados |
| FR-7 | Epic 2 | Listar transações com filtros |
| FR-8 | Epic 2 | Criar transação |
| FR-9 | Epic 2 | Excluir transação |
| FR-10 | Epic 2 | Gerenciar categorias |
| FR-11 | Epic 2 | Gerenciar cartões de crédito |
| FR-12 | Epic 2 | Gerenciar orçamentos |
| FR-13 | Epic 2 | Progresso do orçamento |
| FR-1 | Epic 3 | Cards de resumo financeiro |
| FR-2 | Epic 3 | Gráfico fluxo de caixa |
| FR-3 | Epic 3 | Gráfico despesas por categoria |
| FR-4 | Epic 3 | Transações recentes |
| FR-14 | Epic 4 | Gerenciar ativos da carteira |
| FR-15 | Epic 4 | Registrar transações de investimento |
| FR-16 | Epic 4 | Visualizar carteira de investimentos |
| FR-17 | Epic 4 | Importar nota de corretagem |
| FR-18 | Epic 4 | Exportar dados de investimentos |
| FR-5 | Epic 4 | Gráfico rentabilidade investimentos |
| FR-6 | Epic 4 | Cotações atuais dos ativos |
| FR-23 | Epic 4 | Gerenciar alertas de ativos |
| FR-24 | Epic 4 | Visualizar notificações |
| FR-21 | Epic 5 | Convidar visualizador |

## Epic List

### Epic 1: Autenticação e Conta

Usuário pode criar conta, autenticar-se e ter seus dados isolados dos demais.

**FRs covered:** FR-19, FR-20, FR-22

**UX-DRs:** UX-DR-11 (base), UX-DR-12 (base), UX-DR-13 (base), UX-DR-14 (navegação), UX-DR-15 (modais), UX-DR-16 (responsivo base), UX-DR-17 (acessibilidade), UX-DR-18 (mensagens), UX-DR-19 (layout)

**Arquitetura:** RegisterForm.tsx, rota register.tsx, feature auth/api/register.ts

### Epic 2: Gestão Financeira

Usuário gerencia transações, categorias, cartões de crédito e orçamentos do dia a dia.

**FRs covered:** FR-7, FR-8, FR-9, FR-10, FR-11, FR-12, FR-13

**UX-DRs:** UX-DR-2 (TransactionCard), UX-DR-3 (QuickActionModal), UX-DR-6 (CategoryIcon), UX-DR-11, UX-DR-12, UX-DR-13, UX-DR-15

**Arquitetura:** `features/finance/` completo (CRUD transações, categorias, cartões, orçamentos). Schemas Zod em api modules.

### Epic 3: Dashboard e Visão Geral

Usuário visualiza cards de resumo, gráficos financeiros e transações recentes na página inicial.

**FRs covered:** FR-1, FR-2, FR-3, FR-4

**UX-DRs:** UX-DR-1 (SummaryCard), UX-DR-4 (FAB), UX-DR-7 (CashFlowChart), UX-DR-8 (ExpenseByCategoryChart), UX-DR-11, UX-DR-12

**Arquitetura:** `features/dashboard/` (SummaryCards, CashFlowChart, ExpenseByCategoryChart). Hooks TanStack Query consomem dados de Epic 2.

### Epic 4: Investimentos

Usuário gerencia ativos, registra transações de investimento, importa notas de corretagem (PDF), visualiza rentabilidade da carteira, acompanha cotações e recebe alertas.

**FRs covered:** FR-14, FR-15, FR-16, FR-17, FR-18, FR-5, FR-6, FR-23, FR-24

**UX-DRs:** UX-DR-5 (BrokerNoteUpload), UX-DR-9 (AssetCard), UX-DR-11, UX-DR-12, UX-DR-15

**Arquitetura:** `features/investments/` (assets, investment-transactions, brokerage-note, alerts) + `features/notifications/`. Schema AssetQuote. Brasil API em `lib/quotes.ts`. Trigger alertas pós-transação.

### Epic 5: Multiusuário

Titular pode convidar pessoas para visualizar suas finanças com acesso somente leitura.

**FRs covered:** FR-21

**UX-DRs:** UX-DR-10 (InviteForm), UX-DR-11, UX-DR-12, UX-DR-15

**Arquitetura:** Resend SDK em `lib/email.ts`. Fluxo: Titular envia email → convidado cria/recebe conta como Visualizador. Papel User no schema Prisma.

## Epic 1: Autenticação e Conta

Usuário pode criar conta, autenticar-se e ter seus dados isolados dos demais.

### Story 1.1: Cadastro de Usuário

As a visitante,
I want criar uma conta com email e senha,
So that eu possa acessar o sistema como Titular.

**Acceptance Criteria:**

**Given** um visitante na página de cadastro
**When** ele informa email válido e senha (mínimo 6 caracteres)
**Then** a conta é criada com papel "Titular"
**And** o usuário é autenticado automaticamente e redirecionado à dashboard

**Given** um visitante tenta cadastrar com email já existente
**When** ele submete o formulário
**Then** o sistema retorna erro amigável "Este email já está em uso"

**Given** um visitante tenta cadastrar com senha inválida
**When** ele submete o formulário
**Then** o sistema exibe validação inline com a regra não atendida

### Story 1.2: Login e Sessão

As um Titular ou Visualizador,
I want fazer login com email e senha,
So that eu possa acessar meus dados financeiros.

**Acceptance Criteria:**

**Given** um usuário com conta existente
**When** ele informa email e senha corretos
**Then** o sistema cria sessão JWT e redireciona à dashboard

**Given** um usuário informa email ou senha incorretos
**When** ele submete o formulário
**Then** o sistema retorna erro 401 com mensagem "Email ou senha incorretos"

**Given** um usuário autenticado acessa a página de login
**When** ele navega para /login
**Then** o sistema redireciona automaticamente para a dashboard

### Story 1.3: Layout Fundacional e Navegação

As um usuário autenticado,
I want ter um layout consistente com sidebar e navegação,
So that eu possa navegar entre as funcionalidades do sistema.

**Acceptance Criteria:**

**Given** um usuário autenticado
**When** ele acessa qualquer página do sistema
**Then** o layout exibe sidebar (240px desktop) com 5 itens: Dashboard, Transações, Investimentos, Relatórios, Configurações
**And** o item ativo é destacado visualmente com `aria-current="page"`

**Given** um usuário em viewport mobile (< 640px)
**When** ele acessa o sistema
**Then** a sidebar é substituída por bottom tab bar com os mesmos 5 itens

**Given** um usuário Visualizador
**When** ele navega pelo sistema
**Then** o layout é o mesmo, mas ações de CRUD (botões de criar/editar/excluir) não são exibidas

**Given** qualquer página
**When** carregada
**Then** o layout mantém padding de 32px (desktop) / 16px (mobile), gap entre cards de 24px e cornerRadius de 12-16px

## Epic 2: Gestão Financeira

Usuário gerencia transações, categorias, cartões de crédito e orçamentos do dia a dia.

### Story 2.1: Gerenciar Categorias

As um Titular,
I want criar, editar e excluir categorias de transações,
So that eu possa classificar meus gastos e receitas.

**Acceptance Criteria:**

**Given** um Titular na página de transações
**When** ele cria uma categoria informando nome e tipo (INCOME/EXPENSE)
**Then** a categoria é salva com nome único por tipo e usuário
**And** exibe toast de sucesso

**Given** um Titular edita uma categoria existente
**When** ele altera o nome
**Then** o nome é atualizado no banco

**Given** um Titular exclui uma categoria
**When** ele confirma a exclusão
**Then** a categoria é removida e transações existentes mantêm referência nula

**Given** um Titular tenta criar categoria com nome duplicado para o mesmo tipo
**When** ele submete
**Then** retorna erro amigável "Já existe uma categoria com este nome"

### Story 2.2: Gerenciar Cartões de Crédito

As um Titular,
I want criar e excluir cartões de crédito,
So que eu possa vincular transações a cartões específicos.

**Acceptance Criteria:**

**Given** um Titular
**When** ele cria um cartão informando nome, limite, dia de fechamento e dia de vencimento
**Then** o cartão é salvo vinculado ao usuário

**Given** um Titular exclui um cartão
**When** ele confirma a exclusão
**Then** o cartão é removido e transações vinculadas mantêm a referência

### Story 2.3: Criar Transações com Parcelamento

As um Titular,
I want registrar uma transação informando tipo, valor, descrição, categoria e opcionalmente cartão de crédito,
So that meus gastos e receitas fiquem registrados no sistema.

**Acceptance Criteria:**

**Given** um Titular na dashboard ou página de transações
**When** ele clica no botão de ação rápida (QuickActionModal)
**Then** abre modal com: input de valor (máscara R$), select categoria (top 5 no topo), descrição opcional

**Given** um Titular preenche uma transação sem cartão de crédito
**When** ele confirma
**Then** a transação é salva com data atual e tipo selecionado
**And** exibe toast de sucesso

**Given** um Titular seleciona cartão de crédito com parcelas > 1
**When** ele confirma
**Then** o sistema gera N transações mensais com datas sequenciais e valores iguais

**Given** qualquer transação criada
**When** salva
**Then** a dashboard e lista de transações refletem a atualização via refetch

### Story 2.4: Listar e Filtrar Transações

As um Titular,
I want visualizar minhas transações em uma tabela com filtros,
So that eu possa encontrar transações específicas rapidamente.

**Acceptance Criteria:**

**Given** um Titular na página de transações
**When** a página carrega
**Then** exibe tabela com colunas: data (decrescente), descrição, categoria, valor (despesa vermelho, receita verde), ações

**Given** um Titular aplica filtro por tipo (receita/despesa)
**When** ele seleciona o filtro
**Then** a lista é filtrada sem recarregar a página

**Given** um Titular aplica filtro por período ou categoria
**When** ele seleciona os filtros
**Then** a lista é filtrada de acordo

### Story 2.5: Excluir Transação

As um Titular,
I want excluir uma transação existente,
So that eu possa remover lançamentos incorretos.

**Acceptance Criteria:**

**Given** um Titular seleciona excluir uma transação
**When** ele confirma no AlertDialog
**Then** a transação é removida do banco

**Given** uma transação parcelada é excluída
**When** confirmado
**Then** todas as parcelas vinculadas são removidas

**Given** uma transação é excluída
**When** confirmado
**Then** exibe toast de sucesso e a lista/dashboard são atualizadas

### Story 2.6: Gerenciar Orçamentos

As um Titular,
I want definir limites mensais de gastos por categoria,
So that eu possa controlar meu orçamento.

**Acceptance Criteria:**

**Given** um Titular
**When** ele cria um orçamento informando categoria, valor limite, mês e ano
**Then** o orçamento é salvo (único por combinação categoria/mês/ano)

**Given** um Titular atualiza um orçamento existente
**When** ele altera o valor
**Then** o upsert sobrescreve o valor

**Given** um Titular visualiza a página de orçamentos
**When** carregada
**Then** exibe cards com barra de progresso, valor gasto vs limite e percentual

## Epic 3: Dashboard e Visão Geral

Usuário visualiza cards de resumo, gráficos financeiros e transações recentes na página inicial.

### Story 3.1: SummaryCards e Transações Recentes

As um Titular ou Visualizador,
I want ver cards com resumo financeiro e as transações mais recentes na dashboard,
So that eu entenda rapidamente minha situação financeira.

**Acceptance Criteria:**

**Given** um usuário autenticado na dashboard
**When** a página carrega
**Then** exibe 4 SummaryCards: Receitas (período), Despesas (período), Saldo atual, Total investido
**And** cada card exibe ícone, label e valor formatado BRL

**Given** um card está carregando dados
**When** em estado de loading
**Then** exibe Skeleton pulsante no lugar do card

**Given** um usuário com dados financeiros
**When** a dashboard carrega
**Then** exibe as 10 transações mais recentes com data, descrição, categoria, valor (despesa vermelho, receita verde)

**Given** um card de resumo é clicado
**When** o usuário clica em "Despesas"
**Then** navega para página de transações filtrada por despesas no período

### Story 3.2: Gráficos da Dashboard

As um Titular ou Visualizador,
I want ver gráficos de fluxo de caixa e distribuição de despesas,
So que eu identifique padrões nos meus gastos.

**Acceptance Criteria:**

**Given** um usuário na dashboard
**When** carregada
**Then** exibe CashFlowChart (BarChart) com receitas vs despesas dos últimos 6 meses
**And** receitas na cor success (verde), despesas na cor danger (vermelho)

**Given** um usuário na dashboard
**When** carregada
**Then** exibe ExpenseByCategoryChart (PieChart) com distribuição de despesas por categoria no período
**And** cada fatia tem cor distinta

**Given** não há dados para exibir nos gráficos
**When** em estado vazio
**Then** exibe placeholder "Adicione transações para ver o gráfico"

**Given** os gráficos estão carregando
**When** em estado de loading
**Then** exibe Skeleton

## Epic 4: Investimentos

Usuário gerencia ativos, registra transações de investimento, importa notas de corretagem (PDF), visualiza rentabilidade da carteira, acompanha cotações e recebe alertas.

### Story 4.1: Schema e Infra de Cotações

As um Titular,
I want que o sistema tenha uma base para buscar e cachear cotações de ativos,
So that os preços dos meus ativos estejam atualizados sem sobrecarregar APIs externas.

**Acceptance Criteria:**

**Given** o schema Prisma
**When** executada a migração
**Then** existe o modelo `AssetQuote` com campos: ticker, price, updatedAt

**Given** uma requisição de cotação para um ticker
**When** o cache tem menos de 15 minutos
**Then** retorna o valor do cache sem chamar API externa

**Given** uma requisição de cotação para um ticker
**When** o cache está expirado ou não existe
**Then** busca na Brasil API, atualiza AssetQuote e retorna o novo valor

**Given** a Brasil API está indisponível
**When** uma cotação é solicitada
**Then** retorna o último valor em cache (se existir) com indicador de "dado desatualizado"

### Story 4.2: Gerenciar Ativos

As um Titular,
I want cadastrar e excluir ativos na minha carteira,
So that eu possa acompanhar meus investimentos.

**Acceptance Criteria:**

**Given** um Titular
**When** ele cadastra um ativo com ticker, nome, tipo (STOCK/ETF/CRYPTO/FII/BOND/OTHER) e mercado
**Then** o ativo é salvo (único por ticker e usuário)

**Given** um Titular tenta excluir um ativo com transações vinculadas
**When** ele confirma
**Then** o sistema retorna erro e não permite exclusão

**Given** um Titular exclui um ativo sem transações vinculadas
**When** ele confirma
**Then** o ativo é removido

### Story 4.3: Registrar Transações de Investimento

As um Titular,
I want registrar compras, vendas, dividendos e taxas dos meus ativos,
So que o preço médio seja calculado automaticamente.

**Acceptance Criteria:**

**Given** um Titular registra uma compra (BUY) de um ativo
**When** confirmado
**Then** a quantidade do ativo aumenta e o preço médio é recalculado

**Given** um Titular registra uma venda (SELL)
**When** confirmado
**Then** a quantidade do ativo diminui

**Given** uma transação de investimento é criada
**When** do tipo BUY ou SELL
**Then** verifica alertas do ativo e gera Notification se condição satisfeita

**Given** um Titular registra dividendo (DIVIDEND) ou taxa (TAX)
**When** confirmado
**Then** a transação é registrada sem alterar quantidade do ativo

### Story 4.4: Visualizar Carteira de Investimentos

As um Titular,
I want ver minha carteira com posição atual de cada ativo,
So que eu saiba quanto tenho investido e qual a rentabilidade.

**Acceptance Criteria:**

**Given** um Titular na página de investimentos
**When** carregada
**Then** exibe lista de ativos com: ticker, tipo, quantidade, preço médio, valor investido, preço atual, valor de mercado, ganho/perda

**Given** um asset está carregando cotação
**When** em loading
**Then** exibe Skeleton no lugar do preço atual

**Given** a cotação de um ativo está indisponível
**When** em erro
**Then** exibe "Cotação indisponível" no AssetCard

### Story 4.5: Importar Nota de Corretagem

As um Titular,
I want importar um PDF de nota de corretagem,
So que as operações de compra/venda sejam registradas automaticamente.

**Acceptance Criteria:**

**Given** um Titular na página de investimentos
**When** ele clica em "Importar nota"
**Then** abre BrokerNoteUpload dialog com área para selecionar PDF

**Given** um PDF é selecionado
**When** o upload é processado
**Then** exibe preview das operações extraídas com valores e quantidades

**Given** o PDF não é de uma corretora suportada (BTG/Inter)
**When** o parsing falha
**Then** exibe mensagem "Não reconhecemos esse formato. Notas da BTG e Inter são suportadas."

**Given** o Titular confirma a importação
**When** ele clica em "Confirmar"
**Then** as operações são registradas e o preço médio é recalculado
**And** exibe toast "Nota importada com sucesso"

### Story 4.6: Gráfico de Rentabilidade

As um Titular,
I want ver um gráfico comparando valor investido vs valor de mercado ao longo do tempo,
So que eu veja claramente se estou ganhando ou perdendo dinheiro.

**Acceptance Criteria:**

**Given** um Titular na página de investimentos
**When** carregada
**Then** exibe gráfico (Recharts) com duas curvas: valor investido (custo) e valor de mercado (atual)
**And** a diferença entre curvas representa ganho/perda

**Given** não há dados de investimento
**When** em estado vazio
**Then** exibe placeholder "Adicione investimentos para ver o gráfico de rentabilidade"

### Story 4.7: Exportar Dados

As um Titular,
I want exportar os dados da minha carteira,
So que eu possa levar os dados para outra corretora ou planilha.

**Acceptance Criteria:**

**Given** um Titular na página de investimentos
**When** ele clica em "Exportar"
**Then** o sistema gera arquivo CSV/JSON com: preço médio, quantidades e histórico de transações

**Given** o arquivo é gerado
**When** pronto
**Then** inicia download automaticamente

### Story 4.8: Alertas e Notificações

As um Titular,
I want configurar alertas sobre meus ativos e receber notificações,
So que eu seja informado quando condições de mercado ocorrerem.

**Acceptance Criteria:**

**Given** um Titular
**When** ele cria um alerta para um ativo com tipo (PRICE/VOLUME/DIVIDEND/OTHER) e valor alvo opcional
**Then** o alerta é salvo vinculado ao ativo

**Given** um Titular remove um alerta
**When** confirmado
**Then** o alerta é marcado como inativo (soft-delete)

**Given** um Titular acessa a página de notificações
**When** carregada
**Then** exibe lista de notificações por data decrescente com status de leitura

**Given** um Titular clica em uma notificação não lida
**When** visualizada
**Then** a notificação é marcada como lida

## Epic 5: Multiusuário

Titular pode convidar pessoas para visualizar suas finanças com acesso somente leitura.

### Story 5.1: Convidar Visualizador

As um Titular,
I want convidar uma pessoa para visualizar minhas finanças,
So que ela possa acompanhar sem precisar de acesso de edição.

**Acceptance Criteria:**

**Given** um Titular
**When** ele informa um email no InviteForm e clica em "Convidar"
**Then** o sistema envia email de convite via Resend

**Given** o email do convidado já possui conta no sistema
**When** o convite é enviado
**Then** o link redireciona para aceitar o convite diretamente

**Given** o email do convidado não possui conta
**When** o convite é enviado
**Then** o link redireciona para criar conta como Visualizador

**Given** um Visualizador acessa o dashboard do Titular que o convidou
**When** autenticado
**Then** ele vê os mesmos dados, mas sem botões de criar/editar/excluir

