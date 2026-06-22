import { test, expect } from '@playwright/test'
import { login, selectByLabel } from './utils/auth'

test.describe('Transações', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/transactions')
  })

  test('cria, edita e exclui uma transação de despesa', async ({ page }) => {
    const description = `E2E despesa ${Date.now()}`

    await page.getByRole('button', { name: 'Nova Transação' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Nova Transação')).toBeVisible()

    await selectByLabel(dialog, page, 'Tipo', 'Despesa')
    await dialog.getByPlaceholder('0,00').fill('123,45')
    await dialog.getByPlaceholder('Descrição da transação').fill(description)
    await selectByLabel(dialog, page, 'Categoria', 'Aluguel')

    await dialog.getByRole('button', { name: /Salvar/ }).click()
    await expect(dialog).not.toBeVisible()

    const row = page.locator('tr', { hasText: description })
    await expect(row).toBeVisible()
    await expect(row).toContainText('123,45')

    await row.getByRole('button', { name: 'Editar transação' }).click()
    const editDialog = page.getByRole('dialog')
    await expect(editDialog.getByText('Editar Transação')).toBeVisible()
    const newDescription = `${description} editado`
    await editDialog.getByPlaceholder('Descrição da transação').fill(newDescription)
    await editDialog.getByRole('button', { name: 'Atualizar' }).click()
    await expect(editDialog).not.toBeVisible()

    const editedRow = page.locator('tr', { hasText: newDescription })
    await expect(editedRow).toBeVisible()

    await editedRow.getByRole('button', { name: 'Excluir transação' }).click()
    const confirmDialog = page.getByRole('dialog')
    await expect(confirmDialog.getByText('Excluir transação')).toBeVisible()
    await confirmDialog.getByRole('button', { name: 'Excluir' }).click()
    await expect(page.locator('tr', { hasText: newDescription })).toHaveCount(0)
  })

  test('não salva uma transação sem tipo selecionado', async ({ page }) => {
    await page.getByRole('button', { name: 'Nova Transação' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Nova Transação')).toBeVisible()

    await dialog.getByPlaceholder('Descrição da transação').fill('Transação sem tipo')
    await dialog.getByRole('button', { name: /Salvar/ }).click()

    await expect(dialog).toBeVisible()
    await expect(page.locator('tr', { hasText: 'Transação sem tipo' })).toHaveCount(0)
  })

  test('filtra transações por tipo', async ({ page }) => {
    await page
      .getByText('Tipo', { exact: true })
      .locator('xpath=following-sibling::*[1]//*[@role="combobox"] | following-sibling::*[1][@role="combobox"]')
      .first()
      .click()
    await page.getByRole('option', { name: 'Receitas' }).click()

    const rows = page.locator('table tbody tr')
    const count = await rows.count()
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator('td').nth(3)).toContainText('+')
    }
  })
})
