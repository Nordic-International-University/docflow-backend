import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as argon2 from 'argon2'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

interface PermissionData {
  key: string
  name: string
  description: string
}

interface ModulePermissions {
  module: string
  description: string
  permissions: PermissionData[]
}

interface PermissionsFile {
  permissions: ModulePermissions[]
}

interface RoleData {
  name: string
  description: string
  permissions: string[]
}

interface RolesFile {
  roles: RoleData[]
}

async function seedPermissions(): Promise<Map<string, string>> {
  console.log('🔐 Seeding permissions...')

  const permissionsPath = path.join(__dirname, '../mock/permissions.json')
  const permissionsData: PermissionsFile = JSON.parse(
    fs.readFileSync(permissionsPath, 'utf-8'),
  )

  const permissionKeyToId = new Map<string, string>()

  for (const moduleData of permissionsData.permissions) {
    for (const perm of moduleData.permissions) {
      // First check for active permission
      let existing = await prisma.permission.findFirst({
        where: { key: perm.key, deletedAt: null },
      })

      if (existing) {
        permissionKeyToId.set(perm.key, existing.id)
        console.log(`  ✓ Permission "${perm.key}" already exists`)
      } else {
        // Check for soft-deleted permission
        const deletedPermission = await prisma.permission.findFirst({
          where: { key: perm.key, deletedAt: { not: null } },
        })

        if (deletedPermission) {
          // Restore the soft-deleted permission
          existing = await prisma.permission.update({
            where: { id: deletedPermission.id },
            data: {
              deletedAt: null,
              name: perm.name,
              module: moduleData.module,
              description: perm.description,
            },
          })
          permissionKeyToId.set(perm.key, existing.id)
          console.log(`  ↻ Restored permission "${perm.key}"`)
        } else {
          // Create new permission
          const created = await prisma.permission.create({
            data: {
              key: perm.key,
              name: perm.name,
              module: moduleData.module,
              description: perm.description,
            },
          })
          permissionKeyToId.set(perm.key, created.id)
          console.log(`  + Created permission "${perm.key}"`)
        }
      }
    }
  }

  console.log(`✅ Permissions seeded: ${permissionKeyToId.size} total\n`)
  return permissionKeyToId
}

async function seedRoles(
  permissionKeyToId: Map<string, string>,
): Promise<Map<string, string>> {
  console.log('👥 Seeding roles...')

  const rolesPath = path.join(__dirname, '../mock/roles.json')
  const rolesData: RolesFile = JSON.parse(fs.readFileSync(rolesPath, 'utf-8'))

  const roleNameToId = new Map<string, string>()

  for (const roleData of rolesData.roles) {
    // First check for active role
    let role = await prisma.role.findFirst({
      where: { name: roleData.name, deletedAt: null },
    })

    if (role) {
      console.log(`  ✓ Role "${roleData.name}" already exists`)
      roleNameToId.set(roleData.name, role.id)
    } else {
      // Check if there's a soft-deleted role with the same name
      const deletedRole = await prisma.role.findFirst({
        where: { name: roleData.name, deletedAt: { not: null } },
      })

      if (deletedRole) {
        // Restore the soft-deleted role
        role = await prisma.role.update({
          where: { id: deletedRole.id },
          data: {
            deletedAt: null,
            description: roleData.description,
          },
        })
        console.log(`  ↻ Restored role "${roleData.name}"`)
        roleNameToId.set(roleData.name, role.id)
      } else {
        // Create new role
        role = await prisma.role.create({
          data: {
            name: roleData.name,
            description: roleData.description,
          },
        })
        console.log(`  + Created role "${roleData.name}"`)
        roleNameToId.set(roleData.name, role.id)
      }
    }

    // Sync role permissions
    const existingPermissions = await prisma.rolePermission.findMany({
      where: { roleId: role.id },
    })
    const existingPermissionIds = new Set(
      existingPermissions.map((rp) => rp.permissionId),
    )

    let addedCount = 0
    for (const permKey of roleData.permissions) {
      const permissionId = permissionKeyToId.get(permKey)
      if (!permissionId) {
        console.log(`    ⚠ Permission "${permKey}" not found, skipping`)
        continue
      }

      if (!existingPermissionIds.has(permissionId)) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permissionId,
          },
        })
        addedCount++
      }
    }

    if (addedCount > 0) {
      console.log(`    + Added ${addedCount} permissions to "${roleData.name}"`)
    }
  }

  console.log(`✅ Roles seeded: ${roleNameToId.size} total\n`)
  return roleNameToId
}

async function seedAdminUser(roleNameToId: Map<string, string>): Promise<void> {
  console.log('👤 Seeding admin user...')

  const adminRoleId = roleNameToId.get('Super Administrator')
  if (!adminRoleId) {
    console.log('  ⚠ Super Administrator role not found, creating user without role')
  }

  const adminPassword = 'Admin@123'
  const hashedPassword = await argon2.hash(adminPassword)

  const existingAdmin = await prisma.user.findFirst({
    where: { username: 'admin', deletedAt: null },
  })

  if (existingAdmin) {
    // Update admin to have Super Administrator role if not set
    if (!existingAdmin.roleId && adminRoleId) {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { roleId: adminRoleId },
      })
      console.log('  ✓ Admin user already exists, updated role to Super Administrator')
    } else {
      console.log('  ✓ Admin user already exists')
    }
  } else {
    await prisma.user.create({
      data: {
        fullname: 'System Administrator',
        username: 'admin',
        password: hashedPassword,
        roleId: adminRoleId,
        isActive: true,
      },
    })
    console.log('  + Created admin user')
  }

  console.log(`\n✅ Admin user credentials:`)
  console.log(`   Username: admin`)
  console.log(`   Password: ${adminPassword}`)
  console.log(`   Role: Super Administrator\n`)
}

async function seedTaskScoreConfig(): Promise<void> {
  console.log('📊 Seeding Task Score Configuration (KPI)...')

  const configs = [
    {
      priorityLevel: 10,
      priorityCode: '№10',
      baseScore: 5,
      recommendedDays: 1,
      penaltyPerDay: -5,
      description: "Oddiy, ma'lumot beruvchi, 1-2 soat ichida bajariladigan vazifa",
      criteria: "Faqat xodim tomonidan bajariladi, boshqa shaxslar bilan muvofiqlashtirish talab etilmaydi.",
    },
    {
      priorityLevel: 9,
      priorityCode: '№9',
      baseScore: 10,
      recommendedDays: 3,
      penaltyPerDay: -5,
      description: "Qisqa muddatli, bitta hujjat tayyorlash yoki tasdiqlash jarayonidan iborat topshiriq",
      criteria: "3 ish kuni ichida bajariladi, natijasi ma'lum formatda bo'ladi (PDF, Word, Excel).",
    },
    {
      priorityLevel: 8,
      priorityCode: '№8',
      baseScore: 15,
      recommendedDays: 4,
      penaltyPerDay: -5,
      description: "Murakkablik darajasi o'rta – hisobot tayyorlash yoki taklif yozish kabi topshiriq",
      criteria: "Kamida 2 hujjat, 1 muvofiqlashtiruvchi yoki tasdiqlovchi ishtirok etadi.",
    },
    {
      priorityLevel: 7,
      priorityCode: '№7',
      baseScore: 20,
      recommendedDays: 5,
      penaltyPerDay: -5,
      description: "Muhim, muddati qat'iy, kechikishi xatarli topshiriq (masalan, tashqi tashkilotga javob yuborish)",
      criteria: "2+ bo'lim yoki kafedra ishtirok etadi. Jarayon ichki tizimga ta'sir qiladi.",
    },
    {
      priorityLevel: 6,
      priorityCode: '№6',
      baseScore: 25,
      recommendedDays: 6,
      penaltyPerDay: -5,
      description: "Boshqaruv darajasidagi – xodimlarga topshiriq taqsimoti, reja shakllantirish topshiriqlari",
      criteria: "Kamida 1 bo'lim boshlig'i yoki rahbar kiritgan topshiriq. 3+ bandli reja yoki jadvalli hujjat.",
    },
    {
      priorityLevel: 5,
      priorityCode: '№5',
      baseScore: 30,
      recommendedDays: 7,
      penaltyPerDay: -5,
      description: "Analitik, ko'p bosqichli – masalan, o'rganish, tahlil va xulosa chiqarish topshiriqlari",
      criteria: "Hisobot + grafik / jadval + tavsiya. Ko'pi bilan 1 hafta davom etadi.",
    },
    {
      priorityLevel: 4,
      priorityCode: '№4',
      baseScore: 35,
      recommendedDays: 8,
      penaltyPerDay: -5,
      description: "Strategik tahlil, taklif kiritish yoki ichki nizomlarni ishlab chiqish topshiriqlari",
      criteria: "Kamida 1 strategik hujjat tayyorlanadi (yo'riqnoma, nizom, qaror loyihasi).",
    },
    {
      priorityLevel: 3,
      priorityCode: '№3',
      baseScore: 40,
      recommendedDays: 9,
      penaltyPerDay: -10,
      description: "Tashqi hamkorlik, kelishuv va protokol ishlab chiqish bo'yicha topshiriq",
      criteria: "2 yoki undan ortiq tashqi tashkilot ishtirok etadi. Ish jarayoni kelishuvga asoslanadi.",
    },
    {
      priorityLevel: 2,
      priorityCode: '№2',
      baseScore: 45,
      recommendedDays: 10,
      penaltyPerDay: -10,
      description: "Universitet darajasidagi – loyihani boshqarish, universitet hisobotini tayyorlash",
      criteria: "1 haftadan ortiq muddat. Xodim rektoratga yoki prorektor nazoratiga hisobot beradi.",
    },
    {
      priorityLevel: 1,
      priorityCode: '№1',
      baseScore: 50,
      recommendedDays: 12,
      penaltyPerDay: -10,
      description: "Eng muhim, strategik, universitet bo'yicha tezkor qaror chiqarishga olib keladigan topshiriq",
      criteria: "Rektor, Prorektor yoki Boshqaruv kengashi uchun tayyorlanadi. Kechikishi tizimiy oqibatlarga olib kelishi mumkin.",
    },
  ]

  for (const config of configs) {
    const existing = await prisma.taskScoreConfig.findFirst({
      where: { priorityLevel: config.priorityLevel, deletedAt: null },
    })

    if (existing) {
      // Update existing config
      await prisma.taskScoreConfig.update({
        where: { id: existing.id },
        data: config,
      })
      console.log(`  ✓ Updated TaskScoreConfig for priority ${config.priorityCode}`)
    } else {
      await prisma.taskScoreConfig.create({
        data: config,
      })
      console.log(`  + Created TaskScoreConfig for priority ${config.priorityCode}`)
    }
  }

  console.log(`✅ Task Score Configuration seeded: ${configs.length} priorities\n`)
}

