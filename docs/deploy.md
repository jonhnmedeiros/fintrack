# Deploy — Vercel + Supabase

## Visão geral

O FinTrack é deployed no Vercel usando o preset `vercel` do Nitro (TanStack Start / Vinxi). O banco de dados é o Supabase (PostgreSQL).

## Variáveis de ambiente (Vercel)

| Variável         | Descrição                                                      |
|------------------|----------------------------------------------------------------|
| `DATABASE_URL`   | URL do **Transaction Pooler** do Supabase (porta 6543)         |
| `NEXTAUTH_URL`   | URL pública do deploy (ex: `https://fintrack-beta-liard.vercel.app`) |
| `NEXTAUTH_SECRET`| Secret do NextAuth — gere com `openssl rand -base64 32`        |

### Por que Transaction Pooler?

Vercel executa funções serverless que abrem e fecham conexões a cada request. A conexão direta ao Postgres (porta 5432) esgota o limite de conexões rapidamente e pode ser bloqueada pela rede do Vercel.

O **Transaction Pooler** do Supabase (porta 6543, PgBouncer em transaction mode) gerencia um pool de conexões compartilhado, resolvendo os dois problemas.

**URL do pooler** (Settings → Database → Connection Pooling no dashboard do Supabase):
```
postgresql://postgres.PROJECT_ID:SENHA@aws-0-REGION.pooler.supabase.com:6543/postgres
```

## Primeiro deploy

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Build local
npm run build

# 3. Deploy
vercel deploy --prod --prebuilt
```

## Deploys subsequentes

```bash
npm run build && vercel deploy --prod --prebuilt
```

## Migrations e seed

As migrations e o seed devem ser rodados **localmente** apontando para o banco direto (porta 5432), não pelo pooler — o PgBouncer em transaction mode não suporta todas as operações do Prisma.

```bash
# Configure .env com a URL direta (porta 5432) para rodar localmente
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

## Lições aprendidas

- **`app/features/` não deve ser externalizado** do bundle do cliente no `app.config.ts`. Externalize apenas módulos que realmente são server-only: `@prisma/client`, `app/generated/prisma/`, `app/lib/(auth|db|tenant-db)`.
- **`NEXTAUTH_URL` é obrigatório** em produção. Sem ela, o NextAuth retorna 500 em todas as rotas `/api/auth/*`.
- Use **`--prebuilt`** no `vercel deploy` para garantir que os assets gerados localmente sejam enviados exatamente como buildados.
