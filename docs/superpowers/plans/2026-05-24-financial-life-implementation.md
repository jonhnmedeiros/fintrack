# Financial Life Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** To build a personal finance application with expense tracking and investment management features.

**Architecture:** A monolithic SSR application built with React, Vite, and Express.

**Tech Stack:** React, Vite, Tailwind, TanStack, Express, PostgreSQL, Prisma.

---

### Task 1: Setup Backend with Express and Prisma

**Files:**
- Create: `server.js`
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Install dependencies**

```bash
npm install express @prisma/client
npm install -D prisma
```

- [ ] **Step 2: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 3: Define the database schema**

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id         Int      @id @default(autoincrement())
  email      String   @unique
  password   String
  Transaction Transaction[]
  Investment  Investment[]
  Category    Category[]
}

model Transaction {
  id          Int      @id @default(autoincrement())
  amount      Float
  description String
  date        DateTime
  user        User     @relation(fields: [userId], references: [id])
  userId      Int
  category    Category @relation(fields: [categoryId], references: [id])
  categoryId  Int
}

model Category {
  id      Int      @id @default(autoincrement())
  name    String
  user    User     @relation(fields: [userId], references: [id])
  userId  Int
  Transaction Transaction[]
}

model Investment {
  id            Int      @id @default(autoincrement())
  name          String
  quantity      Float
  purchasePrice Float
  purchaseDate  DateTime
  user          User     @relation(fields: [userId], references: [id])
  userId        Int
}
```

- [ ] **Step 4: Create the Express server**

```javascript
// server.js

import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// API routes will go here

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

- [ ] **Step 5: Run the database migration**

```bash
npx prisma migrate dev --name init
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: Setup backend with Express and Prisma"
```

### Task 2: User Authentication

**Files:**
- Modify: `server.js`

- [ ] **Step 1: Install dependencies**

```bash
npm install bcrypt jsonwebtoken cookie-parser
npm install -D @types/bcrypt @types/jsonwebtoken @types/cookie-parser
```

- [ ] **Step 2: Add authentication routes**

```javascript
// server.js

// ... (imports)

// ... (app setup)

app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
  res.json({ user });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  res.cookie('token', token, { httpOnly: true });
  res.json({ user });
});

// ... (listen)
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: Add user authentication"
```

