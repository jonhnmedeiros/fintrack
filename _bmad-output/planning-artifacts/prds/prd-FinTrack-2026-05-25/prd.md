---
title: FinTrack
status: final
created: 2026-05-25
updated: 2026-05-25
---

# PRD: FinTrack

## 0. Document Purpose

Este PRD define o escopo, funcionalidades e critérios de sucesso do FinTrack — um sistema de controle financeiro e investimentos. Destinado à equipe de desenvolvimento e futuros workflows de arquitetura, UX e épicos. O documento está estruturado em Visão, Público-Alvo, Glossário, Funcionalidades agrupadas com FRs aninhadas, e demais seções de suporte. Suposições estão marcadas inline com `[ASSUMPTION]`.

## 1. Visão

O FinTrack é um sistema de controle financeiro e de investimentos que oferece dashboards visuais para uma visão geral da saúde financeira do usuário, com entrada de dados flexível — tanto manual quanto por importação de documentos (notas de corretagem). O objetivo é consolidar em um só lugar gastos do dia a dia, cartão de crédito e investimentos (ações, FIIs, CDB, Tesouro Direto), com classificação inteligente para entender para onde o dinheiro está indo e como está sendo investido.

## 2. Público-Alvo

### 2.1 Persona Primária — Titular

Indivíduo que gerencia suas próprias finanças pessoais e investimentos. Quer controle sobre gastos (conta corrente, cartão de crédito), entendimento de para onde o dinheiro vai e acompanhamento detalhado da rentabilidade da carteira de investimentos (preço médio, notas de corretagem).

### 2.2 Persona Secundária — Visualizador

Indivíduo que acompanha as finanças de um titular sem poder editar os dados. Pode ser cônjuge, familiar ou consultor. Acessa dashboards e visão consolidada.

### 2.3 Jobs To Be Done

- Saber para onde o dinheiro está indo
- Controlar se o orçamento está sendo cumprido
- Acompanhar rentabilidade dos investimentos
- Ter visão consolidada do patrimônio
- Acompanhar a saúde financeira de terceiros (visualizador)

### 2.4 Key User Journeys

**UJ-1. Titular acompanha a saúde financeira no dia a dia**

- **Persona + contexto:** Titular, já autenticado, abre o sistema para ver como estão as finanças
- **Entry state:** Autenticado, na dashboard
- **Path:**
  1. Abre o sistema e visualiza a dashboard com visão geral (saldo, receitas, despesas, investimentos, rentabilidade)
  2. Identifica algo que precisa registrar
  3. Clica no botão de ação rápida
  4. Escolhe entre gasto, investimento ou transferência
  5. Preenche os dados e salva
  6. Visualiza o reflexo da alteração na dashboard
- **Climax:** O dado é registrado e o dashboard reflete a atualização
- **Resolution:** Continua navegando ou fecha o sistema
- **Edge case:** Se o usuário não está autenticado, é redirecionado ao login

## 3. Glossário

- **Titular** — Usuário que gerencia suas próprias finanças (receitas, despesas, investimentos)
- **Visualizador** — Usuário com acesso somente leitura às finanças de um Titular
- **Transação** — Movimentação financeira de receita, despesa ou transferência. Pertence a um Titular
- **Categoria** — Classificação de transações por tipo (INCOME / EXPENSE). Única por combinação de nome, tipo e usuário
- **Cartão de Crédito** — Conta de cartão de crédito com limite, dia de fechamento e dia de vencimento. Pertence a um Titular
- **Orçamento** — Limite mensal definido por categoria, mês e ano. Único por combinação de categoria, mês, ano e usuário
- **Investimento** — Aplicação em ativos (ações, ETFs, FIIs, cripto, renda fixa)
- **Ativo** — Papel ou aplicação financeira identificado por ticker. Possui tipo (STOCK/ETF/CRYPTO/FII/BOND/OTHER) e preço médio. Único por ticker e usuário
- **Nota de Corretagem** — Documento que registra operações de compra/venda de ativos, utilizado para importação
- **Transação de Investimento** — Movimentação de compra (BUY), venda (SELL), dividendo (DIVIDEND) ou taxa (TAX) de um ativo
- **Preço Médio** — Custo médio ponderado de um ativo, considerando todas as compras realizadas
- **Alerta** — Configuração de notificação por tipo de ativo (preço, volume, dividendo). Pertence a um Titular
- **Notificação** — Mensagem gerada pelo sistema para o usuário. Possui status de leitura

