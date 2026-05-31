import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10)

  const user = await prisma.user.upsert({
    where: { email: 'teste@teste.com' },
    update: {},
    create: {
      email: 'teste@teste.com',
      name: 'Usuário Teste',
      password: hashedPassword,
      role: 'TITULAR',
    },
  })
  console.log('Usuário criado:', user.email, user.id)

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const incomeCategories = [
    { name: 'Salário', color: '#22c55e', icon: 'briefcase' },
    { name: 'Freelance', color: '#3b82f6', icon: 'code' },
    { name: 'Investimentos', color: '#8b5cf6', icon: 'trending-up' },
    { name: 'Outras Receitas', color: '#06b6d4', icon: 'plus-circle' },
  ]
  const expenseCategories = [
    { name: 'Moradia', color: '#ef4444', icon: 'home' },
    { name: 'Alimentação', color: '#f97316', icon: 'shopping-cart' },
    { name: 'Transporte', color: '#eab308', icon: 'car' },
    { name: 'Saúde', color: '#ec4899', icon: 'heart' },
    { name: 'Educação', color: '#14b8a6', icon: 'book-open' },
    { name: 'Lazer', color: '#a855f7', icon: 'gamepad-2' },
    { name: 'Assinaturas', color: '#6366f1', icon: 'repeat' },
    { name: 'Compras', color: '#d946ef', icon: 'shopping-bag' },
  ]

  const createdIncomeCategories = []
  for (const cat of incomeCategories) {
    const created = await prisma.category.upsert({
      where: { userId_name_type: { userId: user.id, name: cat.name, type: 'INCOME' } },
      update: {},
      create: { ...cat, userId: user.id, type: 'INCOME' },
    })
    createdIncomeCategories.push(created)
  }
  console.log('Categorias de receita criadas:', createdIncomeCategories.length)

  const createdExpenseCategories = []
  for (const cat of expenseCategories) {
    const created = await prisma.category.upsert({
      where: { userId_name_type: { userId: user.id, name: cat.name, type: 'EXPENSE' } },
      update: {},
      create: { ...cat, userId: user.id, type: 'EXPENSE' },
    })
    createdExpenseCategories.push(created)
  }
  console.log('Categorias de despesa criadas:', createdExpenseCategories.length)

  const creditCard = await prisma.creditCard.create({
    data: {
      name: 'Nubank',
      billingDay: 5,
      closingDay: 1,
      limit: 5000,
      userId: user.id,
    },
  })
  console.log('Cartão de crédito criado:', creditCard.name)

  const [salario, freelance, investimentos] = createdIncomeCategories
  const [moradia, alimentacao, transporte, saude, educacao, lazer, assinaturas, compras] = createdExpenseCategories

  const subAluguel = await prisma.category.upsert({
    where: { userId_parentId_name_type: { userId: user.id, parentId: moradia.id, name: 'Aluguel', type: 'EXPENSE' } },
    update: {},
    create: { name: 'Aluguel', type: 'EXPENSE', color: '#ef4444', icon: '🏠', userId: user.id, parentId: moradia.id },
  })
  const subCondominio = await prisma.category.upsert({
    where: { userId_parentId_name_type: { userId: user.id, parentId: moradia.id, name: 'Condomínio', type: 'EXPENSE' } },
    update: {},
    create: { name: 'Condomínio', type: 'EXPENSE', color: '#ef4444', icon: '🏢', userId: user.id, parentId: moradia.id },
  })
  const subInternet = await prisma.category.upsert({
    where: { userId_parentId_name_type: { userId: user.id, parentId: moradia.id, name: 'Internet', type: 'EXPENSE' } },
    update: {},
    create: { name: 'Internet', type: 'EXPENSE', color: '#ef4444', icon: '📡', userId: user.id, parentId: moradia.id },
  })
  const subRestaurante = await prisma.category.upsert({
    where: { userId_parentId_name_type: { userId: user.id, parentId: alimentacao.id, name: 'Restaurante', type: 'EXPENSE' } },
    update: {},
    create: { name: 'Restaurante', type: 'EXPENSE', color: '#f97316', icon: '🍕', userId: user.id, parentId: alimentacao.id },
  })
  const subSupermercado = await prisma.category.upsert({
    where: { userId_parentId_name_type: { userId: user.id, parentId: alimentacao.id, name: 'Supermercado', type: 'EXPENSE' } },
    update: {},
    create: { name: 'Supermercado', type: 'EXPENSE', color: '#f97316', icon: '🛒', userId: user.id, parentId: alimentacao.id },
  })
  const subIfood = await prisma.category.upsert({
    where: { userId_parentId_name_type: { userId: user.id, parentId: alimentacao.id, name: 'Ifood', type: 'EXPENSE' } },
    update: {},
    create: { name: 'Ifood', type: 'EXPENSE', color: '#f97316', icon: '🥡', userId: user.id, parentId: alimentacao.id },
  })
  const subGasolina = await prisma.category.upsert({
    where: { userId_parentId_name_type: { userId: user.id, parentId: transporte.id, name: 'Gasolina', type: 'EXPENSE' } },
    update: {},
    create: { name: 'Gasolina', type: 'EXPENSE', color: '#eab308', icon: '⛽', userId: user.id, parentId: transporte.id },
  })
  const subUber = await prisma.category.upsert({
    where: { userId_parentId_name_type: { userId: user.id, parentId: transporte.id, name: 'Uber', type: 'EXPENSE' } },
    update: {},
    create: { name: 'Uber', type: 'EXPENSE', color: '#eab308', icon: '🚗', userId: user.id, parentId: transporte.id },
  })
  const subPlanoSaude = await prisma.category.upsert({
    where: { userId_parentId_name_type: { userId: user.id, parentId: saude.id, name: 'Plano de Saúde', type: 'EXPENSE' } },
    update: {},
    create: { name: 'Plano de Saúde', type: 'EXPENSE', color: '#ec4899', icon: '💊', userId: user.id, parentId: saude.id },
  })
  const subAcademia = await prisma.category.upsert({
    where: { userId_parentId_name_type: { userId: user.id, parentId: saude.id, name: 'Academia', type: 'EXPENSE' } },
    update: {},
    create: { name: 'Academia', type: 'EXPENSE', color: '#ec4899', icon: '🏋️', userId: user.id, parentId: saude.id },
  })
  const subStreaming = await prisma.category.upsert({
    where: { userId_parentId_name_type: { userId: user.id, parentId: lazer.id, name: 'Streaming', type: 'EXPENSE' } },
    update: {},
    create: { name: 'Streaming', type: 'EXPENSE', color: '#a855f7', icon: '🎬', userId: user.id, parentId: lazer.id },
  })
  const subCinema = await prisma.category.upsert({
    where: { userId_parentId_name_type: { userId: user.id, parentId: lazer.id, name: 'Cinema', type: 'EXPENSE' } },
    update: {},
    create: { name: 'Cinema', type: 'EXPENSE', color: '#a855f7', icon: '🎮', userId: user.id, parentId: lazer.id },
  })
  const subApps = await prisma.category.upsert({
    where: { userId_parentId_name_type: { userId: user.id, parentId: assinaturas.id, name: 'Apps', type: 'EXPENSE' } },
    update: {},
    create: { name: 'Apps', type: 'EXPENSE', color: '#6366f1', icon: '📱', userId: user.id, parentId: assinaturas.id },
  })
  const subCloud = await prisma.category.upsert({
    where: { userId_parentId_name_type: { userId: user.id, parentId: assinaturas.id, name: 'Cloud', type: 'EXPENSE' } },
    update: {},
    create: { name: 'Cloud', type: 'EXPENSE', color: '#6366f1', icon: '☁️', userId: user.id, parentId: assinaturas.id },
  })

  const transactionsData = [
    { type: 'INCOME', amount: 8500, description: 'Salário Maio/2026', date: new Date(2026, 4, 5), categoryId: salario.id },
    { type: 'INCOME', amount: 4200, description: 'Salário Abr/2026', date: new Date(2026, 3, 5), categoryId: salario.id },
    { type: 'INCOME', amount: 1200, description: 'Projeto site XYZ', date: new Date(2026, 4, 12), categoryId: freelance.id },
    { type: 'INCOME', amount: 340, description: 'Dividendos mensais', date: new Date(2026, 4, 15), categoryId: investimentos.id },
    { type: 'INCOME', amount: 150, description: 'Dividendos', date: new Date(2026, 4, 1), categoryId: investimentos.id },
    { type: 'EXPENSE', amount: 1800, description: 'Aluguel', date: new Date(2026, 4, 1), categoryId: subAluguel.id },
    { type: 'EXPENSE', amount: 320, description: 'Condomínio', date: new Date(2026, 4, 5), categoryId: subCondominio.id },
    { type: 'EXPENSE', amount: 89.90, description: 'Supermercado', date: new Date(2026, 4, 3), categoryId: subSupermercado.id },
    { type: 'EXPENSE', amount: 245.50, description: 'Supermercado Extra', date: new Date(2026, 4, 10), categoryId: subSupermercado.id },
    { type: 'EXPENSE', amount: 34.90, description: 'Uber', date: new Date(2026, 4, 2), categoryId: subUber.id },
    { type: 'EXPENSE', amount: 199.90, description: 'Gasolina', date: new Date(2026, 4, 8), categoryId: subGasolina.id },
    { type: 'EXPENSE', amount: 150, description: 'Plano de saúde', date: new Date(2026, 4, 10), categoryId: subPlanoSaude.id },
    { type: 'EXPENSE', amount: 89.90, description: 'Academia', date: new Date(2026, 4, 1), categoryId: subAcademia.id },
    { type: 'EXPENSE', amount: 497, description: 'Curso online React', date: new Date(2026, 4, 7), categoryId: educacao.id },
    { type: 'EXPENSE', amount: 79.90, description: 'Streaming Netflix', date: new Date(2026, 4, 15), categoryId: subStreaming.id },
    { type: 'EXPENSE', amount: 34.90, description: 'Cinema + pipoca', date: new Date(2026, 4, 12), categoryId: subCinema.id },
    { type: 'EXPENSE', amount: 49.90, description: 'Spotify', date: new Date(2026, 4, 5), categoryId: subApps.id },
    { type: 'EXPENSE', amount: 29.90, description: 'iCloud', date: new Date(2026, 4, 10), categoryId: subCloud.id },
    { type: 'EXPENSE', amount: 89.90, description: 'Internet', date: new Date(2026, 4, 8), categoryId: subInternet.id },
    { type: 'EXPENSE', amount: 299, description: 'Camiseta + calça', date: new Date(2026, 4, 15), categoryId: compras.id },
    { type: 'EXPENSE', amount: 1500, description: 'Aluguel', date: new Date(2026, 3, 1), categoryId: subAluguel.id },
    { type: 'EXPENSE', amount: 320, description: 'Condomínio', date: new Date(2026, 3, 5), categoryId: subCondominio.id },
    { type: 'EXPENSE', amount: 78.50, description: 'Supermercado', date: new Date(2026, 3, 3), categoryId: subSupermercado.id },
    { type: 'INCOME', amount: 350, description: 'Venda de item usado', date: new Date(2026, 3, 20), categoryId: investimentos.id },
  ]

  let txCount = 0
  for (const t of transactionsData) {
    await prisma.transaction.create({
      data: {
        type: t.type as any,
        amount: t.amount,
        description: t.description,
        date: t.date,
        categoryId: t.categoryId,
        userId: user.id,
      },
    })
    txCount++
  }
  console.log('Transações criadas:', txCount)

  const budgetsData = [
    { categoryId: moradia.id, amount: 2200, month: currentMonth, year: currentYear },
    { categoryId: alimentacao.id, amount: 1200, month: currentMonth, year: currentYear },
    { categoryId: transporte.id, amount: 500, month: currentMonth, year: currentYear },
    { categoryId: saude.id, amount: 400, month: currentMonth, year: currentYear },
    { categoryId: educacao.id, amount: 600, month: currentMonth, year: currentYear },
    { categoryId: lazer.id, amount: 300, month: currentMonth, year: currentYear },
    { categoryId: assinaturas.id, amount: 200, month: currentMonth, year: currentYear },
    { categoryId: compras.id, amount: 500, month: currentMonth, year: currentYear },
    { categoryId: moradia.id, amount: 2200, month: 4, year: currentYear },
    { categoryId: alimentacao.id, amount: 1000, month: 4, year: currentYear },
    { categoryId: transporte.id, amount: 400, month: 4, year: currentYear },
    { categoryId: saude.id, amount: 400, month: 4, year: currentYear },
  ]

  let budgetCount = 0
  for (const b of budgetsData) {
    await prisma.budget.upsert({
      where: { userId_categoryId_month_year: { userId: user.id, categoryId: b.categoryId, month: b.month, year: b.year } },
      update: { amount: b.amount },
      create: { ...b, userId: user.id },
    })
    budgetCount++
  }
  console.log('Orçamentos criados:', budgetCount)

  const assetsData = [
    { ticker: 'PETR4', name: 'Petrobras PN', type: 'STOCK', market: 'BOVESPA' },
    { ticker: 'VALE3', name: 'Vale ON', type: 'STOCK', market: 'BOVESPA' },
    { ticker: 'ITUB4', name: 'Itaú Unibanco PN', type: 'STOCK', market: 'BOVESPA' },
    { ticker: 'BOVA11', name: 'iShares Ibovespa ETF', type: 'ETF', market: 'BOVESPA' },
    { ticker: 'BTC', name: 'Bitcoin', type: 'CRYPTO', market: 'MERCADO_BITCOIN' },
    { ticker: 'ETH', name: 'Ethereum', type: 'CRYPTO', market: 'MERCADO_BITCOIN' },
    { ticker: 'KNCR11', name: 'Kinea Rendimentos Imobiliários', type: 'FIIS', market: 'BOVESPA' },
    { ticker: 'MXRF11', name: 'Maxi Renda FII', type: 'FIIS', market: 'BOVESPA' },
  ]

  const createdAssets = []
  for (const a of assetsData) {
    const created = await prisma.asset.upsert({
      where: { userId_ticker: { userId: user.id, ticker: a.ticker } },
      update: {},
      create: { ...a, userId: user.id },
    })
    createdAssets.push(created)
  }
  console.log('Ativos criados:', createdAssets.length)

  const [petr4, vale3, itub4, bova11, btc, eth, kncr11, mxrf11] = createdAssets

  const invTransactionsData = [
    { type: 'BUY', quantity: 100, price: 38.50, fees: 4.90, date: new Date(2026, 3, 10), assetId: petr4.id },
    { type: 'BUY', quantity: 200, price: 68.20, fees: 4.90, date: new Date(2026, 3, 5), assetId: vale3.id },
    { type: 'BUY', quantity: 150, price: 32.10, fees: 4.90, date: new Date(2026, 4, 1), assetId: itub4.id },
    { type: 'BUY', quantity: 50, price: 145.30, fees: 4.90, date: new Date(2026, 3, 15), assetId: bova11.id },
    { type: 'BUY', quantity: 0.01, price: 420000, fees: 0, date: new Date(2026, 3, 20), assetId: btc.id },
    { type: 'BUY', quantity: 0.5, price: 15000, fees: 0, date: new Date(2026, 4, 8), assetId: eth.id },
    { type: 'BUY', quantity: 10, price: 105.40, fees: 4.90, date: new Date(2026, 3, 8), assetId: kncr11.id },
    { type: 'BUY', quantity: 15, price: 98.70, fees: 4.90, date: new Date(2026, 4, 3), assetId: mxrf11.id },
    { type: 'DIVIDEND', quantity: 100, price: 1.50, fees: 0, date: new Date(2026, 4, 15), assetId: petr4.id },
    { type: 'DIVIDEND', quantity: 200, price: 2.10, fees: 0, date: new Date(2026, 4, 10), assetId: vale3.id },
  ]

  let invTxCount = 0
  for (const t of invTransactionsData) {
    await prisma.investmentTransaction.create({
      data: {
        type: t.type as any,
        quantity: t.quantity,
        price: t.price,
        fees: t.fees,
        taxes: 0,
        date: t.date,
        assetId: t.assetId,
        userId: user.id,
      },
    })
    invTxCount++
  }
  console.log('Transações de investimento criadas:', invTxCount)

  await prisma.notification.createMany({
    data: [
      { title: 'Fatura próxima do vencimento', body: 'Sua fatura Nubank vence em 5 dias.', userId: user.id },
      { title: 'Dividendos recebidos', body: 'R$ 150,00 em dividendos creditados.', userId: user.id },
      { title: 'Orçamento de alimentação', body: 'Você usou 80% do orçamento de alimentação deste mês.', userId: user.id },
    ],
  })
  console.log('Notificações criadas')

  console.log('\n--- Seed concluído com sucesso! ---')
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