async function seedKpiRewardTiers(): Promise<void> {
  console.log('🏆 Seeding KPI Reward Tiers...')

  const tiers = [
    {
      minScore: 0,
      maxScore: 45,
      rewardBhm: null,
      rewardAmount: null,
      isPenalty: true,
      penaltyType: 'WARNING',
      name: 'Ogohlantirish',
      description: "Moliyaviy/ogohlantiruvchi jazo. KPI ko'rsatkichlari qoniqarsiz.",
      color: '#FF0000',
    },
    {
      minScore: 50,
      maxScore: 65,
      rewardBhm: 0,
      rewardAmount: 0,
      isPenalty: false,
      penaltyType: null,
      name: 'Neytral',
      description: "Rag'bat yo'q, lekin jazo qo'llanilmaydi.",
      color: '#808080',
    },
    {
      minScore: 70,
      maxScore: 80,
      rewardBhm: 5,
      rewardAmount: 1875000,
      isPenalty: false,
      penaltyType: null,
      name: 'Qoniqarli',
      description: "Mas'uliyatli ishlagan, lekin maksimal emas.",
      color: '#FFA500',
    },
    {
      minScore: 85,
      maxScore: 95,
      rewardBhm: 10,
      rewardAmount: 3750000,
      isPenalty: false,
      penaltyType: null,
      name: 'Yaxshi',
      description: "Yaxshi natija, sifatli va to'liq KPI ishlari.",
      color: '#90EE90',
    },
    {
      minScore: 100,
      maxScore: 100,
      rewardBhm: 15,
      rewardAmount: 5625000,
      isPenalty: false,
      penaltyType: null,
      name: "A'lo",
      description: "Har oyda 100 ball olganlarga alohida e'tibor va e'tirof.",
      color: '#00FF00',
    },
  ]

  for (const tier of tiers) {
    const existing = await prisma.kpiRewardTier.findFirst({
      where: {
        minScore: tier.minScore,
        maxScore: tier.maxScore,
        deletedAt: null,
      },
    })

    if (existing) {
      await prisma.kpiRewardTier.update({
        where: { id: existing.id },
        data: tier,
      })
      console.log(`  ✓ Updated KpiRewardTier: ${tier.minScore}-${tier.maxScore} (${tier.name})`)
    } else {
      await prisma.kpiRewardTier.create({
        data: tier,
      })
      console.log(`  + Created KpiRewardTier: ${tier.minScore}-${tier.maxScore} (${tier.name})`)
    }
  }

  console.log(`✅ KPI Reward Tiers seeded: ${tiers.length} tiers\n`)
}

async function seedTaskCategories(): Promise<void> {
  console.log('📁 Seeding Task Categories...')

  const categories = [
    { name: 'Bug', description: 'Xatolikni tuzatish', color: '#FF0000', icon: 'bug' },
    { name: 'Feature', description: "Yangi funksionallik qo'shish", color: '#00FF00', icon: 'sparkles' },
    { name: 'Improvement', description: 'Mavjud funksiyani yaxshilash', color: '#0000FF', icon: 'trending-up' },
    { name: 'Task', description: 'Oddiy topshiriq', color: '#808080', icon: 'check-square' },
    { name: 'Documentation', description: 'Hujjatlashtirish', color: '#800080', icon: 'file-text' },
    { name: 'Research', description: "Tadqiqot va o'rganish", color: '#FFA500', icon: 'search' },
  ]

  for (const category of categories) {
    const existing = await prisma.taskCategory.findFirst({
      where: { name: category.name, deletedAt: null },
    })

    if (existing) {
      console.log(`  ✓ TaskCategory "${category.name}" already exists`)
    } else {
      await prisma.taskCategory.create({
        data: category,
      })
      console.log(`  + Created TaskCategory "${category.name}"`)
    }
  }

  console.log(`✅ Task Categories seeded: ${categories.length} categories\n`)
}

// ============================================================
// COMPREHENSIVE MOCK DATA SEEDING
// ============================================================

async function seedDepartments(): Promise<Map<string, string>> {
  console.log('🏢 Seeding departments...')

  const depsPath = path.join(__dirname, '../mock/departments.json')
  const depsData = JSON.parse(fs.readFileSync(depsPath, 'utf-8'))
  const depNameToId = new Map<string, string>()

  // First pass: create parent departments
  for (const dep of depsData.departments.filter((d: any) => !d.parentName)) {
    let existing = await prisma.department.findFirst({ where: { code: dep.code, deletedAt: null } })
    if (!existing) {
      existing = await prisma.department.create({
        data: { name: dep.name, code: dep.code, description: dep.description, location: dep.location },
      })
      console.log(`  + Created department "${dep.name}"`)
    } else {
      console.log(`  ✓ Department "${dep.name}" exists`)
    }
    depNameToId.set(dep.name, existing.id)
  }

  // Second pass: create child departments
  for (const dep of depsData.departments.filter((d: any) => d.parentName)) {
    const parentId = depNameToId.get(dep.parentName)
    let existing = await prisma.department.findFirst({ where: { code: dep.code, deletedAt: null } })
    if (!existing) {
      existing = await prisma.department.create({
        data: { name: dep.name, code: dep.code, description: dep.description, location: dep.location, parentId },
      })
      console.log(`  + Created department "${dep.name}" under "${dep.parentName}"`)
    } else {
      console.log(`  ✓ Department "${dep.name}" exists`)
    }
    depNameToId.set(dep.name, existing.id)
  }

  console.log(`✅ Departments seeded: ${depNameToId.size} total\n`)
  return depNameToId
}

async function seedUsers(
  roleNameToId: Map<string, string>,
  depNameToId: Map<string, string>,
): Promise<Map<string, string>> {
  console.log('👥 Seeding users...')

  const usersPath = path.join(__dirname, '../mock/users.json')
  const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
  const userNameToId = new Map<string, string>()

  // Also add admin
  const adminUser = await prisma.user.findFirst({ where: { username: 'admin', deletedAt: null } })
  if (adminUser) userNameToId.set('admin', adminUser.id)

  for (const u of usersData.users) {
    let existing = await prisma.user.findFirst({ where: { username: u.username, deletedAt: null } })
    if (!existing) {
      const hashedPassword = await argon2.hash(u.password)
      existing = await prisma.user.create({
        data: {
          fullname: u.fullname,
          username: u.username,
          password: hashedPassword,
          roleId: u.roleName ? roleNameToId.get(u.roleName) || null : null,
          departmentId: u.departmentName ? depNameToId.get(u.departmentName) || null : null,
          isActive: u.isActive,
        },
      })
      console.log(`  + Created user "${u.username}"`)
    } else {
      console.log(`  ✓ User "${u.username}" exists`)
    }
    userNameToId.set(u.username, existing.id)
  }

  // Set department directors
  const directorMap: Record<string, string> = {
    'IT Bo\'limi': 'asror.direktor',
    'Moliya Bo\'limi': 'nodira.direktor',
    'Kadrlar Bo\'limi': 'zilola.hr',
    'Arxiv Bo\'limi': 'sardor.arxiv',
  }
  for (const [depName, username] of Object.entries(directorMap)) {
    const depId = depNameToId.get(depName)
    const userId = userNameToId.get(username)
    if (depId && userId) {
      await prisma.department.update({ where: { id: depId }, data: { directorId: userId } }).catch(() => {})
    }
  }

  console.log(`✅ Users seeded: ${userNameToId.size} total\n`)
  return userNameToId
}

async function seedDocumentTypes(): Promise<Map<string, string>> {
  console.log('📄 Seeding document types...')

  const dtPath = path.join(__dirname, '../mock/document-types.json')
  const dtData = JSON.parse(fs.readFileSync(dtPath, 'utf-8'))
  const dtNameToId = new Map<string, string>()

  for (const dt of dtData.documentTypes) {
    let existing = await prisma.documentType.findFirst({ where: { name: dt.name, deletedAt: null } })
    if (!existing) {
      existing = await prisma.documentType.create({
        data: { name: dt.name, description: dt.description, isActive: dt.isActive },
      })
      console.log(`  + Created document type "${dt.name}"`)
    } else {
      console.log(`  ✓ Document type "${dt.name}" exists`)
    }
    dtNameToId.set(dt.name, existing.id)
  }

  console.log(`✅ Document types seeded: ${dtNameToId.size} total\n`)
  return dtNameToId
}

async function seedJournals(
  depNameToId: Map<string, string>,
  userNameToId: Map<string, string>,
): Promise<Map<string, string>> {
  console.log('📓 Seeding journals...')

  const jPath = path.join(__dirname, '../mock/journals.json')
  const jData = JSON.parse(fs.readFileSync(jPath, 'utf-8'))
  const journalNameToId = new Map<string, string>()

  for (const j of jData.journals) {
    let existing = await prisma.journal.findFirst({ where: { prefix: j.prefix, deletedAt: null } })
    if (!existing) {
      existing = await prisma.journal.create({
        data: {
          name: j.name,
          prefix: j.prefix,
          format: j.format,
          departmentId: j.departmentName ? depNameToId.get(j.departmentName) || null : null,
          responsibleUserId: j.responsibleUsername ? userNameToId.get(j.responsibleUsername) || null : null,
        },
      })
      console.log(`  + Created journal "${j.name}" (${j.prefix})`)
    } else {
      console.log(`  ✓ Journal "${j.name}" exists`)
    }
    journalNameToId.set(j.prefix, existing.id)
  }

  console.log(`✅ Journals seeded: ${journalNameToId.size} total\n`)
  return journalNameToId
}

