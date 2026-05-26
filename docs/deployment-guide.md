# Guia de Deploy

## Stack de Produção

- **Servidor:** Node.js 18+ (Nitro)
- **Banco:** PostgreSQL
- **Build:** Vinxi (client + SSR + server bundles)

## Build de Produção

```bash
npm run build
```

A build gera:

- `.output/public/` — Assets estáticos do cliente
- `.output/server/` — Servidor Nitro (Node.js)
- `.vinxi/` — Cache do Vinxi

## Preview Local

```bash
node .output/server/index.mjs
```

## CI/CD (GitHub Actions)

Pipeline definida em `.github/workflows/ci.yml`:

```yaml
# Triggers: push para main, PRs
# Steps:
#   1. Setup Node.js
#   2. npm ci
#   3. npx prisma generate
#   4. npm run build
#   5. npm run lint (ESLint)
#   6. npm run test (Vitest)
#   7. npm run test:e2e (Playwright)
```

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL |
| `AUTH_SECRET` | Chave secreta para sessões Auth.js |
| `AUTH_TRUST_HOST` | `true` para produção |

## Considerações

- **Database:** Migrations devem ser executadas antes do deploy (`npx prisma migrate deploy`)
- **Prisma Client:** Gerado localmente durante o build (`npx prisma generate`)
- **Static Assets:** Servidos pelo Nitro em produção (pasta `.output/public/`)
- **SSR:** Todo o HTML é renderizado no servidor
