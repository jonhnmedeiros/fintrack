// Busca taxas de referência (CDI e IPCA) na API pública do Banco Central
// (SGS — Sistema Gerenciador de Séries Temporais), usadas para calcular o
// valor atualizado de investimentos de renda fixa (ex: CDB).
//
// Séries usadas:
//   12    — CDI (taxa diária, % a.d.)
//   13522 — IPCA acumulado em 12 meses (% a.a.)
//
// As taxas mudam pouco de um dia para o outro, então mantemos um cache em
// memória do processo por algumas horas para não bater na API a cada request.

const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 horas
const BCB_BASE_URL = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs'

interface RatesCache {
  cdiAnnual: number
  ipca12m: number
  fetchedAt: number
}

let cache: RatesCache | null = null

async function fetchLatestSgsValue(serie: number): Promise<number> {
  const res = await fetch(`${BCB_BASE_URL}.${serie}/dados/ultimos/1?formato=json`)
  if (!res.ok) throw new Error(`BCB SGS série ${serie} retornou ${res.status}`)
  const data = (await res.json()) as { data: string; valor: string }[]
  if (!data?.[0]?.valor) throw new Error(`BCB SGS série ${serie} sem dados`)
  return parseFloat(data[0].valor)
}

/**
 * Retorna { cdiAnnual, ipca12m } — taxas anuais em % (ex: 10.65 = 10,65% a.a.).
 * CDI diário é anualizado por juros compostos (252 dias úteis/ano).
 * Usa cache em memória; se a API falhar e houver cache (mesmo vencido), reaproveita.
 */
export async function getReferenceRates(): Promise<{ cdiAnnual: number; ipca12m: number; fetchedAt: number; stale: boolean }> {
  const now = Date.now()
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return { ...cache, stale: false }
  }

  try {
    const [cdiDaily, ipca12m] = await Promise.all([
      fetchLatestSgsValue(12),
      fetchLatestSgsValue(13522),
    ])
    const cdiAnnual = (Math.pow(1 + cdiDaily / 100, 252) - 1) * 100
    cache = { cdiAnnual, ipca12m, fetchedAt: now }
    return { ...cache, stale: false }
  } catch (err) {
    if (cache) {
      console.error('[rates] falha ao atualizar taxas BCB, usando cache anterior:', err)
      return { ...cache, stale: true }
    }
    throw err
  }
}

interface CdbValueInput {
  principal: number
  rateType: 'CDI_PERCENT' | 'PREFIXADO' | 'IPCA_PLUS'
  rate: number
  purchaseDate: Date
  referenceDate?: Date
  cdiAnnual: number
  ipca12m: number
}

/**
 * Estima o valor atualizado de um investimento de renda fixa via juros
 * compostos, assumindo a taxa de referência atual constante ao longo do
 * período (aproximação — CDI/IPCA variam dia a dia; ver comentário no topo).
 */
export function calcFixedIncomeValue({
  principal,
  rateType,
  rate,
  purchaseDate,
  referenceDate = new Date(),
  cdiAnnual,
  ipca12m,
}: CdbValueInput): number {
  const days = Math.max(0, (referenceDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24))
  const years = days / 365

  let annualRate: number
  if (rateType === 'CDI_PERCENT') annualRate = cdiAnnual * (rate / 100)
  else if (rateType === 'PREFIXADO') annualRate = rate
  else annualRate = ipca12m + rate // IPCA_PLUS

  return principal * Math.pow(1 + annualRate / 100, years)
}
