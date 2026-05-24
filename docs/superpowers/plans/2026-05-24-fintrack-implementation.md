# FinTrack Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal finance and investment tracking application with SSR, authentication, and multi-tenant data isolation.

**Architecture:** Monolithic modular app using TanStack Start (SSR + routing + API routes), Prisma ORM with PostgreSQL, Auth.js for authentication, and feature-sliced architecture for finance and investment domains.

**Tech Stack:** React 18, TanStack Start, TanStack Router, TanStack Query, TanStack Table, Tailwind CSS, shadcn/ui, Zustand, Recharts, Prisma, PostgreSQL, Auth.js (next-auth), Zod, React Hook Form, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-05-24-fintrack-design.md`

---

## Chunk 1: Project Setup & Infrastructure

### Task 1: Install TanStack Start & Migrate from Vite

**Files:**
- Modify: `package.json`
- Delete: `vite.config.ts`
- Delete: `src/main.tsx`
- Create: `app.config.ts`
- Create: `app/client.tsx`
- Create: `app/ssr.tsx`
- Create: `app/routes/__root.tsx`
- Create: `app/globals.css`
- Modify: `tsconfig.json`
- Modify: `tailwind.config.js`
- Modify: `index.html`

- [ ] **Step 1: Install TanStack Start dependencies**

```bash
npm install @tanstack/start
npm install -D @tanstack/router-plugin
```

- [ ] **Step 2: Update package.json scripts**

```json
{
  "scripts": {
    "dev": "vinxi dev",
    "build": "vinxi build",
    "start": "vinxi start",
    "lint": "eslint . --ext ts,tsx",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 3: Create app.config.ts**

```typescript
import { defineConfig } from '@tanstack/start/config'
import tsr from '@tanstack/router-plugin/vite'

export default defineConfig({
  vite: {
    plugins: [
      tsr({
        routesDirectory: './app/routes',
        generatedRouteTree: './app/routeTree.gen.ts',
      }),
    ],
  },
})
```

- [ ] **Step 4: Create app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
```

- [ ] **Step 5: Create app/client.tsx**

```typescript
import { StartClient } from '@tanstack/start'
import { createRouter } from '@tanstack/start'
import { createRoot } from 'react-dom/client'
import { routeTree } from './routeTree.gen'
import './globals.css'

const router = createRouter({ routeTree })

declare module '@tanstack/start' {
  interface Register {
    router: typeof router
  }
}

const rootEl = document.getElementById('root')!
createRoot(rootEl).render(<StartClient router={router} />)
```

- [ ] **Step 6: Create app/ssr.tsx**

```typescript
import { createStartHandler, defaultStreamHandler } from '@tanstack/start'
import { createRouter } from '@tanstack/start'
import { getRouterManifest } from '@tanstack/start/server'
import { routeTree } from './routeTree.gen'

const handler = createStartHandler({
  createRouter,
  getRouterManifest,
  routeTree,
})

export default defaultStreamHandler(handler)
```

- [ ] **Step 7: Create app/routes/__root.tsx (placeholder, no Layout yet)**

```typescript
import { createRootRoute, Outlet } from '@tanstack/start'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen">
      <Outlet />
    </div>
  ),
})
```

- [ ] **Step 8: Update tsconfig.json**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./app/*"]
    }
  }
}
```

- [ ] **Step 9: Delete old files**

```bash
rm -f vite.config.ts
rm -f src/main.tsx
rm -rf src/components
rm -rf src/hooks
rm -rf src/lib
rm -rf src/pages
rm -rf src/store
rm -rf src/types
rm -f src/index.css
```

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: migrate to TanStack Start"
```

### Task 2: Setup Prisma & PostgreSQL Schema

**Files:**
- Create: `prisma/schema.prisma`
- Create: `app/lib/db.ts`
- Create: `.env.example`

- [ ] **Step 1: Install Prisma**

```bash
npm install @prisma/client
npm install -D prisma
```

- [ ] **Step 2: Initialize Prisma**

```bash
npx prisma init
```

- [ ] **Step 3: Create prisma/schema.prisma**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  image         String?
  password      String?
  accounts      Account[]
  sessions      Session[]
  categories    Category[]
  transactions  Transaction[]
  creditCards   CreditCard[]
  budgets       Budget[]
  assets        Asset[]
  investmentTransactions InvestmentTransaction[]
  alerts        Alert[]
  notifications Notification[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

enum CategoryType {
  INCOME
  EXPENSE
}

model Category {
  id          String       @id @default(cuid())
  name        String
  type        CategoryType
  color       String?
  icon        String?
  userId      String
  transactions Transaction[]
  budgets     Budget[]
  @@unique([userId, id])
  @@unique([userId, name, type])
}

enum TransactionType {
  INCOME
  EXPENSE
  TRANSFER
}

model Transaction {
  id                String       @id @default(cuid())
  type              TransactionType
  amount            Decimal
  description       String?
  date              DateTime
  categoryId        String?
  category          Category?    @relation(fields: [categoryId], references: [id])
  creditCardId      String?
  creditCard        CreditCard?  @relation(fields: [creditCardId], references: [id])
  installmentNumber Int?
  totalInstallments Int?
  userId            String
}

model CreditCard {
  id          String       @id @default(cuid())
  name        String
  billingDay  Int?
  closingDay  Int?
  limit       Decimal?
  userId      String
  transactions Transaction[]
}

model Budget {
  id         String   @id @default(cuid())
  categoryId String
  amount     Decimal
  month      Int
  year       Int
  userId     String
  category   Category @relation(fields: [categoryId], references: [id])
  @@unique([userId, categoryId, month, year])
}

enum AssetType {
  STOCK
  ETF
  CRYPTO
  FIIS
  BOND
  OTHER
}

model Asset {
  id          String    @id @default(cuid())
  ticker      String
  name        String?
  type        AssetType
  market      String?
  userId      String
  transactions InvestmentTransaction[]
  alerts      Alert[]
  @@unique([userId, ticker])
}

enum InvTransactionType {
  BUY
  SELL
  DIVIDEND
  TAX
}

model InvestmentTransaction {
  id        String          @id @default(cuid())
  type      InvTransactionType
  quantity  Decimal
  price     Decimal
  fees      Decimal?        @default(0)
  taxes     Decimal?        @default(0)
  date      DateTime
  assetId   String
  asset     Asset           @relation(fields: [assetId], references: [id], onDelete: Cascade)
  userId    String
}

enum AlertType {
  PRICE
  VOLUME
  DIVIDEND
  OTHER
}

model Alert {
  id          String    @id @default(cuid())
  type        AlertType
  targetPrice Decimal?
  message     String
  active      Boolean   @default(true)
  assetId     String?
  asset       Asset?    @relation(fields: [assetId], references: [id], onDelete: Cascade)
  userId      String
}

model Notification {
  id     String   @id @default(cuid())
  title  String
  body   String
  read   Boolean  @default(false)
  userId String
}
```

- [ ] **Step 4: Create app/lib/db.ts**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 5: Create .env.example**

