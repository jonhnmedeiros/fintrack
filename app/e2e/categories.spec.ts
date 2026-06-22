import { test, expect } from '@playwright/test'
import { login, selectByLabel } from './utils/auth'

test.describe('Categorias', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/categories')
    await page.getByText('Carregando').waitFor({ state: 'detached' })
  })

  test('cria, edita e exclui uma categoria de despesa', async ({ page }) => {
    const name = `E2E categoria ${Date.now()}`

    await page.getByRole('button', { name: 'Nova Categoria' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Nova Categoria')).toBeVisible()

    await dialog.getByPlaceholder('Ex: Alimentação').fill(name)
    await selectByLabel(dialog, page, 'Tipo', 'Despesa')
    await dialog.getByRole('button', { name: 'Criar' }).click()
    await expect(dialog).not.toBeVisible()

    await expect(page.getByText(name)).toBeVisible()

    await page.getByRole('button', { name: `Editar categoria ${name}` }).click()
    const editDialog = page.getByRole('dialog')
    await expect(editDialog.getByText('Editar Categoria')).toBeVisible()
    const newName = `${name} editada`
    await editDialog.getByPlaceholder('Ex: Alimentação').fill(newName)
    await editDialog.getByRole('button', { name: 'Atualizar' }).click()
    await expect(editDialog).not.toBeVisible()

    await expect(page.getByText(newName)).toBeVisible()

    await page.getByRole('button', { name: `Excluir categoria ${newName}` }).click()
    const confirmDialog = page.getByRole('dialog')
    await confirmDialog.getByRole('button', { name: 'Excluir' }).click()
    await expect(page.getByText(newName)).toHaveCount(0)
  })
})
