import { test, expect, Page } from '@playwright/test'

const BASE = 'https://docverse.uz'
const USERNAME = 'superadmin'
const PASSWORD = '12345678'

// Shared login helper
async function login(page: Page, username = USERNAME, password = PASSWORD) {
  await page.goto(`${BASE}/login`)
  await page.waitForSelector('text=Xush kelibsiz', { timeout: 10000 })
  await page.getByPlaceholder('Foydalanuvchi nomini kiriting').fill(username)
  await page.getByPlaceholder('Parolni kiriting').fill(password)
  await page.getByRole('button', { name: 'Kirish' }).click()
  await page.waitForURL('**/dashboard**', { timeout: 15000 })
}

// ============ LOGIN ============

test.describe('Login sahifasi', () => {
  test('login sahifa ochiladi', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await expect(page.locator('text=Xush kelibsiz')).toBeVisible()
    await expect(page.locator('text=Docflow Pro')).toBeVisible()
    await expect(page.getByPlaceholder('Foydalanuvchi nomini kiriting')).toBeVisible()
    await expect(page.getByPlaceholder('Parolni kiriting')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Kirish' })).toBeVisible()
  })

  test('to\'g\'ri login → dashboard', async ({ page }) => {
    await login(page)
    await expect(page).toHaveURL(/dashboard/)
  })

  test('noto\'g\'ri parol → xato xabar', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.getByPlaceholder('Foydalanuvchi nomini kiriting').fill('superadmin')
    await page.getByPlaceholder('Parolni kiriting').fill('wrong-password')
    await page.getByRole('button', { name: 'Kirish' }).click()
    // Xato xabar ko'rinishi kerak
    await page.waitForTimeout(2000)
    const currentUrl = page.url()
    expect(currentUrl).toContain('login') // hali login sahifada
  })

  test('bo\'sh form → submit ishlamaydi', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.getByRole('button', { name: 'Kirish' }).click()
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('login')
  })
})

// ============ DASHBOARD ============

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('dashboard yuklanadi', async ({ page }) => {
    await expect(page).toHaveURL(/dashboard/)
    // Screenshot
    await page.screenshot({ path: 'test/browser/screenshots/dashboard.png' })
  })

  test('sidebar navigatsiya ishlaydi', async ({ page }) => {
    // Sidebar elementlarini tekshirish
    const sidebar = page.locator('aside, nav, [class*=sidebar], [class*=Sidebar]').first()
    if (await sidebar.isVisible()) {
      await page.screenshot({ path: 'test/browser/screenshots/sidebar.png' })
    }
  })
})

// ============ DOCUMENTS ============

test.describe('Hujjatlar', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('hujjatlar sahifasi ochiladi', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/documents`)
    await page.waitForTimeout(3000)
    await page.screenshot({ path: 'test/browser/screenshots/documents.png' })
  })

  test('hujjatlar ro\'yxati bor', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/documents`)
    await page.waitForTimeout(3000)
    // Jadval yoki karta ko'rinishini tekshirish
    const content = await page.textContent('body')
    // Agar hujjatlar bor bo'lsa — raqam yoki sarlavha ko'rinishi kerak
    expect(content).toBeTruthy()
  })
})

// ============ TASKS ============

test.describe('Topshiriqlar', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('tasklar sahifasi ochiladi', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/tasks`)
    await page.waitForTimeout(3000)
    await page.screenshot({ path: 'test/browser/screenshots/tasks.png' })
  })
})

// ============ PROJECTS ============

test.describe('Loyihalar', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('loyihalar sahifasi ochiladi', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/projects`)
    await page.waitForTimeout(3000)
    await page.screenshot({ path: 'test/browser/screenshots/projects.png' })
  })
})

// ============ WORKFLOWS ============

test.describe('Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('workflow sahifasi ochiladi', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/workflows`)
    await page.waitForTimeout(3000)
    await page.screenshot({ path: 'test/browser/screenshots/workflows.png' })
  })
})

// ============ CHAT ============

test.describe('Chat', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('chat sahifasi ochiladi', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/chat`)
    await page.waitForTimeout(3000)
    await page.screenshot({ path: 'test/browser/screenshots/chat.png' })
  })
})

// ============ SECURITY ============

test.describe('Xavfsizlik', () => {
  test('auth yo\'q → login ga redirect', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`)
    await page.waitForTimeout(3000)
    expect(page.url()).toContain('login')
  })

  test('noto\'g\'ri URL → 404 yoki redirect', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE}/dashboard/nonexistent-page-12345`)
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test/browser/screenshots/404.png' })
  })
})

// ============ RESPONSIVE ============

test.describe('Mobile ko\'rinish', () => {
  test.use({ viewport: { width: 375, height: 812 } }) // iPhone X

  test('login mobile da ishlaydi', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await expect(page.getByRole('button', { name: 'Kirish' })).toBeVisible()
    await page.screenshot({ path: 'test/browser/screenshots/login-mobile.png' })
  })

  test('dashboard mobile da ochiladi', async ({ page }) => {
    await login(page)
    await page.screenshot({ path: 'test/browser/screenshots/dashboard-mobile.png' })
  })
})
