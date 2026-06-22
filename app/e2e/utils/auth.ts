import type { Page } from '@playwright/test'

export const SEED_USER = { email: 'teste@teste.com', password: '123456' }

export async function login(page: Page, email = SEED_USER.email, password = SEED_USER.password) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('/')
  await page.getByRole('link', { name: 'Dashboard' }).first().waitFor({ state: 'visible' })
}

export async function selectByLabel(container: import('@playwright/test').Locator, page: Page, labelText: string, optionText: string) {
  const trigger = container
    .getByText(labelText, { exact: true })
    .locator('xpath=following-sibling::*[1]//*[@role="combobox"] | following-sibling::*[1][@role="combobox"]')
    .first()
  await trigger.click()
  await page.getByRole('option', { name: optionText }).click()
}