async function seedDocumentsAndWorkflows(
  dtNameToId: Map<string, string>,
  journalPrefixToId: Map<string, string>,
  userNameToId: Map<string, string>,
): Promise<{ docIds: string[]; workflowIds: string[] }> {
  console.log('📋 Seeding documents and workflows...')

  const existingDocs = await prisma.document.count({ where: { deletedAt: null } })
  if (existingDocs > 0) {
    console.log(`  ✓ Documents already exist (${existingDocs}), skipping\n`)
    const docs = await prisma.document.findMany({ where: { deletedAt: null }, select: { id: true } })
    const wfs = await prisma.workflow.findMany({ where: { deletedAt: null }, select: { id: true } })
    return { docIds: docs.map(d => d.id), workflowIds: wfs.map(w => w.id) }
  }

  const adminId = userNameToId.get('admin')!
  const asrorId = userNameToId.get('asror.direktor')!
  const nodiraId = userNameToId.get('nodira.direktor')!
  const boburId = userNameToId.get('bobur.menejer')!
  const dilnozaId = userNameToId.get('dilnoza.menejer')!
  const jamshidId = userNameToId.get('jamshid.xodim')!
  const malikaId = userNameToId.get('malika.xodim')!
  const zilolaId = userNameToId.get('zilola.hr')!
  const shohruhId = userNameToId.get('shohruh.developer')!
  const davronId = userNameToId.get('davron.accountant')!
  const sevaraId = userNameToId.get('sevara.treasury')!

  const documents = [
    // APPROVED documents
    {
      title: 'IT infratuzilmasini yangilash buyrug\'i',
      description: 'Universitet IT infratuzilmasini 2026-yil uchun modernizatsiya qilish bo\'yicha buyruq',
      documentNumber: 'IB-2026-0001',
      status: 'APPROVED' as const,
      documentTypeId: dtNameToId.get('Buyruq')!,
      journalId: journalPrefixToId.get('IB')!,
      createdById: asrorId,
    },
    {
      title: 'Server xonasi texnik xizmati shartnomasi',
      description: 'Server xonasiga texnik xizmat ko\'rsatish bo\'yicha yillik shartnoma',
      documentNumber: 'SH-2026-00001',
      status: 'APPROVED' as const,
      documentTypeId: dtNameToId.get('Shartnoma')!,
      journalId: journalPrefixToId.get('SH')!,
      createdById: boburId,
    },
    {
      title: '2025-yil moliyaviy hisoboti',
      description: '2025-yil yakunlari bo\'yicha moliyaviy hisobot',
      documentNumber: 'HB-2026-0001',
      status: 'APPROVED' as const,
      documentTypeId: dtNameToId.get('Hisobot')!,
      journalId: journalPrefixToId.get('HB')!,
      createdById: dilnozaId,
    },
    {
      title: 'Yangi xodim qabul qilish buyrug\'i - Alisher Yusupov',
      description: 'Dasturlash sektoriga yangi xodim qabul qilish bo\'yicha buyruq',
      documentNumber: 'KB-2026-0001',
      status: 'APPROVED' as const,
      documentTypeId: dtNameToId.get('Buyruq')!,
      journalId: journalPrefixToId.get('KB')!,
      createdById: zilolaId,
    },
    // PENDING documents (in workflow)
    {
      title: 'Dasturiy ta\'minot litsenziyalari sotib olish',
      description: 'JetBrains va Microsoft litsenziyalari uchun xarid',
      documentNumber: 'SH-2026-00002',
      status: 'PENDING' as const,
      documentTypeId: dtNameToId.get('Shartnoma')!,
      journalId: journalPrefixToId.get('SH')!,
      createdById: boburId,
    },
    {
      title: 'Q1 2026 moliyaviy smeta',
      description: '2026-yil 1-chorak uchun moliyaviy xarajatlar smetasi',
      documentNumber: 'MH-2026-00001',
      status: 'PENDING' as const,
      documentTypeId: dtNameToId.get('Smetа')!,
      journalId: journalPrefixToId.get('MH')!,
      createdById: malikaId,
    },
    {
      title: 'Mehnat shartnomasi - Kamola Tosheva',
      description: 'Buxgalteriya bo\'limiga yangi xodim uchun mehnat shartnomasi',
      documentNumber: 'KB-2026-0002',
      status: 'IN_REVIEW' as const,
      documentTypeId: dtNameToId.get('Mehnat shartnomasi')!,
      journalId: journalPrefixToId.get('KB')!,
      createdById: zilolaId,
    },
    // DRAFT documents
    {
      title: 'IT xavfsizlik siyosati yo\'riqnomasi',
      description: 'Kiberxavfsizlik bo\'yicha ichki yo\'riqnoma loyihasi',
      documentNumber: 'TH-2026-0001',
      status: 'DRAFT' as const,
      documentTypeId: dtNameToId.get('Yo\'riqnoma')!,
      journalId: journalPrefixToId.get('TH')!,
      createdById: asrorId,
    },
    {
      title: 'Server xonasi tekshiruv akti',
      description: 'Server xonasi jismoniy holatini tekshirish akti',
      documentNumber: 'TH-2026-0002',
      status: 'DRAFT' as const,
      documentTypeId: dtNameToId.get('Akt')!,
      journalId: journalPrefixToId.get('TH')!,
      createdById: boburId,
    },
    {
      title: 'Tashqi audit natijalari xati',
      description: 'Tashqi audit kompaniyasiga javob xati',
      documentNumber: 'CH-2026-00001',
      status: 'DRAFT' as const,
      documentTypeId: dtNameToId.get('Xat')!,
      journalId: journalPrefixToId.get('CH')!,
      createdById: nodiraId,
    },
    // REJECTED
    {
      title: 'Serverlarni ko\'chirish smetasi',
      description: 'Serverlarni yangi binoga ko\'chirish bo\'yicha smeta - rad etilgan',
      documentNumber: 'MH-2026-00002',
      status: 'REJECTED' as const,
      documentTypeId: dtNameToId.get('Smetа')!,
      journalId: journalPrefixToId.get('MH')!,
      createdById: boburId,
    },
    // More APPROVED
    {
      title: 'Xodimlarni malaka oshirish bayonnomasi',
      description: '2026-yil 1-chorak malaka oshirish dasturi yig\'ilish bayonnomasi',
      documentNumber: 'UB-2026-0001',
      status: 'APPROVED' as const,
      documentTypeId: dtNameToId.get('Bayonnoma')!,
      journalId: journalPrefixToId.get('UB')!,
      createdById: zilolaId,
    },
    {
      title: 'Oylik ish haqi ma\'lumotnomasi - Mart 2026',
      description: 'Jamshid Alimov uchun oylik ish haqi ma\'lumotnomasi',
      documentNumber: 'ML-2026-00001',
      status: 'APPROVED' as const,
      documentTypeId: dtNameToId.get('Ma\'lumotnoma')!,
      journalId: journalPrefixToId.get('ML')!,
      createdById: malikaId,
    },
    {
      title: 'Kiruvchi xat - Vazirlik so\'rovi',
      description: 'Raqamli texnologiyalar vazirligi so\'rov xati',
      documentNumber: 'KH-2026-00001',
      status: 'APPROVED' as const,
      documentTypeId: dtNameToId.get('Xat')!,
      journalId: journalPrefixToId.get('KH')!,
      createdById: adminId,
    },
    {
      title: 'Shtat jadvali o\'zgarishlari 2026',
      description: 'IT bo\'limiga 3 ta yangi shtat birligi qo\'shish',
      documentNumber: 'KB-2026-0003',
      status: 'PENDING' as const,
      documentTypeId: dtNameToId.get('Shtat jadvali')!,
      journalId: journalPrefixToId.get('KB')!,
      createdById: zilolaId,
    },
  ]

  const docIds: string[] = []
  const workflowIds: string[] = []

  for (const doc of documents) {
    const created = await prisma.document.create({ data: doc })
    docIds.push(created.id)
    console.log(`  + Document: "${doc.title}" [${doc.status}]`)
  }

  // Create workflows for non-DRAFT documents
  const workflowDocs = documents
    .map((d, i) => ({ ...d, id: docIds[i] }))
    .filter(d => d.status !== 'DRAFT')

  for (const doc of workflowDocs) {
    const isCompleted = doc.status === 'APPROVED' || doc.status === 'REJECTED'
    const isParallel = doc.title.includes('smeta') || doc.title.includes('Shtat')

    const wf = await prisma.workflow.create({
      data: {
        documentId: doc.id,
        currentStepOrder: isCompleted ? 3 : 1,
        type: isParallel ? 'PARALLEL' : 'CONSECUTIVE',
        status: doc.status === 'APPROVED' ? 'COMPLETED' : doc.status === 'REJECTED' ? 'CANCELLED' : 'ACTIVE',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })
    workflowIds.push(wf.id)

    // Create workflow steps
    const stepConfigs = getWorkflowSteps(doc, userNameToId)
    for (const step of stepConfigs) {
      const ws = await prisma.workflowStep.create({ data: { ...step, workflowId: wf.id } })

      // Add actions for completed/rejected steps
      if (step.status === 'COMPLETED' || step.status === 'REJECTED') {
        await prisma.workflowStepAction.create({
          data: {
            workflowStepId: ws.id,
            actionType: step.status === 'COMPLETED' ? 'APPROVED' : 'REJECTED',
            performedByUserId: step.assignedToUserId!,
            comment: step.status === 'COMPLETED'
              ? 'Hujjat ko\'rib chiqildi va tasdiqlandi'
              : 'Smeta summasi mos kelmaydi, qayta ishlab chiqish kerak',
          },
        })
      } else if (step.status === 'IN_PROGRESS') {
        await prisma.workflowStepAction.create({
          data: {
            workflowStepId: ws.id,
            actionType: 'STARTED',
            performedByUserId: step.assignedToUserId!,
          },
        })
      }
    }
  }

  console.log(`✅ Documents: ${docIds.length}, Workflows: ${workflowIds.length}\n`)
  return { docIds, workflowIds }
}

function getWorkflowSteps(
  doc: any,
  userNameToId: Map<string, string>,
): Array<{
  order: number
  status: string
  actionType: 'APPROVAL' | 'SIGN' | 'REVIEW' | 'ACKNOWLEDGE' | 'VERIFICATION'
  assignedToUserId: string
  isCreator: boolean
  isRejected: boolean
  rejectionReason?: string
  startedAt?: Date
  completedAt?: Date
  dueDate: Date
}> {
  const isApproved = doc.status === 'APPROVED'
  const isRejected = doc.status === 'REJECTED'
  const isPending = doc.status === 'PENDING'
  const isInReview = doc.status === 'IN_REVIEW'
  const now = new Date()
  const past = (daysAgo: number) => new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
  const future = (daysAhead: number) => new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)

  const boburId = userNameToId.get('bobur.menejer')!
  const asrorId = userNameToId.get('asror.direktor')!
  const nodiraId = userNameToId.get('nodira.direktor')!
  const adminId = userNameToId.get('admin')!
  const dilnozaId = userNameToId.get('dilnoza.menejer')!
  const zilolaId = userNameToId.get('zilola.hr')!
  const malikaId = userNameToId.get('malika.xodim')!

  if (isApproved) {
    return [
      { order: 1, status: 'COMPLETED', actionType: 'REVIEW', assignedToUserId: boburId, isCreator: false, isRejected: false, startedAt: past(10), completedAt: past(9), dueDate: past(5) },
      { order: 2, status: 'COMPLETED', actionType: 'APPROVAL', assignedToUserId: asrorId, isCreator: false, isRejected: false, startedAt: past(9), completedAt: past(7), dueDate: past(3) },
      { order: 3, status: 'COMPLETED', actionType: 'SIGN', assignedToUserId: adminId, isCreator: false, isRejected: false, startedAt: past(7), completedAt: past(5), dueDate: past(1) },
    ]
  }

  if (isRejected) {
    return [
      { order: 1, status: 'COMPLETED', actionType: 'REVIEW', assignedToUserId: dilnozaId, isCreator: false, isRejected: false, startedAt: past(5), completedAt: past(4), dueDate: past(2) },
      { order: 2, status: 'REJECTED', actionType: 'APPROVAL', assignedToUserId: nodiraId, isCreator: false, isRejected: true, rejectionReason: 'Smeta summasi mos kelmaydi, qayta ishlab chiqish kerak', startedAt: past(4), completedAt: past(3), dueDate: future(1) },
      { order: 3, status: 'NOT_STARTED', actionType: 'SIGN', assignedToUserId: adminId, isCreator: false, isRejected: false, dueDate: future(5) },
    ]
  }

  if (isInReview) {
    return [
      { order: 1, status: 'COMPLETED', actionType: 'REVIEW', assignedToUserId: zilolaId, isCreator: true, isRejected: false, startedAt: past(3), completedAt: past(2), dueDate: past(1) },
      { order: 2, status: 'IN_PROGRESS', actionType: 'APPROVAL', assignedToUserId: nodiraId, isCreator: false, isRejected: false, startedAt: past(2), dueDate: future(3) },
      { order: 3, status: 'NOT_STARTED', actionType: 'SIGN', assignedToUserId: adminId, isCreator: false, isRejected: false, dueDate: future(7) },
    ]
  }

  // PENDING
  return [
    { order: 1, status: 'IN_PROGRESS', actionType: 'REVIEW', assignedToUserId: dilnozaId, isCreator: false, isRejected: false, startedAt: past(1), dueDate: future(3) },
    { order: 2, status: 'NOT_STARTED', actionType: 'APPROVAL', assignedToUserId: nodiraId, isCreator: false, isRejected: false, dueDate: future(5) },
    { order: 3, status: 'NOT_STARTED', actionType: 'SIGN', assignedToUserId: adminId, isCreator: false, isRejected: false, dueDate: future(7) },
  ]
}