## 4. Features

### 4.1 Dashboard

**Descrição:** O Dashboard é a tela inicial do sistema, exibindo uma visão geral da saúde financeira do Titular. Deve consolidar dados de transações, investimentos e orçamentos em cards de resumo e gráficos interativos. Realiza UJ-1.

**Functional Requirements:**

#### FR-1: Visualizar cards de resumo financeiro

O Titular pode visualizar cards com Receitas do período, Despesas do período, Saldo atual e Valor total investido.

**Consequences (testable):**
- Cada card exibe o valor formatado em moeda (BRL)
- Os valores refletem os dados cadastrados pelo usuário

#### FR-2: Visualizar gráfico de fluxo de caixa

O Titular pode visualizar um gráfico de área (AreaChart) com receitas vs. despesas dos últimos 6 meses.

**Consequences (testable):**
- O gráfico mostra barras/linhas para receitas e despesas mês a mês
- Os dados são agregados por mês

#### FR-3: Visualizar gráfico de despesas por categoria

O Titular pode visualizar um gráfico de pizza (PieChart) com distribuição de despesas por categoria no período.

**Consequences (testable):**
- Cada fatia representa uma categoria com cor distinta
- Exibe o valor e percentual ao passar o mouse

#### FR-4: Visualizar transações recentes

O Titular pode visualizar as 10 transações mais recentes na dashboard.

**Consequences (testable):**
- Exibe data, descrição, categoria e valor
- Valores positivos (receitas) e negativos (despesas) com cores distintas

#### FR-5: Visualizar gráfico de rentabilidade dos investimentos

O Titular pode visualizar um gráfico de curva comparando patrimônio investido vs. valor de mercado ao longo do tempo, evidenciando ganhos e perdas.

**Consequences (testable):**
- O gráfico exibe duas curvas: valor investido (custo) e valor de mercado (atual)
- A diferença entre as curvas representa ganho/perda
- Os dados são calculados a partir das transações de investimento e cotações
- `[ASSUMPTION]` Cotações serão obtidas via API externa (Google Finance ou similar)

#### FR-6: Exibir cotações atuais dos ativos

O Titular pode visualizar o preço atual e a variação dos ativos da carteira.

**Consequences (testable):**
- Exibe ticker, preço atual e variação (percentual)
- Dados obtidos de API externa de cotações
- `[ASSUMPTION]` API de cotações a definir (Google Finance, Yahoo Finance, Brasil API)

### 4.2 Transações

**Descrição:** O módulo de transações permite ao Titular registrar, visualizar, editar e excluir movimentações financeiras (receitas, despesas e transferências). Suporta parcelamento para compras no cartão de crédito e classificação por categoria. Realiza UJ-1.

**Functional Requirements:**

#### FR-7: Listar transações com filtros

O Titular pode visualizar a lista de transações em uma tabela com colunas de data, descrição, categoria, valor e ações. Deve ser possível filtrar por tipo, período e categoria.

**Consequences (testable):**
- A tabela exibe as transações do usuário ordenadas por data decrescente
- Filtros alteram a lista exibida sem recarregar a página
- Valores de despesa em vermelho, receitas em verde

#### FR-8: Criar transação

O Titular pode registrar uma nova transação informando tipo (receita/despesa/transferência), valor, descrição, categoria, data, e opcionalmente cartão de crédito com parcelamento.

**Consequences (testable):**
- Ao selecionar cartão de crédito com parcelas > 1, o sistema gera N transações mensais automaticamente
- A transação é vinculada ao usuário autenticado

#### FR-9: Excluir transação

O Titular pode excluir uma transação existente, incluindo todas as parcelas geradas.

**Consequences (testable):**
- A transação é removida do banco de dados
- Ao excluir uma transação parcelada, todas as parcelas são removidas

#### FR-10: Gerenciar categorias

O Titular pode criar, editar e excluir categorias de transações (tipo INCOME ou EXPENSE).

**Consequences (testable):**
- Categorias com nome único por tipo e usuário
- Ao excluir uma categoria, transações existentes mantêm a referência (nulo)

### 4.3 Cartão de Crédito

