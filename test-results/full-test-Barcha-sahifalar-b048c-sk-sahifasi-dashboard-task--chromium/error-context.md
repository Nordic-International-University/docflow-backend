# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-test.spec.ts >> Barcha sahifalar yuklanadi >> Task sahifasi (/dashboard/task)
- Location: test/browser/full-test.spec.ts:50:9

# Error details

```
Error: expect(received).toBeFalsy()

Received: true
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e3]:
    - generic [ref=e5]:
      - img "university logo" [ref=e10]
      - generic [ref=e13]:
        - generic [ref=e15] [cursor=pointer]:
          - img [ref=e17]
          - paragraph [ref=e23]: Bosh sahifa
        - generic [ref=e25] [cursor=pointer]:
          - img [ref=e27]
          - paragraph [ref=e31]: Suhbatlar
        - generic [ref=e33] [cursor=pointer]:
          - img [ref=e35]
          - paragraph [ref=e40]: Hujjatlar
        - generic [ref=e42] [cursor=pointer]:
          - img [ref=e44]
          - paragraph [ref=e48]: Hujjat turlari
        - generic [ref=e50] [cursor=pointer]:
          - img [ref=e52]
          - paragraph [ref=e57]: Andozalar
        - generic [ref=e59] [cursor=pointer]:
          - img [ref=e61]
          - paragraph [ref=e66]: Jurnallar
        - generic [ref=e68] [cursor=pointer]:
          - img [ref=e70]
          - generic [ref=e75]:
            - paragraph [ref=e76]: Hujjat aylanmasi
            - generic [ref=e78]: "1"
          - img [ref=e80]
        - generic [ref=e83] [cursor=pointer]:
          - img [ref=e85]
          - paragraph [ref=e89]: Bo'limlar
        - generic [ref=e91] [cursor=pointer]:
          - img [ref=e93]
          - paragraph [ref=e98]: Audit jurnali
        - generic [ref=e100] [cursor=pointer]:
          - img [ref=e102]
          - paragraph [ref=e109]: KPI
          - img [ref=e111]
        - generic [ref=e114] [cursor=pointer]:
          - img [ref=e116]
          - paragraph [ref=e122]: Boshqaruv
          - img [ref=e124]
        - generic [ref=e127] [cursor=pointer]:
          - img [ref=e129]
          - paragraph [ref=e135]: Sozlamalar
          - img [ref=e137]
        - generic [ref=e139]:
          - generic [ref=e140] [cursor=pointer]:
            - img [ref=e142]
            - generic [ref=e147]:
              - paragraph [ref=e148]: Vazifalar
              - button [ref=e149]:
                - img [ref=e151]
            - img [ref=e153]
          - paragraph [ref=e160] [cursor=pointer]: Barcha loyihalar
      - generic [ref=e165] [cursor=pointer]:
        - img [ref=e167]
        - paragraph [ref=e173]: Chiqish
    - generic [ref=e174]:
      - banner [ref=e175]:
        - generic [ref=e176]:
          - generic [ref=e181]:
            - img [ref=e183]
            - textbox "Qidirish..." [ref=e186]
            - generic [ref=e189]: Ctrl+K
          - generic [ref=e190]:
            - generic [ref=e194] [cursor=pointer]: SA
            - separator [ref=e195]
            - button [ref=e197] [cursor=pointer]:
              - img [ref=e199]
            - button [ref=e202] [cursor=pointer]:
              - img [ref=e204]
            - button "SA" [ref=e207] [cursor=pointer]:
              - generic "Super Administrator" [ref=e210]:
                - paragraph [ref=e211]: SA
      - main [ref=e212]:
        - generic [ref=e216]:
          - generic [ref=e217]:
            - generic [ref=e218]:
              - paragraph [ref=e219]: Vazifalar
              - paragraph [ref=e220]: Barcha vazifalarni boshqarish
            - button "Yangi vazifa" [ref=e221] [cursor=pointer]:
              - generic [ref=e222]:
                - img [ref=e224]
                - generic [ref=e225]: Yangi vazifa
          - generic [ref=e226]:
            - generic [ref=e227]:
              - generic [ref=e229]:
                - img [ref=e231]
                - textbox "Vazifalarni qidirish..." [ref=e234]
              - generic [ref=e236]:
                - textbox "Loyiha" [ref=e237] [cursor=pointer]: Barcha loyihalar
                - generic:
                  - img
              - generic [ref=e239]:
                - textbox "Muhimlik" [ref=e240] [cursor=pointer]: Barcha muhimliklar
                - generic:
                  - img
              - generic [ref=e242]:
                - textbox "Mas'ul shaxs" [ref=e243]: Barcha foydalanuvchilar
                - generic:
                  - img
            - radiogroup [ref=e244]:
              - generic [ref=e246]:
                - radio [checked]
                - img [ref=e250] [cursor=pointer]
              - generic [ref=e253]:
                - radio
                - img [ref=e257] [cursor=pointer]
              - generic [ref=e258]:
                - radio
                - img [ref=e262] [cursor=pointer]
          - status [ref=e264]
  - button [ref=e265] [cursor=pointer]:
    - img [ref=e267]
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