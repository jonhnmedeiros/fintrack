# Modelos de Dados

## Schema ER (Prisma)

### User
| Campo | Tipo | Atributos |
|---|---|---|
| id | String | `@id @default(cuid())` |
| email | String | `@unique` |
| name | String? | |
| emailVerified | DateTime? | |
| image | String? | |
| password | String? | bcrypt hash |
| **Relações** | | Account[], Session[], Category[], Transaction[], CreditCard[], Budget[], Asset[], InvestmentTransaction[], Alert[], Notification[] |

### Account (Auth.js)
| Campo | Tipo | Atributos |
|---|---|---|
| id | String | `@id @default(cuid())` |
| userId | String | FK → User |
| type/provider/providerAccountId | String | `@@unique([provider, providerAccountId])` |

### Session (Auth.js)
| Campo | Tipo | Atributos |
|---|---|---|
| id | String | `@id @default(cuid())` |
| sessionToken | String | `@unique` |
| userId | String | FK → User |
| expires | DateTime | |

### VerificationToken
| Campo | Tipo | Atributos |
|---|---|---|
| identifier | String | |
| token | String | `@unique` |
| expires | DateTime | `@@unique([identifier, token])` |

### Category
| Campo | Tipo | Atributos |
|---|---|---|
| id | String | `@id @default(cuid())` |
| name | String | |
| type | CategoryType | `INCOME` / `EXPENSE` |
| color | String? | HEX |
| icon | String? | Lucide icon name |
| userId | String | FK → User |
| **Únicos** | | `@@unique([userId, id])`, `@@unique([userId, name, type])` |
| **Relações** | | Transaction[], Budget[] |

### Transaction
| Campo | Tipo | Atributos |
|---|---|---|
| id | String | `@id @default(cuid())` |
| type | TransactionType | `INCOME` / `EXPENSE` / `TRANSFER` |
| amount | Decimal | |
| description | String? | |
| date | DateTime | |
| categoryId | String? | FK → Category |
| creditCardId | String? | FK → CreditCard |
| installmentNumber | Int? | |
| totalInstallments | Int? | |
| userId | String | FK → User |

### CreditCard
| Campo | Tipo | Atributos |
|---|---|---|
| id | String | `@id @default(cuid())` |
| name | String | |
| billingDay | Int? | |
| closingDay | Int? | |
| limit | Decimal? | |
| userId | String | FK → User |
| **Relações** | | Transaction[] |

### Budget
| Campo | Tipo | Atributos |
|---|---|---|
| id | String | `@id @default(cuid())` |
| categoryId | String | FK → Category |
| amount | Decimal | Limite mensal |
| month | Int | 1-12 |
| year | Int | |
| userId | String | FK → User |
| **Único** | | `@@unique([userId, categoryId, month, year])` |

### Asset
| Campo | Tipo | Atributos |
|---|---|---|
| id | String | `@id @default(cuid())` |
| ticker | String | Ex: PETR4, BTC |
| name | String? | |
| type | AssetType | `STOCK` / `ETF` / `CRYPTO` / `FIIS` / `BOND` / `OTHER` |
| market | String? | |
| userId | String | FK → User |
| **Único** | | `@@unique([userId, ticker])` |
| **Relações** | | InvestmentTransaction[], Alert[] |

### InvestmentTransaction
| Campo | Tipo | Atributos |
|---|---|---|
| id | String | `@id @default(cuid())` |
| type | InvTransactionType | `BUY` / `SELL` / `DIVIDEND` / `TAX` |
| quantity | Decimal | |
| price | Decimal | |
| fees | Decimal? | `@default(0)` |
| taxes | Decimal? | `@default(0)` |
| date | DateTime | |
| assetId | String | FK → Asset |
| userId | String | FK → User |

### Alert
| Campo | Tipo | Atributos |
|---|---|---|
| id | String | `@id @default(cuid())` |
| type | AlertType | `PRICE` / `VOLUME` / `DIVIDEND` / `OTHER` |
| targetPrice | Decimal? | |
| message | String | |
| active | Boolean | `@default(true)` |
| assetId | String? | FK → Asset |
| userId | String | FK → User |

### Notification
| Campo | Tipo | Atributos |
|---|---|---|
| id | String | `@id @default(cuid())` |
| title | String | |
| body | String | |
| read | Boolean | `@default(false)` |
| userId | String | FK → User |

## Relacionamentos Principais

```
User ──┬── Category (1:N)
       ├── Transaction (1:N)
       ├── CreditCard (1:N)
       ├── Budget (1:N)
       ├── Asset (1:N)
       │     └── InvestmentTransaction (1:N)
       │     └── Alert (1:N)
       └── Notification (1:N)

Category ──┬── Transaction (1:N)
           └── Budget (1:N)

Asset ──┬── InvestmentTransaction (1:N)
        └── Alert (1:N)

CreditCard ── Transaction (1:N)
```
