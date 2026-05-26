# Contratos de API

## Autenticação

### POST `/api/auth/login`
- **Handler:** `app/routes/api/auth/login.ts`
- **Body:** `{ email: string, password: string }`
- **Response:** `200` — sessão criada via Auth.js
- **Auth:** Não requerida

### POST `/api/auth/logout`
- **Handler:** `app/routes/api/auth/logout.ts`
- **Response:** `200` — sessão destruída
- **Auth:** Requerida

## Orçamentos

### GET `/api/budgets`
- **Handler:** `app/routes/api/budgets/index.ts`
- **Query Params:** `?month=&year=`
- **Response:** `Budget[]` filtrado por userId + período
- **Auth:** Requerida

### POST `/api/budgets`
- **Handler:** `app/routes/api/budgets/index.ts`
- **Body:** `{ categoryId, amount, month, year }`
- **Auth:** Requerida

### PUT `/api/budgets`
- **Handler:** `app/routes/api/budgets/index.ts`
- **Body:** `{ id, categoryId, amount, month, year }`
- **Auth:** Requerida

### DELETE `/api/budgets`
- **Handler:** `app/routes/api/budgets/index.ts`
- **Body:** `{ id }`
- **Auth:** Requerida

## Categorias

### GET `/api/categories`
- **Handler:** `app/routes/api/categories/index.ts`
- **Query Params:** `?type=INCOME|EXPENSE`
- **Auth:** Requerida

### POST `/api/categories`
- **Handler:** `app/routes/api/categories/index.ts`
- **Body:** `{ name, type, color?, icon? }`
- **Auth:** Requerida

### PUT `/api/categories`
- **Handler:** `app/routes/api/categories/index.ts`
- **Body:** `{ id, name, type, color?, icon? }`
- **Auth:** Requerida

### DELETE `/api/categories`
- **Handler:** `app/routes/api/categories/index.ts`
- **Body:** `{ id }`
- **Auth:** Requerida

## Transações

### GET `/api/transactions`
- **Handler:** `app/routes/api/transactions/index.ts`
- **Query Params:** `?type=&search=&page=&limit=`
- **Response:** `{ transactions, total, page, totalPages }`
- **Auth:** Requerida

### POST `/api/transactions`
- **Handler:** `app/routes/api/transactions/index.ts`
- **Body:** `{ type, amount, description?, date, categoryId?, creditCardId?, installmentNumber?, totalInstallments? }`
- **Auth:** Requerida

### DELETE `/api/transactions`
- **Handler:** `app/routes/api/transactions/index.ts`
- **Body:** `{ id }`
- **Auth:** Requerida

## Cartões de Crédito

### GET `/api/credit-cards`
- **Handler:** `app/routes/api/credit-cards/index.ts`
- **Auth:** Requerida

### POST `/api/credit-cards`
- **Handler:** `app/routes/api/credit-cards/index.ts`
- **Body:** `{ name, billingDay?, closingDay?, limit? }`
- **Auth:** Requerida

### PUT `/api/credit-cards`
- **Handler:** `app/routes/api/credit-cards/index.ts`
- **Body:** `{ id, name?, billingDay?, closingDay?, limit? }`
- **Auth:** Requerida

## Ativos (Investimentos)

### GET `/api/assets`
- **Handler:** `app/routes/api/assets/index.ts`
- **Auth:** Requerida

### POST `/api/assets`
- **Handler:** `app/routes/api/assets/index.ts`
- **Body:** `{ ticker, name?, type, market? }`
- **Auth:** Requerida

### DELETE `/api/assets`
- **Handler:** `app/routes/api/assets/index.ts`
- **Body:** `{ id }`
- **Auth:** Requerida

## Transações de Investimento

### GET `/api/investment-transactions`
- **Handler:** `app/routes/api/investment-transactions/index.ts`
- **Query Params:** `?assetId=`
- **Auth:** Requerida

### POST `/api/investment-transactions`
- **Handler:** `app/routes/api/investment-transactions/index.ts`
- **Body:** `{ type, quantity, price, fees?, taxes?, date, assetId }`
- **Auth:** Requerida

## Alertas

### GET `/api/alerts`
- **Handler:** `app/routes/api/alerts/index.ts`
- **Auth:** Requerida

### POST `/api/alerts`
- **Handler:** `app/routes/api/alerts/index.ts`
- **Body:** `{ type, targetPrice?, message, active, assetId? }`
- **Auth:** Requerida

### PUT `/api/alerts`
- **Handler:** `app/routes/api/alerts/index.ts`
- **Body:** `{ id, type?, targetPrice?, message?, active?, assetId? }`
- **Auth:** Requerida

### DELETE `/api/alerts`
- **Handler:** `app/routes/api/alerts/index.ts`
- **Body:** `{ id }`
- **Auth:** Requerida

## Notificações

### GET `/api/notifications`
- **Handler:** `app/routes/api/notifications/index.ts`
- **Auth:** Requerida

### POST `/api/notifications`
- **Handler:** `app/routes/api/notifications/index.ts`
- **Body:** `{ title, body }`
- **Auth:** Requerida

### PUT `/api/notifications`
- **Handler:** `app/routes/api/notifications/index.ts`
- **Body:** `{ id, read }`
- **Auth:** Requerida
