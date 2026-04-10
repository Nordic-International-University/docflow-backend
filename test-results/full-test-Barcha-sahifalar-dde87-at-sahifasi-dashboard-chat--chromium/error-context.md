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
        - generic [ref=e139] [cursor=pointer]:
          - img [ref=e141]
          - generic [ref=e146]:
            - paragraph [ref=e147]: Vazifalar
            - button [ref=e148]:
              - img [ref=e150]
          - img [ref=e152]
      - generic [ref=e155] [cursor=pointer]:
        - img [ref=e157]
        - paragraph [ref=e163]: Chiqish
    - generic [ref=e164]:
      - banner [ref=e165]:
        - generic [ref=e166]:
          - generic [ref=e171]:
            - img [ref=e173]
            - textbox "Qidirish..." [ref=e176]
            - generic [ref=e179]: Ctrl+K
          - generic [ref=e180]:
            - generic [ref=e184] [cursor=pointer]: SA
            - separator [ref=e185]
            - button [ref=e187] [cursor=pointer]:
              - img [ref=e189]
            - button [ref=e192] [cursor=pointer]:
              - img [ref=e194]
            - button "SA" [ref=e197] [cursor=pointer]:
              - generic "Super Administrator" [ref=e200]:
                - paragraph [ref=e201]: SA
      - main [ref=e202]:
        - generic [ref=e206]:
          - generic [ref=e207]:
            - generic [ref=e208]:
              - generic [ref=e209]:
                - paragraph [ref=e210]: Suhbatlar
                - generic [ref=e211]:
                  - button [ref=e212] [cursor=pointer]:
                    - img [ref=e214]
                  - button [ref=e217] [cursor=pointer]:
                    - img [ref=e219]
              - generic [ref=e221]:
                - img [ref=e223]
                - textbox "Suhbatlarni qidirish..." [ref=e226]
            - tablist [ref=e228]:
              - tab "Faol" [selected] [ref=e229] [cursor=pointer]:
                - img [ref=e231]
                - generic [ref=e233]: Faol
              - tab "Arxiv" [ref=e234] [cursor=pointer]:
                - img [ref=e236]
                - generic [ref=e239]: Arxiv
            - generic [ref=e243]:
              - generic [ref=e245] [cursor=pointer]:
                - img [ref=e249]
                - generic [ref=e250]:
                  - generic [ref=e251]:
                    - paragraph [ref=e253]: To'qliyev Abdurauf
                    - paragraph [ref=e254]: 9-apr
                  - generic [ref=e255]:
                    - paragraph [ref=e256]: salom
                    - button [ref=e257]:
                      - img [ref=e259]
              - generic [ref=e264] [cursor=pointer]:
                - img [ref=e268]
                - generic [ref=e269]:
                  - generic [ref=e270]:
                    - paragraph [ref=e272]: Abdullayev Abdulaziz
                    - paragraph [ref=e273]: 8-apr
                  - generic [ref=e274]:
                    - paragraph [ref=e275]: reply
                    - button [ref=e276]:
                      - img [ref=e278]
              - generic [ref=e283] [cursor=pointer]:
                - img [ref=e287]
                - generic [ref=e288]:
                  - generic [ref=e289]:
                    - paragraph [ref=e291]: Shodmonov Ruslan
                    - paragraph [ref=e292]: 7-apr
                  - generic [ref=e293]:
                    - paragraph [ref=e294]: forward test
                    - button [ref=e295]:
                      - img [ref=e297]
              - generic [ref=e302] [cursor=pointer]:
                - img [ref=e307]
                - generic [ref=e312]:
                  - generic [ref=e313]:
                    - paragraph [ref=e315]: E2E Test Group
                    - paragraph
                  - generic [ref=e316]:
                    - paragraph [ref=e317]: Hali xabar yo'q
                    - button [ref=e318]:
                      - img [ref=e320]
              - generic [ref=e325] [cursor=pointer]:
                - generic [ref=e329]: ZN
                - generic [ref=e330]:
                  - generic [ref=e331]:
                    - paragraph [ref=e333]: Zilola Norova
                    - paragraph
                  - generic [ref=e334]:
                    - paragraph [ref=e335]: Hali xabar yo'q
                    - button [ref=e336]:
                      - img [ref=e338]
              - generic [ref=e343] [cursor=pointer]:
                - img [ref=e348]
                - generic [ref=e353]:
                  - generic [ref=e354]:
                    - paragraph [ref=e356]: invoice
                    - paragraph
                  - generic [ref=e357]:
                    - paragraph [ref=e358]: Hali xabar yo'q
                    - button [ref=e359]:
                      - img [ref=e361]
          - generic [ref=e367]:
            - img [ref=e369]
            - paragraph [ref=e371]: Suhbatni tanlang
            - paragraph [ref=e372]:
              - text: Chap tomondagi ro'yxatdan suhbat tanlang
              - text: yoki yangi suhbat boshlang
  - button [ref=e373] [cursor=pointer]:
    - img [ref=e375]
  - alert [ref=e379]
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