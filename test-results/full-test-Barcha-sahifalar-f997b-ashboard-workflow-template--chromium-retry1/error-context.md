# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-test.spec.ts >> Barcha sahifalar yuklanadi >> Workflow template sahifasi (/dashboard/workflow-template)
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
        - generic [ref=e225]:
          - generic [ref=e226]:
            - generic [ref=e227]:
              - paragraph [ref=e228]: Aylanma shablonlari
              - paragraph [ref=e229]: Hujjat aylanmalari uchun shablonlarni boshqaring
            - button "Shablon qo'shish" [ref=e230] [cursor=pointer]:
              - generic [ref=e231]:
                - img [ref=e233]
                - generic [ref=e234]: Shablon qo'shish
          - generic [ref=e236]:
            - generic [ref=e238]:
              - img [ref=e240]
              - textbox "Qidirish..." [ref=e243]
            - generic [ref=e245]:
              - textbox "Hujjat turi" [ref=e246] [cursor=pointer]
              - generic:
                - img
          - generic [ref=e247]:
            - generic [ref=e249] [cursor=pointer]:
              - generic [ref=e250]:
                - generic [ref=e251]:
                  - paragraph [ref=e252]: Test Shablom
                  - generic [ref=e254]: Faol
                - generic [ref=e255]:
                  - generic [ref=e256]:
                    - img [ref=e257]
                    - paragraph [ref=e260]: Ketma-ket
                  - paragraph [ref=e261]: Loyiha hujjatiw
                  - generic [ref=e263]: 3 ta bosqich
                  - generic [ref=e265]: Ommaviy
              - generic [ref=e266]:
                - button [ref=e267]:
                  - img [ref=e269]
                - button [ref=e272]:
                  - img [ref=e274]
                - img [ref=e278]
            - generic [ref=e281] [cursor=pointer]:
              - generic [ref=e282]:
                - generic [ref=e283]:
                  - paragraph [ref=e284]: Kadrlar buyrug'i tasdiqlash
                  - generic [ref=e286]: Faol
                - generic [ref=e287]:
                  - generic [ref=e288]:
                    - img [ref=e289]
                    - paragraph [ref=e292]: Ketma-ket
                  - paragraph [ref=e293]: Buyruq
                  - generic [ref=e295]: 3 ta bosqich
                  - generic [ref=e297]: Ommaviy
              - generic [ref=e298]:
                - button [ref=e299]:
                  - img [ref=e301]
                - button [ref=e304]:
                  - img [ref=e306]
                - img [ref=e310]
            - generic [ref=e313] [cursor=pointer]:
              - generic [ref=e314]:
                - generic [ref=e315]:
                  - paragraph [ref=e316]: Moliyaviy hujjat parallel tasdiqlash
                  - generic [ref=e318]: Faol
                - generic [ref=e319]:
                  - generic [ref=e320]:
                    - img [ref=e321]
                    - paragraph [ref=e324]: Parallel
                  - paragraph [ref=e325]: Smetа
                  - generic [ref=e327]: 3 ta bosqich
                  - generic [ref=e329]: Ommaviy
              - generic [ref=e330]:
                - button [ref=e331]:
                  - img [ref=e333]
                - button [ref=e336]:
                  - img [ref=e338]
                - img [ref=e342]
            - generic [ref=e345] [cursor=pointer]:
              - generic [ref=e346]:
                - generic [ref=e347]:
                  - paragraph [ref=e348]: Shartnoma tasdiqlash
                  - generic [ref=e350]: Faol
                - generic [ref=e351]:
                  - generic [ref=e352]:
                    - img [ref=e353]
                    - paragraph [ref=e356]: Ketma-ket
                  - paragraph [ref=e357]: Shartnoma
                  - generic [ref=e359]: 4 ta bosqich
                  - generic [ref=e361]: Ommaviy
              - generic [ref=e362]:
                - button [ref=e363]:
                  - img [ref=e365]
                - button [ref=e368]:
                  - img [ref=e370]
                - img [ref=e374]
            - generic [ref=e377] [cursor=pointer]:
              - generic [ref=e378]:
                - generic [ref=e379]:
                  - paragraph [ref=e380]: Standart buyruq tasdiqlash
                  - generic [ref=e382]: Faol
                - generic [ref=e383]:
                  - generic [ref=e384]:
                    - img [ref=e385]
                    - paragraph [ref=e388]: Ketma-ket
                  - paragraph [ref=e389]: Buyruq
                  - generic [ref=e391]: 3 ta bosqich
                  - generic [ref=e393]: Ommaviy
              - generic [ref=e394]:
                - button [ref=e395]:
                  - img [ref=e397]
                - button [ref=e400]:
                  - img [ref=e402]
                - img [ref=e406]
  - button [ref=e410] [cursor=pointer]:
    - img [ref=e412]
  - alert [ref=e416]
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