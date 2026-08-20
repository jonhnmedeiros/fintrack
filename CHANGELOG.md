# Changelog

Todas as mudanças notáveis do FinTrack são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o
projeto adota [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2026-08-19

### Added
- **Tesouro Direto** como novo tipo de ativo em Investimentos (Tesouro Selic,
  Prefixado e IPCA+), reaproveitando o mesmo fluxo de renda fixa do CDB.
- Busca da taxa **Selic** em tempo real (Banco Central) para valorizar
  títulos Tesouro Selic, além do CDI e IPCA já usados pelo CDB.
- **Cotação real da B3** (via brapi.dev) no card de cada ação/ETF/FII —
  "Cotação atual" e "Valor atualizado" deixam de depender do preço da
  última transação lançada, que ficava desatualizado com o tempo.
- **Rentabilidade em todos os cards de ativo** (ações, ETFs, cripto, FIIs),
  não só CDB/Tesouro: "Valor atualizado" e "Rentabilidade" (verde/vermelho).
- **Débito/crédito automático na conta** ao registrar uma transação de
  investimento (compra, venda, aporte, resgate, dividendo, taxa) — com
  pré-seleção da conta do tipo "Investimento", quando existir.
- **Categoria padrão configurável** (Configurações → Investimentos) pros
  lançamentos de conta gerados automaticamente por transações de
  investimento — uma categoria pra débitos, outra pra créditos.
- **Edição do tipo de um ativo já cadastrado** (ex: corrigir um FII lançado
  como Ação), sem perder o histórico de transações.
- Tipo de transação **Bonificação** em investimentos — ações recebidas sem
  custo, sem afetar o total investido.
- Botão **"Copiar orçamento do mês anterior"** em Orçamentos.

### Fixed
- Orçamento de categoria-pai agora soma os gastos lançados nas
  subcategorias (antes só contava a categoria exata).
- Card "Investido" do Dashboard exibindo valores absurdos (bug de
  concatenação de string ao somar `quantity`/`price` vindos como texto da
  API).
- Gráfico de rentabilidade de Investimentos calculando errado para CDB
  (tratava resgates como venda de cota a preço médio) e ignorando
  transações de Bonificação.
- Preferência de categoria de investimento (débito/crédito) sendo zerada
  ao salvar a outra.
- Taxa contratada de renda fixa exibida com imprecisão de ponto flutuante
  (ex: "8.140000000000001%" em vez de "8,14%").

## [1.0.3] - 2026-08-07

### Fixed
- CI: re-execução após instabilidade de infraestrutura do GitHub Actions
  (job não atendido em 15min — não era falha de código).

## [1.0.2] - 2026-08-06

### Added
- Data digitável no formato `dd/mm/aaaa` e valores em Real (R$) nos campos
  de transação de investimentos.
- Seletor único de data com navegação por mês/ano (dropdown), em vez de
  navegar mês a mês.

### Fixed
- Revisão completa de responsividade mobile: navegação, cabeçalhos e
  tabelas (botão crítico inacessível em Investimentos, tabelas viram
  cards empilhados, menu inferior virou dropdown superior).
- Formato de data padronizado (`dd/MM/yyyy`, compacto) em todas as listas.

## [1.0.1] - 2026-08-05

### Added
- Suporte a **CDB** (renda fixa) em Investimentos, com valorização
  automática via taxa CDI/IPCA do Banco Central — inclui a modalidade
  "caixinha" (CDB de liquidez diária, sem data de vencimento).
- Conceito de **Contas/Carteiras** (Wallets).

### Fixed
- Transações salvas aparecendo com um dia a menos (bug de timezone).
- Card "Investido" do Dashboard retornando `NaN`.
- Campo "Nome" do formulário de Contas não aceitava digitação.

## [1.0.0] - 2026-07-19

Lançamento inicial em produção (Vercel), migrado de Next.js para
[TanStack Start](https://tanstack.com/start).

### Added
- Dashboard com resumo financeiro, seletor de período, gráfico de fluxo de
  caixa e maiores gastos por categoria.
- Transações (receita/despesa/transferência), com parcelamento em cartão
  de crédito.
- Categorias com hierarquia (pai/filha).
- Orçamentos mensais por categoria.
- Investimentos: ativos, transações, alertas de preço, e importação de
  nota de corretagem (parser com extração de data e deduplicação).
- Cartões de crédito.
- Autenticação (Auth.js/NextAuth, credenciais).
- Multiusuário: convite de Visualizador (acesso somente leitura).
- Testes automatizados (Vitest + Playwright) e CI/CD no GitHub Actions.
