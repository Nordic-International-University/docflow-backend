# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-test.spec.ts >> Barcha sahifalar yuklanadi >> Audit log sahifasi (/dashboard/audit-log)
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
          - paragraph [ref=e34]: KPI
          - img [ref=e36]
        - generic [ref=e39] [cursor=pointer]:
          - img [ref=e41]
          - paragraph [ref=e47]: Sozlamalar
          - img [ref=e49]
        - generic [ref=e52] [cursor=pointer]:
          - img [ref=e54]
          - generic [ref=e59]:
            - paragraph [ref=e60]: Vazifalar
            - button [ref=e61]:
              - img [ref=e63]
          - img [ref=e65]
      - generic [ref=e68] [cursor=pointer]:
        - img [ref=e70]
        - paragraph [ref=e76]: Chiqish
    - generic [ref=e77]:
      - banner [ref=e78]
      - main [ref=e84]:
        - generic [ref=e88]:
          - generic [ref=e90]:
            - paragraph [ref=e91]: Audit jurnallari
            - paragraph [ref=e92]: Tizim harakatlari monitoringi
          - generic [ref=e95]:
            - img [ref=e97]
            - textbox "Audit loglarni qidirish..." [ref=e100]
          - generic [ref=e102]:
            - table [ref=e107]:
              - rowgroup [ref=e108]:
                - row "Entity Amal Foydalanuvchi Vaqt IP Address Amallar" [ref=e109]:
                  - columnheader "Entity" [ref=e110]:
                    - button "Entity" [ref=e111] [cursor=pointer]:
                      - paragraph [ref=e112]: Entity
                      - img [ref=e113]
                  - columnheader "Amal" [ref=e116]:
                    - button "Amal" [ref=e117] [cursor=pointer]:
                      - paragraph [ref=e118]: Amal
                      - img [ref=e119]
                  - columnheader "Foydalanuvchi" [ref=e122]:
                    - button "Foydalanuvchi" [ref=e123] [cursor=pointer]:
                      - paragraph [ref=e124]: Foydalanuvchi
                      - img [ref=e125]
                  - columnheader "Vaqt" [ref=e128]:
                    - button "Vaqt" [ref=e129] [cursor=pointer]:
                      - paragraph [ref=e130]: Vaqt
                      - img [ref=e131]
                  - columnheader "IP Address" [ref=e134]:
                    - button "IP Address" [ref=e135] [cursor=pointer]:
                      - paragraph [ref=e136]: IP Address
                      - img [ref=e137]
                  - columnheader "Amallar" [ref=e140]:
                    - paragraph [ref=e141]: Amallar
              - rowgroup [ref=e142]:
                - row "Workflow CREATE To'qliyev Abdurauf @abdurauf 09.04.2026 19:09:54 —" [ref=e143]:
                  - cell "Workflow" [ref=e144]:
                    - generic [ref=e146]: Workflow
                  - cell "CREATE" [ref=e147]:
                    - generic [ref=e149]: CREATE
                  - cell "To'qliyev Abdurauf @abdurauf" [ref=e150]:
                    - generic [ref=e151]:
                      - paragraph [ref=e152]: To'qliyev Abdurauf
                      - paragraph [ref=e153]: "@abdurauf"
                  - cell "09.04.2026 19:09:54" [ref=e154]:
                    - generic [ref=e155]:
                      - paragraph [ref=e156]: 09.04.2026
                      - paragraph [ref=e157]: 19:09:54
                  - cell "—" [ref=e158]:
                    - paragraph [ref=e159]: —
                  - cell [ref=e160]:
                    - button [ref=e161] [cursor=pointer]:
                      - img [ref=e163]
                - row "Workflow DELETE To'qliyev Abdurauf @abdurauf 09.04.2026 19:08:36 —" [ref=e167]:
                  - cell "Workflow" [ref=e168]:
                    - generic [ref=e170]: Workflow
                  - cell "DELETE" [ref=e171]:
                    - generic [ref=e173]: DELETE
                  - cell "To'qliyev Abdurauf @abdurauf" [ref=e174]:
                    - generic [ref=e175]:
                      - paragraph [ref=e176]: To'qliyev Abdurauf
                      - paragraph [ref=e177]: "@abdurauf"
                  - cell "09.04.2026 19:08:36" [ref=e178]:
                    - generic [ref=e179]:
                      - paragraph [ref=e180]: 09.04.2026
                      - paragraph [ref=e181]: 19:08:36
                  - cell "—" [ref=e182]:
                    - paragraph [ref=e183]: —
                  - cell [ref=e184]:
                    - button [ref=e185] [cursor=pointer]:
                      - img [ref=e187]
                - row "Document DELETE To'qliyev Abdurauf @abdurauf 09.04.2026 19:08:30 —" [ref=e191]:
                  - cell "Document" [ref=e192]:
                    - generic [ref=e194]: Document
                  - cell "DELETE" [ref=e195]:
                    - generic [ref=e197]: DELETE
                  - cell "To'qliyev Abdurauf @abdurauf" [ref=e198]:
                    - generic [ref=e199]:
                      - paragraph [ref=e200]: To'qliyev Abdurauf
                      - paragraph [ref=e201]: "@abdurauf"
                  - cell "09.04.2026 19:08:30" [ref=e202]:
                    - generic [ref=e203]:
                      - paragraph [ref=e204]: 09.04.2026
                      - paragraph [ref=e205]: 19:08:30
                  - cell "—" [ref=e206]:
                    - paragraph [ref=e207]: —
                  - cell [ref=e208]:
                    - button [ref=e209] [cursor=pointer]:
                      - img [ref=e211]
                - row "Document DELETE To'qliyev Abdurauf @abdurauf 09.04.2026 19:08:28 —" [ref=e215]:
                  - cell "Document" [ref=e216]:
                    - generic [ref=e218]: Document
                  - cell "DELETE" [ref=e219]:
                    - generic [ref=e221]: DELETE
                  - cell "To'qliyev Abdurauf @abdurauf" [ref=e222]:
                    - generic [ref=e223]:
                      - paragraph [ref=e224]: To'qliyev Abdurauf
                      - paragraph [ref=e225]: "@abdurauf"
                  - cell "09.04.2026 19:08:28" [ref=e226]:
                    - generic [ref=e227]:
                      - paragraph [ref=e228]: 09.04.2026
                      - paragraph [ref=e229]: 19:08:28
                  - cell "—" [ref=e230]:
                    - paragraph [ref=e231]: —
                  - cell [ref=e232]:
                    - button [ref=e233] [cursor=pointer]:
                      - img [ref=e235]
                - row "Workflow CREATE To'qliyev Abdurauf @abdurauf 09.04.2026 19:07:32 —" [ref=e239]:
                  - cell "Workflow" [ref=e240]:
                    - generic [ref=e242]: Workflow
                  - cell "CREATE" [ref=e243]:
                    - generic [ref=e245]: CREATE
                  - cell "To'qliyev Abdurauf @abdurauf" [ref=e246]:
                    - generic [ref=e247]:
                      - paragraph [ref=e248]: To'qliyev Abdurauf
                      - paragraph [ref=e249]: "@abdurauf"
                  - cell "09.04.2026 19:07:32" [ref=e250]:
                    - generic [ref=e251]:
                      - paragraph [ref=e252]: 09.04.2026
                      - paragraph [ref=e253]: 19:07:32
                  - cell "—" [ref=e254]:
                    - paragraph [ref=e255]: —
                  - cell [ref=e256]:
                    - button [ref=e257] [cursor=pointer]:
                      - img [ref=e259]
                - row "Workflow CREATE Super Administrator @superadmin 09.04.2026 19:07:09 —" [ref=e263]:
                  - cell "Workflow" [ref=e264]:
                    - generic [ref=e266]: Workflow
                  - cell "CREATE" [ref=e267]:
                    - generic [ref=e269]: CREATE
                  - cell "Super Administrator @superadmin" [ref=e270]:
                    - generic [ref=e271]:
                      - paragraph [ref=e272]: Super Administrator
                      - paragraph [ref=e273]: "@superadmin"
                  - cell "09.04.2026 19:07:09" [ref=e274]:
                    - generic [ref=e275]:
                      - paragraph [ref=e276]: 09.04.2026
                      - paragraph [ref=e277]: 19:07:09
                  - cell "—" [ref=e278]:
                    - paragraph [ref=e279]: —
                  - cell [ref=e280]:
                    - button [ref=e281] [cursor=pointer]:
                      - img [ref=e283]
                - row "Workflow CREATE Super Administrator @superadmin 09.04.2026 19:04:29 —" [ref=e287]:
                  - cell "Workflow" [ref=e288]:
                    - generic [ref=e290]: Workflow
                  - cell "CREATE" [ref=e291]:
                    - generic [ref=e293]: CREATE
                  - cell "Super Administrator @superadmin" [ref=e294]:
                    - generic [ref=e295]:
                      - paragraph [ref=e296]: Super Administrator
                      - paragraph [ref=e297]: "@superadmin"
                  - cell "09.04.2026 19:04:29" [ref=e298]:
                    - generic [ref=e299]:
                      - paragraph [ref=e300]: 09.04.2026
                      - paragraph [ref=e301]: 19:04:29
                  - cell "—" [ref=e302]:
                    - paragraph [ref=e303]: —
                  - cell [ref=e304]:
                    - button [ref=e305] [cursor=pointer]:
                      - img [ref=e307]
                - row "Workflow CREATE To'qliyev Abdurauf @abdurauf 09.04.2026 19:03:48 —" [ref=e311]:
                  - cell "Workflow" [ref=e312]:
                    - generic [ref=e314]: Workflow
                  - cell "CREATE" [ref=e315]:
                    - generic [ref=e317]: CREATE
                  - cell "To'qliyev Abdurauf @abdurauf" [ref=e318]:
                    - generic [ref=e319]:
                      - paragraph [ref=e320]: To'qliyev Abdurauf
                      - paragraph [ref=e321]: "@abdurauf"
                  - cell "09.04.2026 19:03:48" [ref=e322]:
                    - generic [ref=e323]:
                      - paragraph [ref=e324]: 09.04.2026
                      - paragraph [ref=e325]: 19:03:48
                  - cell "—" [ref=e326]:
                    - paragraph [ref=e327]: —
                  - cell [ref=e328]:
                    - button [ref=e329] [cursor=pointer]:
                      - img [ref=e331]
                - row "Workflow DELETE To'qliyev Abdurauf @abdurauf 09.04.2026 19:02:42 —" [ref=e335]:
                  - cell "Workflow" [ref=e336]:
                    - generic [ref=e338]: Workflow
                  - cell "DELETE" [ref=e339]:
                    - generic [ref=e341]: DELETE
                  - cell "To'qliyev Abdurauf @abdurauf" [ref=e342]:
                    - generic [ref=e343]:
                      - paragraph [ref=e344]: To'qliyev Abdurauf
                      - paragraph [ref=e345]: "@abdurauf"
                  - cell "09.04.2026 19:02:42" [ref=e346]:
                    - generic [ref=e347]:
                      - paragraph [ref=e348]: 09.04.2026
                      - paragraph [ref=e349]: 19:02:42
                  - cell "—" [ref=e350]:
                    - paragraph [ref=e351]: —
                  - cell [ref=e352]:
                    - button [ref=e353] [cursor=pointer]:
                      - img [ref=e355]
                - row "Document DELETE To'qliyev Abdurauf @abdurauf 09.04.2026 19:02:33 —" [ref=e359]:
                  - cell "Document" [ref=e360]:
                    - generic [ref=e362]: Document
                  - cell "DELETE" [ref=e363]:
                    - generic [ref=e365]: DELETE
                  - cell "To'qliyev Abdurauf @abdurauf" [ref=e366]:
                    - generic [ref=e367]:
                      - paragraph [ref=e368]: To'qliyev Abdurauf
                      - paragraph [ref=e369]: "@abdurauf"
                  - cell "09.04.2026 19:02:33" [ref=e370]:
                    - generic [ref=e371]:
                      - paragraph [ref=e372]: 09.04.2026
                      - paragraph [ref=e373]: 19:02:33
                  - cell "—" [ref=e374]:
                    - paragraph [ref=e375]: —
                  - cell [ref=e376]:
                    - button [ref=e377] [cursor=pointer]:
                      - img [ref=e379]
            - generic [ref=e383]:
              - paragraph [ref=e384]: 1-10 / 584
              - generic [ref=e385]:
                - generic [ref=e387]:
                  - textbox [ref=e388] [cursor=pointer]: "10"
                  - generic:
                    - img
                - generic [ref=e389]:
                  - button [disabled] [ref=e390]:
                    - img [ref=e392]
                  - paragraph [ref=e394]: 1 / 59
                  - button [ref=e395] [cursor=pointer]:
                    - img [ref=e397]
  - button [ref=e401] [cursor=pointer]:
    - img [ref=e403]
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