async function seedWorkflowTemplates(
  dtNameToId: Map<string, string>,
  userNameToId: Map<string, string>,
): Promise<void> {
  console.log('📝 Seeding workflow templates...')

  const existingCount = await prisma.workflowTemplate.count({ where: { deletedAt: null } })
  if (existingCount > 0) {
    console.log(`  ✓ Workflow templates already exist (${existingCount}), skipping\n`)
    return
  }

  const adminId = userNameToId.get('admin')!
  const asrorId = userNameToId.get('asror.direktor')!
  const nodiraId = userNameToId.get('nodira.direktor')!
  const boburId = userNameToId.get('bobur.menejer')!

  const templates = [
    {
      name: 'Standart buyruq tasdiqlash',
      description: 'Buyruqlar uchun ketma-ket tasdiqlash jarayoni: Ko\'rib chiqish → Tasdiqlash → Imzolash',
      documentTypeId: dtNameToId.get('Buyruq')!,
      type: 'CONSECUTIVE' as const,
      steps: [
        { order: 1, actionType: 'REVIEW' as const, assignedToUserId: boburId, dueInDays: 3, description: 'Hujjatni ko\'rib chiqish' },
        { order: 2, actionType: 'APPROVAL' as const, assignedToUserId: asrorId, dueInDays: 2, description: 'Direktor tasdiqlashi' },
        { order: 3, actionType: 'SIGN' as const, assignedToUserId: adminId, dueInDays: 1, description: 'Imzolash' },
      ],
    },
    {
      name: 'Shartnoma tasdiqlash',
      description: 'Shartnomalar uchun tasdiqlash: Yuridik tekshiruv → Moliya tekshiruv → Imzolash',
      documentTypeId: dtNameToId.get('Shartnoma')!,
      type: 'CONSECUTIVE' as const,
      steps: [
        { order: 1, actionType: 'REVIEW' as const, assignedToUserId: boburId, dueInDays: 5, description: 'Texnik shartlarni tekshirish' },
        { order: 2, actionType: 'VERIFICATION' as const, assignedToUserId: nodiraId, dueInDays: 3, description: 'Moliyaviy shartlarni tekshirish' },
        { order: 3, actionType: 'APPROVAL' as const, assignedToUserId: asrorId, dueInDays: 2, description: 'Direktor tasdiqlashi' },
        { order: 4, actionType: 'SIGN' as const, assignedToUserId: adminId, dueInDays: 1, description: 'Imzolash' },
      ],
    },
    {
      name: 'Moliyaviy hujjat parallel tasdiqlash',
      description: 'Smeta va moliyaviy hujjatlar uchun parallel tasdiqlash',
      documentTypeId: dtNameToId.get('Smetа')!,
      type: 'PARALLEL' as const,
      steps: [
        { order: 1, actionType: 'REVIEW' as const, assignedToUserId: nodiraId, dueInDays: 3, description: 'Moliya direktori ko\'rib chiqishi' },
        { order: 2, actionType: 'REVIEW' as const, assignedToUserId: asrorId, dueInDays: 3, description: 'IT direktor ko\'rib chiqishi' },
        { order: 3, actionType: 'SIGN' as const, assignedToUserId: adminId, dueInDays: 2, description: 'Imzolash' },
      ],
    },
    {
      name: 'Kadrlar buyrug\'i tasdiqlash',
      description: 'HR buyruqlari uchun: HR → Direktor → Imzolash',
      documentTypeId: dtNameToId.get('Buyruq')!,
      type: 'CONSECUTIVE' as const,
      steps: [
        { order: 1, actionType: 'REVIEW' as const, assignedToUserId: userNameToId.get('zilola.hr')!, dueInDays: 2, description: 'HR tekshiruvi' },
        { order: 2, actionType: 'APPROVAL' as const, assignedToUserId: asrorId, dueInDays: 2, description: 'Direktor tasdiqlashi' },
        { order: 3, actionType: 'SIGN' as const, assignedToUserId: adminId, dueInDays: 1, description: 'Imzolash' },
      ],
    },
  ]

  for (const t of templates) {
    const { steps, ...templateData } = t
    const template = await prisma.workflowTemplate.create({ data: templateData })
    for (const step of steps) {
      await prisma.workflowTemplateStep.create({
        data: { workflowTemplateId: template.id, ...step, isRequired: true },
      })
    }
    console.log(`  + Template: "${t.name}" (${t.steps.length} steps)`)
  }

  console.log(`✅ Workflow templates seeded\n`)
}

