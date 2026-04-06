-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."ActionType" AS ENUM ('CREATED', 'UPDATED', 'APPROVED', 'REJECTED', 'ASSIGNED', 'COMMENTED');

-- CreateEnum
CREATE TYPE "public"."DocumentStatus" AS ENUM ('DRAFT', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ProjectMemberRole" AS ENUM ('OWNER', 'MANAGER', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."StepActionType" AS ENUM ('APPROVAL', 'SIGN', 'REVIEW', 'ACKNOWLEDGE', 'VERIFICATION');

-- CreateEnum
CREATE TYPE "public"."TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "public"."WorkflowStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED');

-- CreateEnum
CREATE TYPE "public"."WorkflowStepActionType" AS ENUM ('STARTED', 'APPROVED', 'REJECTED', 'REASSIGNED', 'COMMENTED', 'DELEGATED');

-- CreateEnum
CREATE TYPE "public"."WorkflowType" AS ENUM ('CONSECUTIVE', 'PARALLEL');

-- CreateEnum
CREATE TYPE "public"."audit_action" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'ARCHIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."token_type" AS ENUM ('ACCESS', 'REFRESH');

-- CreateTable
CREATE TABLE "public"."attachment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "document_id" UUID,
    "uploaded_by_id" UUID,
    "is_auto_generated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entity" VARCHAR(255) NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" "public"."audit_action" NOT NULL DEFAULT 'OTHER',
    "changes" JSONB,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "performed_by_user_id" UUID NOT NULL,
    "performed_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."department" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50),
    "description" VARCHAR(255) NOT NULL,
    "parent_id" UUID,
    "director_id" UUID,
    "location" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_template" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "template_file_id" UUID NOT NULL,
    "document_type_id" UUID NOT NULL,
    "required_tags" JSON,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "document_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_type" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "document_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(500),
    "document_number" VARCHAR(100),
    "status" "public"."DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "document_type_id" UUID NOT NULL,
    "journal_id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,
    "updated_by_id" UUID,
    "template_id" UUID,
    "pdf_url" VARCHAR(500),
    "xfdf_url" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "deletedAt" TIMESTAMP(6),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."journal" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "prefix" VARCHAR(255) NOT NULL,
    "format" VARCHAR(100) NOT NULL,
    "department_id" UUID,
    "responsible_user_id" UUID,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "permission_key" VARCHAR(125) NOT NULL,
    "name" VARCHAR(125) NOT NULL,
    "module" VARCHAR(125) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "key" VARCHAR(10) NOT NULL,
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "department_id" UUID,
    "start_date" DATE,
    "end_date" DATE,
    "budget" DECIMAL(15,2),
    "color" VARCHAR(7),
    "icon" VARCHAR(50),
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_document" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "description" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "project_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_label" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "color" VARCHAR(7) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "project_label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_member" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "public"."ProjectMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "project_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refresh_token" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "revoked_at" TIMESTAMP(6),
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role_permission" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "public"."task" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "project_id" UUID NOT NULL,
    "category_id" UUID,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "priority" "public"."TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "assigned_to_user_id" UUID,
    "created_by_id" UUID NOT NULL,
    "parent_task_id" UUID,
    "workflow_id" UUID,
    "start_date" DATE,
    "due_date" DATE,
    "completed_at" TIMESTAMP(6),
    "estimated_hours" DECIMAL(8,2),
    "actual_hours" DECIMAL(8,2),
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task_activity" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "changes" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task_attachment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" UUID NOT NULL,
    "attachment_id" UUID NOT NULL,
    "uploaded_by_id" UUID NOT NULL,
    "description" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "task_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "color" VARCHAR(7),
    "icon" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "task_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task_checklist" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "task_checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task_checklist_item" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "checklist_id" UUID NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_by_id" UUID,
    "completed_at" TIMESTAMP(6),
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "task_checklist_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task_comment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "parent_comment_id" UUID,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "edited_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "task_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task_comment_attachment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "comment_id" UUID NOT NULL,
    "attachment_id" UUID NOT NULL,
    "uploaded_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_comment_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task_comment_mention" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "comment_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_comment_mention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task_comment_reaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "comment_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "emoji" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_comment_reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task_dependency" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" UUID NOT NULL,
    "depends_on_task_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_dependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task_document" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "description" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "task_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task_label" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" UUID NOT NULL,
    "label_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task_time_entry" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "description" TEXT,
    "hours" DECIMAL(8,2) NOT NULL,
    "date" DATE NOT NULL,
    "is_billable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "task_time_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task_watcher" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_watcher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."token_blacklist" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token" TEXT NOT NULL,
    "token_type" "public"."token_type" NOT NULL DEFAULT 'ACCESS',
    "expires_at" TIMESTAMP(6) NOT NULL,
    "reason" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fullname" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role_id" UUID,
    "department_id" UUID,
    "avatar_url" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(6),
    "telegram_id" VARCHAR(100),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wopi_access_token" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token" VARCHAR(255) NOT NULL,
    "user_id" UUID NOT NULL,
    "file_id" UUID NOT NULL,
    "permissions" JSON NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "wopi_access_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workflow" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_id" UUID NOT NULL,
    "current_step_order" INTEGER NOT NULL,
    "type" "public"."WorkflowType" NOT NULL DEFAULT 'CONSECUTIVE',
    "status" "public"."WorkflowStatus" NOT NULL DEFAULT 'ACTIVE',
    "deadline" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workflow_step" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order" INTEGER NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',
    "action_type" "public"."StepActionType" NOT NULL,
    "workflow_id" UUID NOT NULL,
    "assigned_to_user_id" UUID,
    "started_at" TIMESTAMP(6),
    "completed_at" TIMESTAMP(6),
    "due_date" TIMESTAMP(6),
    "is_creator" BOOLEAN,
    "isRejected" BOOLEAN NOT NULL,
    "rejectionReason" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "workflow_step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workflow_step_action" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workflow_step_id" UUID NOT NULL,
    "action_type" "public"."WorkflowStepActionType" NOT NULL,
    "performed_by_user_id" UUID NOT NULL,
    "comment" TEXT,
    "metadata" JSON,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "workflow_step_action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workflow_step_attachment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workflow_step_id" UUID NOT NULL,
    "attachment_id" UUID NOT NULL,
    "comment" TEXT,
    "uploaded_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "workflow_step_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workflow_template" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "document_type_id" UUID,
    "type" "public"."WorkflowType" NOT NULL DEFAULT 'CONSECUTIVE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "workflow_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workflow_template_step" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workflow_template_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "action_type" "public"."StepActionType" NOT NULL,
    "assigned_to_user_id" UUID,
    "assigned_to_role_id" UUID,
    "assigned_to_department_id" UUID,
    "due_in_days" INTEGER,
    "description" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "workflow_template_step_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_log_entity_entity_id_idx" ON "public"."audit_log"("entity" ASC, "entity_id" ASC);

-- CreateIndex
CREATE INDEX "audit_log_performed_at_idx" ON "public"."audit_log"("performed_at" ASC);

-- CreateIndex
CREATE INDEX "audit_log_performed_by_user_id_idx" ON "public"."audit_log"("performed_by_user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "department_code_key" ON "public"."department"("code" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "department_director_id_key" ON "public"."department"("director_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "document_type_name_key" ON "public"."document_type"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "documents_document_number_key" ON "public"."documents"("document_number" ASC);

-- CreateIndex
CREATE INDEX "notification_user_id_is_read_idx" ON "public"."notification"("user_id" ASC, "is_read" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "permission_permission_key_key" ON "public"."permission"("permission_key" ASC);

-- CreateIndex
CREATE INDEX "project_department_id_idx" ON "public"."project"("department_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "project_key_key" ON "public"."project"("key" ASC);

-- CreateIndex
CREATE INDEX "project_status_idx" ON "public"."project"("status" ASC);

-- CreateIndex
CREATE INDEX "project_document_document_id_idx" ON "public"."project_document"("document_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "project_document_project_id_document_id_key" ON "public"."project_document"("project_id" ASC, "document_id" ASC);

-- CreateIndex
CREATE INDEX "project_document_project_id_idx" ON "public"."project_document"("project_id" ASC);

-- CreateIndex
CREATE INDEX "project_label_project_id_idx" ON "public"."project_label"("project_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "project_label_project_id_name_key" ON "public"."project_label"("project_id" ASC, "name" ASC);

-- CreateIndex
CREATE INDEX "project_member_project_id_idx" ON "public"."project_member"("project_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "project_member_project_id_user_id_key" ON "public"."project_member"("project_id" ASC, "user_id" ASC);

-- CreateIndex
CREATE INDEX "project_member_user_id_idx" ON "public"."project_member"("user_id" ASC);

-- CreateIndex
CREATE INDEX "refresh_token_expires_at_idx" ON "public"."refresh_token"("expires_at" ASC);

-- CreateIndex
CREATE INDEX "refresh_token_token_idx" ON "public"."refresh_token"("token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_token_key" ON "public"."refresh_token"("token" ASC);

-- CreateIndex
CREATE INDEX "refresh_token_user_id_idx" ON "public"."refresh_token"("user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "public"."role"("name" ASC);

-- CreateIndex
CREATE INDEX "task_assigned_to_user_id_idx" ON "public"."task"("assigned_to_user_id" ASC);

-- CreateIndex
CREATE INDEX "task_category_id_idx" ON "public"."task"("category_id" ASC);

-- CreateIndex
CREATE INDEX "task_created_by_id_idx" ON "public"."task"("created_by_id" ASC);

-- CreateIndex
CREATE INDEX "task_due_date_idx" ON "public"."task"("due_date" ASC);

-- CreateIndex
CREATE INDEX "task_parent_task_id_idx" ON "public"."task"("parent_task_id" ASC);

-- CreateIndex
CREATE INDEX "task_priority_idx" ON "public"."task"("priority" ASC);

-- CreateIndex
CREATE INDEX "task_project_id_idx" ON "public"."task"("project_id" ASC);

-- CreateIndex
CREATE INDEX "task_status_idx" ON "public"."task"("status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "task_workflow_id_key" ON "public"."task"("workflow_id" ASC);

-- CreateIndex
CREATE INDEX "task_activity_created_at_idx" ON "public"."task_activity"("created_at" ASC);

-- CreateIndex
CREATE INDEX "task_activity_task_id_idx" ON "public"."task_activity"("task_id" ASC);

-- CreateIndex
CREATE INDEX "task_activity_user_id_idx" ON "public"."task_activity"("user_id" ASC);

-- CreateIndex
CREATE INDEX "task_attachment_attachment_id_idx" ON "public"."task_attachment"("attachment_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "task_attachment_task_id_attachment_id_key" ON "public"."task_attachment"("task_id" ASC, "attachment_id" ASC);

-- CreateIndex
CREATE INDEX "task_attachment_task_id_idx" ON "public"."task_attachment"("task_id" ASC);

-- CreateIndex
CREATE INDEX "task_attachment_uploaded_by_id_idx" ON "public"."task_attachment"("uploaded_by_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "task_category_name_key" ON "public"."task_category"("name" ASC);

-- CreateIndex
CREATE INDEX "task_checklist_task_id_idx" ON "public"."task_checklist"("task_id" ASC);

-- CreateIndex
CREATE INDEX "task_checklist_item_checklist_id_idx" ON "public"."task_checklist_item"("checklist_id" ASC);

-- CreateIndex
CREATE INDEX "task_comment_parent_comment_id_idx" ON "public"."task_comment"("parent_comment_id" ASC);

-- CreateIndex
CREATE INDEX "task_comment_task_id_idx" ON "public"."task_comment"("task_id" ASC);

-- CreateIndex
CREATE INDEX "task_comment_user_id_idx" ON "public"."task_comment"("user_id" ASC);

-- CreateIndex
CREATE INDEX "task_comment_attachment_attachment_id_idx" ON "public"."task_comment_attachment"("attachment_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "task_comment_attachment_comment_id_attachment_id_key" ON "public"."task_comment_attachment"("comment_id" ASC, "attachment_id" ASC);

-- CreateIndex
CREATE INDEX "task_comment_attachment_comment_id_idx" ON "public"."task_comment_attachment"("comment_id" ASC);

-- CreateIndex
CREATE INDEX "task_comment_mention_comment_id_idx" ON "public"."task_comment_mention"("comment_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "task_comment_mention_comment_id_user_id_key" ON "public"."task_comment_mention"("comment_id" ASC, "user_id" ASC);

-- CreateIndex
CREATE INDEX "task_comment_mention_user_id_idx" ON "public"."task_comment_mention"("user_id" ASC);

-- CreateIndex
CREATE INDEX "task_comment_reaction_comment_id_idx" ON "public"."task_comment_reaction"("comment_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "task_comment_reaction_comment_id_user_id_emoji_key" ON "public"."task_comment_reaction"("comment_id" ASC, "user_id" ASC, "emoji" ASC);

-- CreateIndex
CREATE INDEX "task_comment_reaction_user_id_idx" ON "public"."task_comment_reaction"("user_id" ASC);

-- CreateIndex
CREATE INDEX "task_dependency_depends_on_task_id_idx" ON "public"."task_dependency"("depends_on_task_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "task_dependency_task_id_depends_on_task_id_key" ON "public"."task_dependency"("task_id" ASC, "depends_on_task_id" ASC);

-- CreateIndex
CREATE INDEX "task_dependency_task_id_idx" ON "public"."task_dependency"("task_id" ASC);

-- CreateIndex
CREATE INDEX "task_document_document_id_idx" ON "public"."task_document"("document_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "task_document_task_id_document_id_key" ON "public"."task_document"("task_id" ASC, "document_id" ASC);

-- CreateIndex
CREATE INDEX "task_document_task_id_idx" ON "public"."task_document"("task_id" ASC);

-- CreateIndex
CREATE INDEX "task_label_label_id_idx" ON "public"."task_label"("label_id" ASC);

-- CreateIndex
CREATE INDEX "task_label_task_id_idx" ON "public"."task_label"("task_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "task_label_task_id_label_id_key" ON "public"."task_label"("task_id" ASC, "label_id" ASC);

-- CreateIndex
CREATE INDEX "task_time_entry_date_idx" ON "public"."task_time_entry"("date" ASC);

-- CreateIndex
CREATE INDEX "task_time_entry_task_id_idx" ON "public"."task_time_entry"("task_id" ASC);

-- CreateIndex
CREATE INDEX "task_time_entry_user_id_idx" ON "public"."task_time_entry"("user_id" ASC);

-- CreateIndex
CREATE INDEX "task_watcher_task_id_idx" ON "public"."task_watcher"("task_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "task_watcher_task_id_user_id_key" ON "public"."task_watcher"("task_id" ASC, "user_id" ASC);

-- CreateIndex
CREATE INDEX "task_watcher_user_id_idx" ON "public"."task_watcher"("user_id" ASC);

-- CreateIndex
CREATE INDEX "token_blacklist_expires_at_idx" ON "public"."token_blacklist"("expires_at" ASC);

-- CreateIndex
CREATE INDEX "token_blacklist_token_idx" ON "public"."token_blacklist"("token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "token_blacklist_token_key" ON "public"."token_blacklist"("token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "user_telegram_id_key" ON "public"."user"("telegram_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "public"."user"("username" ASC);

-- CreateIndex
CREATE INDEX "wopi_access_token_expires_at_idx" ON "public"."wopi_access_token"("expires_at" ASC);

-- CreateIndex
CREATE INDEX "wopi_access_token_file_id_idx" ON "public"."wopi_access_token"("file_id" ASC);

-- CreateIndex
CREATE INDEX "wopi_access_token_token_idx" ON "public"."wopi_access_token"("token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "wopi_access_token_token_key" ON "public"."wopi_access_token"("token" ASC);

-- CreateIndex
CREATE INDEX "wopi_access_token_user_id_idx" ON "public"."wopi_access_token"("user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "workflow_step_workflow_id_order_key" ON "public"."workflow_step"("workflow_id" ASC, "order" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "workflow_step_attachment_workflow_step_id_attachment_id_key" ON "public"."workflow_step_attachment"("workflow_step_id" ASC, "attachment_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "workflow_template_step_workflow_template_id_order_key" ON "public"."workflow_template_step"("workflow_template_id" ASC, "order" ASC);

-- AddForeignKey
ALTER TABLE "public"."attachment" ADD CONSTRAINT "attachment_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attachment" ADD CONSTRAINT "attachment_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_log" ADD CONSTRAINT "audit_log_performed_by_user_id_fkey" FOREIGN KEY ("performed_by_user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."department" ADD CONSTRAINT "department_director_id_fkey" FOREIGN KEY ("director_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."department" ADD CONSTRAINT "department_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_template" ADD CONSTRAINT "document_template_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "public"."document_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_template" ADD CONSTRAINT "document_template_template_file_id_fkey" FOREIGN KEY ("template_file_id") REFERENCES "public"."attachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "public"."document_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "public"."journal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."document_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."journal" ADD CONSTRAINT "journal_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."journal" ADD CONSTRAINT "journal_responsible_user_id_fkey" FOREIGN KEY ("responsible_user_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project" ADD CONSTRAINT "project_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_document" ADD CONSTRAINT "project_document_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_document" ADD CONSTRAINT "project_document_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_label" ADD CONSTRAINT "project_label_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_member" ADD CONSTRAINT "project_member_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_member" ADD CONSTRAINT "project_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refresh_token" ADD CONSTRAINT "refresh_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task" ADD CONSTRAINT "task_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task" ADD CONSTRAINT "task_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."task_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task" ADD CONSTRAINT "task_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task" ADD CONSTRAINT "task_parent_task_id_fkey" FOREIGN KEY ("parent_task_id") REFERENCES "public"."task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task" ADD CONSTRAINT "task_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task" ADD CONSTRAINT "task_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_activity" ADD CONSTRAINT "task_activity_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_activity" ADD CONSTRAINT "task_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_attachment" ADD CONSTRAINT "task_attachment_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_attachment" ADD CONSTRAINT "task_attachment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_attachment" ADD CONSTRAINT "task_attachment_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_checklist" ADD CONSTRAINT "task_checklist_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_checklist_item" ADD CONSTRAINT "task_checklist_item_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "public"."task_checklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_checklist_item" ADD CONSTRAINT "task_checklist_item_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_comment" ADD CONSTRAINT "task_comment_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."task_comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_comment" ADD CONSTRAINT "task_comment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_comment" ADD CONSTRAINT "task_comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_comment_attachment" ADD CONSTRAINT "task_comment_attachment_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_comment_attachment" ADD CONSTRAINT "task_comment_attachment_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."task_comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_comment_attachment" ADD CONSTRAINT "task_comment_attachment_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_comment_mention" ADD CONSTRAINT "task_comment_mention_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."task_comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_comment_mention" ADD CONSTRAINT "task_comment_mention_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_comment_reaction" ADD CONSTRAINT "task_comment_reaction_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."task_comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_comment_reaction" ADD CONSTRAINT "task_comment_reaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_dependency" ADD CONSTRAINT "task_dependency_depends_on_task_id_fkey" FOREIGN KEY ("depends_on_task_id") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_dependency" ADD CONSTRAINT "task_dependency_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_document" ADD CONSTRAINT "task_document_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_document" ADD CONSTRAINT "task_document_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_label" ADD CONSTRAINT "task_label_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "public"."project_label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_label" ADD CONSTRAINT "task_label_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_time_entry" ADD CONSTRAINT "task_time_entry_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_time_entry" ADD CONSTRAINT "task_time_entry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_watcher" ADD CONSTRAINT "task_watcher_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_watcher" ADD CONSTRAINT "task_watcher_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wopi_access_token" ADD CONSTRAINT "wopi_access_token_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."attachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wopi_access_token" ADD CONSTRAINT "wopi_access_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow" ADD CONSTRAINT "workflow_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_step" ADD CONSTRAINT "workflow_step_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_step" ADD CONSTRAINT "workflow_step_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_step_action" ADD CONSTRAINT "workflow_step_action_performed_by_user_id_fkey" FOREIGN KEY ("performed_by_user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_step_action" ADD CONSTRAINT "workflow_step_action_workflow_step_id_fkey" FOREIGN KEY ("workflow_step_id") REFERENCES "public"."workflow_step"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_step_attachment" ADD CONSTRAINT "workflow_step_attachment_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_step_attachment" ADD CONSTRAINT "workflow_step_attachment_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_step_attachment" ADD CONSTRAINT "workflow_step_attachment_workflow_step_id_fkey" FOREIGN KEY ("workflow_step_id") REFERENCES "public"."workflow_step"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_template" ADD CONSTRAINT "workflow_template_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "public"."document_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_template_step" ADD CONSTRAINT "workflow_template_step_assigned_to_department_id_fkey" FOREIGN KEY ("assigned_to_department_id") REFERENCES "public"."department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_template_step" ADD CONSTRAINT "workflow_template_step_assigned_to_role_id_fkey" FOREIGN KEY ("assigned_to_role_id") REFERENCES "public"."role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_template_step" ADD CONSTRAINT "workflow_template_step_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_template_step" ADD CONSTRAINT "workflow_template_step_workflow_template_id_fkey" FOREIGN KEY ("workflow_template_id") REFERENCES "public"."workflow_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