**Descrição:** O módulo de cartão de crédito permite ao Titular gerenciar cartões com limite, dia de fechamento e vencimento. Transações podem ser vinculadas a cartões com parcelamento automático.

**Functional Requirements:**

#### FR-11: Gerenciar cartões de crédito

O Titular pode criar e excluir cartões de crédito informando nome, limite, dia de fechamento e dia de vencimento.

**Consequences (testable):**
- Cartões são vinculados ao usuário autenticado
- Ao excluir um cartão, transações vinculadas mantêm a referência

### 4.4 Orçamentos

**Descrição:** O módulo de orçamento permite ao Titular definir limites mensais de gastos por categoria e visualizar o progresso de cada orçamento.

**Functional Requirements:**

#### FR-12: Gerenciar orçamentos mensais

O Titular pode criar e excluir orçamentos definindo categoria, valor limite, mês e ano.

**Consequences (testable):**
- Orçamento único por combinação de categoria, mês e ano por usuário
- Atualização (upsert) sobrescreve o valor existente

#### FR-13: Visualizar progresso do orçamento

O Titular pode visualizar o progresso de cada orçamento com barra de progresso e valor gasto vs. limite.

**Consequences (testable):**
- A barra de progresso reflete o total de despesas da categoria no período
- `[ASSUMPTION]` Progresso exibido em cards na página de orçamentos

### 4.5 Investimentos

**Descrição:** O módulo de investimentos permite ao Titular gerenciar sua carteira de ativos (ações, FIIs, ETFs, cripto, renda fixa), registrar compras/vendas, calcular preço médio automaticamente, acompanhar rentabilidade e importar notas de corretagem.

**Functional Requirements:**

#### FR-14: Gerenciar ativos da carteira

O Titular pode cadastrar e excluir ativos informando ticker, nome, tipo (STOCK/ETF/CRYPTO/FII/BOND/OTHER) e mercado.

**Consequences (testable):**
- Ativo único por ticker e usuário
- Exclusão permitida apenas se não houver transações vinculadas

#### FR-15: Registrar transações de investimento

O Titular pode registrar compra (BUY), venda (SELL), dividendo (DIVIDEND) e taxa (TAX) de ativos.

**Consequences (testable):**
- Quantidade e preço registrados com até 4 casas decimais
- Compra aumenta quantidade do ativo; venda reduz
- Preço médio é recalculado automaticamente a cada compra

#### FR-16: Visualizar carteira de investimentos

O Titular pode visualizar sua carteira com posição atual de cada ativo: ticker, tipo, quantidade, preço médio, valor investido, preço atual, valor de mercado, ganho/perda.

**Consequences (testable):**
- Valor investido = quantidade × preço médio
- Valor de mercado = quantidade × preço atual (via API de cotações)
- Ganho/perda = valor de mercado − valor investido
- `[ASSUMPTION]` Preço atual obtido via API externa

#### FR-17: Importar nota de corretagem

O Titular pode importar arquivos PDF de notas de corretagem para registrar automaticamente as transações de investimento.

**Consequences (testable):**
- O sistema processa o PDF e extrai operações de compra/venda
- As transações extraídas são registradas na carteira
- Preço médio é recalculado automaticamente
- Suporte inicial para notas da BTG Pactual e Inter
- **Out of Scope:** Importação de extratos bancários

#### FR-18: Exportar dados de investimentos

O Titular pode exportar os dados da carteira (preço médio, quantidades, histórico de transações) para um arquivo portável.

**Consequences (testable):**
- Arquivo gerado em formato estruturado (CSV/JSON)
- Dados suficientes para recriar o preço médio em outra corretora

### 4.6 Multiusuário

**Descrição:** O sistema oferece dois papéis: Titular (acesso completo) e Visualizador (acesso somente leitura). O cadastro é feito por email e senha. Titulares podem convidar Visualizadores para acompanhar suas finanças.

**Functional Requirements:**

#### FR-19: Cadastro de usuário

Qualquer pessoa pode criar uma conta informando email e senha, tornando-se um Titular.

**Consequences (testable):**
- Email único no sistema
- Senha armazenada com hash (bcrypt)
- Ao criar conta, o usuário é autenticado automaticamente

#### FR-20: Login

O Titular ou Visualizador pode autenticar-se com email e senha.

