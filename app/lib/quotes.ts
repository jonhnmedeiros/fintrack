// Busca cotação atual de ações/ETFs/FIIs listados na B3 via brapi.dev, usada
// para calcular o valor de mercado real dos ativos de renda variável (antes
// aproximado pelo preço da última transação, que fica desatualizado quando
// o usuário não lança uma transação nova há tempo).
//
// https://brapi.dev/docs — plano gratuito, requer token (BRAPI_TOKEN).

const CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutos — cotação muda o dia todo, ao contrário de CDI/Selic/IPCA
const BRAPI_BASE_URL = 'https://brapi.dev/api/quote'

interface QuoteCacheEntry {
  price: number
  fetchedAt: number
}

const cache = new Map<string, QuoteCacheEntry>()

/**
 * Retorna { TICKER: preço atual } pros tickers informados. Tickers não
 * encontrados na B3 (ex: cripto, "Outros") ou com falha na API simplesmente
 * não aparecem no resultado — quem chama decide o fallback (ex: preço da
 * última transação).
 */
export async function getQuotes(tickers: string[]): Promise<Record<string, number>> {
  const uniqueTickers = [...new Set(tickers.map((t) => t.toUpperCase()))]
  const now = Date.now()

  const result: Record<string, number> = {}
  const toFetch: string[] = []

  for (const ticker of uniqueTickers) {
    const cached = cache.get(ticker)
    if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
      result[ticker] = cached.price
    } else {
      toFetch.push(ticker)
    }
  }

  if (toFetch.length === 0) return result

  const token = process.env.BRAPI_TOKEN
  if (!token) {
    console.error('[quotes] BRAPI_TOKEN não configurado — cotações reais indisponíveis')
    return result
  }

  // Plano gratuito da brapi.dev permite só 1 ativo por requisição — busca
  // cada ticker em paralelo, sem deixar uma falha isolada derrubar as demais.
  await Promise.all(
    toFetch.map(async (ticker) => {
      try {
        const res = await fetch(`${BRAPI_BASE_URL}/${ticker}?token=${token}`)
        if (!res.ok) throw new Error(`brapi.dev retornou ${res.status} para ${ticker}`)
        const data = (await res.json()) as {
          results?: { symbol: string; regularMarketPrice?: number }[]
        }
        const price = data.results?.[0]?.regularMarketPrice
        if (typeof price === 'number') {
          cache.set(ticker, { price, fetchedAt: now })
          result[ticker] = price
        }
      } catch (err) {
        console.error(`[quotes] falha ao buscar cotação de ${ticker} na brapi.dev:`, err)
      }
    })
  )

  return result
}