```
DATABASE_URL="postgresql://user:password@localhost:5432/fintrack"
AUTH_SECRET="your-secret-here"
AUTH_URL="http://localhost:5173"
```

- [ ] **Step 6: Run initial migration**

```bash
npx prisma generate
npx prisma migrate dev --name init
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: setup Prisma with PostgreSQL schema"
```

### Task 3: Setup Auth.js (NextAuth)

**Files:**
- Create: `app/lib/auth.ts`
- Create: `app/routes/api/auth/$.ts`
- Install: `next-auth`, `@auth/prisma-adapter`, `bcryptjs`

- [ ] **Step 1: Install Auth.js dependencies**

```bash
npm install next-auth @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **Step 2: Create app/lib/auth.ts**

```typescript
import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './db'
import bcrypt from 'bcryptjs'

export const { handlers: authHandlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) return null

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub as string,
      },
    }),
  },
  pages: {
    signIn: '/login',
  },
})
```

- [ ] **Step 3: Create app/routes/api/auth/$.ts**

```typescript
import { createAPIFileRoute } from '@tanstack/start'
import { authHandlers } from '@/lib/auth'

export const APIRoute = createAPIFileRoute('/api/auth/$')({
  GET: authHandlers.GET,
  POST: authHandlers.POST,
})
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: setup Auth.js with credentials provider"
```

### Task 4: Create Multi-tenant DB Helper & Route Guards

**Files:**
- Create: `app/lib/tenant-db.ts`
- Modify: `app/routes/__root.tsx`

- [ ] **Step 1: Create app/lib/tenant-db.ts**

```typescript
import { prisma } from './db'
import { auth } from './auth'

export async function userDb() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized: no user session')
  }
  const userId = session.user.id

  return {
    transaction: {
      findMany: (args?: Parameters<typeof prisma.transaction.findMany>[0]) =>
        prisma.transaction.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.transaction.create>[0]) =>
        prisma.transaction.create({ ...args, data: { ...args.data, userId } }),
      update: (args: Parameters<typeof prisma.transaction.update>[0]) =>
        prisma.transaction.update({ ...args, data: { ...args.data, userId } }),
      delete: (args: Parameters<typeof prisma.transaction.delete>[0]) =>
        prisma.transaction.delete(args),
    },
    category: {
      findMany: (args?: Parameters<typeof prisma.category.findMany>[0]) =>
        prisma.category.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.category.create>[0]) =>
        prisma.category.create({ ...args, data: { ...args.data, userId } }),
      update: (args: Parameters<typeof prisma.category.update>[0]) =>
        prisma.category.update({ ...args, data: { ...args.data, userId } }),
      delete: (args: Parameters<typeof prisma.category.delete>[0]) =>
        prisma.category.delete(args),
    },
    creditCard: {
      findMany: (args?: Parameters<typeof prisma.creditCard.findMany>[0]) =>
        prisma.creditCard.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.creditCard.create>[0]) =>
        prisma.creditCard.create({ ...args, data: { ...args.data, userId } }),
    },
    budget: {
      findMany: (args?: Parameters<typeof prisma.budget.findMany>[0]) =>
        prisma.budget.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.budget.create>[0]) =>
        prisma.budget.create({ ...args, data: { ...args.data, userId } }),
    },
    asset: {
      findMany: (args?: Parameters<typeof prisma.asset.findMany>[0]) =>
        prisma.asset.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.asset.create>[0]) =>
        prisma.asset.create({ ...args, data: { ...args.data, userId } }),
    },
    investmentTransaction: {
      findMany: (args?: Parameters<typeof prisma.investmentTransaction.findMany>[0]) =>
        prisma.investmentTransaction.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.investmentTransaction.create>[0]) =>
        prisma.investmentTransaction.create({ ...args, data: { ...args.data, userId } }),
    },
    alert: {
      findMany: (args?: Parameters<typeof prisma.alert.findMany>[0]) =>
        prisma.alert.findMany({ ...args, where: { userId, ...args?.where } }),
      create: (args: Parameters<typeof prisma.alert.create>[0]) =>
        prisma.alert.create({ ...args, data: { ...args.data, userId } }),
    },
    notification: {
      findMany: (args?: Parameters<typeof prisma.notification.findMany>[0]) =>
        prisma.notification.findMany({ ...args, where: { userId, ...args?.where } }),
      update: (args: Parameters<typeof prisma.notification.update>[0]) =>
        prisma.notification.update(args),
    },
  }
}
```

- [ ] **Step 2: Update app/routes/__root.tsx with auth guard**

```typescript
import { createRootRoute, Outlet } from '@tanstack/start'
import { auth } from '@/lib/auth'

export const Route = createRootRoute({
  beforeLoad: async () => {
    const session = await auth()
    return { user: session?.user }
  },
  component: () => (
    <div className="min-h-screen">
      <Outlet />
    </div>
  ),
})
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add multi-tenant DB helper and route guards"
```

### Task 5: Setup shadcn/ui & Tailwind Theme

**Files:**
- Modify: `tailwind.config.js`
- Install: shadcn/ui dependencies

- [ ] **Step 1: Install shadcn/ui dependencies**

```bash
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-slot @radix-ui/react-dropdown-menu @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-checkbox @radix-ui/react-switch @radix-ui/react-label
npm install lucide-react
npm install zustand
npm install recharts
npm install react-hook-form @hookform/resolvers zod
npm install date-fns
```

- [ ] **Step 2: Create app/lib/utils.ts**

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date + 'T00:00:00'))
}
```

- [ ] **Step 3: Create shadcn/ui components**

Create `app/components/ui/button.tsx`:

```typescript
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

Create `app/components/ui/input.tsx`:

```typescript
import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
```

Create `app/components/ui/label.tsx`:

```typescript
import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
)

const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
```

Create `app/components/ui/card.tsx`:

```typescript
import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }
```

- [ ] **Step 4: Update tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
      },
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: Update index.html**

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FinTrack</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/app/client.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: setup shadcn/ui, Tailwind theme, and base UI components"
```

---

## Chunk 2: Finance Feature

### Task 6: Create Finance Feature Types & Zod Schemas

**Files:**
- Create: `app/features/finance/schemas.ts`

- [ ] **Step 1: Create app/features/finance/schemas.ts**

```typescript
import { z } from 'zod'

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().optional(),
  icon: z.string().optional(),
  userId: z.string(),
})

export const transactionSchema = z.object({
  id: z.string(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.string(),
  categoryId: z.string().optional(),
  creditCardId: z.string().optional(),
  installmentNumber: z.number().optional(),
  totalInstallments: z.number().optional(),
  userId: z.string(),
})

export const creditCardSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  billingDay: z.number().min(1).max(31).optional(),
  closingDay: z.number().min(1).max(31).optional(),
  limit: z.number().optional(),
  userId: z.string(),
})

export const budgetSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  amount: z.number().positive(),
  month: z.number().min(1).max(12),
  year: z.number(),
  userId: z.string(),
})

export const createTransactionSchema = transactionSchema.omit({ id: true, userId: true })
export const createCategorySchema = categorySchema.omit({ id: true, userId: true })
export const createCreditCardSchema = creditCardSchema.omit({ id: true, userId: true })
export const createBudgetSchema = budgetSchema.omit({ id: true, userId: true })
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add finance zod schemas"
```

