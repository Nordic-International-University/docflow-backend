# KPI Tizimi Frontend Qo'llanmasi

Bu hujjat frontend dasturchilari uchun KPI (Key Performance Indicator) tizimini ishlab chiqish bo'yicha qo'llanma.

## Mundarija

1. [Umumiy ko'rinish](#umumiy-korinish)
2. [KPI Tizimi qanday ishlaydi](#kpi-tizimi-qanday-ishlaydi)
3. [Ma'lumot turlari (TypeScript)](#malumot-turlari)
4. [API Endpoints](#api-endpoints)
5. [Frontend sahifalari](#frontend-sahifalari)
6. [Namuna kodlar](#namuna-kodlar)
7. [UI/UX tavsiyalar](#uiux-tavsiyalar)

---

## Umumiy ko'rinish

KPI tizimi xodimlarning vazifalarni bajarish samaradorligini baholash va rag'batlantirish uchun ishlatiladi.

### Asosiy tushunchalar:

```
Vazifa bajarildi → TaskKpiScore (ball hisoblanadi) → UserMonthlyKpi (oylik jam) → KpiReward (mukofot/jazo)
```

### Tizim komponentlari:

| Komponent | Tavsif |
|-----------|--------|
| **TaskScoreConfig** | Har bir prioritet darajasi uchun ball va jarima konfiguratsiyasi |
| **KpiRewardTier** | Oylik ball diapazonlari va ularga mos mukofotlar |
| **TaskKpiScore** | Har bir bajarilgan vazifa uchun hisoblangan ball |
| **UserMonthlyKpi** | Foydalanuvchining oylik umumiy balli |
| **DepartmentMonthlyKpi** | Bo'lim darajasidagi oylik statistika |
| **KpiReward** | Foydalanuvchiga berilgan mukofot/jazo yozuvi |
| **KpiAchievement** | Maxsus yutuqlar (masalan, "Yil xodimi" nomzodi) |

---

## KPI Tizimi qanday ishlaydi

### 1-qadam: Vazifa prioriteti va ball

Har bir vazifaga prioritet beriladi (№1 dan №10 gacha). Prioritet qanchalik yuqori bo'lsa, ball va muddat shuncha ko'p:

| Prioritet | Kod | Asosiy ball | Muddat (kun) | Jarima/kun |
|-----------|-----|-------------|--------------|------------|
| 1 | №1 | 50 | 12 | -10 |
| 2 | №2 | 45 | 10 | -10 |
| 3 | №3 | 40 | 9 | -10 |
| 4 | №4 | 35 | 8 | -5 |
| 5 | №5 | 30 | 7 | -5 |
| 6 | №6 | 25 | 6 | -5 |
| 7 | №7 | 20 | 5 | -5 |
| 8 | №8 | 15 | 4 | -5 |
| 9 | №9 | 10 | 3 | -5 |
| 10 | №10 | 5 | 1 | -5 |

### 2-qadam: Ball hisoblash formulasi

```
earnedScore = baseScore - (daysLate × penaltyPerDay)
earnedScore = max(0, earnedScore)  // Manfiy bo'lmaydi
```

**Misol:**
- Vazifa: №5 prioritet (baseScore: 30, muddat: 7 kun, jarima: -5/kun)
- Vazifa 2 kun kechikib bajarildi
- Hisoblash: `30 - (2 × 5) = 20 ball`

### 3-qadam: Oylik ball yig'indisi

Oy davomida bajarilgan barcha vazifalarning `earnedScore` qiymatlari yig'iladi:

```
totalEarnedScore = sum(all TaskKpiScore.earnedScore for the month)
```

### 4-qadam: Yakuniy ball va mukofot

Oylik yakuniy ball asosida mukofot yoki jazo belgilanadi:

| Ball diapazoni | Natija | Mukofot (BHM) | Summa (so'm) |
|----------------|--------|---------------|--------------|
| 0-45 | Ogohlantirish/Jazo | — | — |
| 50-65 | Neytral | 0 | 0 |
| 70-80 | Qoniqarli | 5 | 1,875,000 |
| 85-95 | Yaxshi | 10 | 3,750,000 |
| 100 | A'lo | 15 | 5,625,000 |

### 5-qadam: Maxsus yutuqlar

- **"Yil xodimi" nomzodi**: Ketma-ket 3 oy 100 ball olgan xodim
- **Jamoa mukofoti**: Bo'lim o'rtacha balli 85+ bo'lsa

---

## Ma'lumot turlari

### TaskScoreConfig
```typescript
interface TaskScoreConfig {
  id: string
  priorityLevel: number      // 1-10 (1 = eng muhim)
  priorityCode: string       // "№1", "№2", ...
  baseScore: number          // 5, 10, 15, ... 50
  recommendedDays: number    // 1, 3, 4, ... 12
  penaltyPerDay: number      // -5 yoki -10
  maxPenaltyDays?: number    // Maksimal jarima kunlari
  description: string        // Vazifa tavsifi
  criteria?: string          // O'lchash mezonlari
  isActive: boolean
}
```

### KpiRewardTier
```typescript
interface KpiRewardTier {
  id: string
  minScore: number           // 0, 50, 70, 85, 100
  maxScore: number           // 45, 65, 80, 95, 100
  rewardBhm?: number         // 0, 5, 10, 15
  rewardAmount?: number      // 0, 1875000, 3750000, 5625000
  isPenalty: boolean         // true = jazo
  penaltyType?: string       // "WARNING", "FINANCIAL"
  name: string               // "A'lo", "Yaxshi", "Qoniqarli"
  description?: string
  color?: string             // "#00FF00", "#FF0000"
  isActive: boolean
}
```

### TaskKpiScore
```typescript
interface TaskKpiScore {
  id: string
  taskId: string
  userId: string             // Bajargan xodim
  baseScore: number          // Asl ball
  earnedScore: number        // Haqiqiy olingan ball
  penaltyApplied: number     // Qo'llanilgan jarima
  dueDate: Date              // Muddat
  completedDate: Date        // Bajarilgan sana
  daysLate: number           // Kechikkan kunlar
  periodYear: number         // Yil (2024)
  periodMonth: number        // Oy (1-12)
  breakdown?: {              // Tafsilotlar
    baseScore: number
    daysLate: number
    penaltyPerDay: number
    totalPenalty: number
    earned: number
  }
}
```

### UserMonthlyKpi
```typescript
interface UserMonthlyKpi {
  id: string
  userId: string
  departmentId?: string
  year: number
  month: number

  // Ballar
  totalBaseScore: number     // Jami asl ball
  totalEarnedScore: number   // Jami olingan ball
  totalPenalty: number       // Jami jarima

  // Vazifalar soni
  tasksCompleted: number     // Bajarilgan vazifalar
  tasksOnTime: number        // O'z vaqtida
  tasksLate: number          // Kechikkan

  // Yakuniy
  finalScore: number         // Yakuniy ball (max 100)
  isFullScore: boolean       // 100 ball oldimi?
  consecutiveFullMonths: number  // Ketma-ket 100 lar soni

  isFinalized: boolean       // Oy yopilganmi?
  finalizedAt?: Date

  scoreBreakdown?: {         // Prioritet bo'yicha taqsimot
    [key: string]: {
      count: number
      earned: number
    }
  }

  reward?: KpiReward         // Bog'langan mukofot
}
```

### DepartmentMonthlyKpi
```typescript
interface DepartmentMonthlyKpi {
  id: string
  departmentId: string
  year: number
  month: number

  averageScore: number       // O'rtacha ball
  totalScore: number         // Jami ball
  totalUsers: number         // Xodimlar soni
  usersAbove85: number       // 85+ ball olganlar
  usersAt100: number         // 100 ball olganlar

  isEligibleForTeamReward: boolean  // Jamoa mukofotiga loyiqmi?
  isFinalized: boolean
  finalizedAt?: Date
}
```

### KpiReward
```typescript
interface KpiReward {
  id: string
  userMonthlyKpiId: string
  rewardTierId?: string
  userId: string
  year: number
  month: number

  finalScore: number         // Ballga asoslangan
  rewardAmount?: number      // Mukofot summasi
  rewardBhm?: number         // BHM qiymati
  isPenalty: boolean
  penaltyType?: string

  status: KpiRewardStatus    // PENDING, APPROVED, PAID, REJECTED
  approvedById?: string
  approvedAt?: Date
  paidAt?: Date
  notes?: string
}

type KpiRewardStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED'
```

### KpiAchievement
```typescript
interface KpiAchievement {
  id: string
  userId: string
  achievementType: string    // "EMPLOYEE_OF_YEAR_NOMINATION", "TEAM_AWARD"
  title: string
  description?: string
  year?: number
  month?: number
  metadata?: {
    consecutiveMonths?: number
    scores?: number[]
  }
  awardAmount?: number
  awardedAt?: Date
}
```

---

## API Endpoints

### TaskScoreConfig (Prioritet konfiguratsiyasi)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/v1/task-score-config` | Barcha konfiguratsiyalar |
| GET | `/api/v1/task-score-config/:priorityLevel` | Bitta prioritet |
| POST | `/api/v1/task-score-config` | Yangi konfiguratsiya (admin) |
| PATCH | `/api/v1/task-score-config/:id` | Tahrirlash (admin) |

### KpiRewardTier (Mukofot darajalari)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/v1/kpi-reward-tier` | Barcha darajalar |
| POST | `/api/v1/kpi-reward-tier` | Yangi daraja (admin) |
| PATCH | `/api/v1/kpi-reward-tier/:id` | Tahrirlash (admin) |

### TaskKpiScore (Vazifa ballari)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/v1/task-kpi-score?userId={id}&year={y}&month={m}` | Foydalanuvchi ballari |
| GET | `/api/v1/task-kpi-score/:taskId` | Vazifa balli |

### UserMonthlyKpi (Oylik KPI)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/v1/user-monthly-kpi?userId={id}&year={y}&month={m}` | Foydalanuvchi oylik KPI |
| GET | `/api/v1/user-monthly-kpi/me` | Joriy foydalanuvchi KPI |
| GET | `/api/v1/user-monthly-kpi/leaderboard?year={y}&month={m}` | Reyting jadvali |
| GET | `/api/v1/user-monthly-kpi/history?userId={id}` | KPI tarixi |
| POST | `/api/v1/user-monthly-kpi/:id/finalize` | Oyni yopish (admin) |

### DepartmentMonthlyKpi (Bo'lim KPI)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/v1/department-monthly-kpi?departmentId={id}&year={y}&month={m}` | Bo'lim KPI |
| GET | `/api/v1/department-monthly-kpi/ranking?year={y}&month={m}` | Bo'limlar reytingi |

### KpiReward (Mukofotlar)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/v1/kpi-reward?userId={id}` | Foydalanuvchi mukofotlari |
| GET | `/api/v1/kpi-reward/pending` | Kutilayotgan mukofotlar (admin) |
| POST | `/api/v1/kpi-reward/:id/approve` | Tasdiqlash (admin) |
| POST | `/api/v1/kpi-reward/:id/pay` | To'langan deb belgilash (admin) |
| POST | `/api/v1/kpi-reward/:id/reject` | Rad etish (admin) |

### KpiAchievement (Yutuqlar)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/v1/kpi-achievement?userId={id}` | Foydalanuvchi yutuqlari |
| GET | `/api/v1/kpi-achievement/nominations` | "Yil xodimi" nomzodlari |

---

## Frontend sahifalari

### 1. KPI Dashboard (Asosiy sahifa)

**Yo'l:** `/kpi` yoki `/kpi/dashboard`

**Komponentlar:**
```
KpiDashboard
├── CurrentMonthCard (Joriy oy balli, progress bar)
├── ScoreChart (Oylik ball grafigi - line chart)
├── TasksBreakdown (Prioritet bo'yicha vazifalar)
├── RecentScores (So'nggi hisoblangan ballar ro'yxati)
└── AchievementBadges (Yutuq nishonlari)
```

**Ma'lumotlar:**
```typescript
// Joriy oy KPI
GET /api/v1/user-monthly-kpi/me?year=2024&month=1

// So'nggi 6 oy tarixi
GET /api/v1/user-monthly-kpi/history?userId=xxx&limit=6

// Joriy oy vazifalari ballari
GET /api/v1/task-kpi-score?userId=xxx&year=2024&month=1
```

### 2. Leaderboard (Reyting jadvali)

**Yo'l:** `/kpi/leaderboard`

**Komponentlar:**
```
Leaderboard
├── PeriodSelector (Oy/Yil tanlash)
├── LeaderboardTable
│   ├── Rank
│   ├── UserAvatar + Name
│   ├── Department
│   ├── FinalScore (rang bilan)
│   └── TasksCompleted
├── DepartmentRanking (Bo'limlar reytingi)
└── TopAchievers (Top 3 xodim kartasi)
```

**Ma'lumotlar:**
```typescript
// Foydalanuvchilar reytingi
GET /api/v1/user-monthly-kpi/leaderboard?year=2024&month=1&limit=50

// Bo'limlar reytingi
GET /api/v1/department-monthly-kpi/ranking?year=2024&month=1
```

### 3. My KPI History (Shaxsiy tarix)

**Yo'l:** `/kpi/history`

**Komponentlar:**
```
KpiHistory
├── YearSelector
├── MonthlyScoreCards (12 oy kartasi)
├── YearlyTrendChart (Yillik grafik)
├── RewardsHistory (Mukofotlar tarixi)
└── AchievementsList (Yutuqlar ro'yxati)
```

### 4. Task Score Details (Vazifa ball tafsiloti)

**Yo'l:** `/kpi/task/:taskId`

**Komponentlar:**
```
TaskScoreDetail
├── TaskInfo (Sarlavha, prioritet, muddat)
├── ScoreCalculation
│   ├── BaseScore
│   ├── DaysLate
│   ├── PenaltyApplied
│   └── FinalScore
└── Timeline (Yaratilgan, muddat, bajarilgan sanalar)
```

### 5. Admin: Score Config (Konfiguratsiya)

**Yo'l:** `/admin/kpi/config`

**Komponentlar:**
```
KpiConfigAdmin
├── PriorityConfigTable (10 ta prioritet)
│   ├── PriorityCode
│   ├── BaseScore (tahrirlash)
│   ├── RecommendedDays (tahrirlash)
│   ├── PenaltyPerDay (tahrirlash)
│   └── Actions (Save)
└── RewardTiersTable
    ├── ScoreRange
    ├── RewardBHM
    ├── RewardAmount
    ├── IsPenalty
    └── Actions
```

### 6. Admin: Rewards Management (Mukofotlar boshqaruvi)

**Yo'l:** `/admin/kpi/rewards`

**Komponentlar:**
```
RewardsAdmin
├── PeriodFilter (Yil, Oy)
├── StatusTabs (Pending, Approved, Paid, Rejected)
├── RewardsTable
│   ├── User
│   ├── Department
│   ├── FinalScore
│   ├── RewardAmount
│   ├── Status
│   └── Actions (Approve, Pay, Reject)
├── BulkActions (Hammasini tasdiqlash)
└── ExportButton (Excel eksport)
```

---

## Namuna kodlar

### Joriy oy KPI olish

```typescript
interface KpiDashboardData {
  currentMonth: UserMonthlyKpi
  rewardTier: KpiRewardTier | null
  taskScores: TaskKpiScore[]
}

async function fetchKpiDashboard(year: number, month: number): Promise<KpiDashboardData> {
  const [currentMonth, tiers, taskScores] = await Promise.all([
    api.get('/user-monthly-kpi/me', { params: { year, month } }),
    api.get('/kpi-reward-tier'),
    api.get('/task-kpi-score', { params: { year, month } })
  ])

  // Tegishli tier ni topish
  const rewardTier = tiers.find(t =>
    currentMonth.finalScore >= t.minScore &&
    currentMonth.finalScore <= t.maxScore
  )

  return { currentMonth, rewardTier, taskScores }
}
```

### Ball progress bar

```typescript
function ScoreProgressBar({ score, maxScore = 100 }: { score: number; maxScore?: number }) {
  const percentage = Math.min((score / maxScore) * 100, 100)

  const getColor = (score: number) => {
    if (score >= 100) return '#00FF00'  // A'lo - yashil
    if (score >= 85) return '#90EE90'   // Yaxshi - och yashil
    if (score >= 70) return '#FFA500'   // Qoniqarli - sariq
    if (score >= 50) return '#808080'   // Neytral - kulrang
    return '#FF0000'                     // Jazo - qizil
  }

  return (
    <div className="progress-container">
      <div
        className="progress-bar"
        style={{
          width: `${percentage}%`,
          backgroundColor: getColor(score)
        }}
      />
      <span className="score-text">{score} / {maxScore}</span>
    </div>
  )
}
```

### Prioritet bo'yicha ball ko'rsatish

```typescript
function PriorityScoreBadge({ priorityLevel }: { priorityLevel: number }) {
  const configs: Record<number, { code: string; score: number; color: string }> = {
    1: { code: '№1', score: 50, color: '#FF0000' },
    2: { code: '№2', score: 45, color: '#FF4500' },
    3: { code: '№3', score: 40, color: '#FF6347' },
    4: { code: '№4', score: 35, color: '#FF7F50' },
    5: { code: '№5', score: 30, color: '#FFA500' },
    6: { code: '№6', score: 25, color: '#FFD700' },
    7: { code: '№7', score: 20, color: '#ADFF2F' },
    8: { code: '№8', score: 15, color: '#7FFF00' },
    9: { code: '№9', score: 10, color: '#00FF00' },
    10: { code: '№10', score: 5, color: '#32CD32' },
  }

  const config = configs[priorityLevel]

  return (
    <span
      className="priority-badge"
      style={{ backgroundColor: config.color }}
    >
      {config.code} ({config.score} ball)
    </span>
  )
}
```

### Ball hisoblash kalkulyatori

```typescript
function calculateScore(
  priorityLevel: number,
  dueDate: Date,
  completedDate: Date,
  configs: TaskScoreConfig[]
): { earnedScore: number; breakdown: any } {
  const config = configs.find(c => c.priorityLevel === priorityLevel)
  if (!config) throw new Error('Config not found')

  const daysLate = Math.max(0,
    Math.floor((completedDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
  )

  const penalty = daysLate * Math.abs(config.penaltyPerDay)
  const earnedScore = Math.max(0, config.baseScore - penalty)

  return {
    earnedScore,
    breakdown: {
      baseScore: config.baseScore,
      daysLate,
      penaltyPerDay: config.penaltyPerDay,
      totalPenalty: penalty,
      earned: earnedScore
    }
  }
}
```

### Mukofot tierini aniqlash

```typescript
function getRewardTier(finalScore: number, tiers: KpiRewardTier[]): KpiRewardTier | null {
  return tiers.find(tier =>
    finalScore >= tier.minScore && finalScore <= tier.maxScore
  ) || null
}

function RewardTierCard({ tier }: { tier: KpiRewardTier }) {
  return (
    <div
      className="reward-tier-card"
      style={{ borderColor: tier.color }}
    >
      <h3 style={{ color: tier.color }}>{tier.name}</h3>
      <p>{tier.description}</p>
      {tier.isPenalty ? (
        <span className="penalty-badge">Ogohlantirish</span>
      ) : tier.rewardAmount ? (
        <div className="reward-info">
          <span>{tier.rewardBhm} BHM</span>
          <span>{tier.rewardAmount?.toLocaleString()} so'm</span>
        </div>
      ) : (
        <span className="neutral-badge">Mukofot yo'q</span>
      )}
    </div>
  )
}
```

### Leaderboard jadval

```typescript
interface LeaderboardEntry {
  rank: number
  user: {
    id: string
    fullname: string
    avatarUrl?: string
  }
  department?: {
    id: string
    name: string
  }
  finalScore: number
  tasksCompleted: number
  tasksOnTime: number
}

function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  const getRankStyle = (rank: number) => {
    if (rank === 1) return { color: '#FFD700', fontWeight: 'bold' }  // Oltin
    if (rank === 2) return { color: '#C0C0C0', fontWeight: 'bold' }  // Kumush
    if (rank === 3) return { color: '#CD7F32', fontWeight: 'bold' }  // Bronza
    return {}
  }

  return (
    <table className="leaderboard-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Xodim</th>
          <th>Bo'lim</th>
          <th>Ball</th>
          <th>Vazifalar</th>
          <th>O'z vaqtida</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(entry => (
          <tr key={entry.user.id}>
            <td style={getRankStyle(entry.rank)}>{entry.rank}</td>
            <td>
              <div className="user-cell">
                <img src={entry.user.avatarUrl} alt="" />
                <span>{entry.user.fullname}</span>
              </div>
            </td>
            <td>{entry.department?.name || '-'}</td>
            <td>
              <ScoreProgressBar score={entry.finalScore} />
            </td>
            <td>{entry.tasksCompleted}</td>
            <td>{entry.tasksOnTime} ({Math.round(entry.tasksOnTime / entry.tasksCompleted * 100)}%)</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

---

## UI/UX tavsiyalar

### 1. Ranglar sxemasi

```css
:root {
  /* Ball darajalari */
  --score-excellent: #00FF00;    /* 100 - A'lo */
  --score-good: #90EE90;         /* 85-95 - Yaxshi */
  --score-acceptable: #FFA500;   /* 70-80 - Qoniqarli */
  --score-neutral: #808080;      /* 50-65 - Neytral */
  --score-penalty: #FF0000;      /* 0-45 - Jazo */

  /* Prioritetlar */
  --priority-1: #FF0000;         /* Eng muhim */
  --priority-5: #FFA500;         /* O'rta */
  --priority-10: #32CD32;        /* Eng past */
}
```

### 2. Animatsiyalar

- Ball o'zgarganda counter animatsiya (0 dan hozirgi qiymatgacha)
- Progress bar smooth transition
- Yangi yutuq olganda confetti effekti
- Leaderboard pozitsiya o'zgarganda highlight

### 3. Real-time yangilanishlar

- Vazifa bajarilganda ball avtomatik yangilansin (WebSocket)
- Leaderboard real-time yangilansin
- Oy boshida yangi KPI period avtomatik yaratilsin

### 4. Mobile responsive

- Dashboard kartalar stacked layout
- Leaderboard horizontal scroll
- Progress bar kompakt versiya

### 5. Notifications

```typescript
// Vazifa bajarilganda
{
  type: 'KPI_SCORE_EARNED',
  title: 'Ball olindi!',
  message: 'Siz "Login sahifa" vazifasi uchun 25 ball oldingiz',
  data: { taskId, earnedScore, totalScore }
}

// Oy yakunida
{
  type: 'MONTHLY_KPI_FINALIZED',
  title: 'Oylik natija',
  message: 'Yanvar oyi uchun 87 ball to\'pladingiz. Mukofot: 3,750,000 so\'m',
  data: { year, month, finalScore, rewardAmount }
}

// Yutuq olganda
{
  type: 'ACHIEVEMENT_EARNED',
  title: 'Yangi yutuq!',
  message: 'Siz "Yil xodimi" nomzodi bo\'ldingiz!',
  data: { achievementType, title }
}
```

---

## Xatolar va yechimlar

### "TaskScoreConfig not found for priority X"
Prioritet konfiguratsiyasi mavjud emas. Admin paneldan qo'shing.

### "Cannot finalize month with pending tasks"
Oyni yopishdan oldin barcha tayinlangan vazifalar bajarilgan yoki bekor qilingan bo'lishi kerak.

### "User already has KPI record for this month"
Bu oy uchun allaqachon KPI yozuvi mavjud. Yangi yaratish o'rniga mavjudini yangilang.

---

## Qo'shimcha resurslar

- API Swagger: `http://localhost:5058/api/docs`
- Prisma schema: `prisma/schema.prisma` (1149-1418 qatorlar)
- Task Manager qo'llanmasi: `docs/FRONTEND_TASK_MANAGER_GUIDE.md`

---

## Ishlab chiqish tartibi

1. **1-bosqich**: TaskScoreConfig va KpiRewardTier sahifalarini yarating (read-only)
2. **2-bosqich**: KPI Dashboard - joriy oy ko'rinishi
3. **3-bosqich**: Task completion da ball hisoblash integratsiyasi
4. **4-bosqich**: Leaderboard sahifasi
5. **5-bosqich**: Admin panel - konfiguratsiya va mukofotlar boshqaruvi
6. **6-bosqich**: Notifications va real-time yangilanishlar
