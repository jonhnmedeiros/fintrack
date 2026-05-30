import { PDFParse } from 'pdf-parse'

export interface ParsedOperation {
  ticker: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  total: number
}

export interface ParseResult {
  broker: 'BTG' | 'INTER' | 'UNKNOWN'
  operations: ParsedOperation[]
  rawText: string
}

function detectBroker(text: string): 'BTG' | 'INTER' | 'UNKNOWN' {
  if (/BTG\s*Pactual|Banco\s*BTG/i.test(text)) return 'BTG'
  if (/Banco\s*Inter|INTER\s*DTVM/i.test(text)) return 'INTER'
  return 'UNKNOWN'
}

function parseBtgNote(text: string): ParsedOperation[] {
  const ops: ParsedOperation[] = []
  const lines = text.split('\n')

  let inNegocios = false
  for (const line of lines) {
    if (/Negócios\s*realizados/i.test(line)) {
      inNegocios = true
      continue
    }
    if (inNegocios && /Resumo\s*dos\s*Negócios|Taxas|Total/i.test(line)) {
      inNegocios = false
      continue
    }
    if (!inNegocios) continue

    const match = line.match(
      /(\d+)\s+BOVESPA\s+(\w+)\s+(COMPRA|VENDA)\s+([\d.]+)\s+([\d,]+)\s+([\d,.]+)/
    )
    if (match) {
      ops.push({
        ticker: match[2],
        type: match[3] === 'COMPRA' ? 'BUY' : 'SELL',
        quantity: parseInt(match[4].replace(/\./g, ''), 10),
        price: parseFloat(match[5].replace(/\./g, '').replace(',', '.')),
        total: parseFloat(match[6].replace(/\./g, '').replace(',', '.')),
      })
    }

    const altMatch = line.match(
      /(\d+)\s+BOVESPA\s+(\w+)\s+(COMPRA|VENDA)\s+([\d.]+)\s+([\d,]+)/
    )
    if (altMatch && !match) {
      ops.push({
        ticker: altMatch[2],
        type: altMatch[3] === 'COMPRA' ? 'BUY' : 'SELL',
        quantity: parseInt(altMatch[4].replace(/\./g, ''), 10),
        price: parseFloat(altMatch[5].replace(/\./g, '').replace(',', '.')),
        total: 0,
      })
    }
  }

  return ops
}

function parseInterNote(text: string): ParsedOperation[] {
  const ops: ParsedOperation[] = []
  const lines = text.split('\n')

  let inNegocios = false
  for (const line of lines) {
    if (/Resumo\s*dos\s*Negócios|Negócios\s*realizados/i.test(line)) {
      inNegocios = true
      continue
    }
    if (inNegocios && /Resumo\s*Financeiro|Taxas|Total|Líquido/i.test(line)) {
      inNegocios = false
      continue
    }
    if (!inNegocios) continue

    const match = line.match(
      /(?:BOVESPA|FRACIONARIO)\s+(\w+)\s+(?:COMPRA|VENDA)\s+(COMPRA|VENDA)\s+([\d.]+)\s+([\d,.]+)/
    )
    if (match) {
      ops.push({
        ticker: match[1],
        type: match[2] === 'COMPRA' ? 'BUY' : 'SELL',
        quantity: parseInt(match[3].replace(/\./g, ''), 10),
        price: parseFloat(match[4].replace(/\./g, '').replace(',', '.')),
        total: 0,
      })
    }
  }

  return ops
}

export function parseNoteText(text: string): ParseResult {
  const broker = detectBroker(text)
  let operations: ParsedOperation[] = []

  if (broker === 'BTG') {
    operations = parseBtgNote(text)
  } else if (broker === 'INTER') {
    operations = parseInterNote(text)
  }

  return { broker, operations, rawText: text }
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