async function seedProjectsAndTasks(
  userNameToId: Map<string, string>,
  depNameToId: Map<string, string>,
): Promise<void> {
  console.log('🚀 Seeding projects, boards, and tasks...')

  const existingProjects = await prisma.project.count({ where: { deletedAt: null } })
  if (existingProjects > 0) {
    console.log(`  ✓ Projects already exist (${existingProjects}), skipping\n`)
    return
  }

  const adminId = userNameToId.get('admin')!
  const asrorId = userNameToId.get('asror.direktor')!
  const boburId = userNameToId.get('bobur.menejer')!
  const jamshidId = userNameToId.get('jamshid.xodim')!
  const shohruhId = userNameToId.get('shohruh.developer')!
  const nodiraId = userNameToId.get('nodira.direktor')!
  const dilnozaId = userNameToId.get('dilnoza.menejer')!
  const malikaId = userNameToId.get('malika.xodim')!
  const davronId = userNameToId.get('davron.accountant')!
  const nigoraId = userNameToId.get('nigora.support')!
  const otabekId = userNameToId.get('otabek.sysadmin')!

  const now = new Date()
  const past = (d: number) => new Date(now.getTime() - d * 86400000)
  const future = (d: number) => new Date(now.getTime() + d * 86400000)

  // Get task categories
  const categories = await prisma.taskCategory.findMany({ where: { deletedAt: null } })
  const catByName = new Map(categories.map(c => [c.name, c.id]))

  // ==================== PROJECT 1: DocFlow System ====================
  const proj1 = await prisma.project.create({
    data: {
      name: 'DocFlow tizimini ishlab chiqish',
      description: 'Hujjat aylanish tizimini yaratish va joriy etish loyihasi',
      key: 'DOCFLOW',
      status: 'ACTIVE',
      departmentId: depNameToId.get('IT Bo\'limi'),
      startDate: past(60),
      endDate: future(120),
      color: '#3B82F6',
      icon: 'file-text',
      taskCounter: 12,
      penaltyPerDay: 5,
    },
  })

  // Board columns for project 1
  const cols1 = await Promise.all([
    prisma.boardColumn.create({ data: { projectId: proj1.id, name: 'Backlog', color: '#94A3B8', position: 0, isDefault: true } }),
    prisma.boardColumn.create({ data: { projectId: proj1.id, name: 'Bajarilmoqda', color: '#3B82F6', position: 1, wipLimit: 5 } }),
    prisma.boardColumn.create({ data: { projectId: proj1.id, name: 'Ko\'rib chiqilmoqda', color: '#F59E0B', position: 2, wipLimit: 3 } }),
    prisma.boardColumn.create({ data: { projectId: proj1.id, name: 'Tayyor', color: '#10B981', position: 3, isClosed: true } }),
  ])

  // Project members
  await Promise.all([
    prisma.projectMember.create({ data: { projectId: proj1.id, userId: asrorId, role: 'OWNER' } }),
    prisma.projectMember.create({ data: { projectId: proj1.id, userId: boburId, role: 'MANAGER' } }),
    prisma.projectMember.create({ data: { projectId: proj1.id, userId: jamshidId, role: 'MEMBER' } }),
    prisma.projectMember.create({ data: { projectId: proj1.id, userId: shohruhId, role: 'MEMBER' } }),
    prisma.projectMember.create({ data: { projectId: proj1.id, userId: otabekId, role: 'MEMBER' } }),
    prisma.projectMember.create({ data: { projectId: proj1.id, userId: nigoraId, role: 'VIEWER' } }),
  ])

  // Project labels
  const labels1 = await Promise.all([
    prisma.projectLabel.create({ data: { projectId: proj1.id, name: 'Frontend', color: '#8B5CF6' } }),
    prisma.projectLabel.create({ data: { projectId: proj1.id, name: 'Backend', color: '#EF4444' } }),
    prisma.projectLabel.create({ data: { projectId: proj1.id, name: 'Urgent', color: '#F97316' } }),
    prisma.projectLabel.create({ data: { projectId: proj1.id, name: 'DevOps', color: '#06B6D4' } }),
  ])

  // Tasks for project 1
  const p1Tasks = [
    { taskNumber: 1, title: 'JWT autentifikatsiya tizimini sozlash', description: 'Access va refresh tokenlar, session boshqaruvi', priority: 'HIGH' as const, createdById: boburId, boardColumnId: cols1[3].id, categoryId: catByName.get('Feature'), startDate: past(50), dueDate: past(40), completedAt: past(38), score: 20 },
    { taskNumber: 2, title: 'Prisma ORM integratsiyasi', description: 'PostgreSQL bilan Prisma adapter sozlash, schema yaratish', priority: 'HIGH' as const, createdById: boburId, boardColumnId: cols1[3].id, categoryId: catByName.get('Feature'), startDate: past(55), dueDate: past(45), completedAt: past(44), score: 20 },
    { taskNumber: 3, title: 'Hujjat CRUD API yaratish', description: 'Document model uchun to\'liq REST API endpointlar', priority: 'HIGH' as const, createdById: boburId, boardColumnId: cols1[3].id, categoryId: catByName.get('Feature'), startDate: past(40), dueDate: past(30), completedAt: past(28), score: 25 },
    { taskNumber: 4, title: 'Workflow engine ishlab chiqish', description: 'CONSECUTIVE va PARALLEL workflow turlarini qo\'llab-quvvatlash', priority: 'URGENT' as const, createdById: asrorId, boardColumnId: cols1[3].id, categoryId: catByName.get('Feature'), startDate: past(35), dueDate: past(20), completedAt: past(18), score: 35 },
    { taskNumber: 5, title: 'MinIO fayl saqlash integratsiyasi', description: 'Hujjat va attachment fayllarini MinIO ga yuklash', priority: 'MEDIUM' as const, createdById: boburId, boardColumnId: cols1[3].id, categoryId: catByName.get('Feature'), startDate: past(30), dueDate: past(22), completedAt: past(23), score: 15 },
    { taskNumber: 6, title: 'Real-time notification tizimi', description: 'Socket.IO orqali bildirishnomalar va Telegram bot integratsiya', priority: 'HIGH' as const, createdById: boburId, boardColumnId: cols1[2].id, categoryId: catByName.get('Feature'), startDate: past(15), dueDate: future(5) },
    { taskNumber: 7, title: 'KPI hisoblash moduli', description: 'Task ball tizimi, oylik KPI va mukofot hisoblash', priority: 'MEDIUM' as const, createdById: asrorId, boardColumnId: cols1[1].id, categoryId: catByName.get('Feature'), startDate: past(10), dueDate: future(10) },
    { taskNumber: 8, title: 'PDF watermark muammosini tuzatish', description: 'Apryse watermark approved hujjatlarda qolmoqda', priority: 'URGENT' as const, createdById: jamshidId, boardColumnId: cols1[1].id, categoryId: catByName.get('Bug'), startDate: past(5), dueDate: future(2) },
    { taskNumber: 9, title: 'WOPI protokol integratsiyasi', description: 'Office hujjatlarni brauzerda tahrirlash imkoniyati', priority: 'HIGH' as const, createdById: boburId, boardColumnId: cols1[0].id, categoryId: catByName.get('Feature'), dueDate: future(20) },
    { taskNumber: 10, title: 'API rate limiting qo\'shish', description: 'DDoS himoya uchun rate limiter sozlash', priority: 'MEDIUM' as const, createdById: otabekId, boardColumnId: cols1[0].id, categoryId: catByName.get('Improvement'), dueDate: future(25) },
    { taskNumber: 11, title: 'Unit testlar yozish - Auth moduli', description: 'Auth service va guard uchun Jest testlar', priority: 'LOW' as const, createdById: shohruhId, boardColumnId: cols1[0].id, categoryId: catByName.get('Task'), dueDate: future(30) },
    { taskNumber: 12, title: 'API dokumentatsiyasini yangilash', description: 'Swagger annotatsiyalarni to\'liq qo\'shish', priority: 'LOW' as const, createdById: boburId, boardColumnId: cols1[0].id, categoryId: catByName.get('Documentation'), dueDate: future(35) },
  ]

  const createdTasks1: string[] = []
  for (const t of p1Tasks) {
    const task = await prisma.task.create({ data: { projectId: proj1.id, ...t } })
    createdTasks1.push(task.id)
  }
  // Update project taskCounter
  await prisma.project.update({ where: { id: proj1.id }, data: { taskCounter: 12 } })

  // Task assignees
  const assigneeMap1 = [
    [0, [jamshidId]], [1, [shohruhId]], [2, [jamshidId, shohruhId]],
    [3, [jamshidId, shohruhId]], [4, [otabekId]], [5, [jamshidId]],
    [6, [shohruhId]], [7, [jamshidId]], [8, [shohruhId, jamshidId]],
    [9, [otabekId]], [10, [shohruhId]], [11, [boburId]],
  ]
  for (const [idx, userIds] of assigneeMap1) {
    for (const uid of userIds as string[]) {
      await prisma.taskAssignee.create({ data: { taskId: createdTasks1[idx as number], userId: uid } })
    }
  }

  // Task labels
  await Promise.all([
    prisma.taskLabel.create({ data: { taskId: createdTasks1[0], labelId: labels1[1].id } }),
    prisma.taskLabel.create({ data: { taskId: createdTasks1[1], labelId: labels1[1].id } }),
    prisma.taskLabel.create({ data: { taskId: createdTasks1[2], labelId: labels1[1].id } }),
    prisma.taskLabel.create({ data: { taskId: createdTasks1[3], labelId: labels1[1].id } }),
    prisma.taskLabel.create({ data: { taskId: createdTasks1[3], labelId: labels1[2].id } }),
    prisma.taskLabel.create({ data: { taskId: createdTasks1[4], labelId: labels1[3].id } }),
    prisma.taskLabel.create({ data: { taskId: createdTasks1[5], labelId: labels1[1].id } }),
    prisma.taskLabel.create({ data: { taskId: createdTasks1[6], labelId: labels1[1].id } }),
    prisma.taskLabel.create({ data: { taskId: createdTasks1[7], labelId: labels1[2].id } }),
    prisma.taskLabel.create({ data: { taskId: createdTasks1[9], labelId: labels1[3].id } }),
  ])

  // Task comments
  const comments = [
    { taskId: createdTasks1[3], userId: jamshidId, content: 'Workflow engine uchun state machine pattern ishlatamizmi yoki oddiy if/else bilan qilamizmi?' },
    { taskId: createdTasks1[3], userId: boburId, content: 'State machine yaxshiroq bo\'ladi, kelajakda kengaytirish oson bo\'ladi. CONSECUTIVE turini birinchi qilamiz.' },
    { taskId: createdTasks1[3], userId: shohruhId, content: 'Men PARALLEL qismini olaman. Deadline ga ulguraymiz deb o\'ylayman.' },
    { taskId: createdTasks1[7], userId: jamshidId, content: 'Watermark faqat birinchi sahifada paydo bo\'lyapti. pdf-lib bilan olib tashlaydigan util yozdim.' },
    { taskId: createdTasks1[7], userId: boburId, content: '@jamshid.xodim yaxshi, lekin barcha sahifalarni tekshirish kerak. Ko\'p sahifali hujjatlarda muammo bor.' },
    { taskId: createdTasks1[5], userId: jamshidId, content: 'Socket.IO namespace larni ajratib qo\'ysak yaxshi bo\'ladi - notification va chat uchun alohida.' },
    { taskId: createdTasks1[6], userId: shohruhId, content: 'KPI formulasi: finalScore = totalEarnedScore / totalBaseScore * 100 to\'g\'rimi?' },
    { taskId: createdTasks1[6], userId: asrorId, content: 'Ha, lekin penaltyPerDay ni ham hisobga olish kerak. Kech bajarilgan task lar uchun ball kamayadi.' },
  ]

  const commentIds: string[] = []
  for (const c of comments) {
    const comment = await prisma.taskComment.create({ data: c })
    commentIds.push(comment.id)
  }

  // Reply to first comment
  await prisma.taskComment.create({
    data: {
      taskId: createdTasks1[3],
      userId: asrorId,
      content: 'State machine + strategy pattern ishlatadiganlar uchun razmer ko\'proq, lekin maintenance oson. Tasdiqlandi.',
      parentCommentId: commentIds[0],
    },
  })

  // Comment reactions
  await Promise.all([
    prisma.taskCommentReaction.create({ data: { commentId: commentIds[1], userId: jamshidId, emoji: '👍' } }),
    prisma.taskCommentReaction.create({ data: { commentId: commentIds[2], userId: boburId, emoji: '🚀' } }),
    prisma.taskCommentReaction.create({ data: { commentId: commentIds[3], userId: boburId, emoji: '👍' } }),
  ])

  // Comment mentions
  await prisma.taskCommentMention.create({ data: { commentId: commentIds[4], userId: jamshidId } })

  // Task checklists
  const cl1 = await prisma.taskChecklist.create({ data: { taskId: createdTasks1[5], title: 'Notification tizimi bosqichlari', position: 0 } })
  await Promise.all([
    prisma.taskChecklistItem.create({ data: { checklistId: cl1.id, title: 'WebSocket gateway sozlash', isCompleted: true, completedById: jamshidId, completedAt: past(10), position: 0 } }),
    prisma.taskChecklistItem.create({ data: { checklistId: cl1.id, title: 'Notification service yaratish', isCompleted: true, completedById: jamshidId, completedAt: past(8), position: 1 } }),
    prisma.taskChecklistItem.create({ data: { checklistId: cl1.id, title: 'Telegram bot integratsiya', isCompleted: false, position: 2 } }),
    prisma.taskChecklistItem.create({ data: { checklistId: cl1.id, title: 'Online user tracking (Redis)', isCompleted: false, position: 3 } }),
  ])

  const cl2 = await prisma.taskChecklist.create({ data: { taskId: createdTasks1[6], title: 'KPI moduli tarkibi', position: 0 } })
  await Promise.all([
    prisma.taskChecklistItem.create({ data: { checklistId: cl2.id, title: 'TaskScoreConfig CRUD', isCompleted: true, completedById: shohruhId, completedAt: past(5), position: 0 } }),
    prisma.taskChecklistItem.create({ data: { checklistId: cl2.id, title: 'KpiRewardTier CRUD', isCompleted: true, completedById: shohruhId, completedAt: past(4), position: 1 } }),
    prisma.taskChecklistItem.create({ data: { checklistId: cl2.id, title: 'Oylik KPI hisoblash service', isCompleted: false, position: 2 } }),
    prisma.taskChecklistItem.create({ data: { checklistId: cl2.id, title: 'Leaderboard va dashboard', isCompleted: false, position: 3 } }),
    prisma.taskChecklistItem.create({ data: { checklistId: cl2.id, title: 'KpiReward tasdiqlash flow', isCompleted: false, position: 4 } }),
  ])

  // Task watchers
  await Promise.all([
    prisma.taskWatcher.create({ data: { taskId: createdTasks1[3], userId: asrorId } }),
    prisma.taskWatcher.create({ data: { taskId: createdTasks1[3], userId: boburId } }),
    prisma.taskWatcher.create({ data: { taskId: createdTasks1[7], userId: boburId } }),
    prisma.taskWatcher.create({ data: { taskId: createdTasks1[5], userId: asrorId } }),
  ])

  // Task dependencies
  await prisma.taskDependency.create({ data: { taskId: createdTasks1[5], dependsOnTaskId: createdTasks1[0] } }) // Notification depends on Auth
  await prisma.taskDependency.create({ data: { taskId: createdTasks1[8], dependsOnTaskId: createdTasks1[4] } }) // WOPI depends on MinIO

  // Task time entries
  const timeEntries = [
    { taskId: createdTasks1[0], userId: jamshidId, description: 'JWT guard va strategy yozish', hours: 6, date: past(45), isBillable: true },
    { taskId: createdTasks1[0], userId: jamshidId, description: 'Refresh token logikasi', hours: 4, date: past(43), isBillable: true },
    { taskId: createdTasks1[1], userId: shohruhId, description: 'Prisma schema dizayni', hours: 8, date: past(50), isBillable: true },
    { taskId: createdTasks1[2], userId: jamshidId, description: 'Document CRUD endpointlar', hours: 5, date: past(35), isBillable: true },
    { taskId: createdTasks1[2], userId: shohruhId, description: 'Document DTO va validatsiya', hours: 3, date: past(34), isBillable: true },
    { taskId: createdTasks1[3], userId: jamshidId, description: 'Workflow step execution logic', hours: 10, date: past(25), isBillable: true },
    { taskId: createdTasks1[3], userId: shohruhId, description: 'Parallel workflow implementatsiya', hours: 8, date: past(23), isBillable: true },
    { taskId: createdTasks1[5], userId: jamshidId, description: 'Socket.IO gateway setup', hours: 4, date: past(12), isBillable: true },
    { taskId: createdTasks1[6], userId: shohruhId, description: 'KPI calculation service', hours: 6, date: past(8), isBillable: true },
    { taskId: createdTasks1[7], userId: jamshidId, description: 'Watermark detection algorithm', hours: 5, date: past(4), isBillable: true },
  ]
  for (const te of timeEntries) {
    await prisma.taskTimeEntry.create({ data: te })
  }

  // Task activities
  const activities = [
    { taskId: createdTasks1[0], userId: boburId, action: 'CREATED', changes: { title: 'JWT autentifikatsiya tizimini sozlash' }, createdAt: past(50) },
    { taskId: createdTasks1[0], userId: boburId, action: 'ASSIGNED', changes: { assignee: 'Jamshid Alimov' }, createdAt: past(50) },
    { taskId: createdTasks1[0], userId: jamshidId, action: 'STATUS_CHANGED', changes: { from: 'Backlog', to: 'Bajarilmoqda' }, createdAt: past(48) },
    { taskId: createdTasks1[0], userId: jamshidId, action: 'STATUS_CHANGED', changes: { from: 'Bajarilmoqda', to: 'Tayyor' }, createdAt: past(38) },
    { taskId: createdTasks1[3], userId: asrorId, action: 'CREATED', changes: { title: 'Workflow engine ishlab chiqish' }, createdAt: past(35) },
    { taskId: createdTasks1[3], userId: asrorId, action: 'PRIORITY_CHANGED', changes: { from: 'HIGH', to: 'URGENT' }, createdAt: past(33) },
    { taskId: createdTasks1[3], userId: jamshidId, action: 'STATUS_CHANGED', changes: { from: 'Backlog', to: 'Bajarilmoqda' }, createdAt: past(32) },
    { taskId: createdTasks1[3], userId: jamshidId, action: 'STATUS_CHANGED', changes: { from: 'Bajarilmoqda', to: 'Tayyor' }, createdAt: past(18) },
    { taskId: createdTasks1[7], userId: jamshidId, action: 'CREATED', changes: { title: 'PDF watermark muammosini tuzatish' }, createdAt: past(5) },
    { taskId: createdTasks1[7], userId: jamshidId, action: 'STATUS_CHANGED', changes: { from: 'Backlog', to: 'Bajarilmoqda' }, createdAt: past(4) },
  ]
  for (const a of activities) {
    await prisma.taskActivity.create({ data: a })
  }

  console.log(`  + Project 1: "${proj1.name}" — 12 tasks, 4 columns`)

  // ==================== PROJECT 2: Moliyaviy Tizim ====================
  const proj2 = await prisma.project.create({
    data: {
      name: 'Moliyaviy hisobot avtomatlashtirish',
      description: 'Oylik va yillik moliyaviy hisobotlarni avtomatik generatsiya qilish tizimi',
      key: 'FINANCE',
      status: 'ACTIVE',
      departmentId: depNameToId.get('Moliya Bo\'limi'),
      startDate: past(30),
      endDate: future(90),
      color: '#10B981',
      icon: 'dollar-sign',
      taskCounter: 6,
      penaltyPerDay: 5,
    },
  })

  const cols2 = await Promise.all([
    prisma.boardColumn.create({ data: { projectId: proj2.id, name: 'Rejada', color: '#94A3B8', position: 0, isDefault: true } }),
    prisma.boardColumn.create({ data: { projectId: proj2.id, name: 'Jarayonda', color: '#F59E0B', position: 1, wipLimit: 4 } }),
    prisma.boardColumn.create({ data: { projectId: proj2.id, name: 'Bajarildi', color: '#10B981', position: 2, isClosed: true } }),
  ])

  await Promise.all([
    prisma.projectMember.create({ data: { projectId: proj2.id, userId: nodiraId, role: 'OWNER' } }),
    prisma.projectMember.create({ data: { projectId: proj2.id, userId: dilnozaId, role: 'MANAGER' } }),
    prisma.projectMember.create({ data: { projectId: proj2.id, userId: malikaId, role: 'MEMBER' } }),
    prisma.projectMember.create({ data: { projectId: proj2.id, userId: davronId, role: 'MEMBER' } }),
    prisma.projectMember.create({ data: { projectId: proj2.id, userId: userNameToId.get('sevara.treasury')!, role: 'MEMBER' } }),
  ])

  const labels2 = await Promise.all([
    prisma.projectLabel.create({ data: { projectId: proj2.id, name: 'Hisobot', color: '#3B82F6' } }),
    prisma.projectLabel.create({ data: { projectId: proj2.id, name: 'Smeta', color: '#EF4444' } }),
    prisma.projectLabel.create({ data: { projectId: proj2.id, name: 'Audit', color: '#8B5CF6' } }),
  ])

  const p2Tasks = [
    { taskNumber: 1, title: 'Oylik balans hisoboti shablonini yaratish', description: 'Excel formatda avtomatik balans hisoboti generatsiya', priority: 'HIGH' as const, createdById: dilnozaId, boardColumnId: cols2[2].id, categoryId: catByName.get('Feature'), startDate: past(25), dueDate: past(15), completedAt: past(14), score: 20 },
    { taskNumber: 2, title: 'Xarajatlar tahlili dashboard', description: 'Bo\'limlar kesimida xarajatlar tahlili vizualizatsiyasi', priority: 'MEDIUM' as const, createdById: dilnozaId, boardColumnId: cols2[1].id, categoryId: catByName.get('Feature'), startDate: past(10), dueDate: future(10) },
    { taskNumber: 3, title: 'Byudjet rejalashtirish moduli', description: 'Choraklik byudjet rejasi kiritish va tasdiqlash', priority: 'HIGH' as const, createdById: nodiraId, boardColumnId: cols2[1].id, categoryId: catByName.get('Feature'), startDate: past(5), dueDate: future(20) },
    { taskNumber: 4, title: 'Soliq hisobotlari integratsiyasi', description: 'Soliq inspeksiyasi formatiga avtomatik konvertatsiya', priority: 'MEDIUM' as const, createdById: dilnozaId, boardColumnId: cols2[0].id, categoryId: catByName.get('Feature'), dueDate: future(40) },
    { taskNumber: 5, title: 'Balans formulasida xatolikni tuzatish', description: 'Debet-Kredit farqi noto\'g\'ri hisoblanmoqda', priority: 'URGENT' as const, createdById: malikaId, boardColumnId: cols2[1].id, categoryId: catByName.get('Bug'), startDate: past(2), dueDate: future(3) },
    { taskNumber: 6, title: 'Moliyaviy audit trail', description: 'Har bir moliyaviy o\'zgarish uchun batafsil audit log', priority: 'LOW' as const, createdById: nodiraId, boardColumnId: cols2[0].id, categoryId: catByName.get('Improvement'), dueDate: future(50) },
  ]

  const createdTasks2: string[] = []
  for (const t of p2Tasks) {
    const task = await prisma.task.create({ data: { projectId: proj2.id, ...t } })
    createdTasks2.push(task.id)
  }
  await prisma.project.update({ where: { id: proj2.id }, data: { taskCounter: 6 } })

  const assigneeMap2 = [
    [0, [malikaId]], [1, [malikaId, davronId]], [2, [dilnozaId]],
    [3, [davronId]], [4, [malikaId]], [5, [davronId]],
  ]
  for (const [idx, userIds] of assigneeMap2) {
    for (const uid of userIds as string[]) {
      await prisma.taskAssignee.create({ data: { taskId: createdTasks2[idx as number], userId: uid } })
    }
  }

  await Promise.all([
    prisma.taskLabel.create({ data: { taskId: createdTasks2[0], labelId: labels2[0].id } }),
    prisma.taskLabel.create({ data: { taskId: createdTasks2[1], labelId: labels2[0].id } }),
    prisma.taskLabel.create({ data: { taskId: createdTasks2[2], labelId: labels2[1].id } }),
    prisma.taskLabel.create({ data: { taskId: createdTasks2[5], labelId: labels2[2].id } }),
  ])

  console.log(`  + Project 2: "${proj2.name}" — 6 tasks, 3 columns`)

  // ==================== PROJECT 3: Completed Project ====================
  const proj3 = await prisma.project.create({
    data: {
      name: 'Server migratsiyasi',
      description: 'Eski serverlardan yangi cloud infratuzilmaga ko\'chirish',
      key: 'MIGRATE',
      status: 'COMPLETED',
      departmentId: depNameToId.get('IT Bo\'limi'),
      startDate: past(90),
      endDate: past(10),
      color: '#6366F1',
      icon: 'server',
      taskCounter: 4,
      penaltyPerDay: 10,
    },
  })

  const cols3 = await Promise.all([
    prisma.boardColumn.create({ data: { projectId: proj3.id, name: 'Todo', color: '#94A3B8', position: 0, isDefault: true } }),
    prisma.boardColumn.create({ data: { projectId: proj3.id, name: 'In Progress', color: '#3B82F6', position: 1 } }),
    prisma.boardColumn.create({ data: { projectId: proj3.id, name: 'Done', color: '#10B981', position: 2, isClosed: true } }),
  ])

  await Promise.all([
    prisma.projectMember.create({ data: { projectId: proj3.id, userId: asrorId, role: 'OWNER' } }),
    prisma.projectMember.create({ data: { projectId: proj3.id, userId: otabekId, role: 'MANAGER' } }),
    prisma.projectMember.create({ data: { projectId: proj3.id, userId: nigoraId, role: 'MEMBER' } }),
  ])

  const p3Tasks = [
    { taskNumber: 1, title: 'Eski server backup', description: 'Barcha ma\'lumotlarni zaxiralash', priority: 'CRITICAL' as const, createdById: otabekId, boardColumnId: cols3[2].id, categoryId: catByName.get('Task'), completedAt: past(60), score: 40 },
    { taskNumber: 2, title: 'DNS konfiguratsiyasini yangilash', description: 'Domain va subdomain DNS yozuvlarini o\'zgartirish', priority: 'HIGH' as const, createdById: otabekId, boardColumnId: cols3[2].id, categoryId: catByName.get('Task'), completedAt: past(30), score: 20 },
    { taskNumber: 3, title: 'SSL sertifikatlarni o\'rnatish', description: 'Let\'s Encrypt sertifikatlar', priority: 'HIGH' as const, createdById: otabekId, boardColumnId: cols3[2].id, categoryId: catByName.get('Task'), completedAt: past(25), score: 15 },
    { taskNumber: 4, title: 'Performance testlar', description: 'Yangi serverda yuklanish testlari o\'tkazish', priority: 'MEDIUM' as const, createdById: asrorId, boardColumnId: cols3[2].id, categoryId: catByName.get('Task'), completedAt: past(15), score: 15 },
  ]

  for (const t of p3Tasks) {
    await prisma.task.create({ data: { projectId: proj3.id, ...t } })
  }
  await prisma.project.update({ where: { id: proj3.id }, data: { taskCounter: 4 } })

  console.log(`  + Project 3: "${proj3.name}" — 4 tasks (completed)`)
  console.log(`✅ Projects and tasks seeded\n`)
}

