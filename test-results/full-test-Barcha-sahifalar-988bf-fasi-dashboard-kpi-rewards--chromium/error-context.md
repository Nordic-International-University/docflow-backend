# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-test.spec.ts >> Barcha sahifalar yuklanadi >> KPI - Rewards sahifasi (/dashboard/kpi/rewards)
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
        - generic [ref=e23]:
          - generic [ref=e24] [cursor=pointer]:
            - img [ref=e26]
            - paragraph [ref=e33]: KPI
            - img [ref=e35]
          - generic [ref=e38]:
            - paragraph [ref=e43] [cursor=pointer]: Ball sozlamalari
            - paragraph [ref=e48] [cursor=pointer]: Mukofot darajalari
            - paragraph [ref=e53] [cursor=pointer]: Oylik KPI
            - paragraph [ref=e58] [cursor=pointer]: Mukofotlar
        - generic [ref=e60] [cursor=pointer]:
          - img [ref=e62]
          - paragraph [ref=e68]: Sozlamalar
          - img [ref=e70]
        - generic [ref=e73] [cursor=pointer]:
          - img [ref=e75]
          - generic [ref=e80]:
            - paragraph [ref=e81]: Vazifalar
            - button [ref=e82]:
              - img [ref=e84]
          - img [ref=e86]
      - generic [ref=e89] [cursor=pointer]:
        - img [ref=e91]
        - paragraph [ref=e97]: Chiqish
    - generic [ref=e98]:
      - banner [ref=e99]
      - main [ref=e105]:
        - generic [ref=e109]:
          - generic [ref=e111]:
            - paragraph [ref=e112]: KPI Mukofotlar
            - paragraph [ref=e113]: KPI mukofotlarni boshqarish
          - generic [ref=e115]:
            - generic [ref=e117]:
              - textbox "Yil" [ref=e118] [cursor=pointer]: "2026"
              - generic:
                - generic:
                  - button [ref=e119] [cursor=pointer]:
                    - img [ref=e120]
                  - img
            - generic [ref=e123]:
              - textbox "Oy" [ref=e124] [cursor=pointer]
              - generic:
                - img
            - generic [ref=e126]:
              - textbox "Holat" [ref=e127] [cursor=pointer]: Barchasi
              - generic:
                - img
          - generic [ref=e128]:
            - tablist [ref=e129]:
              - tab "Barchasi" [selected] [ref=e130] [cursor=pointer]:
                - img [ref=e132]
                - generic [ref=e134]: Barchasi
              - tab "Mening mukofotlarim" [ref=e135] [cursor=pointer]:
                - img [ref=e137]
                - generic [ref=e140]: Mening mukofotlarim
            - tabpanel "Barchasi" [ref=e141]:
              - generic [ref=e143]:
                - table [ref=e148]:
                  - rowgroup [ref=e149]:
                    - row "Xodim Davr Ball Daraja So'm BHM Holat" [ref=e150]:
                      - columnheader "Xodim" [ref=e151]:
                        - button "Xodim" [ref=e152] [cursor=pointer]:
                          - paragraph [ref=e153]: Xodim
                          - img [ref=e154]
                      - columnheader "Davr" [ref=e157]:
                        - button "Davr" [ref=e158] [cursor=pointer]:
                          - paragraph [ref=e159]: Davr
                          - img [ref=e160]
                      - columnheader "Ball" [ref=e163]:
                        - button "Ball" [ref=e164] [cursor=pointer]:
                          - paragraph [ref=e165]: Ball
                          - img [ref=e166]
                      - columnheader "Daraja" [ref=e169]:
                        - button "Daraja" [ref=e170] [cursor=pointer]:
                          - paragraph [ref=e171]: Daraja
                          - img [ref=e172]
                      - columnheader "So'm" [ref=e175]:
                        - button "So'm" [ref=e176] [cursor=pointer]:
                          - paragraph [ref=e177]: So'm
                          - img [ref=e178]
                      - columnheader "BHM" [ref=e181]:
                        - button "BHM" [ref=e182] [cursor=pointer]:
                          - paragraph [ref=e183]: BHM
                          - img [ref=e184]
                      - columnheader "Holat" [ref=e187]:
                        - button "Holat" [ref=e188] [cursor=pointer]:
                          - paragraph [ref=e189]: Holat
                          - img [ref=e190]
                      - columnheader [ref=e193]:
                        - paragraph
                  - rowgroup [ref=e194]:
                    - row "SH Sevara Hamidova Mart 2026 100 A'lo 5,625,000 15 To'langan" [ref=e195] [cursor=pointer]:
                      - cell "SH Sevara Hamidova" [ref=e196]:
                        - generic [ref=e197]:
                          - paragraph [ref=e200]: SH
                          - paragraph [ref=e201]: Sevara Hamidova
                      - cell "Mart 2026" [ref=e202]:
                        - paragraph [ref=e203]: Mart 2026
                      - cell "100" [ref=e204]:
                        - generic [ref=e206]: "100"
                      - cell "A'lo" [ref=e207]:
                        - generic [ref=e209]: A'lo
                      - cell "5,625,000" [ref=e210]:
                        - paragraph [ref=e211]: 5,625,000
                      - cell "15" [ref=e212]:
                        - paragraph [ref=e213]: "15"
                      - cell "To'langan" [ref=e214]:
                        - generic [ref=e216]: To'langan
                      - cell [ref=e217]:
                        - button [ref=e218]:
                          - img [ref=e220]
                    - row "NI Nigora Ismoilova Mart 2026 78 Qoniqarli 1,875,000 5 To'langan" [ref=e224] [cursor=pointer]:
                      - cell "NI Nigora Ismoilova" [ref=e225]:
                        - generic [ref=e226]:
                          - paragraph [ref=e229]: NI
                          - paragraph [ref=e230]: Nigora Ismoilova
                      - cell "Mart 2026" [ref=e231]:
                        - paragraph [ref=e232]: Mart 2026
                      - cell "78" [ref=e233]:
                        - generic [ref=e235]: "78"
                      - cell "Qoniqarli" [ref=e236]:
                        - generic [ref=e238]: Qoniqarli
                      - cell "1,875,000" [ref=e239]:
                        - paragraph [ref=e240]: 1,875,000
                      - cell "5" [ref=e241]:
                        - paragraph [ref=e242]: "5"
                      - cell "To'langan" [ref=e243]:
                        - generic [ref=e245]: To'langan
                      - cell [ref=e246]:
                        - button [ref=e247]:
                          - img [ref=e249]
                    - row "OS Otabek Sharipov Mart 2026 100 A'lo 5,625,000 15 Tasdiqlangan" [ref=e253] [cursor=pointer]:
                      - cell "OS Otabek Sharipov" [ref=e254]:
                        - generic [ref=e255]:
                          - paragraph [ref=e258]: OS
                          - paragraph [ref=e259]: Otabek Sharipov
                      - cell "Mart 2026" [ref=e260]:
                        - paragraph [ref=e261]: Mart 2026
                      - cell "100" [ref=e262]:
                        - generic [ref=e264]: "100"
                      - cell "A'lo" [ref=e265]:
                        - generic [ref=e267]: A'lo
                      - cell "5,625,000" [ref=e268]:
                        - paragraph [ref=e269]: 5,625,000
                      - cell "15" [ref=e270]:
                        - paragraph [ref=e271]: "15"
                      - cell "Tasdiqlangan" [ref=e272]:
                        - generic [ref=e274]: Tasdiqlangan
                      - cell [ref=e275]:
                        - button [ref=e276]:
                          - img [ref=e278]
                    - row "DQ Davron Qosimov Mart 2026 100 A'lo 5,625,000 15 Tasdiqlangan" [ref=e282] [cursor=pointer]:
                      - cell "DQ Davron Qosimov" [ref=e283]:
                        - generic [ref=e284]:
                          - paragraph [ref=e287]: DQ
                          - paragraph [ref=e288]: Davron Qosimov
                      - cell "Mart 2026" [ref=e289]:
                        - paragraph [ref=e290]: Mart 2026
                      - cell "100" [ref=e291]:
                        - generic [ref=e293]: "100"
                      - cell "A'lo" [ref=e294]:
                        - generic [ref=e296]: A'lo
                      - cell "5,625,000" [ref=e297]:
                        - paragraph [ref=e298]: 5,625,000
                      - cell "15" [ref=e299]:
                        - paragraph [ref=e300]: "15"
                      - cell "Tasdiqlangan" [ref=e301]:
                        - generic [ref=e303]: Tasdiqlangan
                      - cell [ref=e304]:
                        - button [ref=e305]:
                          - img [ref=e307]
                    - row "MS Malika Safarova Mart 2026 86 Yaxshi 3,750,000 10 Tasdiqlangan" [ref=e311] [cursor=pointer]:
                      - cell "MS Malika Safarova" [ref=e312]:
                        - generic [ref=e313]:
                          - paragraph [ref=e316]: MS
                          - paragraph [ref=e317]: Malika Safarova
                      - cell "Mart 2026" [ref=e318]:
                        - paragraph [ref=e319]: Mart 2026
                      - cell "86" [ref=e320]:
                        - generic [ref=e322]: "86"
                      - cell "Yaxshi" [ref=e323]:
                        - generic [ref=e325]: Yaxshi
                      - cell "3,750,000" [ref=e326]:
                        - paragraph [ref=e327]: 3,750,000
                      - cell "10" [ref=e328]:
                        - paragraph [ref=e329]: "10"
                      - cell "Tasdiqlangan" [ref=e330]:
                        - generic [ref=e332]: Tasdiqlangan
                      - cell [ref=e333]:
                        - button [ref=e334]:
                          - img [ref=e336]
                    - row "SU Shohruh Umarov Mart 2026 100 A'lo 5,625,000 15 Tasdiqlangan" [ref=e340] [cursor=pointer]:
                      - cell "SU Shohruh Umarov" [ref=e341]:
                        - generic [ref=e342]:
                          - paragraph [ref=e345]: SU
                          - paragraph [ref=e346]: Shohruh Umarov
                      - cell "Mart 2026" [ref=e347]:
                        - paragraph [ref=e348]: Mart 2026
                      - cell "100" [ref=e349]:
                        - generic [ref=e351]: "100"
                      - cell "A'lo" [ref=e352]:
                        - generic [ref=e354]: A'lo
                      - cell "5,625,000" [ref=e355]:
                        - paragraph [ref=e356]: 5,625,000
                      - cell "15" [ref=e357]:
                        - paragraph [ref=e358]: "15"
                      - cell "Tasdiqlangan" [ref=e359]:
                        - generic [ref=e361]: Tasdiqlangan
                      - cell [ref=e362]:
                        - button [ref=e363]:
                          - img [ref=e365]
                    - row "JA Jamshid Alimov Mart 2026 95 Yaxshi 3,750,000 10 Tasdiqlangan" [ref=e369] [cursor=pointer]:
                      - cell "JA Jamshid Alimov" [ref=e370]:
                        - generic [ref=e371]:
                          - paragraph [ref=e374]: JA
                          - paragraph [ref=e375]: Jamshid Alimov
                      - cell "Mart 2026" [ref=e376]:
                        - paragraph [ref=e377]: Mart 2026
                      - cell "95" [ref=e378]:
                        - generic [ref=e380]: "95"
                      - cell "Yaxshi" [ref=e381]:
                        - generic [ref=e383]: Yaxshi
                      - cell "3,750,000" [ref=e384]:
                        - paragraph [ref=e385]: 3,750,000
                      - cell "10" [ref=e386]:
                        - paragraph [ref=e387]: "10"
                      - cell "Tasdiqlangan" [ref=e388]:
                        - generic [ref=e390]: Tasdiqlangan
                      - cell [ref=e391]:
                        - button [ref=e392]:
                          - img [ref=e394]
                - generic [ref=e398]:
                  - paragraph [ref=e399]: 1-7 / 7
                  - generic [ref=e400]:
                    - generic [ref=e402]:
                      - textbox [ref=e403] [cursor=pointer]: "10"
                      - generic:
                        - img
                    - generic [ref=e404]:
                      - button [disabled] [ref=e405]:
                        - img [ref=e407]
                      - paragraph [ref=e409]: 1 / 1
                      - button [disabled] [ref=e410]:
                        - img [ref=e412]
  - button [ref=e416] [cursor=pointer]:
    - img [ref=e418]
  - alert [ref=e422]
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