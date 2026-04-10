import { test } from '@playwright/test'

test('Force click sidebar and capture real URLs', async ({ page }) => {
  await page.goto('https://docverse.uz/login')
  await page.getByPlaceholder('Foydalanuvchi nomini kiriting').fill('superadmin')
  await page.getByPlaceholder('Parolni kiriting').fill('12345678')
  await page.getByRole('button', { name: 'Kirish' }).click()
  await page.waitForTimeout(5000)
  console.log('After login:', page.url())

  // Dump full HTML structure of sidebar
  const sidebarHtml = await page.evaluate(() => {
    // Try multiple selectors
    const el = document.querySelector('aside') ||
               document.querySelector('nav') ||
               document.querySelector('[class*="sidebar"]') ||
               document.querySelector('[class*="Sidebar"]') ||
               document.querySelector('[class*="menu"]')
    return el ? el.innerHTML.slice(0, 3000) : 'NO SIDEBAR FOUND'
  })
  console.log('\n=== SIDEBAR HTML (first 3000 chars) ===')
  console.log(sidebarHtml)

  // Try getByText with force click
  const textItems = ['Hujjatlar', 'Vazifalar', 'Suhbatlar']
  for (const text of textItems) {
    try {
      await page.getByText(text, { exact: true }).first().click({ force: true, timeout: 3000 })
      await page.waitForTimeout(2000)
      console.log(`\n"${text}" → ${page.url()}`)
    } catch (e) {
      console.log(`\n"${text}" → failed: ${(e as Error).message.slice(0, 100)}`)
    }
  }
})
