
import { test } from '@playwright/test'

test('Discover all frontend pages and structure', async ({ page }) => {
  // Login
  await page.goto('https://docverse.uz/login')
  await page.getByPlaceholder('Foydalanuvchi nomini kiriting').fill('superadmin')
  await page.getByPlaceholder('Parolni kiriting').fill('12345678')
  await page.getByRole('button', { name: 'Kirish' }).click()
  await page.waitForURL('**/dashboard**', { timeout: 15000 })

  console.log('=== DASHBOARD URL ===')
  console.log(page.url())

  // Get all links
  console.log('\n=== ALL LINKS ===')
  const links = await page.$$eval('a[href]', els =>
    els.map(el => ({ text: el.textContent?.trim()?.slice(0, 40), href: el.getAttribute('href') }))
      .filter(l => l.href && l.href.startsWith('/'))
  )
  const unique = [...new Map(links.map(l => [l.href, l])).values()]
  unique.forEach(l => console.log(`  ${l.href} — "${l.text}"`))

  // Click sidebar items
  console.log('\n=== SIDEBAR CLICK TEST ===')
  const menuItems = ['Bosh sahifa', 'KPI', 'Sozlamalar', 'Vazifalar']
  for (const item of menuItems) {
    try {
      await page.click(`text=${item}`, { timeout: 3000 })
      await page.waitForTimeout(2000)
      console.log(`  "${item}" → ${page.url()}`)
      await page.screenshot({ path: `test/browser/screenshots/page-${item.replace(/\s/g, '_')}.png` })
    } catch {
      console.log(`  "${item}" → NOT FOUND`)
    }
  }

  // Try common URLs
  console.log('\n=== URL PROBING ===')
  const urls = [
    '/dashboard',
    '/dashboard/document',
    '/dashboard/documents',
    '/dashboard/task',
    '/dashboard/tasks',
    '/dashboard/project',
    '/dashboard/projects',
    '/dashboard/workflow',
    '/dashboard/workflows',
    '/dashboard/chat',
    '/dashboard/notification',
    '/dashboard/notifications',
    '/dashboard/analytics',
    '/dashboard/kpi',
    '/dashboard/settings',
    '/dashboard/users',
    '/dashboard/roles',
  ]
  for (const url of urls) {
    await page.goto(`https://docverse.uz${url}`)
    await page.waitForTimeout(1500)
    const title = await page.title()
    const is404 = (await page.textContent('body')).includes('404')
    console.log(`  ${url} → ${is404 ? '❌ 404' : '✅ OK'} (${page.url()})`)
  }
})
