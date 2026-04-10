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
        - generic [ref=e98]:
          - generic [ref=e99] [cursor=pointer]:
            - img [ref=e101]
            - paragraph [ref=e108]: KPI
            - img [ref=e110]
          - generic [ref=e113]:
            - paragraph [ref=e118] [cursor=pointer]: Ball sozlamalari
            - paragraph [ref=e123] [cursor=pointer]: Mukofot darajalari
            - paragraph [ref=e128] [cursor=pointer]: Oylik KPI
            - paragraph [ref=e133] [cursor=pointer]: Mukofotlar
        - generic [ref=e135] [cursor=pointer]:
          - img [ref=e137]
          - paragraph [ref=e143]: Boshqaruv
          - img [ref=e145]
        - generic [ref=e148] [cursor=pointer]:
          - img [ref=e150]
          - paragraph [ref=e156]: Sozlamalar
          - img [ref=e158]
        - generic [ref=e161] [cursor=pointer]:
          - img [ref=e163]
          - generic [ref=e168]:
            - paragraph [ref=e169]: Vazifalar
            - button [ref=e170]:
              - img [ref=e172]
          - img [ref=e174]
      - generic [ref=e177] [cursor=pointer]:
        - img [ref=e179]
        - paragraph [ref=e185]: Chiqish
    - generic [ref=e186]:
      - banner [ref=e187]:
        - generic [ref=e188]:
          - generic [ref=e193]:
            - img [ref=e195]
            - textbox "Qidirish..." [ref=e198]
            - generic [ref=e201]: Ctrl+K
          - generic [ref=e202]:
            - generic [ref=e206] [cursor=pointer]: SA
            - separator [ref=e207]
            - button [ref=e209] [cursor=pointer]:
              - img [ref=e211]
            - button [ref=e214] [cursor=pointer]:
              - img [ref=e216]
            - button "SA" [ref=e219] [cursor=pointer]:
              - generic "Super Administrator" [ref=e222]:
                - paragraph [ref=e223]: SA
      - main [ref=e224]:
        - generic [ref=e228]:
          - generic [ref=e230]:
            - paragraph [ref=e231]: KPI Mukofotlar
            - paragraph [ref=e232]: KPI mukofotlarni boshqarish
          - generic [ref=e234]:
            - generic [ref=e236]:
              - textbox "Yil" [ref=e237] [cursor=pointer]: "2026"
              - generic:
                - generic:
                  - button [ref=e238] [cursor=pointer]:
                    - img [ref=e239]
                  - img
            - generic [ref=e242]:
              - textbox "Oy" [ref=e243] [cursor=pointer]
              - generic:
                - img
            - generic [ref=e245]:
              - textbox "Holat" [ref=e246] [cursor=pointer]: Barchasi
              - generic:
                - img
          - generic [ref=e247]:
            - tablist [ref=e248]:
              - tab "Barchasi" [selected] [ref=e249] [cursor=pointer]:
                - img [ref=e251]
                - generic [ref=e253]: Barchasi
              - tab "Mening mukofotlarim" [ref=e254] [cursor=pointer]:
                - img [ref=e256]
                - generic [ref=e259]: Mening mukofotlarim
            - tabpanel "Barchasi" [ref=e260]:
              - generic [ref=e262]:
                - table [ref=e267]:
                  - rowgroup [ref=e268]:
                    - row "Xodim Davr Ball Daraja So'm BHM Holat" [ref=e269]:
                      - columnheader "Xodim" [ref=e270]:
                        - button "Xodim" [ref=e271] [cursor=pointer]:
                          - paragraph [ref=e272]: Xodim
                          - img [ref=e273]
                      - columnheader "Davr" [ref=e276]:
                        - button "Davr" [ref=e277] [cursor=pointer]:
                          - paragraph [ref=e278]: Davr
                          - img [ref=e279]
                      - columnheader "Ball" [ref=e282]:
                        - button "Ball" [ref=e283] [cursor=pointer]:
                          - paragraph [ref=e284]: Ball
                          - img [ref=e285]
                      - columnheader "Daraja" [ref=e288]:
                        - button "Daraja" [ref=e289] [cursor=pointer]:
                          - paragraph [ref=e290]: Daraja
                          - img [ref=e291]
                      - columnheader "So'm" [ref=e294]:
                        - button "So'm" [ref=e295] [cursor=pointer]:
                          - paragraph [ref=e296]: So'm
                          - img [ref=e297]
                      - columnheader "BHM" [ref=e300]:
                        - button "BHM" [ref=e301] [cursor=pointer]:
                          - paragraph [ref=e302]: BHM
                          - img [ref=e303]
                      - columnheader "Holat" [ref=e306]:
                        - button "Holat" [ref=e307] [cursor=pointer]:
                          - paragraph [ref=e308]: Holat
                          - img [ref=e309]
                      - columnheader [ref=e312]:
                        - paragraph
                  - rowgroup [ref=e313]:
                    - row "SH Sevara Hamidova Mart 2026 100 A'lo 5,625,000 15 To'langan" [ref=e314] [cursor=pointer]:
                      - cell "SH Sevara Hamidova" [ref=e315]:
                        - generic [ref=e316]:
                          - paragraph [ref=e319]: SH
                          - paragraph [ref=e320]: Sevara Hamidova
                      - cell "Mart 2026" [ref=e321]:
                        - paragraph [ref=e322]: Mart 2026
                      - cell "100" [ref=e323]:
                        - generic [ref=e325]: "100"
                      - cell "A'lo" [ref=e326]:
                        - generic [ref=e328]: A'lo
                      - cell "5,625,000" [ref=e329]:
                        - paragraph [ref=e330]: 5,625,000
                      - cell "15" [ref=e331]:
                        - paragraph [ref=e332]: "15"
                      - cell "To'langan" [ref=e333]:
                        - generic [ref=e335]: To'langan
                      - cell [ref=e336]:
                        - button [ref=e337]:
                          - img [ref=e339]
                    - row "NI Nigora Ismoilova Mart 2026 78 Qoniqarli 1,875,000 5 To'langan" [ref=e343] [cursor=pointer]:
                      - cell "NI Nigora Ismoilova" [ref=e344]:
                        - generic [ref=e345]:
                          - paragraph [ref=e348]: NI
                          - paragraph [ref=e349]: Nigora Ismoilova
                      - cell "Mart 2026" [ref=e350]:
                        - paragraph [ref=e351]: Mart 2026
                      - cell "78" [ref=e352]:
                        - generic [ref=e354]: "78"
                      - cell "Qoniqarli" [ref=e355]:
                        - generic [ref=e357]: Qoniqarli
                      - cell "1,875,000" [ref=e358]:
                        - paragraph [ref=e359]: 1,875,000
                      - cell "5" [ref=e360]:
                        - paragraph [ref=e361]: "5"
                      - cell "To'langan" [ref=e362]:
                        - generic [ref=e364]: To'langan
                      - cell [ref=e365]:
                        - button [ref=e366]:
                          - img [ref=e368]
                    - row "OS Otabek Sharipov Mart 2026 100 A'lo 5,625,000 15 Tasdiqlangan" [ref=e372] [cursor=pointer]:
                      - cell "OS Otabek Sharipov" [ref=e373]:
                        - generic [ref=e374]:
                          - paragraph [ref=e377]: OS
                          - paragraph [ref=e378]: Otabek Sharipov
                      - cell "Mart 2026" [ref=e379]:
                        - paragraph [ref=e380]: Mart 2026
                      - cell "100" [ref=e381]:
                        - generic [ref=e383]: "100"
                      - cell "A'lo" [ref=e384]:
                        - generic [ref=e386]: A'lo
                      - cell "5,625,000" [ref=e387]:
                        - paragraph [ref=e388]: 5,625,000
                      - cell "15" [ref=e389]:
                        - paragraph [ref=e390]: "15"
                      - cell "Tasdiqlangan" [ref=e391]:
                        - generic [ref=e393]: Tasdiqlangan
                      - cell [ref=e394]:
                        - button [ref=e395]:
                          - img [ref=e397]
                    - row "DQ Davron Qosimov Mart 2026 100 A'lo 5,625,000 15 Tasdiqlangan" [ref=e401] [cursor=pointer]:
                      - cell "DQ Davron Qosimov" [ref=e402]:
                        - generic [ref=e403]:
                          - paragraph [ref=e406]: DQ
                          - paragraph [ref=e407]: Davron Qosimov
                      - cell "Mart 2026" [ref=e408]:
                        - paragraph [ref=e409]: Mart 2026
                      - cell "100" [ref=e410]:
                        - generic [ref=e412]: "100"
                      - cell "A'lo" [ref=e413]:
                        - generic [ref=e415]: A'lo
                      - cell "5,625,000" [ref=e416]:
                        - paragraph [ref=e417]: 5,625,000
                      - cell "15" [ref=e418]:
                        - paragraph [ref=e419]: "15"
                      - cell "Tasdiqlangan" [ref=e420]:
                        - generic [ref=e422]: Tasdiqlangan
                      - cell [ref=e423]:
                        - button [ref=e424]:
                          - img [ref=e426]
                    - row "MS Malika Safarova Mart 2026 86 Yaxshi 3,750,000 10 Tasdiqlangan" [ref=e430] [cursor=pointer]:
                      - cell "MS Malika Safarova" [ref=e431]:
                        - generic [ref=e432]:
                          - paragraph [ref=e435]: MS
                          - paragraph [ref=e436]: Malika Safarova
                      - cell "Mart 2026" [ref=e437]:
                        - paragraph [ref=e438]: Mart 2026
                      - cell "86" [ref=e439]:
                        - generic [ref=e441]: "86"
                      - cell "Yaxshi" [ref=e442]:
                        - generic [ref=e444]: Yaxshi
                      - cell "3,750,000" [ref=e445]:
                        - paragraph [ref=e446]: 3,750,000
                      - cell "10" [ref=e447]:
                        - paragraph [ref=e448]: "10"
                      - cell "Tasdiqlangan" [ref=e449]:
                        - generic [ref=e451]: Tasdiqlangan
                      - cell [ref=e452]:
                        - button [ref=e453]:
                          - img [ref=e455]
                    - row "SU Shohruh Umarov Mart 2026 100 A'lo 5,625,000 15 Tasdiqlangan" [ref=e459] [cursor=pointer]:
                      - cell "SU Shohruh Umarov" [ref=e460]:
                        - generic [ref=e461]:
                          - paragraph [ref=e464]: SU
                          - paragraph [ref=e465]: Shohruh Umarov
                      - cell "Mart 2026" [ref=e466]:
                        - paragraph [ref=e467]: Mart 2026
                      - cell "100" [ref=e468]:
                        - generic [ref=e470]: "100"
                      - cell "A'lo" [ref=e471]:
                        - generic [ref=e473]: A'lo
                      - cell "5,625,000" [ref=e474]:
                        - paragraph [ref=e475]: 5,625,000
                      - cell "15" [ref=e476]:
                        - paragraph [ref=e477]: "15"
                      - cell "Tasdiqlangan" [ref=e478]:
                        - generic [ref=e480]: Tasdiqlangan
                      - cell [ref=e481]:
                        - button [ref=e482]:
                          - img [ref=e484]
                    - row "JA Jamshid Alimov Mart 2026 95 Yaxshi 3,750,000 10 Tasdiqlangan" [ref=e488] [cursor=pointer]:
                      - cell "JA Jamshid Alimov" [ref=e489]:
                        - generic [ref=e490]:
                          - paragraph [ref=e493]: JA
                          - paragraph [ref=e494]: Jamshid Alimov
                      - cell "Mart 2026" [ref=e495]:
                        - paragraph [ref=e496]: Mart 2026
                      - cell "95" [ref=e497]:
                        - generic [ref=e499]: "95"
                      - cell "Yaxshi" [ref=e500]:
                        - generic [ref=e502]: Yaxshi
                      - cell "3,750,000" [ref=e503]:
                        - paragraph [ref=e504]: 3,750,000
                      - cell "10" [ref=e505]:
                        - paragraph [ref=e506]: "10"
                      - cell "Tasdiqlangan" [ref=e507]:
                        - generic [ref=e509]: Tasdiqlangan
                      - cell [ref=e510]:
                        - button [ref=e511]:
                          - img [ref=e513]
                - generic [ref=e517]:
                  - paragraph [ref=e518]: 1-7 / 7
                  - generic [ref=e519]:
                    - generic [ref=e521]:
                      - textbox [ref=e522] [cursor=pointer]: "10"
                      - generic:
                        - img
                    - generic [ref=e523]:
                      - button [disabled] [ref=e524]:
                        - img [ref=e526]
                      - paragraph [ref=e528]: 1 / 1
                      - button [disabled] [ref=e529]:
                        - img [ref=e531]
  - button [ref=e535] [cursor=pointer]:
    - img [ref=e537]
  - alert [ref=e541]
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