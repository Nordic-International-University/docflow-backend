/**
 * CASL type definitions — Prisma modellari bilan type-safe ABAC
 *
 * Bu fayl barcha policy'lar uchun umumiy tiplarni belgilaydi.
 * Har yangi resource qo'shilganda shu yerga qo'shiladi.
 */

import { AbilityBuilder, PureAbility } from '@casl/ability'
import { PrismaQuery, Subjects, createPrismaAbility } from '@casl/prisma'
import {
  Document,
  Workflow,
  WorkflowStep,
  Project,
  Task,
  Chat,
  ChatMessage,
  ChatMember,
  User,
  Attachment,
  Notification,
  Journal,
} from '@prisma/client'

/** ABAC action'lar — CRUD + domain-specific */
export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage' // CRUD hammasi
  | 'approve'
  | 'reject'
  | 'sign'
  | 'complete'
  | 'archive'
  | 'download'
  | 'forward'
  | 'send' // chat message
  | 'call' // audio/video call

/** Subject map — Prisma model → CASL subject */
export type AppSubjects = Subjects<{
  Document: Document
  Workflow: Workflow
  WorkflowStep: WorkflowStep
  Project: Project
  Task: Task
  Chat: Chat
  ChatMessage: ChatMessage
  ChatMember: ChatMember
  User: User
  Attachment: Attachment
  Notification: Notification
  Journal: Journal
}>

/** Main ability type — barcha joyda shu ishlatiladi */
export type AppAbility = PureAbility<[Action, AppSubjects], PrismaQuery>

export const createAppAbility = createPrismaAbility

/** User context — ability yaratish uchun */
export interface CaslUser {
  id: string
  roleName?: string
  departmentId?: string | null
  /** Boshliq bo'lgan bo'lim + uning barcha child'lari (rekursiv) */
  subordinateDeptIds?: string[]
  /** O'z bo'limidan root'gacha zanjir */
  ancestorDeptIds?: string[]
  /** Bo'lim boshliq'imi */
  isDeptHead?: boolean
}

/** Convenience type for AbilityBuilder */
export type AppAbilityBuilder = AbilityBuilder<AppAbility>
