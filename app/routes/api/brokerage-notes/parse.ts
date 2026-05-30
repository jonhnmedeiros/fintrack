import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/brokerage-notes/parse')({})

export const APIRoute = {
  path: '/api/brokerage-notes/parse',
  methods: {
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }

      try {
        const formData = await request.formData()
        const file = formData.get('file')
        if (!file || !(file instanceof File)) {
          return Response.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
        }

        const allowedTypes = ['application/pdf']
        if (!allowedTypes.includes(file.type)) {
          return Response.json({ error: 'Formato não suportado. Envie um arquivo PDF.' }, { status: 400 })
        }

        const buffer = await file.arrayBuffer()
        const { parsePdf } = await import('@/features/investments/api/brokerage-note')
        const result = await parsePdf(buffer)

        return Response.json(result)
      } catch (err) {
        return Response.json({ error: 'Erro ao processar o PDF' }, { status: 500 })
      }
    },
  },
}
