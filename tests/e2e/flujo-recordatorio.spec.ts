import { test, expect } from '@playwright/test'

// Flujo critico: verificacion de rutas publicas y proteccion de rutas autenticadas.
// El test de creacion de recordatorio requiere credenciales en E2E_EMAIL y E2E_PASSWORD.

test('la landing page carga y muestra el contenido principal', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1').first()).toBeVisible()
})

test('la pagina de login renderiza el formulario', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('form')).toBeVisible()
  await expect(page.locator('input[type="email"]')).toBeVisible()
  await expect(page.locator('input[type="password"]')).toBeVisible()
})

test('una ruta protegida redirige al login cuando no hay sesion', async ({ page }) => {
  await page.goto('/inicio')
  await expect(page).toHaveURL(/.*login.*/)
})

test('crear recordatorio y verificar que aparece en la categoria', async ({ page }) => {
  // Este test requiere credenciales reales en variables de entorno.
  // Ejecutar con: E2E_EMAIL=... E2E_PASSWORD=... npm run test:e2e
  test.skip(
    !process.env.E2E_EMAIL || !process.env.E2E_PASSWORD,
    'Requiere credenciales en E2E_EMAIL y E2E_PASSWORD',
  )

  // Autenticacion
  await page.goto('/login')
  await page.fill('input[type="email"]', process.env.E2E_EMAIL!)
  await page.fill('input[type="password"]', process.env.E2E_PASSWORD!)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/.*inicio.*/)

  // Abrir formulario de nuevo recordatorio
  await page.goto('/tasks')
  const botonNuevo = page.getByRole('button', { name: /nuevo/i }).first()
  await botonNuevo.click()

  // Rellenar el formulario
  const tituloTest = `Recordatorio E2E ${Date.now()}`
  await page.fill('input[name="titulo"]', tituloTest)

  // Seleccionar fecha de manana
  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  const fechaFormato = manana.toISOString().split('T')[0]
  await page.fill('input[name="fechaVencimiento"]', fechaFormato)
  await page.fill('input[name="horaVencimiento"]', '09:00')

  // Enviar
  await page.click('button[type="submit"]')

  // Verificar que aparece en la pagina de categoria
  await expect(page.locator('text=' + tituloTest)).toBeVisible({ timeout: 5000 })
})
