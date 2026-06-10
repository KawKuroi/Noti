import { test, expect, type Page } from '@playwright/test'

// Barra del asistente (palette) en el dashboard: presencia, atajo Ctrl+I y
// cierre. No se dispara ninguna busqueda real (eso llamaria a Groq y a las
// APIs externas); solo se verifica la interaccion de apertura/cierre.

async function iniciarSesion(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', process.env.E2E_EMAIL!)
  await page.fill('input[type="password"]', process.env.E2E_PASSWORD!)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/.*inicio.*/)
}

test.describe('barra del asistente', () => {
  test.skip(
    !process.env.E2E_EMAIL || !process.env.E2E_PASSWORD,
    'Requiere credenciales en E2E_EMAIL y E2E_PASSWORD',
  )

  test('la barra es visible en /inicio con su atajo', async ({ page }) => {
    await iniciarSesion(page)
    // El kbd "Ctrl+I" solo se muestra con la barra cerrada (estado inicial).
    await expect(page.locator('kbd', { hasText: 'Ctrl+I' })).toBeVisible()
  })

  test('Ctrl+I abre la barra y Ctrl+I la vuelve a cerrar', async ({ page }) => {
    await iniciarSesion(page)
    const atajo = page.locator('kbd', { hasText: 'Ctrl+I' })
    await expect(atajo).toBeVisible()

    // Abrir: el kbd desaparece (lo reemplazan las acciones de la barra abierta)
    await page.keyboard.press('Control+i')
    await expect(atajo).toBeHidden()

    // Cerrar: el kbd vuelve
    await page.keyboard.press('Control+i')
    await expect(atajo).toBeVisible()
  })

  test('al enfocar el input la barra se abre', async ({ page }) => {
    await iniciarSesion(page)
    const atajo = page.locator('kbd', { hasText: 'Ctrl+I' })
    await expect(atajo).toBeVisible()

    await page.locator('input[placeholder]').first().focus()
    await expect(atajo).toBeHidden()
  })
})