### Task 7: Implement Category Management

**Files:**
- Create: `app/features/finance/api/categories.ts`
- Create: `app/routes/api/categories/index.ts`
- Create: `app/features/finance/hooks/useCategories.ts`

- [ ] **Step 1: Create app/features/finance/api/categories.ts**

```typescript
import { userDb } from '@/lib/tenant-db'
import { createCategorySchema } from '../schemas'

export async function listCategories() {
  const db = await userDb()
  return db.category.findMany({ orderBy: { name: 'asc' } })
}

export async function createCategory(data: unknown) {
  const validated = createCategorySchema.parse(data)
  const db = await userDb()
  return db.category.create({ data: validated })
}

export async function updateCategory(id: string, data: Partial<z.infer<typeof createCategorySchema>>) {
  const db = await userDb()
  return db.category.update({ where: { id }, data })
}

export async function deleteCategory(id: string) {
  const db = await userDb()
  return db.category.delete({ where: { id } })
}
```

Add `import { z } from 'zod'` at the top.

- [ ] **Step 2: Create app/routes/api/categories/index.ts**

```typescript
import { createAPIFileRoute } from '@tanstack/start'
import * as categoriesApi from '@/features/finance/api/categories'

export const APIRoute = createAPIFileRoute('/api/categories')({
  GET: async () => {
    const categories = await categoriesApi.listCategories()
    return Response.json(categories)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const category = await categoriesApi.createCategory(body)
    return Response.json(category)
  },
})
```

- [ ] **Step 3: Create app/routes/api/categories/$id.ts**

```typescript
import { createAPIFileRoute } from '@tanstack/start'
import * as categoriesApi from '@/features/finance/api/categories'

export const APIRoute = createAPIFileRoute('/api/categories/$id')({
  PUT: async ({ request, params }) => {
    const body = await request.json()
    const category = await categoriesApi.updateCategory(params.id, body)
    return Response.json(category)
  },
  DELETE: async ({ params }) => {
    await categoriesApi.deleteCategory(params.id)
    return new Response(null, { status: 204 })
  },
})
```

