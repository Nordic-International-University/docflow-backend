# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-test.spec.ts >> Barcha sahifalar yuklanadi >> Andozalar sahifasi (/dashboard/document-template)
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
              - paragraph [ref=e209]: Hujjat shablonlari
              - paragraph [ref=e210]: Hujjatlar uchun tayyor shablonlar
            - button "Shablon qo'shish" [ref=e211] [cursor=pointer]:
              - generic [ref=e212]:
                - img [ref=e214]
                - generic [ref=e215]: Shablon qo'shish
          - generic [ref=e218]:
            - img [ref=e220]
            - textbox "Shablonlarni qidirish..." [ref=e223]
          - generic [ref=e225]:
            - table [ref=e230]:
              - rowgroup [ref=e231]:
                - row "Nomi Hujjat turi Fayl Holati Amallar" [ref=e232]:
                  - columnheader "Nomi" [ref=e233]:
                    - button "Nomi" [ref=e234] [cursor=pointer]:
                      - paragraph [ref=e235]: Nomi
                      - img [ref=e236]
                  - columnheader "Hujjat turi" [ref=e239]:
                    - button "Hujjat turi" [ref=e240] [cursor=pointer]:
                      - paragraph [ref=e241]: Hujjat turi
                      - img [ref=e242]
                  - columnheader "Fayl" [ref=e245]:
                    - button "Fayl" [ref=e246] [cursor=pointer]:
                      - paragraph [ref=e247]: Fayl
                      - img [ref=e248]
                  - columnheader "Holati" [ref=e251]:
                    - button "Holati" [ref=e252] [cursor=pointer]:
                      - paragraph [ref=e253]: Holati
                      - img [ref=e254]
                  - columnheader "Amallar" [ref=e257]:
                    - paragraph [ref=e258]: Amallar
              - rowgroup [ref=e259]:
                - row "Jonim pizada asljkbal;jkhbsad Hisob-faktura Новый документ (3).docx Faol" [ref=e260]:
                  - cell "Jonim pizada asljkbal;jkhbsad" [ref=e261]:
                    - generic [ref=e262]:
                      - paragraph [ref=e263]: Jonim pizada
                      - paragraph [ref=e264]: asljkbal;jkhbsad
                  - cell "Hisob-faktura" [ref=e265]:
                    - paragraph [ref=e266]: Hisob-faktura
                  - cell "Новый документ (3).docx" [ref=e267]:
                    - generic [ref=e268]:
                      - img [ref=e269]
                      - paragraph [ref=e272]: Новый документ (3).docx
                  - cell "Faol" [ref=e273]:
                    - generic [ref=e275]: Faol
                  - cell [ref=e276]:
                    - button [ref=e277] [cursor=pointer]:
                      - img [ref=e279]
                - row "salom asfasfasfasf Loyiha hujjati 3160597__charter_1773585767432 (2).docx Faol" [ref=e283]:
                  - cell "salom asfasfasfasf" [ref=e284]:
                    - generic [ref=e285]:
                      - paragraph [ref=e286]: salom
                      - paragraph [ref=e287]: asfasfasfasf
                  - cell "Loyiha hujjati" [ref=e288]:
                    - paragraph [ref=e289]: Loyiha hujjati
                  - cell "3160597__charter_1773585767432 (2).docx" [ref=e290]:
                    - generic [ref=e291]:
                      - img [ref=e292]
                      - paragraph [ref=e295]: 3160597__charter_1773585767432 (2).docx
                  - cell "Faol" [ref=e296]:
                    - generic [ref=e298]: Faol
                  - cell [ref=e299]:
                    - button [ref=e300] [cursor=pointer]:
                      - img [ref=e302]
                - row "asdasdasd asdasdasdas Hisob-faktura Новый документ (3).docx Faol" [ref=e306]:
                  - cell "asdasdasd asdasdasdas" [ref=e307]:
                    - generic [ref=e308]:
                      - paragraph [ref=e309]: asdasdasd
                      - paragraph [ref=e310]: asdasdasdas
                  - cell "Hisob-faktura" [ref=e311]:
                    - paragraph [ref=e312]: Hisob-faktura
                  - cell "Новый документ (3).docx" [ref=e313]:
                    - generic [ref=e314]:
                      - img [ref=e315]
                      - paragraph [ref=e318]: Новый документ (3).docx
                  - cell "Faol" [ref=e319]:
                    - generic [ref=e321]: Faol
                  - cell [ref=e322]:
                    - button [ref=e323] [cursor=pointer]:
                      - img [ref=e325]
                - row "Minening ismim Minening ismim Loyiha hujjati Новый документ (3).docx Faol" [ref=e329]:
                  - cell "Minening ismim Minening ismim" [ref=e330]:
                    - generic [ref=e331]:
                      - paragraph [ref=e332]: Minening ismim
                      - paragraph [ref=e333]: Minening ismim
                  - cell "Loyiha hujjati" [ref=e334]:
                    - paragraph [ref=e335]: Loyiha hujjati
                  - cell "Новый документ (3).docx" [ref=e336]:
                    - generic [ref=e337]:
                      - img [ref=e338]
                      - paragraph [ref=e341]: Новый документ (3).docx
                  - cell "Faol" [ref=e342]:
                    - generic [ref=e344]: Faol
                  - cell [ref=e345]:
                    - button [ref=e346] [cursor=pointer]:
                      - img [ref=e348]
                - row "Bildirshnoma-moliyaviy yordam sorash Bildirshnoma-moliyaviy yordam sorash Texnik hujjatk Новый документ (1).docx Faol" [ref=e352]:
                  - cell "Bildirshnoma-moliyaviy yordam sorash Bildirshnoma-moliyaviy yordam sorash" [ref=e353]:
                    - generic [ref=e354]:
                      - paragraph [ref=e355]: Bildirshnoma-moliyaviy yordam sorash
                      - paragraph [ref=e356]: Bildirshnoma-moliyaviy yordam sorash
                  - cell "Texnik hujjatk" [ref=e357]:
                    - paragraph [ref=e358]: Texnik hujjatk
                  - cell "Новый документ (1).docx" [ref=e359]:
                    - generic [ref=e360]:
                      - img [ref=e361]
                      - paragraph [ref=e364]: Новый документ (1).docx
                  - cell "Faol" [ref=e365]:
                    - generic [ref=e367]: Faol
                  - cell [ref=e368]:
                    - button [ref=e369] [cursor=pointer]:
                      - img [ref=e371]
                - row "asdasd asdasd Loyiha hujjatiw roadmap_algorithms.docx Faol" [ref=e375]:
                  - cell "asdasd asdasd" [ref=e376]:
                    - generic [ref=e377]:
                      - paragraph [ref=e378]: asdasd
                      - paragraph [ref=e379]: asdasd
                  - cell "Loyiha hujjatiw" [ref=e380]:
                    - paragraph [ref=e381]: Loyiha hujjatiw
                  - cell "roadmap_algorithms.docx" [ref=e382]:
                    - generic [ref=e383]:
                      - img [ref=e384]
                      - paragraph [ref=e387]: roadmap_algorithms.docx
                  - cell "Faol" [ref=e388]:
                    - generic [ref=e390]: Faol
                  - cell [ref=e391]:
                    - button [ref=e392] [cursor=pointer]:
                      - img [ref=e394]
                - row "asddasd asdasdasdas To'lov topshiriqномаsi Новый документ.docx Faol" [ref=e398]:
                  - cell "asddasd asdasdasdas" [ref=e399]:
                    - generic [ref=e400]:
                      - paragraph [ref=e401]: asddasd
                      - paragraph [ref=e402]: asdasdasdas
                  - cell "To'lov topshiriqномаsi" [ref=e403]:
                    - paragraph [ref=e404]: To'lov topshiriqномаsi
                  - cell "Новый документ.docx" [ref=e405]:
                    - generic [ref=e406]:
                      - img [ref=e407]
                      - paragraph [ref=e410]: Новый документ.docx
                  - cell "Faol" [ref=e411]:
                    - generic [ref=e413]: Faol
                  - cell [ref=e414]:
                    - button [ref=e415] [cursor=pointer]:
                      - img [ref=e417]
                - row "Jonim Jonim Shtat jadvali Новый документ.docx Faol" [ref=e421]:
                  - cell "Jonim Jonim" [ref=e422]:
                    - generic [ref=e423]:
                      - paragraph [ref=e424]: Jonim
                      - paragraph [ref=e425]: Jonim
                  - cell "Shtat jadvali" [ref=e426]:
                    - paragraph [ref=e427]: Shtat jadvali
                  - cell "Новый документ.docx" [ref=e428]:
                    - generic [ref=e429]:
                      - img [ref=e430]
                      - paragraph [ref=e433]: Новый документ.docx
                  - cell "Faol" [ref=e434]:
                    - generic [ref=e436]: Faol
                  - cell [ref=e437]:
                    - button [ref=e438] [cursor=pointer]:
                      - img [ref=e440]
            - generic [ref=e444]:
              - paragraph [ref=e445]: 1-8 / 8
              - generic [ref=e446]:
                - generic [ref=e448]:
                  - textbox [ref=e449] [cursor=pointer]: "10"
                  - generic:
                    - img
                - generic [ref=e450]:
                  - button [disabled] [ref=e451]:
                    - img [ref=e453]
                  - paragraph [ref=e455]: 1 / 1
                  - button [disabled] [ref=e456]:
                    - img [ref=e458]
  - button [ref=e462] [cursor=pointer]:
    - img [ref=e464]
  - alert [ref=e468]
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