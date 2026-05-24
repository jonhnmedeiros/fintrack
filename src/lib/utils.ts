import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { TransactionCategory, TransactionType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date + 'T00:00:00'))
}

export function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(date + 'T00:00:00'))
}

export const categoryLabels: Record<TransactionCategory, string> = {
  salary: 'Salário',
  freelance: 'Freelance',
  investment_return: 'Rendimentos',
  other_income: 'Outras Receitas',
  housing: 'Moradia',
  food: 'Alimentação',
  transport: 'Transporte',
  health: 'Saúde',
  education: 'Educação',
  entertainment: 'Lazer',
  shopping: 'Compras',
  utilities: 'Contas',
  other_expense: 'Outras Despesas',
  transfer: 'Transferência',
}

export const categoryIcons: Record<TransactionCategory, string> = {
  salary: '💼',
  freelance: '💻',
  investment_return: '📈',
  other_income: '💰',
  housing: '🏠',
  food: '🍔',
  transport: '🚗',
  health: '❤️',
  education: '📚',
  entertainment: '🎬',
  shopping: '🛍️',
  utilities: '⚡',
  other_expense: '📦',
  transfer: '🔄',
}

export const categoryColors: Record<TransactionCategory, string> = {
  salary: '#22c55e',
  freelance: '#16a34a',
  investment_return: '#84cc16',
  other_income: '#a3e635',
  housing: '#3b82f6',
  food: '#f97316',
  transport: '#f59e0b',
  health: '#ef4444',
  education: '#8b5cf6',
  entertainment: '#ec4899',
  shopping: '#06b6d4',
  utilities: '#eab308',
  other_expense: '#6b7280',
  transfer: '#94a3b8',
}

export function getTransactionTypeColor(type: TransactionType): string {
  switch (type) {
    case 'income': return 'text-green-500'
    case 'expense': return 'text-red-400'
    case 'transfer': return 'text-blue-400'
  }
}

export function getTransactionTypeSign(type: TransactionType): string {
  switch (type) {
    case 'income': return '+'
    case 'expense': return '-'
    case 'transfer': return '→'
  }
}

export function calcInvestmentReturn(quantity: number, avgPrice: number, currentPrice: number) {
  const invested = quantity * avgPrice
  const current = quantity * currentPrice
  const profit = current - invested
  const percent = ((current - invested) / invested) * 100
  return { invested, current, profit, percent }
}
