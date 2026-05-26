function parseCookies(request: Request): Record<string, string> {
  const cookie = request.headers.get('cookie') || ''
  return Object.fromEntries(
    cookie.split(';').filter(Boolean).map(c => {
      const [key, ...val] = c.trim().split('=')
      try { return [key, decodeURIComponent(val.join('='))] } catch { return [key, val.join('=')] }
    })
  )
}

export async function mockNextAuthHandler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  console.log('[AUTH-HANDLER]', { url: request.url, pathname: url.pathname, search: url.search, searchParams: Object.fromEntries(url.searchParams) })
  const nextauth = url.pathname.replace('/api/auth/', '').split('/')

  const req = {
    query: {
      nextauth,
      ...Object.fromEntries(url.searchParams),
    },
    origin: `${url.protocol}//${url.host}`,
    method: request.method,
    headers: Object.fromEntries(request.headers),
    cookies: parseCookies(request),
    body: null as any,
  }

  if (request.method !== 'GET' && request.body) {
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      req.body = await request.json()
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text()
      req.body = Object.fromEntries(new URLSearchParams(text))
    }
  }

  let statusCode = 200
  let responseBody: any = null
  let responseHeaders: Record<string, string | string[]> = {}

  const res = {
    status: (code: number) => {
      statusCode = code
      return res
    },
    setHeader: (key: string, value: string | string[]) => {
      responseHeaders[key] = value
      return res
    },
    getHeader: (key: string) => responseHeaders[key],
    send: (data: any) => {
      responseBody = data
    },
    json: (data: any) => {
      responseBody = data
      responseHeaders['Content-Type'] = 'application/json'
    },
    end: () => {},
  }

  const { handlers } = await import('@/lib/auth')
  await handlers.GET(req as any, res as any)

  if (statusCode === 302 && responseHeaders['Location']) {
    return new Response(null, { status: 302, headers: responseHeaders as any })
  }

  if (responseHeaders['Content-Type'] === 'application/json') {
    return new Response(JSON.stringify(responseBody), {
      status: statusCode,
      headers: responseHeaders as any,
    })
  }

  const body = typeof responseBody === 'object' && responseBody !== null
    ? JSON.stringify(responseBody)
    : responseBody

  return new Response(body, {
    status: statusCode,
    headers: responseHeaders as any,
  })
}
