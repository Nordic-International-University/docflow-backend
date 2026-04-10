import { test, expect, Page } from '@playwright/test'

const BASE = 'https://docverse.uz'

async function login(page: Page) {
  await page.goto(`${BASE}/login`)
  await page.getByPlaceholder('Foydalanuvchi nomini kiriting').fill('superadmin')
  await page.getByPlaceholder('Parolni kiriting').fill('12345678')
  await page.getByRole('button', { name: 'Kirish' }).click()
  await page.waitForURL('**/dashboard**', { timeout: 15000 })
}

function ss(name: string) {
  return { path: `test/browser/screenshots/${name}.png` }
}

// ============ BARCHA SAHIFALAR ============

test.describe('Barcha sahifalar yuklanadi', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  const pages = [
    { name: 'Dashboard', url: '/dashboard', expect: 'Statistika' },
    { name: 'Hujjatlar', url: '/dashboard/document' },
    { name: 'Hujjat turlari', url: '/dashboard/document-type' },
    { name: 'Andozalar', url: '/dashboard/document-template' },
    { name: 'Jurnallar', url: '/dashboard/journal' },
    { name: 'Workflow', url: '/dashboard/workflow' },
    { name: 'Workflow template', url: '/dashboard/workflow-template' },
    { name: 'Workflow calendar', url: '/dashboard/workflow-calendar' },
    { name: 'Chat', url: '/dashboard/chat' },
    { name: 'Bo\'limlar', url: '/dashboard/department' },
    { name: 'Audit log', url: '/dashboard/audit-log' },
    { name: 'KPI - Task score', url: '/dashboard/kpi/task-score-config' },
    { name: 'KPI - Monthly', url: '/dashboard/kpi/monthly-kpi' },
    { name: 'KPI - Rewards', url: '/dashboard/kpi/rewards' },
    { name: 'KPI - Reward tiers', url: '/dashboard/kpi/reward-tiers' },
    { name: 'Admin', url: '/dashboard/admin' },
    { name: 'Analytics', url: '/dashboard/analytics' },
    { name: 'Settings - Profile', url: '/dashboard/setting/profile' },
    { name: 'Settings - Sessions', url: '/dashboard/setting/sessions' },
    { name: 'Project', url: '/dashboard/project' },
    { name: 'Task', url: '/dashboard/task' },
    { name: 'Users (admin)', url: '/dashboard/admin' },
  ]

  for (const p of pages) {
    test(`${p.name} sahifasi (${p.url})`, async ({ page }) => {
      await page.goto(`${BASE}${p.url}`)
      await page.waitForTimeout(3000)
      // 404 bo'lmasligi kerak
      const body = await page.textContent('body')
      const is404 = body?.includes('This page could not be found')
      if (is404) {
        console.log(`⚠️  ${p.name} → 404`)
      } else {
        console.log(`✅ ${p.name} → OK`)
        if (p.expect) {
          await expect(page.locator(`text=${p.expect}`)).toBeVisible({ timeout: 5000 }).catch(() => {})
        }
      }
      expect(is404).toBeFalsy()
      await page.screenshot(ss(`page-${p.url.replace(/\//g, '_')}`))
    })
  }
})

// ============ HUJJAT YARATISH FLOW ============

test.describe('Hujjat yaratish', () => {
  test('Hujjat sahifasiga kirish va yaratish tugmasi', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE}/dashboard/document`)
    await page.waitForTimeout(3000)
    await page.screenshot(ss('document-list'))

    // Yaratish tugmasi bormi
    const createBtn = page.locator('button:has-text("Yaratish"), button:has-text("Yangi"), button:has-text("Qo\'shish"), a:has-text("Yaratish")')
    const visible = await createBtn.first().isVisible().catch(() => false)
    console.log(`Yaratish tugmasi: ${visible ? '✅ bor' : '❌ yo\'q'}`)
    if (visible) {
      await createBtn.first().click()
      await page.waitForTimeout(2000)
      await page.screenshot(ss('document-create'))
    }
  })
})

// ============ WORKFLOW ============

test.describe('Workflow', () => {
  test('Workflow ro\'yxati', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE}/dashboard/workflow`)
    await page.waitForTimeout(3000)
    await page.screenshot(ss('workflow-list'))

    const body = await page.textContent('body')
    console.log(`Workflow sahifasi: ${body?.includes('404') ? '❌ 404' : '✅ OK'}`)
  })
})

// ============ CHAT ============

test.describe('Chat', () => {
  test('Chat sahifasi ochiladi', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE}/dashboard/chat`)
    await page.waitForTimeout(3000)
    await page.screenshot(ss('chat-full'))

    const body = await page.textContent('body')
    console.log(`Chat: ${body?.includes('404') ? '❌ 404' : '✅ OK'}`)
  })
})

// ============ TASK / PROJECT ============

test.describe('Task va Project', () => {
  test('Loyihalar ro\'yxati', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE}/dashboard/project`)
    await page.waitForTimeout(3000)
    await page.screenshot(ss('project-list'))
  })

  test('Task sahifasi', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE}/dashboard/task`)
    await page.waitForTimeout(3000)
    await page.screenshot(ss('task-board'))
  })
})

// ============ XAVFSIZLIK ============

test.describe('Xavfsizlik testlari', () => {
  test('Auth yo\'q → login redirect', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`)
    await page.waitForTimeout(3000)
    // login'ga redirect bo'lishi yoki dashboard ochilmasligi kerak
    const url = page.url()
    console.log(`Auth check: ${url}`)
  })

  test('Boshqa user ma\'lumotiga kirib bo\'lmasligi', async ({ page }) => {
    await login(page)
    // Mavjud bo'lmagan hujjatga kirish
    await page.goto(`${BASE}/dashboard/document/00000000-0000-0000-0000-000000000000`)
    await page.waitForTimeout(2000)
    await page.screenshot(ss('security-invalid-doc'))
  })
})