**Consequences (testable):**
- Sessão gerenciada via JWT (NextAuth)
- Login inválido retorna erro 401
- `[ASSUMPTION]` Mantido NextAuth (Auth.js) com PrismaAdapter e Credentials Provider

#### FR-21: Convidar visualizador

O Titular pode convidar uma pessoa para visualizar suas finanças, informando email da pessoa.

**Consequences (testable):**
- `[ASSUMPTION]` O convidado recebe um email com link para criar conta como Visualizador
- `[ASSUMPTION]` O Visualizador vê os dashboards do Titular sem permissão de edição

#### FR-22: Isolamento de dados

Cada usuário acessa apenas seus próprios dados financeiros, ou dados de Titulares que o convidaram como Visualizador.

**Consequences (testable):**
- Todas as queries de banco são escopadas por userId
- Visualizador não pode criar, editar ou excluir dados

### 4.7 Alertas e Notificações

**Descrição:** O sistema permite configurar alertas sobre ativos (preço, volume) e exibe notificações para o usuário.

**Functional Requirements:**

#### FR-23: Gerenciar alertas de ativos

O Titular pode criar e remover alertas por tipo (PRICE/VOLUME/DIVIDEND/OTHER) com valor alvo opcional.

**Consequences (testable):**
- Alertas são vinculados a ativos específicos ou genéricos
- Remoção marca como inativo (soft-delete)

#### FR-24: Visualizar notificações

O Titular pode visualizar notificações do sistema e marcá-las como lidas.

**Consequences (testable):**
- Notificações listadas por data decrescente
- Ao marcar como lida, não aparece mais como não lida

## 5. Não-Objetivos (v1)

- Agregação bancária automática (conciliação via importação manual)
- Conexão com instituições financeiras via API bancária
- Aplicativo mobile nativo (web responsivo apenas)
- Plano de assinatura / monetização
- Suporte a múltiplos perfis de investimento por usuário
- OCR de notas fiscais para despesas
- Metas financeiras (adiado para v2)

## 6. Escopo MVP

### 6.1 In Scope

- Dashboard com visão geral + gráfico de rentabilidade
- CRUD de transações, categorias, cartões de crédito, orçamentos
- Cadastro de usuário (sign-up com email e senha)
- Página de Investimentos (carteira, preço médio, transações)
- Importação de notas de corretagem (PDF)
- Exportação de dados de investimentos
- Papel de Visualizador (convidar + acesso read-only)
- Alertas e notificações

### 6.2 Out of Scope for MVP

- Metas financeiras — página stubbed, adiado para v2
- Página de configurações — adiado para v2
- Integração com API de cotações externa — adiado (cotações podem ser inseridas junto com as notas)

## 7. Sucess Metrics

**Primary**
- **SM-1**: Usuários ativos usam o sistema semanalmente por mais de 3 meses consecutivos. Valida FR-1 a FR-24.

**Secondary**
- **SM-2**: Dados de investimento mantidos com preço médio correto após importação de notas de corretagem. Valida FR-17.

## 8. Open Questions

1. ~~Formato de nota de corretagem~~ Suportar PDF das corretoras BTG Pactual e Inter inicialmente
2. **API de cotações** — Encontrar API gratuita (Yahoo Finance, Brasil API, etc.). Decidir na arquitetura
3. ~~Cadastro com confirmação de email~~ Apenas email + senha, sem verificação
4. **Convite do Visualizador** — Titular envia convite e o convidado cria conta com papel de Visualizador. Detalhar na arquitetura
5. ~~Autenticação~~ Mantido NextAuth (Auth.js) com PrismaAdapter e Credentials Provider

## 9. Assumptions Index

- **§4.1 FR-5**: Cotações serão obtidas via API externa a definir
- **§4.1 FR-6**: API de cotações a definir (Google Finance, Yahoo Finance, Brasil API)
- **§4.4 FR-13**: Progresso de orçamento exibido em cards na página de orçamentos
- **§4.5 FR-16**: Preço atual obtido via API externa
- **§4.5 FR-17**: Formato PDF suportado para corretoras brasileiras
- **§4.6 FR-20**: Mantido NextAuth com PrismaAdapter e Credentials Provider
- **§4.6 FR-21**: Convidado recebe email com link para criar conta como Visualizador
- **§4.6 FR-21**: Visualizador vê dashboards do Titular sem permissão de edição
