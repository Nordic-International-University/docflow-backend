# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-test.spec.ts >> Hujjat yaratish >> Hujjat sahifasiga kirish va yaratish tugmasi
- Location: test/browser/full-test.spec.ts:73:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Yaratish"), button:has-text("Yangi"), button:has-text("Qo\'shish"), a:has-text("Yaratish")').first()
    - locator resolved to <button disabled type="button" data-size="sm" data-disabled="true" aria-expanded="true" aria-haspopup="dialog" data-tour="document-create" aria-controls="driver-popover-content" class="mantine-focus-auto m_77c9d27d mantine-Button-root m_87cf2631 mantine-UnstyledButton-root driver-active-element">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
      - waiting 100ms
    102 × waiting for element to be visible, enabled and stable
        - element is not enabled
      - retrying click action
        - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic:
    - generic:
      - generic:
        - generic:
          - generic:
            - generic:
              - img "university logo"
        - generic:
          - generic:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - img
                  - generic:
                    - generic:
                      - paragraph: Bosh sahifa
              - generic:
                - generic:
                  - generic:
                    - img
                  - generic:
                    - generic:
                      - generic:
                        - paragraph: KPI
                  - generic:
                    - img
              - generic:
                - generic:
                  - generic:
                    - img
                  - generic:
                    - generic:
                      - generic:
                        - paragraph: Sozlamalar
                  - generic:
                    - img
              - generic:
                - generic:
                  - generic:
                    - img
                  - generic:
                    - generic:
                      - generic:
                        - paragraph: Vazifalar
                        - button:
                          - generic:
                            - img
                  - generic:
                    - img
        - generic:
          - generic:
            - generic:
              - img
            - generic:
              - generic:
                - paragraph: Chiqish
    - generic:
      - banner
      - main:
        - generic:
          - generic:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - tablist:
                        - tab "Barchasi" [selected]:
                          - generic: Barchasi
                        - tab "Loyiha hujjati":
                          - generic: Loyiha hujjati
                        - tab "Texnik hujjat":
                          - generic: Texnik hujjat
                        - tab "Texnik hujjatk":
                          - generic: Texnik hujjatk
                        - tab "Mehnat shartnomasi":
                          - generic: Mehnat shartnomasi
                        - tab "Shtat jadvali":
                          - generic: Shtat jadvali
                      - button "+ Yangi hujjat" [disabled] [expanded] [ref=e2]:
                        - generic [ref=e4]: + Yangi hujjat
                  - generic:
                    - generic:
                      - generic:
                        - generic:
                          - generic:
                            - generic:
                              - generic:
                                - img
                              - textbox "Hujjatlarni qidirish..."
                          - button:
                            - generic:
                              - img
                      - generic:
                        - generic:
                          - generic:
                            - generic:
                              - generic:
                                - paragraph: OPA OPA ADRENALAYN
                                - paragraph: Ma'lumot yo'q
                                - generic:
                                  - generic:
                                    - generic: Jarayonda
                              - generic:
                                - paragraph: scsdcdscdscds
                                - paragraph: Ma'lumot yo'q
                                - generic:
                                  - generic:
                                    - generic: Jarayonda
                              - generic:
                                - paragraph: Test
                                - paragraph: Ma'lumot yo'q
                                - generic:
                                  - generic:
                                    - generic: Jarayonda
                              - generic:
                                - paragraph: sbsfbdsfbdfb
                                - paragraph: Ma'lumot yo'q
                                - generic:
                                  - generic:
                                    - generic: Tasdiqlangan
                              - generic:
                                - paragraph: Abdulaziz test hujjati
                                - paragraph: Ma'lumot yo'q
                                - generic:
                                  - generic:
                                    - generic: Tayyorlanmoqda
                              - generic:
                                - paragraph: "Race test #3 1775728921525"
                                - paragraph: race test
                                - generic:
                                  - generic:
                                    - generic: Tayyorlanmoqda
                              - generic:
                                - paragraph: "Race test #4 1775728921525"
                                - paragraph: race test
                                - generic:
                                  - generic:
                                    - generic: Tayyorlanmoqda
                              - generic:
                                - paragraph: "Race test #1 1775728921525"
                                - paragraph: race test
                                - generic:
                                  - generic:
                                    - generic: Tayyorlanmoqda
                              - generic:
                                - paragraph: "Race test #2 1775728921525"
                                - paragraph: race test
                                - generic:
                                  - generic:
                                    - generic: Tayyorlanmoqda
                              - generic:
                                - paragraph: "Race test #0 1775728921524"
                                - paragraph: race test
                                - generic:
                                  - generic:
                                    - generic: Tayyorlanmoqda
                              - generic:
                                - paragraph: "Race test #1 1775728567546"
                                - paragraph: race test
                                - generic:
                                  - generic:
                                    - generic: Tayyorlanmoqda
                              - generic:
                                - paragraph: "Race test #4 1775728567546"
                                - paragraph: race test
                                - generic:
                                  - generic:
                                    - generic: Tayyorlanmoqda
                      - generic:
                        - generic:
                          - paragraph: 82 ta
                          - generic:
                            - button [disabled]:
                              - generic:
                                - img
                            - paragraph: "1"
                            - button:
                              - generic:
                                - img
                    - generic:
                      - generic:
                        - generic:
                          - img
                          - paragraph: Element tanlanmagan
                          - paragraph: Tafsilotlarni ko'rish uchun ro'yxatdan element tanlang
  - button:
    - generic:
      - img
  - generic:
    - alert
  - dialog "Yangi hujjat" [ref=e5]:
    - button "Close" [active] [ref=e6] [cursor=pointer]: ×
    - banner [ref=e7]: Yangi hujjat
    - generic [ref=e8]: Yangi hujjat yarating
    - contentinfo [ref=e9]:
      - generic [ref=e10]: 1 / 4
      - generic [ref=e11]:
        - button "← Oldingi" [disabled]
        - button "Keyingi →" [ref=e12] [cursor=pointer]
  - img
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
  64  |       expect(is404).toBeFalsy()
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
> 84  |       await createBtn.first().click()
      |                               ^ Error: locator.click: Test timeout of 60000ms exceeded.
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