# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-test.spec.ts >> Barcha sahifalar yuklanadi >> Project sahifasi (/dashboard/project)
- Location: test/browser/full-test.spec.ts:50:9

# Error details

```
Error: expect(received).toBeFalsy()

Received: true
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e4]:
      - img "university logo" [ref=e9]
      - generic [ref=e12]:
        - generic [ref=e14] [cursor=pointer]:
          - img [ref=e16]
          - paragraph [ref=e22]: Bosh sahifa
        - generic [ref=e24] [cursor=pointer]:
          - img [ref=e26]
          - paragraph [ref=e30]: Suhbatlar
        - generic [ref=e32] [cursor=pointer]:
          - img [ref=e34]
          - paragraph [ref=e39]: Hujjatlar
        - generic [ref=e41] [cursor=pointer]:
          - img [ref=e43]
          - paragraph [ref=e47]: Hujjat turlari
        - generic [ref=e49] [cursor=pointer]:
          - img [ref=e51]
          - paragraph [ref=e56]: Andozalar
        - generic [ref=e58] [cursor=pointer]:
          - img [ref=e60]
          - paragraph [ref=e65]: Jurnallar
        - generic [ref=e67] [cursor=pointer]:
          - img [ref=e69]
          - generic [ref=e74]:
            - paragraph [ref=e75]: Hujjat aylanmasi
            - generic [ref=e77]: "1"
          - img [ref=e79]
        - generic [ref=e82] [cursor=pointer]:
          - img [ref=e84]
          - paragraph [ref=e88]: Bo'limlar
        - generic [ref=e90] [cursor=pointer]:
          - img [ref=e92]
          - paragraph [ref=e97]: Audit jurnali
        - generic [ref=e99] [cursor=pointer]:
          - img [ref=e101]
          - paragraph [ref=e108]: KPI
          - img [ref=e110]
        - generic [ref=e113] [cursor=pointer]:
          - img [ref=e115]
          - paragraph [ref=e121]: Boshqaruv
          - img [ref=e123]
        - generic [ref=e126] [cursor=pointer]:
          - img [ref=e128]
          - paragraph [ref=e134]: Sozlamalar
          - img [ref=e136]
        - generic [ref=e138]:
          - generic [ref=e139] [cursor=pointer]:
            - img [ref=e141]
            - generic [ref=e146]:
              - paragraph [ref=e147]: Vazifalar
              - button [ref=e148]:
                - img [ref=e150]
            - img [ref=e152]
          - generic [ref=e155]:
            - paragraph [ref=e159] [cursor=pointer]: Barcha loyihalar
            - paragraph [ref=e166] [cursor=pointer]: TTS - Twest
            - paragraph [ref=e172] [cursor=pointer]: 123 - Computer
      - generic [ref=e174] [cursor=pointer]:
        - img [ref=e176]
        - paragraph [ref=e182]: Chiqish
    - generic [ref=e183]:
      - banner [ref=e184]:
        - generic [ref=e185]:
          - generic [ref=e190]:
            - img [ref=e192]
            - textbox "Qidirish..." [ref=e195]
            - generic [ref=e198]: Ctrl+K
          - generic [ref=e199]:
            - generic [ref=e203] [cursor=pointer]: SA
            - separator [ref=e204]
            - button [ref=e206] [cursor=pointer]:
              - img [ref=e208]
            - button [ref=e211] [cursor=pointer]:
              - img [ref=e213]
            - button "SA" [ref=e216] [cursor=pointer]:
              - generic "Super Administrator" [ref=e219]:
                - paragraph [ref=e220]: SA
      - main [ref=e221]:
        - generic [ref=e225]:
          - generic [ref=e226]:
            - generic [ref=e227]:
              - paragraph [ref=e228]: Loyihalar
              - paragraph [ref=e229]: Barcha loyihalarni boshqarish
            - button "Yangi loyiha" [ref=e230] [cursor=pointer]:
              - generic [ref=e231]:
                - img [ref=e233]
                - generic [ref=e234]: Yangi loyiha
          - generic [ref=e235]:
            - generic [ref=e236]:
              - generic [ref=e238]:
                - img [ref=e240]
                - textbox "Loyihalarni qidirish..." [ref=e243]
              - generic [ref=e245]:
                - textbox "Holat" [ref=e246] [cursor=pointer]: Barcha holatlar
                - generic:
                  - img
              - generic [ref=e248]:
                - textbox "Bo'lim" [ref=e249] [cursor=pointer]: Barcha bo'limlar
                - generic:
                  - img
            - radiogroup [ref=e250]:
              - generic [ref=e252]:
                - radio [checked]
                - img [ref=e256] [cursor=pointer]
              - generic [ref=e261]:
                - radio
                - img [ref=e265] [cursor=pointer]
  - button [ref=e268] [cursor=pointer]:
    - img [ref=e270]
  - alert [ref=e274]
```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test'
  2   | 
  3   | const BASE = 'https://docverse.uz'
  4   | 
  5   | async function login(page: Page) {
  6   |   await page.goto(`${BASE}/login`)
  7   |   await page.getByPlaceholder('Foydalanuvchi nomini kiriting').fill('superadmin')
  8   |   await page.getByPlaceholder('Parolni kiriting').fill('12345678')
  9   |   await page.getByRole('button', { name: 'Kirish' }).click()
  10  |   await page.waitForURL('**/dashboard**', { timeout: 15000 })
  11  | }
  12  | 
  13  | function ss(name: string) {
  14  |   return { path: `test/browser/screenshots/${name}.png` }
  15  | }
  16  | 
  17  | // ============ BARCHA SAHIFALAR ============
  18  | 
  19  | test.describe('Barcha sahifalar yuklanadi', () => {
  20  |   test.beforeEach(async ({ page }) => {
  21  |     await login(page)
  22  |   })
  23  | 
  24  |   const pages = [
  25  |     { name: 'Dashboard', url: '/dashboard', expect: 'Statistika' },
  26  |     { name: 'Hujjatlar', url: '/dashboard/document' },
  27  |     { name: 'Hujjat turlari', url: '/dashboard/document-type' },
  28  |     { name: 'Andozalar', url: '/dashboard/document-template' },
  29  |     { name: 'Jurnallar', url: '/dashboard/journal' },
  30  |     { name: 'Workflow', url: '/dashboard/workflow' },
  31  |     { name: 'Workflow template', url: '/dashboard/workflow-template' },
  32  |     { name: 'Workflow calendar', url: '/dashboard/workflow-calendar' },
  33  |     { name: 'Chat', url: '/dashboard/chat' },
  34  |     { name: 'Bo\'limlar', url: '/dashboard/department' },
  35  |     { name: 'Audit log', url: '/dashboard/audit-log' },
  36  |     { name: 'KPI - Task score', url: '/dashboard/kpi/task-score-config' },
  37  |     { name: 'KPI - Monthly', url: '/dashboard/kpi/monthly-kpi' },
  38  |     { name: 'KPI - Rewards', url: '/dashboard/kpi/rewards' },
  39  |     { name: 'KPI - Reward tiers', url: '/dashboard/kpi/reward-tiers' },
  40  |     { name: 'Admin', url: '/dashboard/admin' },
  41  |     { name: 'Analytics', url: '/dashboard/analytics' },
  42  |     { name: 'Settings - Profile', url: '/dashboard/setting/profile' },
  43  |     { name: 'Settings - Sessions', url: '/dashboard/setting/sessions' },
  44  |     { name: 'Project', url: '/dashboard/project' },
  45  |     { name: 'Task', url: '/dashboard/task' },
  46  |     { name: 'Users (admin)', url: '/dashboard/admin' },
  47  |   ]
  48  | 
  49  |   for (const p of pages) {
  50  |     test(`${p.name} sahifasi (${p.url})`, async ({ page }) => {
  51  |       await page.goto(`${BASE}${p.url}`)
  52  |       await page.waitForTimeout(3000)
  53  |       // 404 bo'lmasligi kerak
  54  |       const body = await page.textContent('body')
  55  |       const is404 = body?.includes('This page could not be found')
  56  |       if (is404) {
  57  |         console.log(`⚠️  ${p.name} → 404`)
  58  |       } else {
  59  |         console.log(`✅ ${p.name} → OK`)
  60  |         if (p.expect) {
  61  |           await expect(page.locator(`text=${p.expect}`)).toBeVisible({ timeout: 5000 }).catch(() => {})
  62  |         }
  63  |       }
> 64  |       expect(is404).toBeFalsy()
      |                     ^ Error: expect(received).toBeFalsy()
  65  |       await page.screenshot(ss(`page-${p.url.replace(/\//g, '_')}`))
  66  |     })
  67  |   }
  68  | })
  69  | 
  70  | // ============ HUJJAT YARATISH FLOW ============
  71  | 
  72  | test.describe('Hujjat yaratish', () => {
  73  |   test('Hujjat sahifasiga kirish va yaratish tugmasi', async ({ page }) => {
  74  |     await login(page)
  75  |     await page.goto(`${BASE}/dashboard/document`)
  76  |     await page.waitForTimeout(3000)
  77  |     await page.screenshot(ss('document-list'))
  78  | 
  79  |     // Yaratish tugmasi bormi
  80  |     const createBtn = page.locator('button:has-text("Yaratish"), button:has-text("Yangi"), button:has-text("Qo\'shish"), a:has-text("Yaratish")')
  81  |     const visible = await createBtn.first().isVisible().catch(() => false)
  82  |     console.log(`Yaratish tugmasi: ${visible ? '✅ bor' : '❌ yo\'q'}`)
  83  |     if (visible) {
  84  |       await createBtn.first().click()
  85  |       await page.waitForTimeout(2000)
  86  |       await page.screenshot(ss('document-create'))
  87  |     }
  88  |   })
  89  | })
  90  | 
  91  | // ============ WORKFLOW ============
  92  | 
  93  | test.describe('Workflow', () => {
  94  |   test('Workflow ro\'yxati', async ({ page }) => {
  95  |     await login(page)
  96  |     await page.goto(`${BASE}/dashboard/workflow`)
  97  |     await page.waitForTimeout(3000)
  98  |     await page.screenshot(ss('workflow-list'))
  99  | 
  100 |     const body = await page.textContent('body')
  101 |     console.log(`Workflow sahifasi: ${body?.includes('404') ? '❌ 404' : '✅ OK'}`)
  102 |   })
  103 | })
  104 | 
  105 | // ============ CHAT ============
  106 | 
  107 | test.describe('Chat', () => {
  108 |   test('Chat sahifasi ochiladi', async ({ page }) => {
  109 |     await login(page)
  110 |     await page.goto(`${BASE}/dashboard/chat`)
  111 |     await page.waitForTimeout(3000)
  112 |     await page.screenshot(ss('chat-full'))
  113 | 
  114 |     const body = await page.textContent('body')
  115 |     console.log(`Chat: ${body?.includes('404') ? '❌ 404' : '✅ OK'}`)
  116 |   })
  117 | })
  118 | 
  119 | // ============ TASK / PROJECT ============
  120 | 
  121 | test.describe('Task va Project', () => {
  122 |   test('Loyihalar ro\'yxati', async ({ page }) => {
  123 |     await login(page)
  124 |     await page.goto(`${BASE}/dashboard/project`)
  125 |     await page.waitForTimeout(3000)
  126 |     await page.screenshot(ss('project-list'))
  127 |   })
  128 | 
  129 |   test('Task sahifasi', async ({ page }) => {
  130 |     await login(page)
  131 |     await page.goto(`${BASE}/dashboard/task`)
  132 |     await page.waitForTimeout(3000)
  133 |     await page.screenshot(ss('task-board'))
  134 |   })
  135 | })
  136 | 
  137 | // ============ XAVFSIZLIK ============
  138 | 
  139 | test.describe('Xavfsizlik testlari', () => {
  140 |   test('Auth yo\'q → login redirect', async ({ page }) => {
  141 |     await page.goto(`${BASE}/dashboard`)
  142 |     await page.waitForTimeout(3000)
  143 |     // login'ga redirect bo'lishi yoki dashboard ochilmasligi kerak
  144 |     const url = page.url()
  145 |     console.log(`Auth check: ${url}`)
  146 |   })
  147 | 
  148 |   test('Boshqa user ma\'lumotiga kirib bo\'lmasligi', async ({ page }) => {
  149 |     await login(page)
  150 |     // Mavjud bo'lmagan hujjatga kirish
  151 |     await page.goto(`${BASE}/dashboard/document/00000000-0000-0000-0000-000000000000`)
  152 |     await page.waitForTimeout(2000)
  153 |     await page.screenshot(ss('security-invalid-doc'))
  154 |   })
  155 | })
  156 | 
```