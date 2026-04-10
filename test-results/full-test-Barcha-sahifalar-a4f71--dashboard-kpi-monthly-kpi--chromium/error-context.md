# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-test.spec.ts >> Barcha sahifalar yuklanadi >> KPI - Monthly sahifasi (/dashboard/kpi/monthly-kpi)
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
        - generic [ref=e24]:
          - generic [ref=e25] [cursor=pointer]:
            - img [ref=e27]
            - paragraph [ref=e34]: KPI
            - img [ref=e36]
          - generic [ref=e39]:
            - paragraph [ref=e44] [cursor=pointer]: Ball sozlamalari
            - paragraph [ref=e49] [cursor=pointer]: Mukofot darajalari
            - paragraph [ref=e54] [cursor=pointer]: Oylik KPI
            - paragraph [ref=e59] [cursor=pointer]: Mukofotlar
        - generic [ref=e61] [cursor=pointer]:
          - img [ref=e63]
          - paragraph [ref=e69]: Sozlamalar
          - img [ref=e71]
        - generic [ref=e74] [cursor=pointer]:
          - img [ref=e76]
          - generic [ref=e81]:
            - paragraph [ref=e82]: Vazifalar
            - button [ref=e83]:
              - img [ref=e85]
          - img [ref=e87]
      - generic [ref=e90] [cursor=pointer]:
        - img [ref=e92]
        - paragraph [ref=e98]: Chiqish
    - generic [ref=e99]:
      - banner [ref=e100]
      - main [ref=e106]:
        - generic [ref=e110]:
          - generic [ref=e112]:
            - paragraph [ref=e113]: Oylik KPI
            - paragraph [ref=e114]: Foydalanuvchilarning oylik KPI natijalari
          - generic [ref=e116]:
            - generic [ref=e118]:
              - textbox "Yil" [ref=e119] [cursor=pointer]: "2026"
              - generic:
                - generic:
                  - button [ref=e120] [cursor=pointer]:
                    - img [ref=e121]
                  - img
            - generic [ref=e124]:
              - textbox "Oy" [ref=e125] [cursor=pointer]
              - generic:
                - img
            - generic [ref=e127]:
              - textbox "Holat" [ref=e128] [cursor=pointer]: Barchasi
              - generic:
                - img
          - generic [ref=e129]:
            - tablist [ref=e130]:
              - tab "Jadval" [selected] [ref=e131] [cursor=pointer]:
                - img [ref=e133]
                - generic [ref=e135]: Jadval
              - tab "Reyting" [ref=e136] [cursor=pointer]:
                - img [ref=e138]
                - generic [ref=e142]: Reyting
              - tab "Statistika" [ref=e143] [cursor=pointer]:
                - img [ref=e145]
                - generic [ref=e149]: Statistika
            - tabpanel "Jadval" [ref=e150]:
              - generic [ref=e152]:
                - table [ref=e157]:
                  - rowgroup [ref=e158]:
                    - row "Xodim Davr Ball Vazifalar Holat" [ref=e159]:
                      - columnheader "Xodim" [ref=e160]:
                        - button "Xodim" [ref=e161] [cursor=pointer]:
                          - paragraph [ref=e162]: Xodim
                          - img [ref=e163]
                      - columnheader "Davr" [ref=e166]:
                        - button "Davr" [ref=e167] [cursor=pointer]:
                          - paragraph [ref=e168]: Davr
                          - img [ref=e169]
                      - columnheader "Ball" [ref=e172]:
                        - button "Ball" [ref=e173] [cursor=pointer]:
                          - paragraph [ref=e174]: Ball
                          - img [ref=e175]
                      - columnheader "Vazifalar" [ref=e178]:
                        - button "Vazifalar" [ref=e179] [cursor=pointer]:
                          - paragraph [ref=e180]: Vazifalar
                          - img [ref=e181]
                      - columnheader "Holat" [ref=e184]:
                        - button "Holat" [ref=e185] [cursor=pointer]:
                          - paragraph [ref=e186]: Holat
                          - img
                      - columnheader [ref=e189]:
                        - paragraph
                  - rowgroup [ref=e190]:
                    - row "Xushnudbek Xushnazarov IT Bo'limi Aprel 2026 100 3 3" [ref=e191] [cursor=pointer]:
                      - cell "Xushnudbek Xushnazarov IT Bo'limi" [ref=e192]:
                        - generic [ref=e193]:
                          - img [ref=e195]
                          - generic [ref=e196]:
                            - paragraph [ref=e197]: Xushnudbek Xushnazarov
                            - paragraph [ref=e198]: IT Bo'limi
                      - cell "Aprel 2026" [ref=e199]:
                        - paragraph [ref=e200]: Aprel 2026
                      - cell "100" [ref=e201]:
                        - generic [ref=e203]: "100"
                      - cell "3 3" [ref=e204]:
                        - generic [ref=e205]:
                          - generic [ref=e207]: "3"
                          - generic [ref=e209]: "3"
                      - cell [ref=e210]
                      - cell [ref=e212]:
                        - button [ref=e213]:
                          - img [ref=e215]
                    - row "OS Otabek Sharipov IT Bo'limi Aprel 2026 45 1 1" [ref=e219] [cursor=pointer]:
                      - cell "OS Otabek Sharipov IT Bo'limi" [ref=e220]:
                        - generic [ref=e221]:
                          - paragraph [ref=e224]: OS
                          - generic [ref=e225]:
                            - paragraph [ref=e226]: Otabek Sharipov
                            - paragraph [ref=e227]: IT Bo'limi
                      - cell "Aprel 2026" [ref=e228]:
                        - paragraph [ref=e229]: Aprel 2026
                      - cell "45" [ref=e230]:
                        - generic [ref=e232]: "45"
                      - cell "1 1" [ref=e233]:
                        - generic [ref=e234]:
                          - generic [ref=e236]: "1"
                          - generic [ref=e238]: "1"
                      - cell [ref=e239]
                      - cell [ref=e241]:
                        - button [ref=e242]:
                          - img [ref=e244]
                    - row "BT Bobur Tursunov IT Bo'limi Aprel 2026 45 1 1" [ref=e248] [cursor=pointer]:
                      - cell "BT Bobur Tursunov IT Bo'limi" [ref=e249]:
                        - generic [ref=e250]:
                          - paragraph [ref=e253]: BT
                          - generic [ref=e254]:
                            - paragraph [ref=e255]: Bobur Tursunov
                            - paragraph [ref=e256]: IT Bo'limi
                      - cell "Aprel 2026" [ref=e257]:
                        - paragraph [ref=e258]: Aprel 2026
                      - cell "45" [ref=e259]:
                        - generic [ref=e261]: "45"
                      - cell "1 1" [ref=e262]:
                        - generic [ref=e263]:
                          - generic [ref=e265]: "1"
                          - generic [ref=e267]: "1"
                      - cell [ref=e268]
                      - cell [ref=e270]:
                        - button [ref=e271]:
                          - img [ref=e273]
                    - row "NK Nodira Karimova Moliya Bo'limi Aprel 2026 45 1 1" [ref=e277] [cursor=pointer]:
                      - cell "NK Nodira Karimova Moliya Bo'limi" [ref=e278]:
                        - generic [ref=e279]:
                          - paragraph [ref=e282]: NK
                          - generic [ref=e283]:
                            - paragraph [ref=e284]: Nodira Karimova
                            - paragraph [ref=e285]: Moliya Bo'limi
                      - cell "Aprel 2026" [ref=e286]:
                        - paragraph [ref=e287]: Aprel 2026
                      - cell "45" [ref=e288]:
                        - generic [ref=e290]: "45"
                      - cell "1 1" [ref=e291]:
                        - generic [ref=e292]:
                          - generic [ref=e294]: "1"
                          - generic [ref=e296]: "1"
                      - cell [ref=e297]
                      - cell [ref=e299]:
                        - button [ref=e300]:
                          - img [ref=e302]
                    - row "Abdullayev Abdulaziz IT Bo'limi Aprel 2026 95 2 2" [ref=e306] [cursor=pointer]:
                      - cell "Abdullayev Abdulaziz IT Bo'limi" [ref=e307]:
                        - generic [ref=e308]:
                          - img [ref=e310]
                          - generic [ref=e311]:
                            - paragraph [ref=e312]: Abdullayev Abdulaziz
                            - paragraph [ref=e313]: IT Bo'limi
                      - cell "Aprel 2026" [ref=e314]:
                        - paragraph [ref=e315]: Aprel 2026
                      - cell "95" [ref=e316]:
                        - generic [ref=e318]: "95"
                      - cell "2 2" [ref=e319]:
                        - generic [ref=e320]:
                          - generic [ref=e322]: "2"
                          - generic [ref=e324]: "2"
                      - cell [ref=e325]
                      - cell [ref=e327]:
                        - button [ref=e328]:
                          - img [ref=e330]
                    - row "Xayrullayeva Rayxona IT Bo'limi Aprel 2026 50 1 1" [ref=e334] [cursor=pointer]:
                      - cell "Xayrullayeva Rayxona IT Bo'limi" [ref=e335]:
                        - generic [ref=e336]:
                          - img [ref=e338]
                          - generic [ref=e339]:
                            - paragraph [ref=e340]: Xayrullayeva Rayxona
                            - paragraph [ref=e341]: IT Bo'limi
                      - cell "Aprel 2026" [ref=e342]:
                        - paragraph [ref=e343]: Aprel 2026
                      - cell "50" [ref=e344]:
                        - generic [ref=e346]: "50"
                      - cell "1 1" [ref=e347]:
                        - generic [ref=e348]:
                          - generic [ref=e350]: "1"
                          - generic [ref=e352]: "1"
                      - cell [ref=e353]
                      - cell [ref=e355]:
                        - button [ref=e356]:
                          - img [ref=e358]
                    - row "Shodmonov Ruslan IT Bo'limi Aprel 2026 50 1 1" [ref=e362] [cursor=pointer]:
                      - cell "Shodmonov Ruslan IT Bo'limi" [ref=e363]:
                        - generic [ref=e364]:
                          - img [ref=e366]
                          - generic [ref=e367]:
                            - paragraph [ref=e368]: Shodmonov Ruslan
                            - paragraph [ref=e369]: IT Bo'limi
                      - cell "Aprel 2026" [ref=e370]:
                        - paragraph [ref=e371]: Aprel 2026
                      - cell "50" [ref=e372]:
                        - generic [ref=e374]: "50"
                      - cell "1 1" [ref=e375]:
                        - generic [ref=e376]:
                          - generic [ref=e378]: "1"
                          - generic [ref=e380]: "1"
                      - cell [ref=e381]
                      - cell [ref=e383]:
                        - button [ref=e384]:
                          - img [ref=e386]
                    - row "To'qliyev Abdurauf IT Bo'limi Aprel 2026 50 1 1" [ref=e390] [cursor=pointer]:
                      - cell "To'qliyev Abdurauf IT Bo'limi" [ref=e391]:
                        - generic [ref=e392]:
                          - img [ref=e394]
                          - generic [ref=e395]:
                            - paragraph [ref=e396]: To'qliyev Abdurauf
                            - paragraph [ref=e397]: IT Bo'limi
                      - cell "Aprel 2026" [ref=e398]:
                        - paragraph [ref=e399]: Aprel 2026
                      - cell "50" [ref=e400]:
                        - generic [ref=e402]: "50"
                      - cell "1 1" [ref=e403]:
                        - generic [ref=e404]:
                          - generic [ref=e406]: "1"
                          - generic [ref=e408]: "1"
                      - cell [ref=e409]
                      - cell [ref=e411]:
                        - button [ref=e412]:
                          - img [ref=e414]
                    - row "SH Sevara Hamidova Xazina Aprel 2026 100 4 4" [ref=e418] [cursor=pointer]:
                      - cell "SH Sevara Hamidova Xazina" [ref=e419]:
                        - generic [ref=e420]:
                          - paragraph [ref=e423]: SH
                          - generic [ref=e424]:
                            - paragraph [ref=e425]: Sevara Hamidova
                            - paragraph [ref=e426]: Xazina
                      - cell "Aprel 2026" [ref=e427]:
                        - paragraph [ref=e428]: Aprel 2026
                      - cell "100" [ref=e429]:
                        - generic [ref=e431]: "100"
                      - cell "4 4" [ref=e432]:
                        - generic [ref=e433]:
                          - generic [ref=e435]: "4"
                          - generic [ref=e437]: "4"
                      - cell [ref=e438]
                      - cell [ref=e440]:
                        - button [ref=e441]:
                          - img [ref=e443]
                    - row "SU Shohruh Umarov Dasturlash Sektori Mart 2026 100 4 4" [ref=e447] [cursor=pointer]:
                      - cell "SU Shohruh Umarov Dasturlash Sektori" [ref=e448]:
                        - generic [ref=e449]:
                          - paragraph [ref=e452]: SU
                          - generic [ref=e453]:
                            - paragraph [ref=e454]: Shohruh Umarov
                            - paragraph [ref=e455]: Dasturlash Sektori
                      - cell "Mart 2026" [ref=e456]:
                        - paragraph [ref=e457]: Mart 2026
                      - cell "100" [ref=e458]:
                        - generic [ref=e460]: "100"
                      - cell "4 4" [ref=e461]:
                        - generic [ref=e462]:
                          - generic [ref=e464]: "4"
                          - generic [ref=e466]: "4"
                      - cell [ref=e467]
                      - cell [ref=e469]:
                        - button [ref=e470]:
                          - img [ref=e472]
                - generic [ref=e476]:
                  - paragraph [ref=e477]: 1-10 / 16
                  - generic [ref=e478]:
                    - generic [ref=e480]:
                      - textbox [ref=e481] [cursor=pointer]: "10"
                      - generic:
                        - img
                    - generic [ref=e482]:
                      - button [disabled] [ref=e483]:
                        - img [ref=e485]
                      - paragraph [ref=e487]: 1 / 2
                      - button [ref=e488] [cursor=pointer]:
                        - img [ref=e490]
  - button [ref=e494] [cursor=pointer]:
    - img [ref=e496]
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