- [ ] **Step 4: Create app/features/finance/hooks/useCategories.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) =>
      fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetch(`/api/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: implement category CRUD API and hooks"
```

### Task 8: Implement Transaction Management

**Files:**
- Create: `app/features/finance/api/transactions.ts`
- Create: `app/routes/api/transactions/index.ts`
- Create: `app/routes/api/transactions/$id.ts`
- Create: `app/features/finance/hooks/useTransactions.ts`

- [ ] **Step 1: Create app/features/finance/api/transactions.ts**

```typescript
import { userDb } from '@/lib/tenant-db'
import { createTransactionSchema } from '../schemas'
import { prisma } from '@/lib/db'

export async function listTransactions(filters?: {
  type?: string
  categoryId?: string
  startDate?: string
  endDate?: string
}) {
  const db = await userDb()
  const where: Record<string, unknown> = {}
  if (filters?.type) where.type = filters.type
  if (filters?.categoryId) where.categoryId = filters.categoryId
  if (filters?.startDate || filters?.endDate) {
    where.date = {}
    if (filters.startDate) where.date.gte = new Date(filters.startDate)
    if (filters.endDate) where.date.lte = new Date(filters.endDate)
  }
  return db.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { category: true },
  })
}

export async function createTransaction(data: unknown) {
  const validated = createTransactionSchema.parse(data)
  const db = await userDb()

  if (validated.creditCardId && validated.totalInstallments && validated.totalInstallments > 1) {
    const installmentAmount = validated.amount / validated.totalInstallments
    const transactions = []
    for (let i = 1; i <= validated.totalInstallments; i++) {
      const installmentDate = new Date(validated.date)
      installmentDate.setMonth(installmentDate.getMonth() + i - 1)
      transactions.push(
        db.transaction.create({
          data: {
            ...validated,
            amount: installmentAmount,
            installmentNumber: i,
            date: installmentDate.toISOString(),
          },
        })
      )
    }
    return prisma.$transaction(transactions)
  }

  return db.transaction.create({ data: validated })
}

export async function deleteTransaction(id: string) {
  const db = await userDb()
  return db.transaction.delete({ where: { id } })
}
```

- [ ] **Step 2: Create app/routes/api/transactions/index.ts**

```typescript
import { createAPIFileRoute } from '@tanstack/start'
import * as transactionsApi from '@/features/finance/api/transactions'

export const APIRoute = createAPIFileRoute('/api/transactions')({
  GET: async ({ request }) => {
    const url = new URL(request.url)
    const filters = {
      type: url.searchParams.get('type') || undefined,
      categoryId: url.searchParams.get('categoryId') || undefined,
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
    }
    const transactions = await transactionsApi.listTransactions(filters)
    return Response.json(transactions)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const transaction = await transactionsApi.createTransaction(body)
    return Response.json(transaction)
  },
})
```

- [ ] **Step 3: Create app/routes/api/transactions/$id.ts**

```typescript
import { createAPIFileRoute } from '@tanstack/start'
import { userDb } from '@/lib/tenant-db'

export const APIRoute = createAPIFileRoute('/api/transactions/$id')({
  DELETE: async ({ params }) => {
    const db = await userDb()
    await db.transaction.delete({ where: { id: params.id } })
    return new Response(null, { status: 204 })
  },
})
```

- [ ] **Step 4: Create app/features/finance/hooks/useTransactions.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useTransactions(filters?: Record<string, string | undefined>) {
  const params = new URLSearchParams()
  if (filters?.type) params.set('type', filters.type)
  if (filters?.categoryId) params.set('categoryId', filters.categoryId)
  if (filters?.startDate) params.set('startDate', filters.startDate)
  if (filters?.endDate) params.set('endDate', filters.endDate)

  return useQuery({
    queryKey: ['transactions', params.toString()],
    queryFn: () => fetch(`/api/transactions?${params}`).then((r) => r.json()),
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) =>
      fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetch(`/api/transactions/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: implement transaction CRUD with installment support"
```

### Task 9: Implement Credit Card & Budget Management

**Files:**
- Create: `app/features/finance/api/credit-cards.ts`
- Create: `app/features/finance/api/budgets.ts`
- Create: `app/routes/api/credit-cards/index.ts`
- Create: `app/routes/api/budgets/index.ts`
- Create: `app/features/finance/hooks/useCreditCards.ts`
- Create: `app/features/finance/hooks/useBudgets.ts`

- [ ] **Step 1: Create app/features/finance/api/credit-cards.ts**

```typescript
import { userDb } from '@/lib/tenant-db'
import { createCreditCardSchema } from '../schemas'

export async function listCreditCards() {
  const db = await userDb()
  return db.creditCard.findMany({ orderBy: { name: 'asc' } })
}

export async function createCreditCard(data: unknown) {
  const validated = createCreditCardSchema.parse(data)
  const db = await userDb()
  return db.creditCard.create({ data: validated })
}

export async function deleteCreditCard(id: string) {
  const db = await userDb()
  return db.creditCard.delete({ where: { id } })
}
```

- [ ] **Step 2: Create app/features/finance/api/budgets.ts**

```typescript
import { userDb } from '@/lib/tenant-db'
import { createBudgetSchema } from '../schemas'

export async function listBudgets(year?: number, month?: number) {
  const db = await userDb()
  const where: Record<string, unknown> = {}
  if (year) where.year = year
  if (month) where.month = month
  return db.budget.findMany({ where, include: { category: true } })
}

export async function createOrUpdateBudget(data: unknown) {
  const validated = createBudgetSchema.parse(data)
  const db = await userDb()
  return db.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId: validated.userId,
        categoryId: validated.categoryId,
        month: validated.month,
        year: validated.year,
      },
    },
    create: validated,
    update: { amount: validated.amount },
  })
}

export async function deleteBudget(id: string) {
  const db = await userDb()
  return db.budget.delete({ where: { id } })
}
```

- [ ] **Step 3: Create app/routes/api/credit-cards/index.ts**

```typescript
import { createAPIFileRoute } from '@tanstack/start'
import * as creditCardsApi from '@/features/finance/api/credit-cards'

export const APIRoute = createAPIFileRoute('/api/credit-cards')({
  GET: async () => {
    const cards = await creditCardsApi.listCreditCards()
    return Response.json(cards)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const card = await creditCardsApi.createCreditCard(body)
    return Response.json(card)
  },
})
```

- [ ] **Step 4: Create app/routes/api/credit-cards/$id.ts**

```typescript
import { createAPIFileRoute } from '@tanstack/start'
import * as creditCardsApi from '@/features/finance/api/credit-cards'

export const APIRoute = createAPIFileRoute('/api/credit-cards/$id')({
  DELETE: async ({ params }) => {
    await creditCardsApi.deleteCreditCard(params.id)
    return new Response(null, { status: 204 })
  },
})
```

- [ ] **Step 5: Create app/routes/api/budgets/index.ts**

```typescript
import { createAPIFileRoute } from '@tanstack/start'
import * as budgetsApi from '@/features/finance/api/budgets'

export const APIRoute = createAPIFileRoute('/api/budgets')({
  GET: async ({ request }) => {
    const url = new URL(request.url)
    const year = url.searchParams.get('year') ? parseInt(url.searchParams.get('year')!) : undefined
    const month = url.searchParams.get('month') ? parseInt(url.searchParams.get('month')!) : undefined
    const budgets = await budgetsApi.listBudgets(year, month)
    return Response.json(budgets)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const budget = await budgetsApi.createOrUpdateBudget(body)
    return Response.json(budget)
  },
})
```

- [ ] **Step 6: Create app/routes/api/budgets/$id.ts**

```typescript
import { createAPIFileRoute } from '@tanstack/start'
import * as budgetsApi from '@/features/finance/api/budgets'

export const APIRoute = createAPIFileRoute('/api/budgets/$id')({
  DELETE: async ({ params }) => {
    await budgetsApi.deleteBudget(params.id)
    return new Response(null, { status: 204 })
  },
})
```

- [ ] **Step 7: Create app/features/finance/hooks/useCreditCards.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreditCards() {
  return useQuery({
    queryKey: ['credit-cards'],
    queryFn: () => fetch('/api/credit-cards').then((r) => r.json()),
  })
}

export function useCreateCreditCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) =>
      fetch('/api/credit-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['credit-cards'] }),
  })
}

export function useDeleteCreditCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetch(`/api/credit-cards/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['credit-cards'] }),
  })
}
```

- [ ] **Step 8: Create app/features/finance/hooks/useBudgets.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useBudgets(year?: number, month?: number) {
  const params = new URLSearchParams()
  if (year) params.set('year', String(year))
  if (month) params.set('month', String(month))

  return useQuery({
    queryKey: ['budgets', params.toString()],
    queryFn: () => fetch(`/api/budgets?${params}`).then((r) => r.json()),
  })
}

export function useCreateOrUpdateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) =>
      fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetch(`/api/budgets/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}
```

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: implement credit card and budget management"
```

---

## Chunk 3: Investments Feature

### Task 10: Implement Asset & Investment Transaction Management

**Files:**
- Create: `app/features/investments/schemas.ts`
- Create: `app/features/investments/api/assets.ts`
- Create: `app/features/investments/api/investment-transactions.ts`
- Create: `app/routes/api/assets/index.ts`
- Create: `app/routes/api/assets/$id.ts`
- Create: `app/routes/api/investment-transactions/index.ts`
- Create: `app/features/investments/hooks/useAssets.ts`
- Create: `app/features/investments/hooks/useInvestmentTransactions.ts`

- [ ] **Step 1: Create app/features/investments/schemas.ts**

```typescript
import { z } from 'zod'

export const assetSchema = z.object({
  id: z.string(),
  ticker: z.string().min(1).max(20),
  name: z.string().optional(),
  type: z.enum(['STOCK', 'ETF', 'CRYPTO', 'FIIS', 'BOND', 'OTHER']),
  market: z.string().optional(),
  userId: z.string(),
})

export const investmentTransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['BUY', 'SELL', 'DIVIDEND', 'TAX']),
  quantity: z.number().positive(),
  price: z.number().positive(),
  fees: z.number().default(0),
  taxes: z.number().default(0),
  date: z.string(),
  assetId: z.string(),
  userId: z.string(),
})

export const alertSchema = z.object({
  id: z.string(),
  type: z.enum(['PRICE', 'VOLUME', 'DIVIDEND', 'OTHER']),
  targetPrice: z.number().optional(),
  message: z.string(),
  active: z.boolean().default(true),
  assetId: z.string().optional(),
  userId: z.string(),
})

export const createAssetSchema = assetSchema.omit({ id: true, userId: true })
export const createInvestmentTransactionSchema = investmentTransactionSchema.omit({ id: true, userId: true })
export const createAlertSchema = alertSchema.omit({ id: true, userId: true })
```

- [ ] **Step 2: Create app/features/investments/api/assets.ts**

```typescript
import { userDb } from '@/lib/tenant-db'
import { createAssetSchema } from '../schemas'

export async function listAssets() {
  const db = await userDb()
  return db.asset.findMany({
    orderBy: { ticker: 'asc' },
    include: {
      transactions: { orderBy: { date: 'desc' } },
      alerts: { where: { active: true } },
    },
  })
}

export async function createAsset(data: unknown) {
  const validated = createAssetSchema.parse(data)
  const db = await userDb()
  return db.asset.create({ data: validated })
}

export async function deleteAsset(id: string) {
  const db = await userDb()
  return db.asset.delete({ where: { id } })
}

