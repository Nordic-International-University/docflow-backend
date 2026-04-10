# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-test.spec.ts >> Barcha sahifalar yuklanadi >> Workflow calendar sahifasi (/dashboard/workflow-calendar)
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
        - generic [ref=e66]:
          - generic [ref=e67] [cursor=pointer]:
            - img [ref=e69]
            - generic [ref=e74]:
              - paragraph [ref=e75]: Hujjat aylanmasi
              - generic [ref=e77]: "1"
            - img [ref=e79]
          - generic [ref=e82]:
            - generic [ref=e86] [cursor=pointer]:
              - paragraph [ref=e87]: Jarayonlar
              - generic [ref=e89]: "1"
            - paragraph [ref=e94] [cursor=pointer]: Shablonlar
            - paragraph [ref=e99] [cursor=pointer]: Taqvim
        - generic [ref=e101] [cursor=pointer]:
          - img [ref=e103]
          - paragraph [ref=e107]: Bo'limlar
        - generic [ref=e109] [cursor=pointer]:
          - img [ref=e111]
          - paragraph [ref=e116]: Audit jurnali
        - generic [ref=e118] [cursor=pointer]:
          - img [ref=e120]
          - paragraph [ref=e127]: KPI
          - img [ref=e129]
        - generic [ref=e132] [cursor=pointer]:
          - img [ref=e134]
          - paragraph [ref=e140]: Boshqaruv
          - img [ref=e142]
        - generic [ref=e145] [cursor=pointer]:
          - img [ref=e147]
          - paragraph [ref=e153]: Sozlamalar
          - img [ref=e155]
        - generic [ref=e158] [cursor=pointer]:
          - img [ref=e160]
          - generic [ref=e165]:
            - paragraph [ref=e166]: Vazifalar
            - button [ref=e167]:
              - img [ref=e169]
          - img [ref=e171]
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
        - generic [ref=e226]:
          - generic [ref=e227]:
            - generic [ref=e228]:
              - generic [ref=e229]:
                - img [ref=e230]
                - generic [ref=e232]:
                  - paragraph [ref=e233]: Vazifalar taqvimi
                  - paragraph [ref=e234]: Menga tayinlangan vazifalar
              - generic [ref=e235]:
                - generic [ref=e237]: 0 ta vazifa
                - paragraph [ref=e238]: 0 kun
            - generic [ref=e239]:
              - radiogroup [ref=e241]:
                - generic [ref=e243]:
                  - radio "Oylik" [checked]
                  - generic [ref=e244] [cursor=pointer]: Oylik
                - generic [ref=e245]:
                  - radio "Haftalik"
                  - generic [ref=e246] [cursor=pointer]: Haftalik
                - generic [ref=e247]:
                  - radio "Yillik"
                  - generic [ref=e248] [cursor=pointer]: Yillik
                - generic [ref=e249]:
                  - radio "Ro'yxat"
                  - generic [ref=e250] [cursor=pointer]: Ro'yxat
              - generic [ref=e251]:
                - generic [ref=e253]:
                  - img [ref=e255]
                  - textbox "Holat bo'yicha" [ref=e257] [cursor=pointer]
                  - generic:
                    - img
                - generic [ref=e259]:
                  - img [ref=e261]
                  - button "Mart 30, 2026 – May 10, 2026" [ref=e263] [cursor=pointer]
          - generic [ref=e266]:
            - generic [ref=e267]:
              - generic [ref=e268]:
                - generic [ref=e269]:
                  - button "Oldingi" [ref=e270] [cursor=pointer]:
                    - img [ref=e271]: 
                  - button "Keyingi" [ref=e272] [cursor=pointer]:
                    - img [ref=e273]: 
                - button "Bugun" [disabled] [ref=e274]
              - heading "2026 M04" [level=2] [ref=e276]
            - generic "2026 M04" [ref=e277]:
              - grid [ref=e279]:
                - rowgroup [ref=e280]:
                  - row "Mon Tue Wed Thu Fri Sat Sun" [ref=e284]:
                    - columnheader "Mon" [ref=e285]:
                      - generic "Mon" [ref=e287]
                    - columnheader "Tue" [ref=e288]:
                      - generic "Tue" [ref=e290]
                    - columnheader "Wed" [ref=e291]:
                      - generic "Wed" [ref=e293]
                    - columnheader "Thu" [ref=e294]:
                      - generic "Thu" [ref=e296]
                    - columnheader "Fri" [ref=e297]:
                      - generic "Fri" [ref=e299]
                    - columnheader "Sat" [ref=e300]:
                      - generic "Sat" [ref=e302]
                    - columnheader "Sun" [ref=e303]:
                      - generic "Sun" [ref=e305]
                - rowgroup [ref=e306]:
                  - generic [ref=e309]:
                    - row "2026 M03 30 2026 M03 31 2026 M04 1 2026 M04 2 2026 M04 3 2026 M04 4 2026 M04 5" [ref=e311]:
                      - gridcell "2026 M03 30" [ref=e312]:
                        - generic "2026 M03 30" [ref=e315]: "30"
                      - gridcell "2026 M03 31" [ref=e317]:
                        - generic "2026 M03 31" [ref=e320]: "31"
                      - gridcell "2026 M04 1" [ref=e322]:
                        - generic "2026 M04 1" [ref=e325]: "1"
                      - gridcell "2026 M04 2" [ref=e327]:
                        - generic "2026 M04 2" [ref=e330]: "2"
                      - gridcell "2026 M04 3" [ref=e332]:
                        - generic "2026 M04 3" [ref=e335]: "3"
                      - gridcell "2026 M04 4" [ref=e337]:
                        - generic "2026 M04 4" [ref=e340]: "4"
                      - gridcell "2026 M04 5" [ref=e342]:
                        - generic "2026 M04 5" [ref=e345]: "5"
                    - row "2026 M04 6 2026 M04 7 2026 M04 8 2026 M04 9 2026 M04 10 2026 M04 11 2026 M04 12" [ref=e347]:
                      - gridcell "2026 M04 6" [ref=e348]:
                        - generic "2026 M04 6" [ref=e351]: "6"
                      - gridcell "2026 M04 7" [ref=e353]:
                        - generic "2026 M04 7" [ref=e356]: "7"
                      - gridcell "2026 M04 8" [ref=e358]:
                        - generic "2026 M04 8" [ref=e361]: "8"
                      - gridcell "2026 M04 9" [ref=e363]:
                        - generic "2026 M04 9" [ref=e366]: "9"
                      - gridcell "2026 M04 10" [ref=e368]:
                        - generic "2026 M04 10" [ref=e371]: "10"
                      - gridcell "2026 M04 11" [ref=e373]:
                        - generic "2026 M04 11" [ref=e376]: "11"
                      - gridcell "2026 M04 12" [ref=e378]:
                        - generic "2026 M04 12" [ref=e381]: "12"
                    - row "2026 M04 13 2026 M04 14 2026 M04 15 2026 M04 16 2026 M04 17 2026 M04 18 2026 M04 19" [ref=e383]:
                      - gridcell "2026 M04 13" [ref=e384]:
                        - generic "2026 M04 13" [ref=e387]: "13"
                      - gridcell "2026 M04 14" [ref=e389]:
                        - generic "2026 M04 14" [ref=e392]: "14"
                      - gridcell "2026 M04 15" [ref=e394]:
                        - generic "2026 M04 15" [ref=e397]: "15"
                      - gridcell "2026 M04 16" [ref=e399]:
                        - generic "2026 M04 16" [ref=e402]: "16"
                      - gridcell "2026 M04 17" [ref=e404]:
                        - generic "2026 M04 17" [ref=e407]: "17"
                      - gridcell "2026 M04 18" [ref=e409]:
                        - generic "2026 M04 18" [ref=e412]: "18"
                      - gridcell "2026 M04 19" [ref=e414]:
                        - generic "2026 M04 19" [ref=e417]: "19"
                    - row "2026 M04 20 2026 M04 21 2026 M04 22 2026 M04 23 2026 M04 24 2026 M04 25 2026 M04 26" [ref=e419]:
                      - gridcell "2026 M04 20" [ref=e420]:
                        - generic "2026 M04 20" [ref=e423]: "20"
                      - gridcell "2026 M04 21" [ref=e425]:
                        - generic "2026 M04 21" [ref=e428]: "21"
                      - gridcell "2026 M04 22" [ref=e430]:
                        - generic "2026 M04 22" [ref=e433]: "22"
                      - gridcell "2026 M04 23" [ref=e435]:
                        - generic "2026 M04 23" [ref=e438]: "23"
                      - gridcell "2026 M04 24" [ref=e440]:
                        - generic "2026 M04 24" [ref=e443]: "24"
                      - gridcell "2026 M04 25" [ref=e445]:
                        - generic "2026 M04 25" [ref=e448]: "25"
                      - gridcell "2026 M04 26" [ref=e450]:
                        - generic "2026 M04 26" [ref=e453]: "26"
                    - row "2026 M04 27 2026 M04 28 2026 M04 29 2026 M04 30 2026 M05 1 2026 M05 2 2026 M05 3" [ref=e455]:
                      - gridcell "2026 M04 27" [ref=e456]:
                        - generic "2026 M04 27" [ref=e459]: "27"
                      - gridcell "2026 M04 28" [ref=e461]:
                        - generic "2026 M04 28" [ref=e464]: "28"
                      - gridcell "2026 M04 29" [ref=e466]:
                        - generic "2026 M04 29" [ref=e469]: "29"
                      - gridcell "2026 M04 30" [ref=e471]:
                        - generic "2026 M04 30" [ref=e474]: "30"
                      - gridcell "2026 M05 1" [ref=e476]:
                        - generic "2026 M05 1" [ref=e479]: "1"
                      - gridcell "2026 M05 2" [ref=e481]:
                        - generic "2026 M05 2" [ref=e484]: "2"
                      - gridcell "2026 M05 3" [ref=e486]:
                        - generic "2026 M05 3" [ref=e489]: "3"
                    - row "2026 M05 4 2026 M05 5 2026 M05 6 2026 M05 7 2026 M05 8 2026 M05 9 2026 M05 10" [ref=e491]:
                      - gridcell "2026 M05 4" [ref=e492]:
                        - generic "2026 M05 4" [ref=e495]: "4"
                      - gridcell "2026 M05 5" [ref=e497]:
                        - generic "2026 M05 5" [ref=e500]: "5"
                      - gridcell "2026 M05 6" [ref=e502]:
                        - generic "2026 M05 6" [ref=e505]: "6"
                      - gridcell "2026 M05 7" [ref=e507]:
                        - generic "2026 M05 7" [ref=e510]: "7"
                      - gridcell "2026 M05 8" [ref=e512]:
                        - generic "2026 M05 8" [ref=e515]: "8"
                      - gridcell "2026 M05 9" [ref=e517]:
                        - generic "2026 M05 9" [ref=e520]: "9"
                      - gridcell "2026 M05 10" [ref=e522]:
                        - generic "2026 M05 10" [ref=e525]: "10"
  - button [ref=e529] [cursor=pointer]:
    - img [ref=e531]
  - alert [ref=e535]
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