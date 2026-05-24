import { Account, Transaction, Investment, Budget, Goal, MonthlyData } from '@/types'
import { subDays, format } from 'date-fns'

export const mockAccounts: Account[] = [
  { id: 'acc-1', name: 'Conta Corrente', type: 'checking', balance: 8430.5, currency: 'BRL', color: '#22c55e', icon: 'building-bank' },
  { id: 'acc-2', name: 'Poupança', type: 'savings', balance: 15200.0, currency: 'BRL', color: '#3b82f6', icon: 'piggy-bank' },
  { id: 'acc-3', name: 'Carteira XP', type: 'investment', balance: 52840.75, currency: 'BRL', color: '#f59e0b', icon: 'chart-line' },
  { id: 'acc-4', name: 'Nubank', type: 'credit', balance: -1820.4, currency: 'BRL', color: '#8b5cf6', icon: 'credit-card' },
]

export const mockTransactions: Transaction[] = [
  { id: 't-1', type: 'income', category: 'salary', description: 'Salário Outubro', amount: 8500, date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), accountId: 'acc-1' },
  { id: 't-2', type: 'expense', category: 'housing', description: 'Aluguel', amount: 2200, date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), accountId: 'acc-1' },
  { id: 't-3', type: 'expense', category: 'food', description: 'Supermercado Extra', amount: 487.6, date: format(subDays(new Date(), 4), 'yyyy-MM-dd'), accountId: 'acc-4' },
  { id: 't-4', type: 'expense', category: 'transport', description: 'Uber', amount: 45.9, date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), accountId: 'acc-4' },
  { id: 't-5', type: 'income', category: 'freelance', description: 'Projeto React - Cliente A', amount: 3200, date: format(subDays(new Date(), 6), 'yyyy-MM-dd'), accountId: 'acc-1' },
  { id: 't-6', type: 'expense', category: 'utilities', description: 'Conta de Luz', amount: 187.3, date: format(subDays(new Date(), 7), 'yyyy-MM-dd'), accountId: 'acc-1' },
  { id: 't-7', type: 'expense', category: 'health', description: 'Plano de Saúde', amount: 650, date: format(subDays(new Date(), 8), 'yyyy-MM-dd'), accountId: 'acc-1' },
  { id: 't-8', type: 'expense', category: 'entertainment', description: 'Netflix + Spotify', amount: 87.9, date: format(subDays(new Date(), 9), 'yyyy-MM-dd'), accountId: 'acc-4' },
  { id: 't-9', type: 'income', category: 'investment_return', description: 'Dividendos PETR4', amount: 340.5, date: format(subDays(new Date(), 10), 'yyyy-MM-dd'), accountId: 'acc-3' },
  { id: 't-10', type: 'expense', category: 'education', description: 'Curso Udemy', amount: 89.9, date: format(subDays(new Date(), 11), 'yyyy-MM-dd'), accountId: 'acc-4' },
  { id: 't-11', type: 'expense', category: 'food', description: 'iFood', amount: 156.8, date: format(subDays(new Date(), 12), 'yyyy-MM-dd'), accountId: 'acc-4' },
  { id: 't-12', type: 'transfer', category: 'transfer', description: 'Transferência para Poupança', amount: 1000, date: format(subDays(new Date(), 14), 'yyyy-MM-dd'), accountId: 'acc-1' },
  { id: 't-13', type: 'expense', category: 'shopping', description: 'Amazon', amount: 312.4, date: format(subDays(new Date(), 15), 'yyyy-MM-dd'), accountId: 'acc-4' },
  { id: 't-14', type: 'expense', category: 'transport', description: 'Combustível', amount: 200, date: format(subDays(new Date(), 16), 'yyyy-MM-dd'), accountId: 'acc-1' },
  { id: 't-15', type: 'income', category: 'other_income', description: 'Venda de equipamento', amount: 850, date: format(subDays(new Date(), 20), 'yyyy-MM-dd'), accountId: 'acc-1' },
]

