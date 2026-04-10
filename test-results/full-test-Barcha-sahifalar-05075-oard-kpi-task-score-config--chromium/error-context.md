# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-test.spec.ts >> Barcha sahifalar yuklanadi >> KPI - Task score sahifasi (/dashboard/kpi/task-score-config)
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
          - generic [ref=e110]:
            - generic [ref=e111]:
              - paragraph [ref=e112]: Ball konfiguratsiyasi
              - paragraph [ref=e113]: Vazifa ball hisoblash sozlamalari
            - generic [ref=e114]:
              - generic:
                - button "Konfiguratsiya qo'shish" [disabled]:
                  - generic:
                    - generic:
                      - img
                    - generic: Konfiguratsiya qo'shish
          - generic [ref=e116]:
            - table [ref=e121]:
              - rowgroup [ref=e122]:
                - row "Prioritet Ball Muddat Jarima/kun Maks. kun Tavsif Holat" [ref=e123]:
                  - columnheader "Prioritet" [ref=e124]:
                    - button "Prioritet" [ref=e125] [cursor=pointer]:
                      - paragraph [ref=e126]: Prioritet
                      - img [ref=e127]
                  - columnheader "Ball" [ref=e130]:
                    - button "Ball" [ref=e131] [cursor=pointer]:
                      - paragraph [ref=e132]: Ball
                      - img [ref=e133]
                  - columnheader "Muddat" [ref=e136]:
                    - button "Muddat" [ref=e137] [cursor=pointer]:
                      - paragraph [ref=e138]: Muddat
                      - img
                  - columnheader "Jarima/kun" [ref=e141]:
                    - button "Jarima/kun" [ref=e142] [cursor=pointer]:
                      - paragraph [ref=e143]: Jarima/kun
                      - img
                  - columnheader "Maks. kun" [ref=e146]:
                    - button "Maks. kun" [ref=e147] [cursor=pointer]:
                      - paragraph [ref=e148]: Maks. kun
                      - img [ref=e149]
                  - columnheader "Tavsif" [ref=e152]:
                    - button "Tavsif" [ref=e153] [cursor=pointer]:
                      - paragraph [ref=e154]: Tavsif
                      - img [ref=e155]
                  - columnheader "Holat" [ref=e158]:
                    - button "Holat" [ref=e159] [cursor=pointer]:
                      - paragraph [ref=e160]: Holat
                      - img
                  - columnheader [ref=e163]:
                    - paragraph
              - rowgroup [ref=e164]:
                - row "1 №1 50 12 kun --10 — Eng muhim, strategik, universitet bo'yicha tezkor qaror chiqarishga olib keladigan topshiriq" [ref=e165]:
                  - cell "1 №1" [ref=e166]:
                    - generic [ref=e167]:
                      - generic [ref=e169]: "1"
                      - paragraph [ref=e170]: №1
                  - cell "50" [ref=e171]:
                    - paragraph [ref=e172]: "50"
                  - cell "12 kun" [ref=e173]:
                    - paragraph [ref=e174]: 12 kun
                  - cell "--10" [ref=e175]:
                    - paragraph [ref=e176]: "--10"
                  - cell "—" [ref=e177]:
                    - paragraph [ref=e178]: —
                  - cell "Eng muhim, strategik, universitet bo'yicha tezkor qaror chiqarishga olib keladigan topshiriq" [ref=e179]:
                    - paragraph [ref=e180]: Eng muhim, strategik, universitet bo'yicha tezkor qaror chiqarishga olib keladigan topshiriq
                  - cell [ref=e181]
                  - cell [ref=e183]:
                    - button [ref=e184] [cursor=pointer]:
                      - img [ref=e186]
                - row "2 №2 45 10 kun --10 — Universitet darajasidagi – loyihani boshqarish, universitet hisobotini tayyorlash" [ref=e190]:
                  - cell "2 №2" [ref=e191]:
                    - generic [ref=e192]:
                      - generic [ref=e194]: "2"
                      - paragraph [ref=e195]: №2
                  - cell "45" [ref=e196]:
                    - paragraph [ref=e197]: "45"
                  - cell "10 kun" [ref=e198]:
                    - paragraph [ref=e199]: 10 kun
                  - cell "--10" [ref=e200]:
                    - paragraph [ref=e201]: "--10"
                  - cell "—" [ref=e202]:
                    - paragraph [ref=e203]: —
                  - cell "Universitet darajasidagi – loyihani boshqarish, universitet hisobotini tayyorlash" [ref=e204]:
                    - paragraph [ref=e205]: Universitet darajasidagi – loyihani boshqarish, universitet hisobotini tayyorlash
                  - cell [ref=e206]
                  - cell [ref=e208]:
                    - button [ref=e209] [cursor=pointer]:
                      - img [ref=e211]
                - row "3 №3 40 9 kun --10 — Tashqi hamkorlik, kelishuv va protokol ishlab chiqish bo'yicha topshiriq" [ref=e215]:
                  - cell "3 №3" [ref=e216]:
                    - generic [ref=e217]:
                      - generic [ref=e219]: "3"
                      - paragraph [ref=e220]: №3
                  - cell "40" [ref=e221]:
                    - paragraph [ref=e222]: "40"
                  - cell "9 kun" [ref=e223]:
                    - paragraph [ref=e224]: 9 kun
                  - cell "--10" [ref=e225]:
                    - paragraph [ref=e226]: "--10"
                  - cell "—" [ref=e227]:
                    - paragraph [ref=e228]: —
                  - cell "Tashqi hamkorlik, kelishuv va protokol ishlab chiqish bo'yicha topshiriq" [ref=e229]:
                    - paragraph [ref=e230]: Tashqi hamkorlik, kelishuv va protokol ishlab chiqish bo'yicha topshiriq
                  - cell [ref=e231]
                  - cell [ref=e233]:
                    - button [ref=e234] [cursor=pointer]:
                      - img [ref=e236]
                - row "4 №4 35 8 kun --5 — Strategik tahlil, taklif kiritish yoki ichki nizomlarni ishlab chiqish topshiriqlari" [ref=e240]:
                  - cell "4 №4" [ref=e241]:
                    - generic [ref=e242]:
                      - generic [ref=e244]: "4"
                      - paragraph [ref=e245]: №4
                  - cell "35" [ref=e246]:
                    - paragraph [ref=e247]: "35"
                  - cell "8 kun" [ref=e248]:
                    - paragraph [ref=e249]: 8 kun
                  - cell "--5" [ref=e250]:
                    - paragraph [ref=e251]: "--5"
                  - cell "—" [ref=e252]:
                    - paragraph [ref=e253]: —
                  - cell "Strategik tahlil, taklif kiritish yoki ichki nizomlarni ishlab chiqish topshiriqlari" [ref=e254]:
                    - paragraph [ref=e255]: Strategik tahlil, taklif kiritish yoki ichki nizomlarni ishlab chiqish topshiriqlari
                  - cell [ref=e256]
                  - cell [ref=e258]:
                    - button [ref=e259] [cursor=pointer]:
                      - img [ref=e261]
                - row "5 №5 30 7 kun --5 — Analitik, ko'p bosqichli – masalan, o'rganish, tahlil va xulosa chiqarish topshiriqlari" [ref=e265]:
                  - cell "5 №5" [ref=e266]:
                    - generic [ref=e267]:
                      - generic [ref=e269]: "5"
                      - paragraph [ref=e270]: №5
                  - cell "30" [ref=e271]:
                    - paragraph [ref=e272]: "30"
                  - cell "7 kun" [ref=e273]:
                    - paragraph [ref=e274]: 7 kun
                  - cell "--5" [ref=e275]:
                    - paragraph [ref=e276]: "--5"
                  - cell "—" [ref=e277]:
                    - paragraph [ref=e278]: —
                  - cell "Analitik, ko'p bosqichli – masalan, o'rganish, tahlil va xulosa chiqarish topshiriqlari" [ref=e279]:
                    - paragraph [ref=e280]: Analitik, ko'p bosqichli – masalan, o'rganish, tahlil va xulosa chiqarish topshiriqlari
                  - cell [ref=e281]
                  - cell [ref=e283]:
                    - button [ref=e284] [cursor=pointer]:
                      - img [ref=e286]
                - row "6 №6 25 6 kun --5 — Boshqaruv darajasidagi – xodimlarga topshiriq taqsimoti, reja shakllantirish topshiriqlari" [ref=e290]:
                  - cell "6 №6" [ref=e291]:
                    - generic [ref=e292]:
                      - generic [ref=e294]: "6"
                      - paragraph [ref=e295]: №6
                  - cell "25" [ref=e296]:
                    - paragraph [ref=e297]: "25"
                  - cell "6 kun" [ref=e298]:
                    - paragraph [ref=e299]: 6 kun
                  - cell "--5" [ref=e300]:
                    - paragraph [ref=e301]: "--5"
                  - cell "—" [ref=e302]:
                    - paragraph [ref=e303]: —
                  - cell "Boshqaruv darajasidagi – xodimlarga topshiriq taqsimoti, reja shakllantirish topshiriqlari" [ref=e304]:
                    - paragraph [ref=e305]: Boshqaruv darajasidagi – xodimlarga topshiriq taqsimoti, reja shakllantirish topshiriqlari
                  - cell [ref=e306]
                  - cell [ref=e308]:
                    - button [ref=e309] [cursor=pointer]:
                      - img [ref=e311]
                - row "7 №7 20 5 kun --5 — Muhim, muddati qat'iy, kechikishi xatarli topshiriq (masalan, tashqi tashkilotga javob yuborish)" [ref=e315]:
                  - cell "7 №7" [ref=e316]:
                    - generic [ref=e317]:
                      - generic [ref=e319]: "7"
                      - paragraph [ref=e320]: №7
                  - cell "20" [ref=e321]:
                    - paragraph [ref=e322]: "20"
                  - cell "5 kun" [ref=e323]:
                    - paragraph [ref=e324]: 5 kun
                  - cell "--5" [ref=e325]:
                    - paragraph [ref=e326]: "--5"
                  - cell "—" [ref=e327]:
                    - paragraph [ref=e328]: —
                  - cell "Muhim, muddati qat'iy, kechikishi xatarli topshiriq (masalan, tashqi tashkilotga javob yuborish)" [ref=e329]:
                    - paragraph [ref=e330]: Muhim, muddati qat'iy, kechikishi xatarli topshiriq (masalan, tashqi tashkilotga javob yuborish)
                  - cell [ref=e331]
                  - cell [ref=e333]:
                    - button [ref=e334] [cursor=pointer]:
                      - img [ref=e336]
                - row "8 №8 15 4 kun --5 — Murakkablik darajasi o'rta – hisobot tayyorlash yoki taklif yozish kabi topshiriq" [ref=e340]:
                  - cell "8 №8" [ref=e341]:
                    - generic [ref=e342]:
                      - generic [ref=e344]: "8"
                      - paragraph [ref=e345]: №8
                  - cell "15" [ref=e346]:
                    - paragraph [ref=e347]: "15"
                  - cell "4 kun" [ref=e348]:
                    - paragraph [ref=e349]: 4 kun
                  - cell "--5" [ref=e350]:
                    - paragraph [ref=e351]: "--5"
                  - cell "—" [ref=e352]:
                    - paragraph [ref=e353]: —
                  - cell "Murakkablik darajasi o'rta – hisobot tayyorlash yoki taklif yozish kabi topshiriq" [ref=e354]:
                    - paragraph [ref=e355]: Murakkablik darajasi o'rta – hisobot tayyorlash yoki taklif yozish kabi topshiriq
                  - cell [ref=e356]
                  - cell [ref=e358]:
                    - button [ref=e359] [cursor=pointer]:
                      - img [ref=e361]
                - row "9 №9 10 3 kun --5 — Qisqa muddatli, bitta hujjat tayyorlash yoki tasdiqlash jarayonidan iborat topshiriq" [ref=e365]:
                  - cell "9 №9" [ref=e366]:
                    - generic [ref=e367]:
                      - generic [ref=e369]: "9"
                      - paragraph [ref=e370]: №9
                  - cell "10" [ref=e371]:
                    - paragraph [ref=e372]: "10"
                  - cell "3 kun" [ref=e373]:
                    - paragraph [ref=e374]: 3 kun
                  - cell "--5" [ref=e375]:
                    - paragraph [ref=e376]: "--5"
                  - cell "—" [ref=e377]:
                    - paragraph [ref=e378]: —
                  - cell "Qisqa muddatli, bitta hujjat tayyorlash yoki tasdiqlash jarayonidan iborat topshiriq" [ref=e379]:
                    - paragraph [ref=e380]: Qisqa muddatli, bitta hujjat tayyorlash yoki tasdiqlash jarayonidan iborat topshiriq
                  - cell [ref=e381]
                  - cell [ref=e383]:
                    - button [ref=e384] [cursor=pointer]:
                      - img [ref=e386]
                - row "10 №10 5 1 kun --5 — Oddiy, ma'lumot beruvchi, 1-2 soat ichida bajariladigan vazifa" [ref=e390]:
                  - cell "10 №10" [ref=e391]:
                    - generic [ref=e392]:
                      - generic [ref=e394]: "10"
                      - paragraph [ref=e395]: №10
                  - cell "5" [ref=e396]:
                    - paragraph [ref=e397]: "5"
                  - cell "1 kun" [ref=e398]:
                    - paragraph [ref=e399]: 1 kun
                  - cell "--5" [ref=e400]:
                    - paragraph [ref=e401]: "--5"
                  - cell "—" [ref=e402]:
                    - paragraph [ref=e403]: —
                  - cell "Oddiy, ma'lumot beruvchi, 1-2 soat ichida bajariladigan vazifa" [ref=e404]:
                    - paragraph [ref=e405]: Oddiy, ma'lumot beruvchi, 1-2 soat ichida bajariladigan vazifa
                  - cell [ref=e406]
                  - cell [ref=e408]:
                    - button [ref=e409] [cursor=pointer]:
                      - img [ref=e411]
            - generic [ref=e415]:
              - paragraph [ref=e416]: 1-10 / 10
              - generic [ref=e417]:
                - generic [ref=e419]:
                  - textbox [ref=e420] [cursor=pointer]: "100"
                  - generic:
                    - img
                - generic [ref=e421]:
                  - button [disabled] [ref=e422]:
                    - img [ref=e424]
                  - paragraph [ref=e426]: 1 / 1
                  - button [disabled] [ref=e427]:
                    - img [ref=e429]
  - button [ref=e433] [cursor=pointer]:
    - img [ref=e435]
  - alert [ref=e439]
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