async function seedKpiData(userNameToId: Map<string, string>, depNameToId: Map<string, string>): Promise<void> {
  console.log('📊 Seeding KPI data...')

  const existingKpi = await prisma.userMonthlyKpi.count()
  if (existingKpi > 0) {
    console.log(`  ✓ KPI data already exists (${existingKpi}), skipping\n`)
    return
  }

  const year = 2026
  const month = 3 // March 2026

  const kpiUsers = [
    { username: 'jamshid.xodim', dept: 'Dasturlash Sektori', totalBase: 100, totalEarned: 95, penalty: 5, completed: 5, onTime: 4, late: 1 },
    { username: 'shohruh.developer', dept: 'Dasturlash Sektori', totalBase: 85, totalEarned: 85, penalty: 0, completed: 4, onTime: 4, late: 0 },
    { username: 'malika.xodim', dept: 'Buxgalteriya', totalBase: 70, totalEarned: 60, penalty: 10, completed: 3, onTime: 2, late: 1 },
    { username: 'davron.accountant', dept: 'Buxgalteriya', totalBase: 55, totalEarned: 55, penalty: 0, completed: 3, onTime: 3, late: 0 },
    { username: 'otabek.sysadmin', dept: 'IT Bo\'limi', totalBase: 90, totalEarned: 90, penalty: 0, completed: 4, onTime: 4, late: 0 },
    { username: 'nigora.support', dept: 'Texnik Qo\'llab-quvvatlash', totalBase: 45, totalEarned: 35, penalty: 10, completed: 2, onTime: 1, late: 1 },
    { username: 'sevara.treasury', dept: 'Xazina', totalBase: 60, totalEarned: 60, penalty: 0, completed: 3, onTime: 3, late: 0 },
  ]

  const rewardTiers = await prisma.kpiRewardTier.findMany({ where: { deletedAt: null }, orderBy: { minScore: 'asc' } })

  for (const kpiUser of kpiUsers) {
    const userId = userNameToId.get(kpiUser.username)!
    const departmentId = depNameToId.get(kpiUser.dept)

    const finalScore = Math.round((kpiUser.totalEarned / Math.max(kpiUser.totalBase, 1)) * 100)

    const monthlyKpi = await prisma.userMonthlyKpi.create({
      data: {
        userId,
        departmentId,
        year,
        month,
        totalBaseScore: kpiUser.totalBase,
        totalEarnedScore: kpiUser.totalEarned,
        totalPenalty: kpiUser.penalty,
        tasksCompleted: kpiUser.completed,
        tasksOnTime: kpiUser.onTime,
        tasksLate: kpiUser.late,
        finalScore,
        isFullScore: finalScore >= 100,
        consecutiveFullMonths: finalScore >= 100 ? 1 : 0,
        isFinalized: true,
        finalizedAt: new Date(),
      },
    })

    // Find matching reward tier
    const tier = rewardTiers.find(t => finalScore >= t.minScore && finalScore <= t.maxScore)
    if (tier) {
      await prisma.kpiReward.create({
        data: {
          userMonthlyKpiId: monthlyKpi.id,
          rewardTierId: tier.id,
          userId,
          year,
          month,
          finalScore,
          rewardAmount: tier.rewardAmount,
          rewardBhm: tier.rewardBhm,
          isPenalty: tier.isPenalty,
          penaltyType: tier.penaltyType,
          status: finalScore >= 70 ? 'APPROVED' : finalScore >= 50 ? 'PENDING' : 'PENDING',
          approvedAt: finalScore >= 70 ? new Date() : null,
          approvedById: finalScore >= 70 ? userNameToId.get('admin') : null,
        },
      })
    }

    console.log(`  + KPI: ${kpiUser.username} — ${finalScore}% (${tier?.name || 'N/A'})`)
  }

  // Department monthly KPI
  const deptKpis = [
    { dept: 'Dasturlash Sektori', avg: 90, total: 180, users: 2, above85: 2, at100: 1 },
    { dept: 'Buxgalteriya', avg: 63, total: 115, users: 2, above85: 0, at100: 0 },
    { dept: 'IT Bo\'limi', avg: 90, total: 90, users: 1, above85: 1, at100: 0 },
    { dept: 'Texnik Qo\'llab-quvvatlash', avg: 78, total: 35, users: 1, above85: 0, at100: 0 },
    { dept: 'Xazina', avg: 100, total: 60, users: 1, above85: 0, at100: 1 },
  ]

  for (const dk of deptKpis) {
    const departmentId = depNameToId.get(dk.dept)
    if (departmentId) {
      await prisma.departmentMonthlyKpi.create({
        data: {
          departmentId,
          year,
          month,
          averageScore: dk.avg,
          totalScore: dk.total,
          totalUsers: dk.users,
          usersAbove85: dk.above85,
          usersAt100: dk.at100,
          isEligibleForTeamReward: dk.avg >= 85,
          isFinalized: true,
          finalizedAt: new Date(),
        },
      })
    }
  }

  console.log(`✅ KPI data seeded\n`)
}