export const mockInvestments: Investment[] = [
  { id: 'inv-1', type: 'stock', ticker: 'PETR4', name: 'Petrobras PN', quantity: 200, avgPrice: 34.5, currentPrice: 38.2, currency: 'BRL', purchaseDate: '2023-03-15', broker: 'XP', sector: 'Energia' },
  { id: 'inv-2', type: 'stock', ticker: 'ITUB4', name: 'Itaú Unibanco PN', quantity: 150, avgPrice: 29.8, currentPrice: 32.1, currency: 'BRL', purchaseDate: '2023-05-10', broker: 'XP', sector: 'Financeiro' },
  { id: 'inv-3', type: 'fii', ticker: 'HGLG11', name: 'CSHG Logística', quantity: 50, avgPrice: 158.0, currentPrice: 162.5, currency: 'BRL', purchaseDate: '2023-07-20', broker: 'XP', sector: 'Logística' },
  { id: 'inv-4', type: 'stock', ticker: 'WEGE3', name: 'WEG S.A.', quantity: 100, avgPrice: 42.3, currentPrice: 47.8, currency: 'BRL', purchaseDate: '2022-11-05', broker: 'XP', sector: 'Industrial' },
  { id: 'inv-5', type: 'tesouro', ticker: 'TNLP3', name: 'Tesouro IPCA+ 2029', quantity: 1, avgPrice: 5000, currentPrice: 5380.5, currency: 'BRL', purchaseDate: '2023-01-10', broker: 'Tesouro Direto', sector: 'Renda Fixa' },
  { id: 'inv-6', type: 'cdb', ticker: 'CDB-NU', name: 'CDB Nubank 110% CDI', quantity: 1, avgPrice: 10000, currentPrice: 10840.0, currency: 'BRL', purchaseDate: '2023-06-01', broker: 'Nubank', sector: 'Renda Fixa' },
  { id: 'inv-7', type: 'crypto', ticker: 'BTC', name: 'Bitcoin', quantity: 0.05, avgPrice: 155000, currentPrice: 298000, currency: 'BRL', purchaseDate: '2023-09-15', broker: 'Binance', sector: 'Cripto' },
  { id: 'inv-8', type: 'stock', ticker: 'VALE3', name: 'Vale S.A.', quantity: 120, avgPrice: 68.5, currentPrice: 61.2, currency: 'BRL', purchaseDate: '2023-08-22', broker: 'XP', sector: 'Mineração' },
]

export const mockBudgets: Budget[] = [
  { id: 'b-1', category: 'housing', limit: 2500, period: 'monthly', year: 2024, month: 10 },
  { id: 'b-2', category: 'food', limit: 800, period: 'monthly', year: 2024, month: 10 },
  { id: 'b-3', category: 'transport', limit: 400, period: 'monthly', year: 2024, month: 10 },
  { id: 'b-4', category: 'health', limit: 700, period: 'monthly', year: 2024, month: 10 },
  { id: 'b-5', category: 'entertainment', limit: 200, period: 'monthly', year: 2024, month: 10 },
  { id: 'b-6', category: 'shopping', limit: 500, period: 'monthly', year: 2024, month: 10 },
]

export const mockGoals: Goal[] = [
  { id: 'g-1', name: 'Reserva de Emergência', targetAmount: 50000, currentAmount: 23630.5, deadline: '2025-06-01', icon: '🛡️', color: '#22c55e' },
  { id: 'g-2', name: 'Viagem para Europa', targetAmount: 25000, currentAmount: 8400, deadline: '2025-12-01', icon: '✈️', color: '#3b82f6' },
  { id: 'g-3', name: 'Entrada Apartamento', targetAmount: 80000, currentAmount: 52840.75, deadline: '2026-03-01', icon: '🏠', color: '#f59e0b' },
  { id: 'g-4', name: 'Novo Notebook', targetAmount: 8000, currentAmount: 3200, deadline: '2025-01-01', icon: '💻', color: '#8b5cf6' },
]

export const mockMonthlyData: MonthlyData[] = [
  { month: 'Mai', income: 10200, expense: 5800, balance: 4400, investments: 2000 },
  { month: 'Jun', income: 9800, expense: 6200, balance: 3600, investments: 1500 },
  { month: 'Jul', income: 11500, expense: 5900, balance: 5600, investments: 2500 },
  { month: 'Ago', income: 10300, expense: 6800, balance: 3500, investments: 2000 },
  { month: 'Set', income: 12200, expense: 5400, balance: 6800, investments: 3000 },
  { month: 'Out', income: 12700, expense: 6215.6, balance: 6484.4, investments: 3500 },
]
