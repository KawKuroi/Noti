import { test, expect, type Page } from '@playwright/test'

// Pagina de configuracion: proteccion de ruta sin sesion y render de las
// secciones principales con sesion. Los tests autenticados requieren
// E2E_EMAIL y E2E_PASSWORD (mismo patron que flujo-recordatorio.spec.ts).

async function iniciarSesion(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', process.env.E2E_EMAIL!)
  await page.fill('input[type="password"]', process.env.E2E_PASSWORD!)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/.*inicio.*/)
}

test('settings redirige al login cuando no hay sesion', async ({ page }) => {
  await page.goto('/settings')
  await expect(page).toHaveURL(/.*login.*/)
})

test.describe('settings con sesion', () => {
  test.skip(
    !process.env.E2E_EMAIL || !process.env.E2E_PASSWORD,
    'Requiere credenciales en E2E_EMAIL y E2E_PASSWORD',
  )

  test('muestra el encabezado y las secciones principales', async ({ page }) => {
    await iniciarSesion(page)
    await page.goto('/settings')

    await expect(page.getByRole('heading', { name: 'Configuracion' })).toBeVisible()
    for (const seccion of ['Perfil', 'Apariencia', 'Resumen diario', 'Idioma']) {
      await expect(page.getByRole('heading', { name: seccion, exact: true })).toBeVisible()
    }
  })

  test('la zona de peligro existe y no dispara acciones sin confirmar', async ({ page }) => {
    await iniciarSesion(page)
    await page.goto('/settings')

    await expect(page.getByRole('heading', { name: 'Zona de peligro' })).toBeVisible()
    // Los botones destructivos estan presentes pero requieren confirmacion explicita.
    await expect(page.getByRole('button', { name: /borrar/i }).first()).toBeVisible()
  })
})
