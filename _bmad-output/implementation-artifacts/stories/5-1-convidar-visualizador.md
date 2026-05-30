# Story 5.1: Convidar Visualizador

Status: done

## Story

As um Titular,
I want convidar uma pessoa para visualizar minhas finanças,
So que ela possa acompanhar sem precisar de acesso de edição.

**FRs covered:** FR-21

**UX-DRs:** UX-DR-10 (InviteForm)

## Acceptance Criteria

1. **InviteForm:** Dialog na página de Configurações com input de email + validação + "Enviar Convite".
2. **Email:** Envia email transacional via Resend com link de aceite.
3. **Usuário existente:** Link direto para `/invites/accept?token=...` que aceita o convite e muda o role para VISUALIZADOR.
4. **Novo usuário:** Link para `/register?invite=...` que cria conta como VISUALIZADOR automaticamente.
5. **Role gate:** Apenas Titulares veem o botão de convidar.
6. **Toast:** "Convite enviado com sucesso!" ao enviar, "Convite aceito!" ao aceitar.
7. **Validações:** Email inválido, auto-convite, convite duplicado, token expirado.

## Tasks / Subtasks

- [x] Adicionar `Invite` model + `viewerOfId` no schema Prisma + migration
- [x] Instalar Resend SDK + criar `lib/email.ts`
- [x] Atualizar `auth.ts` com `viewerOfId` no JWT/session
- [x] Atualizar `tenant-db.ts` com suporte a invite + viewerDb
- [x] Criar API routes: POST `/api/invites/` + POST `/api/invites/accept`
- [x] Atualizar register API para aceitar `inviteToken`
- [x] Criar hooks `useCreateInvite` + `useAcceptInvite`
- [x] Criar componente `InviteForm` (dialog)
- [x] Criar página `/invites/accept` para aceitar convite
- [x] Atualizar página de registro para aceitar `?invite=` param
- [x] Atualizar página de Configurações com o InviteForm

## Files Created

| File | Purpose |
|---|---|
| `app/lib/email.ts` | Resend email service |
| `app/routes/api/invites/index.ts` | POST: criar convite |
| `app/routes/api/invites/accept.ts` | POST: aceitar convite |
| `app/features/settings/hooks/useInvites.ts` | Hooks de convite |
| `app/features/settings/components/InviteForm.tsx` | Dialog de convite |
| `app/routes/invites.accept.tsx` | Página de aceitar convite |

## Files Modified

| File | Change |
|---|---|
| `prisma/schema.prisma` | Added Invite model + User.viewerOfId |
| `app/lib/auth.ts` | viewerOfId in JWT callbacks + auth() |
| `app/lib/tenant-db.ts` | invite CRUD + viewerDb helper |
| `app/routes/api/auth/register.ts` | Accept inviteToken param |
| `app/features/auth/api/register.ts` | Handle invite: create user as VISUALIZADOR |
| `app/features/auth/components/RegisterForm.tsx` | Accept inviteToken prop |
| `app/routes/register.tsx` | Parse ?invite= from search params |
| `app/routes/settings.tsx` | Added InviteForm + multi-user section |