async function seedNotifications(userNameToId: Map<string, string>): Promise<void> {
  console.log('🔔 Seeding notifications...')

  const existingCount = await prisma.notification.count()
  if (existingCount > 0) {
    console.log(`  ✓ Notifications already exist (${existingCount}), skipping\n`)
    return
  }

  const now = new Date()
  const past = (h: number) => new Date(now.getTime() - h * 3600000)

  const notifications = [
    { userId: userNameToId.get('bobur.menejer')!, type: 'WORKFLOW', title: 'Yangi hujjat tasdiqlash', message: 'Sizga "Dasturiy ta\'minot litsenziyalari sotib olish" hujjati ko\'rib chiqish uchun yuborildi', isRead: false, createdAt: past(2) },
    { userId: userNameToId.get('asror.direktor')!, type: 'WORKFLOW', title: 'Hujjat tasdiqlandi', message: '"IT infratuzilmasini yangilash buyrug\'i" muvaffaqiyatli tasdiqlandi', isRead: true, readAt: past(20), createdAt: past(24) },
    { userId: userNameToId.get('jamshid.xodim')!, type: 'TASK', title: 'Yangi topshiriq tayinlandi', message: 'Sizga "PDF watermark muammosini tuzatish" topshirig\'i tayinlandi', isRead: false, createdAt: past(5) },
    { userId: userNameToId.get('jamshid.xodim')!, type: 'COMMENT', title: 'Yangi izoh', message: 'Bobur Tursunov "PDF watermark" topshirig\'iga izoh qoldirdi', isRead: false, createdAt: past(3) },
    { userId: userNameToId.get('shohruh.developer')!, type: 'TASK', title: 'Deadline yaqinlashmoqda', message: '"KPI hisoblash moduli" topshirig\'ining muddati 10 kunga qoldi', isRead: true, readAt: past(1), createdAt: past(8) },
    { userId: userNameToId.get('nodira.direktor')!, type: 'WORKFLOW', title: 'Tasdiqlash kutilmoqda', message: '"Mehnat shartnomasi - Kamola Tosheva" hujjatini tasdiqlash kerak', isRead: false, createdAt: past(6) },
    { userId: userNameToId.get('malika.xodim')!, type: 'KPI', title: 'Oylik KPI natijalari', message: 'Mart 2026 KPI natijalaringiz: 86% (Yaxshi)', isRead: false, createdAt: past(12) },
    { userId: userNameToId.get('dilnoza.menejer')!, type: 'WORKFLOW', title: 'Hujjat rad etildi', message: '"Serverlarni ko\'chirish smetasi" Nodira Karimova tomonidan rad etildi', isRead: true, readAt: past(48), createdAt: past(72) },
    { userId: userNameToId.get('admin')!, type: 'SYSTEM', title: 'Tizim yangilanishi', message: 'DocFlow v2.1 muvaffaqiyatli o\'rnatildi', isRead: true, readAt: past(100), createdAt: past(120) },
    { userId: userNameToId.get('otabek.sysadmin')!, type: 'TASK', title: 'Topshiriq bajarildi', message: '"Server migratsiyasi" loyihasidagi barcha topshiriqlar bajarildi', isRead: true, readAt: past(200), createdAt: past(240) },
  ]

  for (const n of notifications) {
    await prisma.notification.create({ data: n })
  }

  console.log(`✅ Notifications seeded: ${notifications.length}\n`)
}

