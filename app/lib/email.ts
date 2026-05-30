import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY

function getResend() {
  if (!resendApiKey) return null
  return new Resend(resendApiKey)
}

export async function sendInviteEmail(params: {
  to: string
  inviterName: string
  token: string
  isNewUser: boolean
}) {
  const resend = getResend()
  if (!resend) {
    console.warn('RESEND_API_KEY not configured — skipping email send')
    return
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const acceptUrl = `${baseUrl}/invites/accept?token=${params.token}`

  if (params.isNewUser) {
    const registerUrl = `${baseUrl}/register?invite=${params.token}`
    await resend.emails.send({
      from: 'FinTrack <onboarding@resend.dev>',
      to: params.to,
      subject: `${params.inviterName} convidou você para o FinTrack`,
      html: `
        <p>Olá!</p>
        <p>${params.inviterName} convidou você para acompanhar as finanças dele(a) no <strong>FinTrack</strong>.</p>
        <p>Crie sua conta como <strong>Visualizador</strong> para começar:</p>
        <p><a href="${registerUrl}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px">Criar conta</a></p>
        <p>Ou acesse: <a href="${registerUrl}">${registerUrl}</a></p>
      `,
    })
  } else {
    await resend.emails.send({
      from: 'FinTrack <onboarding@resend.dev>',
      to: params.to,
      subject: `${params.inviterName} convidou você para o FinTrack`,
      html: `
        <p>Olá!</p>
        <p>${params.inviterName} convidou você para acompanhar as finanças dele(a) no <strong>FinTrack</strong>.</p>
        <p>Aceite o convite para se tornar <strong>Visualizador</strong>:</p>
        <p><a href="${acceptUrl}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px">Aceitar convite</a></p>
        <p>Ou acesse: <a href="${acceptUrl}">${acceptUrl}</a></p>
      `,
    })
  }
}
