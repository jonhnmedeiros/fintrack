import { PDFParse } from 'pdf-parse'

export type AssetTypeGuess = 'STOCK' | 'ETF' | 'CRYPTO' | 'FIIS' | 'BOND' | 'OTHER'

export interface ParsedOperation {
  ticker: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  total: number
  assetType: AssetTypeGuess
}

export interface ParseResult {
  broker: 'BTG' | 'INTER' | 'UNKNOWN'
  operations: ParsedOperation[]
  /** Data pregão extraída da nota, no formato YYYY-MM-DD (quando encontrada) */
  date: string | null
  rawText: string
}

function detectBroker(text: string): 'BTG' | 'INTER' | 'UNKNOWN' {
  if (/BTG\s*Pactual|Banco\s*BTG/i.test(text)) return 'BTG'
  if (/Banco\s*Inter|INTER\s*DTVM/i.test(text)) return 'INTER'
  return 'UNKNOWN'
}

/** Extrai a "Data pregão" da nota e converte para YYYY-MM-DD. */
function extractNoteDate(text: string): string | null {
  // Formato Inter: "Data pregão: 02/07/2025" na mesma linha.
  const inline = text.match(/Data\s*preg[aã]o:?\s*(\d{2})\/(\d{2})\/(\d{4})/i)
  if (inline) {
    const [, dd, mm, yyyy] = inline
    return `${yyyy}-${mm}-${dd}`
  }
  // Formato BTG: cabeçalho "Nr. nota  Folha  Data pregão" e os valores numa
  // linha separada logo abaixo (ex: "30310537  1  16/03/2026").
  const idx = text.search(/Data\s*preg[aã]o/i)
  if (idx >= 0) {
    const nearby = text.slice(idx, idx + 400).match(/(\d{2})\/(\d{2})\/(\d{4})/)
    if (nearby) {
      const [, dd, mm, yyyy] = nearby
      return `${yyyy}-${mm}-${dd}`
    }
  }
  return null
}

/** Converte número em formato BR ("1.234,56" ou "27") para float. */
function parseNumberBR(raw: string): number {
  return parseFloat(raw.replace(/\./g, '').replace(',', '.'))
}

/**
 * Remove o sufixo "F" do mercado fracionário (ex: BBSE3F -> BBSE3, TAEE11F -> TAEE11).
 * FIIs/fundos (ex: MXRF11, KNCR11, CTPS11) não usam esse sufixo e ficam inalterados.
 */
function normalizeTicker(raw: string): string {
  const cleaned = raw.trim().toUpperCase()
  const fracMatch = cleaned.match(/^([A-Z]{4}\d{1,2})F$/)
  return fracMatch ? fracMatch[1] : cleaned
}

/** Classifica o ativo a partir do ticker e do texto de especificação (ex: "ON NM", "CI", "UNT N2"). */
function guessAssetType(ticker: string, hint: string): AssetTypeGuess {
  const h = hint.toUpperCase()
  if (/\bCI\b/.test(h)) return 'FIIS'
  if (/\bUNT\b/.test(h)) return 'STOCK'
  if (/^(ON|PN)/.test(h)) return 'STOCK'
  if (/^(BOVA|IVVB|ACWI|SMAL|SPXI)/.test(ticker)) return 'ETF'
  if (/^(BTC|ETH|USDC|SOL)/.test(ticker)) return 'CRYPTO'
  if (/^(NTN|LTN|LFT|TESOURO)/.test(ticker)) return 'BOND'
  if (/1[12]$/.test(ticker)) return 'FIIS'
  if (/\d$/.test(ticker)) return 'STOCK'
  return 'OTHER'
}

interface PendingLot {
  ticker: string
  side: 'BUY' | 'SELL'
  lines: { quantity: number; price: number; value: number; hint: string }[]
}

/**
 * Motor genérico de leitura das linhas de negociação. Funciona tanto para notas que
 * agregam lotes fracionados numa linha "SubTotal :" (formato mais comum do Inter),
 * quanto para notas que trazem uma linha por operação sem agregação (BTG, e algumas
 * exportações antigas do Inter).
 */
