# Guia de Deploy

> **Produção roda no Vercel**, não em Node.js standalone. Para variáveis de
> ambiente, Transaction Pooler do Supabase e o passo a passo de deploy, veja
> [`deploy.md`](./deploy.md) — este documento cobre apenas o build local e o
> pipeline de CI.

## Stack

- **Produção:** Vercel (preset `vercel` do Nitro/Vinxi)
- **Local/CI:** preset `node-server` do Nitro — `npm start` (`vinxi start`) serve `.output/server/index.mjs`
- **Banco:** PostgreSQL (Supabase)
- **Build:** Vinxi (client + SSR + server bundles)

O preset é escolhido automaticamente em `app.config.ts` via `process.env.VERCEL`.

## Build Local

```bash
npm run build          # preset node-server (para rodar com `npm start`)
VERCEL=1 npm run build # preset vercel (gera .vercel/output/, para deploy)
```

## Preview Local

```bash
npm run build && npm start   # http://localhost:3000
```

## CI/CD (GitHub Actions)

Pipeline definida em `.github/workflows/ci.yml`, job `test`:

1. Checkout + setup Node 20
2. `npm ci`
3. `npx prisma generate`
4. `npx prisma migrate deploy` (contra Postgres de serviço do CI)
5. Seed do banco (`prisma/seed.ts`)
6. `npm test` (Vitest)
7. `npx vinxi build` (build para E2E)
8. Instala browsers do Playwright
9. `npm run test:e2e` (Playwright, contra o app buildado via `npm start`)

Job `build` (separado, depende de `test`): apenas valida que `npm run build` completa.

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL — Transaction Pooler em produção (ver `deploy.md`) |
| `NEXTAUTH_URL` | URL pública do deploy — também usada para decidir se o cookie de sessão usa o prefixo `__Secure-` (ver Lições Aprendidas) |
| `NEXTAUTH_SECRET` | Chave secreta do NextAuth — gere com `openssl rand -base64 32` |

## Lições Aprendidas

- **Não usar `NODE_ENV` para decidir o nome do cookie de sessão.** O Vite inlina `NODE_ENV='production'` no bundle de build, mesmo quando o ambiente de runtime é outro (ex: `test` no CI). Isso fazia o servidor sempre procurar pelo cookie `__Secure-next-auth.session-token`, mesmo quando o NextAuth criava o cookie sem o prefixo (`NEXTAUTH_URL` com `http://`). Usar `NEXTAUTH_URL.startsWith('https://')` para essa decisão, igual à lógica interna do NextAuth.
- **Database:** Migrations devem ser executadas antes do deploy (`npx prisma migrate deploy`)
- **Prisma Client:** Gerado localmente durante o build (`npx prisma generate`)
