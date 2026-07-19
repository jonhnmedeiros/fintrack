import { test, expect } from '@playwright/test'
import { login, selectByLabel } from './utils/auth'

test.describe('Orçamentos', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/budget')
    await page.getByText('Carregando').waitFor({ state: 'detached' })
  })

  test('cria, edita e exclui um orçamento', async ({ page }) => {
    // Debug: directly call /api/categories and log result
    const catResponse = await page.evaluate(async () => {
      const r = await fetch('/api/categories')
      const text = await r.text()
      return { status: r.status, body: text.slice(0, 300) }
    })
    console.log(`[E2E] /api/categories → ${catResponse.status}: ${catResponse.body}`)

    await page.getByRole('button', { name: 'Novo Orçamento' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Novo Orçamento')).toBeVisible()

    await selectByLabel(dialog, page, 'Categoria', 'Aluguel')
    await dialog.getByPlaceholder('0,00').fill('500')
    await dialog.getByRole('button', { name: 'Criar' }).click()
    await expect(dialog).not.toBeVisible()

    const card = page.locator('div', { hasText: 'Aluguel' }).filter({ hasText: 'orçado' }).first()
    await expect(card).toBeVisible()
    await expect(card).toContainText('500')

    await card.getByRole('button', { name: 'Editar orçamento Aluguel' }).click()
    const editDialog = page.getByRole('dialog')
    await expect(editDialog.getByText('Editar Orçamento')).toBeVisible()
    await editDialog.getByPlaceholder('0,00').fill('750')
    await editDialog.getByRole('button', { name: 'Atualizar' }).click()
    await expect(editDialog).not.toBeVisible()
    await expect(card).toContainText('750')

    await card.getByRole('button', { name: 'Excluir orçamento Aluguel' }).click()
    const confirmDialog = page.getByRole('dialog')
    await expect(confirmDialog.getByText('Excluir Orçamento')).toBeVisible()
    await confirmDialog.getByRole('button', { name: 'Excluir' }).click()
    await expect(page.locator('div', { hasText: 'Aluguel' }).filter({ hasText: 'orçado' })).toHaveCount(0)
  })
})
