# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-test.spec.ts >> Barcha sahifalar yuklanadi >> Chat sahifasi (/dashboard/chat)
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
          - paragraph [ref=e33]: KPI
          - img [ref=e35]
        - generic [ref=e38] [cursor=pointer]:
          - img [ref=e40]
          - paragraph [ref=e46]: Sozlamalar
          - img [ref=e48]
        - generic [ref=e51] [cursor=pointer]:
          - img [ref=e53]
          - generic [ref=e58]:
            - paragraph [ref=e59]: Vazifalar
            - button [ref=e60]:
              - img [ref=e62]
          - img [ref=e64]
      - generic [ref=e67] [cursor=pointer]:
        - img [ref=e69]
        - paragraph [ref=e75]: Chiqish
    - generic [ref=e76]:
      - banner [ref=e77]
      - main [ref=e83]:
        - generic [ref=e87]:
          - generic [ref=e88]:
            - generic [ref=e89]:
              - generic [ref=e90]:
                - paragraph [ref=e91]: Suhbatlar
                - generic [ref=e92]:
                  - button [ref=e93] [cursor=pointer]:
                    - img [ref=e95]
                  - button [ref=e98] [cursor=pointer]:
                    - img [ref=e100]
              - generic [ref=e102]:
                - img [ref=e104]
                - textbox "Suhbatlarni qidirish..." [ref=e107]
            - tablist [ref=e109]:
              - tab "Faol" [selected] [ref=e110] [cursor=pointer]:
                - img [ref=e112]
                - generic [ref=e114]: Faol
              - tab "Arxiv" [ref=e115] [cursor=pointer]:
                - img [ref=e117]
                - generic [ref=e120]: Arxiv
            - generic [ref=e124]:
              - generic [ref=e126] [cursor=pointer]:
                - img [ref=e130]
                - generic [ref=e131]:
                  - generic [ref=e132]:
                    - paragraph [ref=e134]: To'qliyev Abdurauf
                    - paragraph [ref=e135]: 9-apr
                  - generic [ref=e136]:
                    - paragraph [ref=e137]: salom
                    - button [ref=e138]:
                      - img [ref=e140]
              - generic [ref=e145] [cursor=pointer]:
                - img [ref=e149]
                - generic [ref=e150]:
                  - generic [ref=e151]:
                    - paragraph [ref=e153]: Abdullayev Abdulaziz
                    - paragraph [ref=e154]: 8-apr
                  - generic [ref=e155]:
                    - paragraph [ref=e156]: reply
                    - button [ref=e157]:
                      - img [ref=e159]
              - generic [ref=e164] [cursor=pointer]:
                - img [ref=e168]
                - generic [ref=e169]:
                  - generic [ref=e170]:
                    - paragraph [ref=e172]: Shodmonov Ruslan
                    - paragraph [ref=e173]: 7-apr
                  - generic [ref=e174]:
                    - paragraph [ref=e175]: forward test
                    - button [ref=e176]:
                      - img [ref=e178]
              - generic [ref=e183] [cursor=pointer]:
                - img [ref=e188]
                - generic [ref=e193]:
                  - generic [ref=e194]:
                    - paragraph [ref=e196]: E2E Test Group
                    - paragraph
                  - generic [ref=e197]:
                    - paragraph [ref=e198]: Hali xabar yo'q
                    - button [ref=e199]:
                      - img [ref=e201]
              - generic [ref=e206] [cursor=pointer]:
                - generic [ref=e210]: ZN
                - generic [ref=e211]:
                  - generic [ref=e212]:
                    - paragraph [ref=e214]: Zilola Norova
                    - paragraph
                  - generic [ref=e215]:
                    - paragraph [ref=e216]: Hali xabar yo'q
                    - button [ref=e217]:
                      - img [ref=e219]
              - generic [ref=e224] [cursor=pointer]:
                - img [ref=e229]
                - generic [ref=e234]:
                  - generic [ref=e235]:
                    - paragraph [ref=e237]: invoice
                    - paragraph
                  - generic [ref=e238]:
                    - paragraph [ref=e239]: Hali xabar yo'q
                    - button [ref=e240]:
                      - img [ref=e242]
          - generic [ref=e248]:
            - img [ref=e250]
            - paragraph [ref=e252]: Suhbatni tanlang
            - paragraph [ref=e253]:
              - text: Chap tomondagi ro'yxatdan suhbat tanlang
              - text: yoki yangi suhbat boshlang
  - button [ref=e254] [cursor=pointer]:
    - img [ref=e256]
  - alert [ref=e260]
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