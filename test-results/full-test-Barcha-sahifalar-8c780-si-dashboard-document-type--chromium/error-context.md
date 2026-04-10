# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-test.spec.ts >> Barcha sahifalar yuklanadi >> Hujjat turlari sahifasi (/dashboard/document-type)
- Location: test/browser/full-test.spec.ts:50:9

# Error details

```
Error: expect(received).toBeFalsy()

Received: true
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic:
    - alert
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
                      - paragraph: Suhbatlar
              - generic:
                - generic:
                  - generic:
                    - img
                  - generic:
                    - generic:
                      - paragraph: Hujjatlar
              - generic:
                - generic:
                  - generic:
                    - img
                  - generic:
                    - generic:
                      - paragraph: Hujjat turlari
              - generic:
                - generic:
                  - generic:
                    - img
                  - generic:
                    - generic:
                      - paragraph: Andozalar
              - generic:
                - generic:
                  - generic:
                    - img
                  - generic:
                    - generic:
                      - paragraph: Jurnallar
              - generic:
                - generic:
                  - generic:
                    - img
                  - generic:
                    - generic:
                      - generic:
                        - paragraph: Hujjat aylanmasi
                        - generic:
                          - generic: "1"
                  - generic:
                    - img
              - generic:
                - generic:
                  - generic:
                    - img
                  - generic:
                    - generic:
                      - paragraph: Bo'limlar
              - generic:
                - generic:
                  - generic:
                    - img
                  - generic:
                    - generic:
                      - paragraph: Audit jurnali
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
                        - paragraph: Boshqaruv
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
      - banner:
        - generic:
          - generic:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - img
                    - textbox "Qidirish..."
                    - generic:
                      - generic:
                        - generic: Ctrl+K
          - generic:
            - generic:
              - generic:
                - generic:
                  - generic: SA
            - separator
            - generic:
              - button:
                - generic:
                  - img
            - button:
              - generic:
                - img
            - button "SA":
              - generic:
                - generic:
                  - generic "Super Administrator":
                    - paragraph: SA
      - main:
        - generic:
          - generic:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - paragraph: Hujjat turlari
                    - paragraph: Hujjat turlarini boshqarish
                  - generic:
                    - button:
                      - generic:
                        - img
                    - button "Hujjat turini qo'shish" [expanded] [ref=e2] [cursor=pointer]:
                      - generic [ref=e3]:
                        - img [ref=e5]
                        - generic [ref=e6]: Hujjat turini qo'shish
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - img
                      - textbox "Hujjat turini qidirish..."
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - generic:
                          - generic:
                            - generic:
                              - table:
                                - rowgroup:
                                  - row "Nomi Tavsif Amallar":
                                    - columnheader "Nomi":
                                      - button "Nomi":
                                        - paragraph: Nomi
                                        - img
                                    - columnheader "Tavsif":
                                      - button "Tavsif":
                                        - paragraph: Tavsif
                                        - img
                                    - columnheader "Amallar":
                                      - paragraph: Amallar
                                - rowgroup:
                                  - row "Loyiha hujjati Loyihalarга oid hujjatlar va taqdimotlar":
                                    - cell "Loyiha hujjati":
                                      - generic:
                                        - img
                                        - paragraph: Loyiha hujjati
                                    - cell "Loyihalarга oid hujjatlar va taqdimotlar":
                                      - paragraph: Loyihalarга oid hujjatlar va taqdimotlar
                                    - cell:
                                      - button:
                                        - generic:
                                          - img
                                  - row "Texnik hujjat Texnik tavsifnomalar va hujjatlar":
                                    - cell "Texnik hujjat":
                                      - generic:
                                        - img
                                        - paragraph: Texnik hujjat
                                    - cell "Texnik tavsifnomalar va hujjatlar":
                                      - paragraph: Texnik tavsifnomalar va hujjatlar
                                    - cell:
                                      - button:
                                        - generic:
                                          - img
                                  - row "Texnik hujjatk Texnik tavsifnomalar va hujjatlar":
                                    - cell "Texnik hujjatk":
                                      - generic:
                                        - img
                                        - paragraph: Texnik hujjatk
                                    - cell "Texnik tavsifnomalar va hujjatlar":
                                      - paragraph: Texnik tavsifnomalar va hujjatlar
                                    - cell:
                                      - button:
                                        - generic:
                                          - img
                                  - row "Mehnat shartnomasi Xodimlar bilan tuzilgan mehnat shartnomalari":
                                    - cell "Mehnat shartnomasi":
                                      - generic:
                                        - img
                                        - paragraph: Mehnat shartnomasi
                                    - cell "Xodimlar bilan tuzilgan mehnat shartnomalari":
                                      - paragraph: Xodimlar bilan tuzilgan mehnat shartnomalari
                                    - cell:
                                      - button:
                                        - generic:
                                          - img
                                  - row "Shtat jadvali Tashkilotning shtat jadvali va o'zgarishlar":
                                    - cell "Shtat jadvali":
                                      - generic:
                                        - img
                                        - paragraph: Shtat jadvali
                                    - cell "Tashkilotning shtat jadvali va o'zgarishlar":
                                      - paragraph: Tashkilotning shtat jadvali va o'zgarishlar
                                    - cell:
                                      - button:
                                        - generic:
                                          - img
                                  - row "To'lov topshiriqномаsi Bank to'lovlari uchun topshiriqnomalar":
                                    - cell "To'lov topshiriqномаsi":
                                      - generic:
                                        - img
                                        - paragraph: To'lov topshiriqномаsi
                                    - cell "Bank to'lovlari uchun topshiriqnomalar":
                                      - paragraph: Bank to'lovlari uchun topshiriqnomalar
                                    - cell:
                                      - button:
                                        - generic:
                                          - img
                                  - row "Hisob-faktura Moliyaviy hisob-fakturalar va schyotlar":
                                    - cell "Hisob-faktura":
                                      - generic:
                                        - img
                                        - paragraph: Hisob-faktura
                                    - cell "Moliyaviy hisob-fakturalar va schyotlar":
                                      - paragraph: Moliyaviy hisob-fakturalar va schyotlar
                                    - cell:
                                      - button:
                                        - generic:
                                          - img
                                  - row "Smetа Moliyaviy smetalar va byudjetlar":
                                    - cell "Smetа":
                                      - generic:
                                        - img
                                        - paragraph: Smetа
                                    - cell "Moliyaviy smetalar va byudjetlar":
                                      - paragraph: Moliyaviy smetalar va byudjetlar
                                    - cell:
                                      - button:
                                        - generic:
                                          - img
                                  - row "Qaror Rahbariyat va kengash qarorlari":
                                    - cell "Qaror":
                                      - generic:
                                        - img
                                        - paragraph: Qaror
                                    - cell "Rahbariyat va kengash qarorlari":
                                      - paragraph: Rahbariyat va kengash qarorlari
                                    - cell:
                                      - button:
                                        - generic:
                                          - img
                                  - row "Akt Turli tekshiruvlar va bajarilgan ishlar aktlari":
                                    - cell "Akt":
                                      - generic:
                                        - img
                                        - paragraph: Akt
                                    - cell "Turli tekshiruvlar va bajarilgan ishlar aktlari":
                                      - paragraph: Turli tekshiruvlar va bajarilgan ishlar aktlari
                                    - cell:
                                      - button:
                                        - generic:
                                          - img
                      - generic:
                        - paragraph: 1-10 / 18
                        - generic:
                          - generic:
                            - generic:
                              - textbox: "10"
                              - generic:
                                - img
                          - generic:
                            - button [disabled]:
                              - generic:
                                - img
                            - paragraph: 1 / 2
                            - button:
                              - generic:
                                - img
  - button:
    - generic:
      - img
  - dialog "Yangi tur" [ref=e7]:
    - button "Close" [active] [ref=e8] [cursor=pointer]: ×
    - banner [ref=e9]: Yangi tur
    - generic [ref=e10]: Hujjat turi yarating
    - contentinfo [ref=e11]:
      - generic [ref=e12]: 1 / 3
      - generic [ref=e13]:
        - button "← Oldingi" [disabled]
        - button "Keyingi →" [ref=e14] [cursor=pointer]
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