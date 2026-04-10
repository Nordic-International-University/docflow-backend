# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-test.spec.ts >> Barcha sahifalar yuklanadi >> Settings - Profile sahifasi (/dashboard/setting/profile)
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
        - generic [ref=e125]:
          - generic [ref=e126] [cursor=pointer]:
            - img [ref=e128]
            - paragraph [ref=e134]: Sozlamalar
            - img [ref=e136]
          - generic [ref=e139]:
            - paragraph [ref=e144] [cursor=pointer]: Profil
            - paragraph [ref=e149] [cursor=pointer]: Sessiyalar
        - generic [ref=e151] [cursor=pointer]:
          - img [ref=e153]
          - generic [ref=e158]:
            - paragraph [ref=e159]: Vazifalar
            - button [ref=e160]:
              - img [ref=e162]
          - img [ref=e164]
      - generic [ref=e167] [cursor=pointer]:
        - img [ref=e169]
        - paragraph [ref=e175]: Chiqish
    - generic [ref=e176]:
      - banner [ref=e177]:
        - generic [ref=e178]:
          - generic [ref=e183]:
            - img [ref=e185]
            - textbox "Qidirish..." [ref=e188]
            - generic [ref=e191]: Ctrl+K
          - generic [ref=e192]:
            - generic [ref=e196] [cursor=pointer]: SA
            - separator [ref=e197]
            - button [ref=e199] [cursor=pointer]:
              - img [ref=e201]
            - button [ref=e204] [cursor=pointer]:
              - img [ref=e206]
            - button "SA" [ref=e209] [cursor=pointer]:
              - generic "Super Administrator" [ref=e212]:
                - paragraph [ref=e213]: SA
      - main [ref=e214]:
        - generic [ref=e219]:
          - generic [ref=e222]:
            - generic [ref=e224]:
              - generic [ref=e226]: SA
              - generic [ref=e228]: Faol
            - generic [ref=e230]:
              - generic [ref=e231]:
                - paragraph [ref=e232]: Super Administrator
                - paragraph [ref=e233]: "@superadmin"
              - generic [ref=e234]:
                - generic [ref=e235]:
                  - img [ref=e237]
                  - generic [ref=e240]:
                    - paragraph [ref=e241]: Rol
                    - paragraph [ref=e242]: Super Administrator
                - generic [ref=e243]:
                  - img [ref=e245]
                  - generic [ref=e247]:
                    - paragraph [ref=e248]: Bo'lim
                    - paragraph [ref=e249]: "-"
                - generic [ref=e250]:
                  - img [ref=e252]
                  - generic [ref=e255]:
                    - paragraph [ref=e256]: So'nggi kirish
                    - paragraph [ref=e257]: April 10, 2026
          - generic [ref=e259]:
            - tablist [ref=e260]:
              - tab "Asosiy ma'lumotlar" [selected] [ref=e261] [cursor=pointer]:
                - img [ref=e263]
                - generic [ref=e266]: Asosiy ma'lumotlar
              - tab "Xavfsizlik" [ref=e267] [cursor=pointer]:
                - img [ref=e269]
                - generic [ref=e273]: Xavfsizlik
              - tab "Tizim" [ref=e274] [cursor=pointer]:
                - img [ref=e276]
                - generic [ref=e279]: Tizim
            - tabpanel "Asosiy ma'lumotlar" [ref=e281]:
              - generic [ref=e282]:
                - generic [ref=e284]:
                  - generic [ref=e286]:
                    - generic [ref=e287]: To'liq ism
                    - paragraph [ref=e288]: Foydalanuvchining to'liq ismi familiyasi
                    - textbox "To'liq ism" [ref=e290]:
                      - /placeholder: Ism Familiya
                      - text: Super Administrator
                  - generic [ref=e292]:
                    - generic [ref=e293]: Username
                    - paragraph [ref=e294]: Tizimga kirish uchun login
                    - textbox "Username" [ref=e296]:
                      - /placeholder: username
                      - text: superadmin
                  - generic [ref=e298]:
                    - generic [ref=e299]: Avatar rasmi
                    - paragraph [ref=e300]: Profil rasmini yangilash (jpg, png)
                    - generic [ref=e301]:
                      - img [ref=e303]
                      - button "Avatar rasmi" [ref=e306] [cursor=pointer]: Fayl tanlang
                - button "Saqlash" [ref=e308] [cursor=pointer]:
                  - generic [ref=e309]:
                    - img [ref=e311]
                    - generic [ref=e315]: Saqlash
  - button [ref=e318] [cursor=pointer]:
    - img [ref=e320]
  - alert [ref=e324]
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