export function calcAveragePrice(transactions: { type: string; quantity: number; price: number }[]) {
  let totalQuantity = 0
  let totalCost = 0

  for (const tx of transactions) {
    if (tx.type === 'BUY') {
      totalQuantity += tx.quantity
      totalCost += tx.quantity * tx.price
    } else if (tx.type === 'SELL') {
      totalQuantity -= tx.quantity
      const avgCost = totalQuantity > 0 ? totalCost / (totalQuantity + tx.quantity) : 0
      totalCost -= tx.quantity * avgCost
    }
  }

  return totalQuantity > 0 ? totalCost / totalQuantity : 0
}

export function calcPL(
  transactions: { type: string; quantity: number; price: number }[],
  currentPrice: number
) {
  const avgPrice = calcAveragePrice(transactions)
  const buyQty = transactions
    .filter((t) => t.type === 'BUY')
    .reduce((sum, t) => sum + t.quantity, 0)
  const sellQty = transactions
    .filter((t) => t.type === 'SELL')
    .reduce((sum, t) => sum + t.quantity, 0)
  const totalQuantity = buyQty - sellQty
  const invested = totalQuantity * avgPrice
  const current = totalQuantity * currentPrice
  const profit = current - invested
  const percent = invested > 0 ? (profit / invested) * 100 : 0

  return { avgPrice, totalQuantity, invested, current, profit, percent }
}
```

- [ ] **Step 3: Create app/features/investments/api/investment-transactions.ts**

```typescript
import { userDb } from '@/lib/tenant-db'
import { createInvestmentTransactionSchema } from '../schemas'

export async function listInvestmentTransactions(assetId?: string) {
  const db = await userDb()
  const where: Record<string, unknown> = {}
  if (assetId) where.assetId = assetId
  return db.investmentTransaction.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { asset: true },
  })
}

export async function createInvestmentTransaction(data: unknown) {
  const validated = createInvestmentTransactionSchema.parse(data)
  const db = await userDb()
  return db.investmentTransaction.create({ data: validated })
}

export async function deleteInvestmentTransaction(id: string) {
  const db = await userDb()
  return db.investmentTransaction.delete({ where: { id } })
}
```

- [ ] **Step 4: Create app/routes/api/assets/index.ts**

```typescript
import { createAPIFileRoute } from '@tanstack/start'
import * as assetsApi from '@/features/investments/api/assets'

export const APIRoute = createAPIFileRoute('/api/assets')({
  GET: async () => {
    const assets = await assetsApi.listAssets()
    return Response.json(assets)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const asset = await assetsApi.createAsset(body)
    return Response.json(asset)
  },
})
```

- [ ] **Step 5: Create app/routes/api/assets/$id.ts**

```typescript
import { createAPIFileRoute } from '@tanstack/start'
import * as assetsApi from '@/features/investments/api/assets'

export const APIRoute = createAPIFileRoute('/api/assets/$id')({
  DELETE: async ({ params }) => {
    await assetsApi.deleteAsset(params.id)
    return new Response(null, { status: 204 })
  },
})
```

- [ ] **Step 6: Create app/routes/api/investment-transactions/index.ts**

```typescript
import { createAPIFileRoute } from '@tanstack/start'
import * as invTxApi from '@/features/investments/api/investment-transactions'

export const APIRoute = createAPIFileRoute('/api/investment-transactions')({
  GET: async ({ request }) => {
    const url = new URL(request.url)
    const assetId = url.searchParams.get('assetId') || undefined
    const transactions = await invTxApi.listInvestmentTransactions(assetId)
    return Response.json(transactions)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const transaction = await invTxApi.createInvestmentTransaction(body)
    return Response.json(transaction)
  },
})
```

- [ ] **Step 7: Create app/features/investments/hooks/useAssets.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: () => fetch('/api/assets').then((r) => r.json()),
  })
}

export function useCreateAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) =>
      fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assets'] }),
  })
}

export function useDeleteAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetch(`/api/assets/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assets'] }),
  })
}
```

- [ ] **Step 8: Create app/features/investments/hooks/useInvestmentTransactions.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useInvestmentTransactions(assetId?: string) {
  const params = new URLSearchParams()
  if (assetId) params.set('assetId', assetId)

  return useQuery({
    queryKey: ['investment-transactions', params.toString()],
    queryFn: () => fetch(`/api/investment-transactions?${params}`).then((r) => r.json()),
  })
}

export function useCreateInvestmentTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) =>
      fetch('/api/investment-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investment-transactions'] })
      qc.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

export function useDeleteInvestmentTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetch(`/api/investment-transactions/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investment-transactions'] })
      qc.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}
```

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: implement asset and investment transaction management"
```

### Task 11: Implement Investment Alerts

**Files:**
- Create: `app/features/investments/api/alerts.ts`
- Create: `app/routes/api/alerts/index.ts`
- Create: `app/routes/api/alerts/$id.ts`
- Create: `app/features/investments/hooks/useAlerts.ts`

- [ ] **Step 1: Create app/features/investments/api/alerts.ts**

```typescript
import { userDb } from '@/lib/tenant-db'
import { createAlertSchema } from '../schemas'

export async function listAlerts() {
  const db = await userDb()
  return db.alert.findMany({
    where: { active: true },
    orderBy: { type: 'asc' },
    include: { asset: true },
  })
}

export async function createAlert(data: unknown) {
  const validated = createAlertSchema.parse(data)
  const db = await userDb()
  return db.alert.create({ data: validated })
}

export async function deleteAlert(id: string) {
  const db = await userDb()
  return db.alert.update({ where: { id }, data: { active: false } })
}
```

- [ ] **Step 2: Create app/routes/api/alerts/index.ts**

```typescript
import { createAPIFileRoute } from '@tanstack/start'
import * as alertsApi from '@/features/investments/api/alerts'

export const APIRoute = createAPIFileRoute('/api/alerts')({
  GET: async () => {
    const alerts = await alertsApi.listAlerts()
    return Response.json(alerts)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const alert = await alertsApi.createAlert(body)
    return Response.json(alert)
  },
})
```

- [ ] **Step 3: Create app/routes/api/alerts/$id.ts**

```typescript
import { createAPIFileRoute } from '@tanstack/start'
import * as alertsApi from '@/features/investments/api/alerts'

export const APIRoute = createAPIFileRoute('/api/alerts/$id')({
  DELETE: async ({ params }) => {
    await alertsApi.deleteAlert(params.id)
    return new Response(null, { status: 204 })
  },
})
```

- [ ] **Step 4: Create app/features/investments/hooks/useAlerts.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => fetch('/api/alerts').then((r) => r.json()),
  })
}

export function useCreateAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) =>
      fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })
}