function extractOperations(text: string, tradeLineRe: RegExp): ParsedOperation[] {
  const operations: ParsedOperation[] = []
  const lines = text.split('\n')
  let pending: PendingLot | null = null

  const flush = () => {
    if (!pending || pending.lines.length === 0) {
      pending = null
      return
    }
    const quantity = pending.lines.reduce((sum, l) => sum + l.quantity, 0)
    const total = pending.lines.reduce((sum, l) => sum + l.value, 0)
    const price = quantity > 0 ? total / quantity : pending.lines[0].price
    const hint = pending.lines.map((l) => l.hint).join(' ')
    operations.push({
      ticker: normalizeTicker(pending.ticker),
      type: pending.side,
      quantity,
      price: Math.round(price * 10000) / 10000,
      total: Math.round(total * 100) / 100,
      assetType: guessAssetType(normalizeTicker(pending.ticker), hint),
    })
    pending = null
  }

  for (const line of lines) {
    const subtotalMatch = line.match(/SubTotal\s*:\s*([\d.]+)\s+([\d.,]+)\s+([\d.,]+)/i)
    if (subtotalMatch && pending) {
      const quantity = parseNumberBR(subtotalMatch[1])
      const total = parseNumberBR(subtotalMatch[3])
      const price = quantity > 0 ? total / quantity : parseNumberBR(subtotalMatch[2])
      const hint = pending.lines.map((l) => l.hint).join(' ')
      operations.push({
        ticker: normalizeTicker(pending.ticker),
        type: pending.side,
        quantity,
        price: Math.round(price * 10000) / 10000,
        total: Math.round(total * 100) / 100,
        assetType: guessAssetType(normalizeTicker(pending.ticker), hint),
      })
      pending = null
      continue
    }

    const tradeMatch = line.match(tradeLineRe)
    if (tradeMatch) {
      const [, sideRaw, ticker, hint, qtyRaw, priceRaw, valueRaw] = tradeMatch
      const side: 'BUY' | 'SELL' = sideRaw.toUpperCase() === 'C' ? 'BUY' : 'SELL'

      if (pending && (pending.ticker !== ticker || pending.side !== side)) {
        flush()
      }
      if (!pending) {
        pending = { ticker, side, lines: [] }
      }
      pending.lines.push({
        quantity: parseNumberBR(qtyRaw),
        price: parseNumberBR(priceRaw),
        value: parseNumberBR(valueRaw),
        hint,
      })
    }
  }

  flush()
  return operations
}

// Ex: "1-Bovespa C VIS   BBSE3F ON NM   5   36,11   180,55 D"
//     "1-Bovespa   V VIS   PETR4F PN N2   6   32,34   194,04 C"
const INTER_TRADE_LINE_RE =
  /\d+-Bovespa\s+([CV])\s+(?:VIS|FRA)\s+(\S+)\s+(.*?)\s+([\d.]+)\s+([\d.,]+)\s+([\d.,]+)\s+[DC]\s*$/i

// Ex: "1-BOVESPA   C   VISTA   KNCR11   1   105,05   105,05   D"
const BTG_TRADE_LINE_RE =
  /\d+-BOVESPA\s+([CV])\s+(?:VISTA|VIS)\s+(\S+)\s*(.*?)\s+([\d.]+)\s+([\d.,]+)\s+([\d.,]+)\s+[DC]\s*$/i

function parseInterNote(text: string): ParsedOperation[] {
  return extractOperations(text, INTER_TRADE_LINE_RE)
}

function parseBtgNote(text: string): ParsedOperation[] {
  return extractOperations(text, BTG_TRADE_LINE_RE)
}

export function parseNoteText(text: string): ParseResult {
  const broker = detectBroker(text)
  let operations: ParsedOperation[] = []

  if (broker === 'BTG') {
    operations = parseBtgNote(text)
  } else if (broker === 'INTER') {
    operations = parseInterNote(text)
  }

  return { broker, operations, date: extractNoteDate(text), rawText: text }
}

export async function parsePdf(buffer: ArrayBuffer): Promise<ParseResult> {
  const parser = new PDFParse({ data: buffer })
  try {
    const result = await parser.getText()
    return parseNoteText(result.text)
  } finally {
    await parser.destroy()
  }
}
