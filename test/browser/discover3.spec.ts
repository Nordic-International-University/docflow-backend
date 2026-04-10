import { test } from '@playwright/test'

test('Click every sidebar item and record URL', async ({ page }) => {
  await page.goto('https://docverse.uz/login')
  await page.getByPlaceholder('Foydalanuvchi nomini kiriting').fill('superadmin')
  await page.getByPlaceholder('Parolni kiriting').fill('12345678')
  await page.getByRole('button', { name: 'Kirish' }).click()
  await page.waitForTimeout(5000)

  const items = [
    'Bosh sahifa', 'Suhbatlar', 'Hujjatlar', 'Hujjat turlari', 'Andozalar',
    'Jurnallar', 'Hujjat aylanmasi', 'Jarayonlar', 'Shablonlar', 'Taqvim',
    "Bo'limlar", 'Audit jurnali',
    'KPI', 'Ball sozlamalari', 'Mukofot darajalari', 'Oylik KPI', 'Mukofotlar',
    'Foydalanuvchilar', 'Rollar', 'Ruxsatlar',
    'Profil', 'Sessiyalar',
    'Vazifalar', 'Barcha loyihalar',
  ]

  for (const item of items) {
    try {
      // Click first match
      await page.locator(`a:has-text("${item}")`).first().click({ timeout: 3000 })
      await page.waitForTimeout(2000)
      console.log(`✅ "${item}" → ${page.url()}`)
      // Take screenshot
      const safe = item.replace(/[^a-zA-Z]/g, '_')
      await page.screenshot({ path: `test/browser/screenshots/nav-${safe}.png` })
    } catch {
      console.log(`❌ "${item}" → click failed`)
    }
  }
})