async function seedAuditLogs(userNameToId: Map<string, string>): Promise<void> {
  console.log('📜 Seeding audit logs...')

  const existingCount = await prisma.auditLog.count()
  if (existingCount > 0) {
    console.log(`  ✓ Audit logs already exist (${existingCount}), skipping\n`)
    return
  }

  const now = new Date()
  const past = (d: number) => new Date(now.getTime() - d * 86400000)

  // Get some entity IDs
  const docs = await prisma.document.findMany({ take: 5, select: { id: true, title: true } })
  const users = await prisma.user.findMany({ take: 5, select: { id: true } })

  const adminId = userNameToId.get('admin')!
  const asrorId = userNameToId.get('asror.direktor')!
  const boburId = userNameToId.get('bobur.menejer')!
  const zilolaId = userNameToId.get('zilola.hr')!

  const logs = [
    { entity: 'User', entityId: users[0]?.id || adminId, action: 'LOGIN' as const, performedByUserId: adminId, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0 Chrome/120', performedAt: past(1) },
    { entity: 'Document', entityId: docs[0]?.id || adminId, action: 'CREATE' as const, performedByUserId: asrorId, changes: { title: 'IT infratuzilmasini yangilash' }, ipAddress: '192.168.1.101', performedAt: past(10) },
    { entity: 'Document', entityId: docs[0]?.id || adminId, action: 'APPROVE' as const, performedByUserId: adminId, ipAddress: '192.168.1.100', performedAt: past(5) },
    { entity: 'Document', entityId: docs[4]?.id || adminId, action: 'CREATE' as const, performedByUserId: boburId, changes: { title: 'Dasturiy ta\'minot litsenziyalari' }, ipAddress: '192.168.1.102', performedAt: past(3) },
    { entity: 'User', entityId: users[2]?.id || adminId, action: 'CREATE' as const, performedByUserId: zilolaId, newValues: { fullname: 'Yangi xodim', role: 'Xodim' }, ipAddress: '192.168.1.105', performedAt: past(7) },
    { entity: 'Department', entityId: adminId, action: 'UPDATE' as const, performedByUserId: adminId, oldValues: { location: '1-qavat' }, newValues: { location: '1-qavat, 101-xona' }, ipAddress: '192.168.1.100', performedAt: past(15) },
    { entity: 'Document', entityId: docs[3]?.id || adminId, action: 'REJECT' as const, performedByUserId: asrorId, changes: { reason: 'Smeta summasi mos kelmaydi' }, ipAddress: '192.168.1.101', performedAt: past(4) },
    { entity: 'User', entityId: adminId, action: 'LOGIN' as const, performedByUserId: adminId, ipAddress: '10.0.0.1', userAgent: 'Mozilla/5.0 Safari/17', performedAt: past(2) },
    { entity: 'Role', entityId: adminId, action: 'UPDATE' as const, performedByUserId: adminId, changes: { permissions: '+5 permissions added' }, ipAddress: '192.168.1.100', performedAt: past(20) },
    { entity: 'Workflow', entityId: adminId, action: 'CREATE' as const, performedByUserId: boburId, ipAddress: '192.168.1.102', performedAt: past(8) },
  ]

  for (const log of logs) {
    await prisma.auditLog.create({ data: log })
  }

  console.log(`✅ Audit logs seeded: ${logs.length}\n`)
}

// ============================================================
// MAIN FUNCTION
// ============================================================

async function main() {
  console.log('🚀 Starting database seed...\n')

  try {
    // Step 1: Seed permissions
    const permissionKeyToId = await seedPermissions()

    // Step 2: Seed roles with permissions
    const roleNameToId = await seedRoles(permissionKeyToId)

    // Step 3: Seed admin user
    await seedAdminUser(roleNameToId)

    // Step 4: Seed Task Categories
    await seedTaskCategories()

    // Step 5: Seed KPI Configuration
    await seedTaskScoreConfig()

    // Step 6: Seed KPI Reward Tiers
    await seedKpiRewardTiers()

    // Step 7: Seed departments
    const depNameToId = await seedDepartments()

    // Step 8: Seed users (with roles and departments)
    const userNameToId = await seedUsers(roleNameToId, depNameToId)

    // Step 9: Seed document types
    const dtNameToId = await seedDocumentTypes()

    // Step 10: Seed journals
    const journalPrefixToId = await seedJournals(depNameToId, userNameToId)

    // Step 11: Seed documents and workflows
    await seedDocumentsAndWorkflows(dtNameToId, journalPrefixToId, userNameToId)

    // Step 12: Seed workflow templates
    await seedWorkflowTemplates(dtNameToId, userNameToId)

    // Step 13: Seed projects, tasks, comments, checklists, etc.
    await seedProjectsAndTasks(userNameToId, depNameToId)

    // Step 14: Seed KPI data
    await seedKpiData(userNameToId, depNameToId)

    // Step 15: Seed notifications
    await seedNotifications(userNameToId)

    // Step 16: Seed audit logs
    await seedAuditLogs(userNameToId)

    console.log('🎉 Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
