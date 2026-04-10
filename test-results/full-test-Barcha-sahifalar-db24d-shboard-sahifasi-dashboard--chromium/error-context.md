# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-test.spec.ts >> Barcha sahifalar yuklanadi >> Dashboard sahifasi (/dashboard)
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
    - generic [ref=e3]:
      - img "university logo" [ref=e8]
      - generic [ref=e11]:
        - generic [ref=e13] [cursor=pointer]:
          - img [ref=e15]
          - paragraph [ref=e21]: Bosh sahifa
        - generic [ref=e23] [cursor=pointer]:
          - img [ref=e25]
          - paragraph [ref=e29]: Suhbatlar
        - generic [ref=e31] [cursor=pointer]:
          - img [ref=e33]
          - paragraph [ref=e38]: Hujjatlar
        - generic [ref=e40] [cursor=pointer]:
          - img [ref=e42]
          - paragraph [ref=e46]: Hujjat turlari
        - generic [ref=e48] [cursor=pointer]:
          - img [ref=e50]
          - paragraph [ref=e55]: Andozalar
        - generic [ref=e57] [cursor=pointer]:
          - img [ref=e59]
          - paragraph [ref=e64]: Jurnallar
        - generic [ref=e66] [cursor=pointer]:
          - img [ref=e68]
          - generic [ref=e73]:
            - paragraph [ref=e74]: Hujjat aylanmasi
            - generic [ref=e76]: "1"
          - img [ref=e78]
        - generic [ref=e81] [cursor=pointer]:
          - img [ref=e83]
          - paragraph [ref=e87]: Bo'limlar
        - generic [ref=e89] [cursor=pointer]:
          - img [ref=e91]
          - paragraph [ref=e96]: Audit jurnali
        - generic [ref=e98] [cursor=pointer]:
          - img [ref=e100]
          - paragraph [ref=e107]: KPI
          - img [ref=e109]
        - generic [ref=e112] [cursor=pointer]:
          - img [ref=e114]
          - paragraph [ref=e120]: Boshqaruv
          - img [ref=e122]
        - generic [ref=e125] [cursor=pointer]:
          - img [ref=e127]
          - paragraph [ref=e133]: Sozlamalar
          - img [ref=e135]
        - generic [ref=e138] [cursor=pointer]:
          - img [ref=e140]
          - generic [ref=e145]:
            - paragraph [ref=e146]: Vazifalar
            - button [ref=e147]:
              - img [ref=e149]
          - img [ref=e151]
      - generic [ref=e154] [cursor=pointer]:
        - img [ref=e156]
        - paragraph [ref=e162]: Chiqish
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
                  - paragraph: Statistika
                  - button "Yo'riqnoma":
                    - generic:
                      - generic:
                        - img
                      - generic: Yo'riqnoma
                - paragraph: Tizim ko'rsatkichlari va tahlil
                - generic:
                  - tablist:
                    - tab "Umumiy" [selected]:
                      - generic: Umumiy
                    - tab "Hujjatlar":
                      - generic: Hujjatlar
                    - tab "Hujjat aylanmasi":
                      - generic: Hujjat aylanmasi
                    - tab "Foydalanuvchilar":
                      - generic: Foydalanuvchilar
                  - tabpanel "Umumiy":
                    - generic:
                      - generic:
                        - generic:
                          - generic:
                            - paragraph: Jami hujjatlar
                            - generic:
                              - img
                          - paragraph: "82"
                          - paragraph: Tizimdagi barcha hujjatlar
                        - generic:
                          - generic:
                            - paragraph: Aktiv foydalanuvchilar
                            - generic:
                              - img
                          - paragraph: "14"
                          - paragraph: Faol foydalanuvchilar
                        - generic:
                          - generic:
                            - paragraph: Bo'limlar
                            - generic:
                              - img
                          - paragraph: "9"
                          - paragraph: Tashkilot bo'limlari
                        - generic:
                          - generic:
                            - paragraph: Jurnallar
                            - generic:
                              - img
                          - paragraph: "16"
                          - paragraph: Hujjat jurnallari
                        - generic:
                          - generic:
                            - paragraph: Aktiv jarayonlar
                            - generic:
                              - img
                          - paragraph: "9"
                          - paragraph: Jarayondagi hujjat aylanmasi
                        - generic:
                          - generic:
                            - paragraph: Kutilayotgan vazifalar
                            - generic:
                              - img
                          - paragraph: "18"
                          - paragraph: Bajarilishi kerak
                      - generic:
                        - generic:
                          - generic:
                            - paragraph: Hujjat turlari
                            - paragraph: Turlar bo'yicha taqsimot
                            - generic:
                              - generic:
                                - generic:
                                  - img:
                                    - generic:
                                      - generic:
                                        - generic:
                                          - img
                                        - generic:
                                          - img
                                        - generic:
                                          - img
                                        - generic:
                                          - img
                                        - generic:
                                          - img
                                        - generic:
                                          - img
                                        - generic:
                                          - img
                                        - generic:
                                          - img
                                        - generic:
                                          - img
                                        - generic:
                                          - img
                                        - generic:
                                          - img
                                        - generic:
                                          - img
                                        - generic:
                                          - img
                                        - generic:
                                          - img
                                        - generic:
                                          - img
                                        - generic:
                                          - img
                                        - generic:
                                          - img
                                        - generic:
                                          - img
                            - generic:
                              - generic:
                                - generic:
                                  - paragraph: Buyruq
                                - generic:
                                  - paragraph: "2"
                                  - paragraph: (2%)
                              - generic:
                                - generic:
                                  - paragraph: Hisob-faktura
                                - generic:
                                  - paragraph: "1"
                                  - paragraph: (1%)
                              - generic:
                                - generic:
                                  - paragraph: Shtat jadvali
                                - generic:
                                  - paragraph: "4"
                                  - paragraph: (5%)
                              - generic:
                                - generic:
                                  - paragraph: Unknown
                                - generic:
                                  - paragraph: "2"
                                  - paragraph: (2%)
                              - generic:
                                - generic:
                                  - paragraph: Texnik hujjat
                                - generic:
                                  - paragraph: "5"
                                  - paragraph: (6%)
                              - generic:
                                - generic:
                                  - paragraph: Unknown
                                - generic:
                                  - paragraph: "2"
                                  - paragraph: (2%)
                              - generic:
                                - generic:
                                  - paragraph: Loyiha hujjati
                                - generic:
                                  - paragraph: "40"
                                  - paragraph: (49%)
                              - generic:
                                - generic:
                                  - paragraph: Yo'riqnoma
                                - generic:
                                  - paragraph: "1"
                                  - paragraph: (1%)
                              - generic:
                                - generic:
                                  - paragraph: Ma'lumotnoma
                                - generic:
                                  - paragraph: "1"
                                  - paragraph: (1%)
                              - generic:
                                - generic:
                                  - paragraph: Texnik hujjatk
                                - generic:
                                  - paragraph: "10"
                                  - paragraph: (12%)
                              - generic:
                                - generic:
                                  - paragraph: Smetа
                                - generic:
                                  - paragraph: "2"
                                  - paragraph: (2%)
                              - generic:
                                - generic:
                                  - paragraph: Xat
                                - generic:
                                  - paragraph: "2"
                                  - paragraph: (2%)
                              - generic:
                                - generic:
                                  - paragraph: Akt
                                - generic:
                                  - paragraph: "2"
                                  - paragraph: (2%)
                              - generic:
                                - generic:
                                  - paragraph: Qaror
                                - generic:
                                  - paragraph: "1"
                                  - paragraph: (1%)
                              - generic:
                                - generic:
                                  - paragraph: Bayonnoma
                                - generic:
                                  - paragraph: "1"
                                  - paragraph: (1%)
                              - generic:
                                - generic:
                                  - paragraph: Mehnat shartnomasi
                                - generic:
                                  - paragraph: "3"
                                  - paragraph: (4%)
                              - generic:
                                - generic:
                                  - paragraph: Hisobot
                                - generic:
                                  - paragraph: "1"
                                  - paragraph: (1%)
                              - generic:
                                - generic:
                                  - paragraph: Shartnoma
                                - generic:
                                  - paragraph: "2"
                                  - paragraph: (2%)
                        - generic:
                          - generic:
                            - paragraph: Hujjatlar holati
                            - paragraph: Holatlar bo'yicha taqsimot
                            - generic:
                              - generic:
                                - generic:
                                  - paragraph: Qoralama
                                  - generic:
                                    - paragraph: "57"
                                    - paragraph: (70%)
                                - generic:
                                  - progressbar
                              - generic:
                                - generic:
                                  - paragraph: Kutilmoqda
                                  - generic:
                                    - paragraph: "9"
                                    - paragraph: (11%)
                                - generic:
                                  - progressbar
                              - generic:
                                - generic:
                                  - paragraph: Ko'rib chiqilmoqda
                                  - generic:
                                    - paragraph: "1"
                                    - paragraph: (1%)
                                - generic:
                                  - progressbar
                              - generic:
                                - generic:
                                  - paragraph: Tasdiqlangan
                                  - generic:
                                    - paragraph: "14"
                                    - paragraph: (17%)
                                - generic:
                                  - progressbar
                              - generic:
                                - generic:
                                  - paragraph: Rad etilgan
                                  - generic:
                                    - paragraph: "1"
                                    - paragraph: (1%)
                                - generic:
                                  - progressbar
                              - generic:
                                - generic:
                                  - paragraph: Arxivlangan
                                  - generic:
                                    - paragraph: "0"
                                    - paragraph: (0%)
                                - generic:
                                  - progressbar
                            - generic:
                              - generic:
                                - paragraph: Jami hujjatlar
                                - paragraph: "82"
                      - generic:
                        - generic:
                          - paragraph: Oylik statistika
                          - paragraph: Hujjatlar yaratilish tendensiyasi
                          - generic:
                            - generic:
                              - generic:
                                - img:
                                  - generic:
                                    - generic:
                                      - generic:
                                        - generic: 2026-04
                                  - generic:
                                    - generic:
                                      - generic:
                                        - generic: "0"
                                      - generic:
                                        - generic: "25"
                                      - generic:
                                        - generic: "50"
                                      - generic:
                                        - generic: "75"
                                      - generic:
                                        - generic: "100"
                      - generic:
                        - generic:
                          - paragraph: Bo'limlar statistikasi
                          - paragraph: Hujjatlar va foydalanuvchilar soni
                          - generic:
                            - generic:
                              - generic:
                                - img:
                                  - generic:
                                    - generic:
                                      - generic:
                                        - generic: Bosh Direktor
                                      - generic:
                                        - generic: Dasturlash Sektori
                                      - generic:
                                        - generic: Buxgalteriya
                                      - generic:
                                        - generic: Xazina
                                      - generic:
                                        - generic: IT Bo'limi
                                      - generic:
                                        - generic: Moliya Bo'limi
                                      - generic:
                                        - generic: Kadrlar Bo'limi
                                      - generic:
                                        - generic: Arxiv Bo'limi
                                  - generic:
                                    - generic:
                                      - generic:
                                        - generic: "0"
                                      - generic:
                                        - generic: "4"
                                      - generic:
                                        - generic: "8"
                                      - generic:
                                        - generic: "12"
                                      - generic:
                                        - generic: "16"
                                - generic:
                                  - list:
                                    - listitem:
                                      - img
                                      - text: Hujjatlar
                                    - listitem:
                                      - img
                                      - text: Foydalanuvchilar
  - button:
    - generic:
      - img
  - generic:
    - alert
  - dialog "Asosiy menyu" [ref=e163]:
    - button "Close" [active] [ref=e164] [cursor=pointer]: ×
    - banner [ref=e165]: Asosiy menyu
    - generic [ref=e166]: Barcha bo'limlarga shu yerdan o'ting
    - contentinfo [ref=e167]:
      - generic [ref=e168]: 1 / 5
      - generic [ref=e169]:
        - button "← Oldingi" [disabled]
        - button "Keyingi →" [ref=e170] [cursor=pointer]
  - img
  - generic: "4"
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