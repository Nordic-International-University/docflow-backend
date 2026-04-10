import { test, expect } from '@playwright/test'

test('Full navigation discovery', async ({ page }) => {
  // Login
  await page.goto('https://docverse.uz/login')
  await page.getByPlaceholder('Foydalanuvchi nomini kiriting').fill('superadmin')
  await page.getByPlaceholder('Parolni kiriting').fill('12345678')
  await page.getByRole('button', { name: 'Kirish' }).click()
  await page.waitForTimeout(5000)

  const dashUrl = page.url()
  console.log('DASHBOARD URL:', dashUrl)
  await page.screenshot({ path: 'test/browser/screenshots/after-login.png' })

  // Get ALL hrefs on page
  const hrefs = await page.$$eval('a', els =>
    els.map(e => e.getAttribute('href')).filter(Boolean)
  )
  console.log('\nALL HREFS:', [...new Set(hrefs)].join('\n  '))

  // Get sidebar content via different selectors
  const bodyText = await page.textContent('body')
  const sidebarWords = bodyText?.match(/\b[A-Z][a-z]+\b/g)
  console.log('\nBody words:', [...new Set(sidebarWords || [])].slice(0, 30).join(', '))

  // Try clicking visible text links
  const visibleTexts = await page.$$eval('a, button, [role="button"], [role="menuitem"], li', els =>
    els.map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim()?.slice(0, 50),
      href: el.getAttribute('href'),
    })).filter(x => x.text && x.text.length > 1 && x.text.length < 50)
  )
  console.log('\nClickable elements:')
  visibleTexts.forEach(v => console.log(`  <${v.tag}> "${v.text}" ${v.href || ''}`))

  // Navigate using sidebar — find all clickable nav items
  const navItems = await page.$$('[class*="sidebar"] a, [class*="menu"] a, aside a, nav a')
  console.log(`\nNav items found: ${navItems.length}`)
  for (const item of navItems.slice(0, 10)) {
    const text = (await item.textContent())?.trim()
    const href = await item.getAttribute('href')
    console.log(`  nav: "${text}" → ${href}`)
  }
})