export function useDeleteAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetch(`/api/alerts/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: implement investment alerts"
```

---

## Chunk 4: Auth Pages & Layout

### Task 12: Create Auth Pages (Login/Register)

**Files:**
- Create: `app/routes/login.tsx`
- Create: `app/features/auth/components/LoginForm.tsx`

- [ ] **Step 1: Create app/features/auth/components/LoginForm.tsx**

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { signIn } from 'next-auth/react'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    if (result?.error) {
      alert('Credenciais inválidas')
    } else {
      window.location.href = '/'
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Entrar no FinTrack</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full">Entrar</Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Create app/routes/login.tsx**

```typescript
import { createFileRoute } from '@tanstack/start'
import { LoginForm } from '@/features/auth/components/LoginForm'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <LoginForm />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add login page with Auth.js credentials"
```

### Task 13: Create Layout & Navigation

**Files:**
- Create: `app/components/layout/Layout.tsx`
- Create: `app/components/layout/Sidebar.tsx`
- Create: `app/components/layout/Header.tsx`
- Modify: `app/routes/__root.tsx`

- [ ] **Step 1: Create app/components/layout/Sidebar.tsx**

```typescript
import { Link, useLocation } from '@tanstack/start'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  PieChart,
  Target,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: Receipt },
  { href: '/investments', label: 'Investimentos', icon: TrendingUp },
  { href: '/budget', label: 'Orçamento', icon: PieChart },
  { href: '/goals', label: 'Metas', icon: Target },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 bg-card border-r min-h-screen p-4">
      <div className="flex items-center gap-2 mb-8">
        <TrendingUp className="h-6 w-6" />
        <span className="text-xl font-bold">FinTrack</span>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Create app/components/layout/Header.tsx**

```typescript
import { signOut, useSession } from 'next-auth/react'
import { Bell, User, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="h-14 border-b px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Bell className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>{session?.user?.email}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Create app/components/layout/Layout.tsx**

```typescript
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Update app/routes/__root.tsx**

```typescript
import { createRootRoute, Outlet } from '@tanstack/start'
import { auth } from '@/lib/auth'
import { Layout } from '@/components/layout/Layout'

export const Route = createRootRoute({
  beforeLoad: async () => {
    const session = await auth()
    return { user: session?.user }
  },
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
})
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: implement layout with sidebar and header"
```

---

## Chunk 5: UI Pages

### Task 14: Create Dashboard Page

**Files:**
- Create: `app/routes/index.tsx`
- Create: `app/features/dashboard/components/SummaryCards.tsx`
- Create: `app/features/dashboard/components/CashFlowChart.tsx`
- Create: `app/features/dashboard/components/ExpenseByCategoryChart.tsx`
- Create: `app/features/dashboard/components/RecentTransactions.tsx`
- Create: `app/features/dashboard/hooks/useDashboardData.ts`

- [ ] **Step 1: Create app/features/dashboard/hooks/useDashboardData.ts**

```typescript
import { useQuery } from '@tanstack/react-query'

export function useDashboardData() {
  const transactions = useQuery({
    queryKey: ['transactions'],
    queryFn: () => fetch('/api/transactions').then((r) => r.json()),
  })

  const assets = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetch('/api/assets').then((r) => r.json()),
  })

  const budgets = useQuery({
    queryKey: ['budgets'],
    queryFn: () => fetch('/api/budgets').then((r) => r.json()),
  })

  return { transactions, assets, budgets }
}
```

- [ ] **Step 2: Create app/features/dashboard/components/SummaryCards.tsx**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react'

interface SummaryCardsProps {
  transactions: unknown[]
  assets: unknown[]
}

export function SummaryCards({ transactions, assets }: SummaryCardsProps) {
  const txArray = transactions as Array<{ type: string; amount: number }>
  const income = txArray
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const expense = txArray
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const assetArray = assets as Array<{ transactions: Array<{ type: string; quantity: number; price: number }> }>
  const totalInvested = assetArray.reduce((sum, asset) => {
    const buys = asset.transactions.filter((t) => t.type === 'BUY')
    const sells = asset.transactions.filter((t) => t.type === 'SELL')
    const qty = buys.reduce((s, t) => s + t.quantity, 0) - sells.reduce((s, t) => s + t.quantity, 0)
    const avgPrice =
      buys.length > 0
        ? buys.reduce((s, t) => s + t.quantity * t.price, 0) / buys.reduce((s, t) => s + t.quantity, 0)
        : 0
    return sum + qty * avgPrice
  }, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-500">{formatCurrency(income)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(expense)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          <Wallet className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(income - expense)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Investido</CardTitle>
          <PiggyBank className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Create app/features/dashboard/components/CashFlowChart.tsx**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CashFlowChartProps {
  transactions: Array<{ type: string; amount: number; date: string }>
}

export function CashFlowChart({ transactions }: CashFlowChartProps) {
  const monthlyData = transactions.reduce((acc, tx) => {
    const date = new Date(tx.date)
    const key = format(date, 'MMM', { locale: ptBR })
    if (!acc[key]) acc[key] = { month: key, income: 0, expense: 0 }
    if (tx.type === 'INCOME') acc[key].income += Number(tx.amount)
    if (tx.type === 'EXPENSE') acc[key].expense += Number(tx.amount)
    return acc
  }, {} as Record<string, { month: string; income: number; expense: number }>)

  const data = Object.values(monthlyData).slice(-6)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Caixa</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="income" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
            <Area type="monotone" dataKey="expense" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Create app/features/dashboard/components/ExpenseByCategoryChart.tsx**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ExpenseByCategoryChartProps {
  transactions: Array<{ type: string; amount: number; category: { name: string } | null }>
}

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

export function ExpenseByCategoryChart({ transactions }: ExpenseByCategoryChartProps) {
  const categoryData = transactions
    .filter((t) => t.type === 'EXPENSE' && t.category)
    .reduce((acc, tx) => {
      const name = tx.category!.name
      if (!acc[name]) acc[name] = { name, value: 0 }
      acc[name].value += Number(tx.amount)
      return acc
    }, {} as Record<string, { name: string; value: number }>)

  const data = Object.values(categoryData)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 5: Create app/features/dashboard/components/RecentTransactions.tsx**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

interface RecentTransactionsProps {
  transactions: Array<{ id: string; type: string; description: string | null; amount: number; date: string; category: { name: string } | null }>
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recent.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{tx.description || tx.category?.name || 'Sem descrição'}</p>
                <p className="text-sm text-muted-foreground">{formatDate(tx.date)}</p>
              </div>
              <span className={`font-semibold ${tx.type === 'INCOME' ? 'text-green-500' : 'text-red-500'}`}>
                {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(Number(tx.amount))}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 6: Create app/routes/index.tsx**

```typescript
import { createFileRoute } from '@tanstack/start'
import { SummaryCards } from '@/features/dashboard/components/SummaryCards'
import { CashFlowChart } from '@/features/dashboard/components/CashFlowChart'
import { ExpenseByCategoryChart } from '@/features/dashboard/components/ExpenseByCategoryChart'
import { RecentTransactions } from '@/features/dashboard/components/RecentTransactions'
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { transactions, assets, budgets } = useDashboardData()

  if (transactions.isLoading || assets.isLoading) {
    return <div className="p-6">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <SummaryCards transactions={transactions.data || []} assets={assets.data || []} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart transactions={transactions.data || []} />
        <ExpenseByCategoryChart transactions={transactions.data || []} />
      </div>
      <RecentTransactions transactions={transactions.data || []} />
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: implement dashboard page with charts"
```

### Task 15: Create Transactions Page

**Files:**
- Create: `app/routes/transactions.tsx`
- Create: `app/features/finance/components/TransactionTable.tsx`
- Create: `app/features/finance/components/TransactionForm.tsx`

- [ ] **Step 1: Create app/features/finance/components/TransactionForm.tsx**

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useCreateTransaction } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { useCreditCards } from '../hooks/useCreditCards'
import { Plus } from 'lucide-react'

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number().positive('Valor deve ser positivo'),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  date: z.string(),
  creditCardId: z.string().optional(),
  totalInstallments: z.number().int().min(1).optional(),
})

type TransactionForm = z.infer<typeof transactionSchema>

export function TransactionForm() {
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { date: new Date().toISOString().split('T')[0] },
  })

  const createMutation = useCreateTransaction()
  const { data: categories } = useCategories()
  const { data: creditCards } = useCreditCards()

  const type = watch('type')
  const creditCardId = watch('creditCardId')

  const onSubmit = async (data: TransactionForm) => {
    await createMutation.mutateAsync(data)
    reset()
  }

  const filteredCategories = categories?.filter((c: { type: string }) =>
    type === 'INCOME' ? c.type === 'INCOME' : c.type === 'EXPENSE'
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Tipo</Label>
            <Select onValueChange={(v) => register('type').onChange({ target: { value: v } })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Receita</SelectItem>
                <SelectItem value="EXPENSE">Despesa</SelectItem>
                <SelectItem value="TRANSFER">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Valor</Label>
            <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
          </div>
          <div>
            <Label>Descrição</Label>
            <Input {...register('description')} />
          </div>
          <div>
            <Label>Categoria</Label>
            <Select onValueChange={(v) => register('categoryId').onChange({ target: { value: v } })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {filteredCategories?.map((c: { id: string; name: string }) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data</Label>
            <Input type="date" {...register('date')} />
          </div>
          {type === 'EXPENSE' && (
            <>
              <div>
                <Label>Cartão de Crédito</Label>
                <Select onValueChange={(v) => register('creditCardId').onChange({ target: { value: v } })}>
                  <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {creditCards?.map((c: { id: string; name: string }) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {creditCardId && (
                <div>
                  <Label>Parcelas</Label>
                  <Input type="number" min="1" max="48" {...register('totalInstallments', { valueAsNumber: true })} />
                </div>
              )}
            </>
          )}
          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Create app/features/finance/components/TransactionTable.tsx**

```typescript
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useDeleteTransaction } from '../hooks/useTransactions'
import { Trash2 } from 'lucide-react'

interface TransactionTableProps {
  transactions: Array<{
    id: string
    type: string
    description: string | null
    amount: number
    date: string
    category: { name: string } | null
  }>
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const deleteMutation = useDeleteTransaction()

  const columns = [
    {
      accessorKey: 'date',
      header: 'Data',
      cell: ({ getValue }: { getValue: () => string }) => formatDate(getValue()),
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
      cell: ({ getValue }: { getValue: () => string | null }) => getValue() || '-',
    },
    {
      accessorKey: 'category',
      header: 'Categoria',
      cell: ({ getValue }: { getValue: () => { name: string } | null }) => getValue()?.name || '-',
    },
    {
      accessorKey: 'amount',
      header: 'Valor',
      cell: ({ row }: { row: { original: { type: string; amount: number } } }) => {
        const { type, amount } = row.original
        const color = type === 'INCOME' ? 'text-green-500' : type === 'EXPENSE' ? 'text-red-500' : 'text-blue-500'
        const sign = type === 'INCOME' ? '+' : type === 'EXPENSE' ? '-' : '→'
        return <span className={`font-semibold ${color}`}>{sign} {formatCurrency(Number(amount))}</span>
      },
    },
    {
      id: 'actions',
      cell: ({ row }: { row: { id: string } }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteMutation.mutate(row.id)}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      ),
    },
  ]

  const table = useReactTable({
    data: transactions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead className="bg-muted">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th key={h.id} className="px-4 py-3 text-left text-sm font-medium">
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 3: Create app/routes/transactions.tsx**

```typescript
import { createFileRoute } from '@tanstack/start'
import { TransactionTable } from '@/features/finance/components/TransactionTable'
import { TransactionForm } from '@/features/finance/components/TransactionForm'
import { useTransactions } from '@/features/finance/hooks/useTransactions'

export const Route = createFileRoute('/transactions')({
  component: TransactionsPage,
})

function TransactionsPage() {
  const { data, isLoading } = useTransactions()

  if (isLoading) return <div className="p-6">Carregando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Transações</h1>
        <TransactionForm />
      </div>
      <TransactionTable transactions={data || []} />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: implement transactions page with form and table"
```

### Task 16: Create Investments Page

**Files:**
- Create: `app/routes/investments.tsx`
- Create: `app/features/investments/components/AssetTable.tsx`
- Create: `app/features/investments/components/AssetForm.tsx`

- [ ] **Step 1: Create app/features/investments/components/AssetForm.tsx**

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useCreateAsset } from '../hooks/useAssets'
import { Plus } from 'lucide-react'

const assetSchema = z.object({
  ticker: z.string().min(1, 'Ticker obrigatório').max(20),
  name: z.string().optional(),
  type: z.enum(['STOCK', 'ETF', 'CRYPTO', 'FIIS', 'BOND', 'OTHER']),
  market: z.string().optional(),
})

type AssetForm = z.infer<typeof assetSchema>

export function AssetForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AssetForm>({
    resolver: zodResolver(assetSchema),
  })

  const createMutation = useCreateAsset()

  const onSubmit = async (data: AssetForm) => {
    await createMutation.mutateAsync(data)
    reset()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Ativo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Ativo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Ticker</Label>
            <Input {...register('ticker')} placeholder="Ex: PETR4" />
            {errors.ticker && <p className="text-red-500 text-sm">{errors.ticker.message}</p>}
          </div>
          <div>
            <Label>Nome</Label>
            <Input {...register('name')} placeholder="Ex: Petrobras PN" />
          </div>
          <div>
            <Label>Tipo</Label>
            <Select onValueChange={(v) => register('type').onChange({ target: { value: v } })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="STOCK">Ação</SelectItem>
                <SelectItem value="ETF">ETF</SelectItem>
                <SelectItem value="CRYPTO">Cripto</SelectItem>
                <SelectItem value="FIIS">FII</SelectItem>
                <SelectItem value="BOND">Renda Fixa</SelectItem>
                <SelectItem value="OTHER">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Mercado</Label>
            <Input {...register('market')} placeholder="Ex: B3, NASDAQ" />
          </div>
          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Create app/features/investments/components/AssetTable.tsx**

```typescript
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { useDeleteAsset } from '../hooks/useAssets'
import { calcPL } from '../api/assets'
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react'

interface AssetTableProps {
  assets: Array<{
    id: string
    ticker: string
    name: string | null
    type: string
    transactions: Array<{ type: string; quantity: number; price: number }>
  }>
}

export function AssetTable({ assets }: AssetTableProps) {
  const deleteMutation = useDeleteAsset()

  const columns = [
    {
      accessorKey: 'ticker',
      header: 'Ticker',
    },
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ getValue }: { getValue: () => string | null }) => getValue() || '-',
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
    },
    {
      id: 'pl',
      header: 'P/L',
      cell: ({ row }: { row: { original: AssetTableProps['assets'][0] } }) => {
        const { transactions } = row.original
        const pl = calcPL(transactions, 0)
        const Icon = pl.profit >= 0 ? TrendingUp : TrendingDown
        const color = pl.profit >= 0 ? 'text-green-500' : 'text-red-500'
        return (
          <div className={`flex items-center gap-1 ${color}`}>
            <Icon className="h-4 w-4" />
            <span>{formatPercent(pl.percent)}</span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }: { row: { id: string } }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteMutation.mutate(row.id)}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      ),
    },
  ]

  const table = useReactTable({
    data: assets || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead className="bg-muted">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th key={h.id} className="px-4 py-3 text-left text-sm font-medium">
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 3: Create app/routes/investments.tsx**

```typescript
import { createFileRoute } from '@tanstack/start'
import { AssetTable } from '@/features/investments/components/AssetTable'
import { AssetForm } from '@/features/investments/components/AssetForm'
import { useAssets } from '@/features/investments/hooks/useAssets'

export const Route = createFileRoute('/investments')({
  component: InvestmentsPage,
})

function InvestmentsPage() {
  const { data, isLoading } = useAssets()

  if (isLoading) return <div className="p-6">Carregando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Investimentos</h1>
        <AssetForm />
      </div>
      <AssetTable assets={data || []} />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: implement investments page with asset form and table"
```

### Task 17: Create Budget & Goals Pages

**Files:**
- Create: `app/routes/budget.tsx`
- Create: `app/routes/goals.tsx`
- Create: `app/routes/settings.tsx`

- [ ] **Step 1: Create app/routes/budget.tsx**

```typescript
import { createFileRoute } from '@tanstack/start'
import { useBudgets } from '@/features/finance/hooks/useBudgets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export const Route = createFileRoute('/budget')({
  component: BudgetPage,
})

function BudgetPage() {
  const { data, isLoading } = useBudgets()

  if (isLoading) return <div className="p-6">Carregando...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orçamento</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data || []).map((budget: { id: string; category: { name: string; color?: string }; amount: number }) => (
          <Card key={budget.id}>
            <CardHeader>
              <CardTitle className="text-sm">{budget.category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(Number(budget.amount))}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create app/routes/goals.tsx**

```typescript
import { createFileRoute } from '@tanstack/start'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/goals')({
  component: GoalsPage,
})

function GoalsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Metas</h1>
      <Card>
        <CardHeader>
          <CardTitle>Em breve</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Funcionalidade de metas em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Create app/routes/settings.tsx**

```typescript
import { createFileRoute } from '@tanstack/start'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Configurações da conta em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add budget, goals, and settings pages"
```

---

## Chunk 6: Testing, CI/CD & Polish

### Task 18: Setup Testing (Vitest + Playwright)

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/unit/investments/calcPL.test.ts`
- Install: vitest, @testing-library/react, jsdom, playwright

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
npm install -D playwright @playwright/test
```

- [ ] **Step 2: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
```

- [ ] **Step 3: Create tests/unit/investments/calcPL.test.ts**

```typescript
import { describe, it, expect } from 'vitest'
import { calcAveragePrice, calcPL } from '@/features/investments/api/assets'

describe('calcAveragePrice', () => {
  it('calculates average price for buy transactions', () => {
    const transactions = [
      { type: 'BUY', quantity: 100, price: 10 },
      { type: 'BUY', quantity: 50, price: 12 },
    ]
    const result = calcAveragePrice(transactions)
    expect(result).toBeCloseTo(10.67, 1)
  })

  it('adjusts average price after sell', () => {
    const transactions = [
      { type: 'BUY', quantity: 100, price: 10 },
      { type: 'SELL', quantity: 50, price: 12 },
    ]
    const result = calcAveragePrice(transactions)
    expect(result).toBeCloseTo(10, 0)
  })
})

describe('calcPL', () => {
  it('calculates profit and loss correctly', () => {
    const transactions = [
      { type: 'BUY', quantity: 100, price: 10 },
    ]
    const result = calcPL(transactions, 15)
    expect(result.profit).toBe(500)
    expect(result.percent).toBeCloseTo(50, 0)
  })
})
```

- [ ] **Step 4: Add test scripts to package.json**

```json
{
  "scripts": {
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: setup Vitest testing with calcPL tests"
```

### Task 19: Setup CI/CD

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create .github/workflows/ci.yml**

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: fintrack_test
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx prisma generate
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/fintrack_test
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: setup CI/CD pipeline"
```

### Task 20: Update README & Final Commit

**Files:**
- Update: `README.md`

- [ ] **Step 1: Update README.md**

```markdown
# FinTrack — Controle Financeiro & Investimentos

Aplicação SSR de controle financeiro pessoal construída com TanStack Start, Prisma e PostgreSQL.

## 🚀 Tech Stack

| Biblioteca | Versão | Uso |
|---|---|---|
| **TanStack Start** | latest | SSR + Roteamento + API Routes |
| **TanStack Router** | latest | Roteamento type-safe |
| **TanStack Query** | latest | Server state & cache |
| **TanStack Table** | latest | Tabelas com sorting, filtros e paginação |
| **Prisma** | latest | ORM TypeScript-first |
| **PostgreSQL** | 16 | Banco de dados |
| **Auth.js** | latest | Autenticação JWT |
| **Tailwind CSS** | v3 | Estilização utilitária |
| **shadcn/ui** | latest | Componentes UI |
| **Recharts** | latest | Gráficos |
| **Zustand** | latest | Estado local |
| **Vitest** | latest | Testes unitários |

## 📦 Instalação

```bash
npm install
cp .env.example .env  # Configure DATABASE_URL e AUTH_SECRET
npx prisma migrate dev
npm run dev
```

Acesse: http://localhost:5173

## 📱 Funcionalidades

- Dashboard com visão geral do patrimônio
- Controle de receitas, despesas e transferências
- Cartão de crédito com parcelas automáticas
- Orçamento por categoria
- Gestão de investimentos (ações, FIIs, cripto, renda fixa)
- Indicadores de performance (P/L, Dividend Yield)
- Alertas de preço
- Notificações in-app
- Autenticação JWT com Auth.js
- Multi-tenant com isolamento de dados

## 📄 Scripts

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run test     # Testes unitários
npm run test:e2e # Testes E2E
```
```

- [ ] **Step 2: Final commit**

```bash
git add .
git commit -m "feat: update README with new architecture and features"
```
