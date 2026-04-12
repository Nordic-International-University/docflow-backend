-- Consolidate the 4 manual SQL files from prisma/migrations-manual/ into a
-- single tracked Prisma migration. This migration is fully idempotent
-- (IF NOT EXISTS, DO $$ EXCEPTION) so it can be safely applied to:
--   * Fresh databases (creates everything)
--   * Existing prod/sandbox databases where the manual SQLs were already run
--
-- Once this migration has been marked as applied on all existing environments
-- (via `prisma migrate resolve --applied 20260412120000_consolidate_manual_migrations`),
-- new deployments get these tables automatically via `prisma migrate deploy`.
--
-- Source files consolidated:
--   - prisma/migrations-manual/document-sequence.sql
--   - prisma/migrations-manual/chat.sql
--   - prisma/migrations-manual/chat-phase3.sql
--   - prisma/migrations-manual/performance-indexes.sql
--
-- NOTE: CONCURRENTLY has been removed from CREATE INDEX statements because
-- Prisma wraps migrations in a transaction, and CONCURRENTLY cannot run in
-- a transaction. Index creation will briefly lock tables — acceptable for
-- small/medium tables. For very large tables, apply indexes manually first.
--
-- GRANT statements have been removed — Prisma migrations should not manage
-- DB privileges (environment-specific).


-- ═══════════════════════════════════════════════════════════════════════
-- 1. document_sequence — document number atomic counter
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "document_sequence" (
  "key"        VARCHAR(255) PRIMARY KEY,
  "counter"    INTEGER      NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════════════════
-- 2. Chat system (chat.sql)
-- ═══════════════════════════════════════════════════════════════════════

-- Enums
DO $$ BEGIN
  CREATE TYPE "ChatType" AS ENUM ('DIRECT','GROUP');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "ChatMemberRole" AS ENUM ('OWNER','ADMIN','MEMBER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "ChatMessageType" AS ENUM ('TEXT','IMAGE','VIDEO','VOICE','FILE','SYSTEM','FORWARD','WORKFLOW','DOCUMENT','TASK','CALL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "CallType" AS ENUM ('AUDIO','VIDEO');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "CallStatus" AS ENUM ('RINGING','ACTIVE','ENDED','MISSED','REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- chat
CREATE TABLE IF NOT EXISTS "chat" (
  "id"              UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  "type"            "ChatType" NOT NULL,
  "title"           VARCHAR(255),
  "description"     TEXT,
  "avatar_url"      VARCHAR(500),
  "created_by_id"   UUID,
  "last_message_at" TIMESTAMP,
  "created_at"      TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"      TIMESTAMP NOT NULL DEFAULT NOW(),
  "deleted_at"      TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "chat_type_last_message_at_idx" ON "chat" ("type","last_message_at");

-- chat_member
CREATE TABLE IF NOT EXISTS "chat_member" (
  "id"           UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  "chat_id"      UUID NOT NULL REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "user_id"      UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "role"         "ChatMemberRole" NOT NULL DEFAULT 'MEMBER',
  "joined_at"    TIMESTAMP NOT NULL DEFAULT NOW(),
  "last_read_at" TIMESTAMP,
  "muted_until"  TIMESTAMP,
  "is_archived"  BOOLEAN NOT NULL DEFAULT FALSE,
  "is_pinned"    BOOLEAN NOT NULL DEFAULT FALSE,
  "left_at"      TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "chat_member_chat_id_user_id_key" ON "chat_member" ("chat_id","user_id");
CREATE INDEX IF NOT EXISTS "chat_member_user_id_idx" ON "chat_member" ("user_id");

-- chat_message
CREATE TABLE IF NOT EXISTS "chat_message" (
  "id"                UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  "chat_id"           UUID NOT NULL REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "sender_id"         UUID NOT NULL REFERENCES "user"("id") ON UPDATE CASCADE,
  "type"              "ChatMessageType" NOT NULL DEFAULT 'TEXT',
  "content"           TEXT,
  "reply_to_id"       UUID REFERENCES "chat_message"("id") ON UPDATE CASCADE,
  "forwarded_from_id" UUID REFERENCES "chat_message"("id") ON UPDATE CASCADE,
  "file_url"          VARCHAR(500),
  "file_name"         VARCHAR(255),
  "file_size"         INT,
  "mime_type"         VARCHAR(100),
  "duration"          INT,
  "thumbnail_url"     VARCHAR(500),
  "width"             INT,
  "height"            INT,
  "ref_type"          VARCHAR(50),
  "ref_id"            UUID,
  "ref_snapshot"      JSONB,
  "edited_at"         TIMESTAMP,
  "created_at"        TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"        TIMESTAMP NOT NULL DEFAULT NOW(),
  "deleted_at"        TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "chat_message_chat_id_created_at_idx" ON "chat_message" ("chat_id","created_at");
CREATE INDEX IF NOT EXISTS "chat_message_sender_id_idx" ON "chat_message" ("sender_id");

-- chat_message_read
CREATE TABLE IF NOT EXISTS "chat_message_read" (
  "id"         UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  "message_id" UUID NOT NULL REFERENCES "chat_message"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "user_id"    UUID NOT NULL REFERENCES "user"("id") ON UPDATE CASCADE,
  "read_at"    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "chat_message_read_message_id_user_id_key" ON "chat_message_read" ("message_id","user_id");
CREATE INDEX IF NOT EXISTS "chat_message_read_user_id_idx" ON "chat_message_read" ("user_id");

-- chat_message_reaction
CREATE TABLE IF NOT EXISTS "chat_message_reaction" (
  "id"         UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  "message_id" UUID NOT NULL REFERENCES "chat_message"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "user_id"    UUID NOT NULL REFERENCES "user"("id") ON UPDATE CASCADE,
  "emoji"      VARCHAR(20) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "chat_message_reaction_message_id_user_id_emoji_key" ON "chat_message_reaction" ("message_id","user_id","emoji");

-- user_chat_settings
CREATE TABLE IF NOT EXISTS "user_chat_settings" (
  "id"                   UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  "user_id"              UUID NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "allow_calls"          BOOLEAN NOT NULL DEFAULT TRUE,
  "allow_video_calls"    BOOLEAN NOT NULL DEFAULT TRUE,
  "allow_group_invites"  BOOLEAN NOT NULL DEFAULT TRUE,
  "show_online_status"   BOOLEAN NOT NULL DEFAULT TRUE,
  "show_last_seen"       BOOLEAN NOT NULL DEFAULT TRUE,
  "show_read_receipts"   BOOLEAN NOT NULL DEFAULT TRUE,
  "notify_sound"         BOOLEAN NOT NULL DEFAULT TRUE,
  "notify_preview"       BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at"           TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"           TIMESTAMP NOT NULL DEFAULT NOW()
);

-- call_session
CREATE TABLE IF NOT EXISTS "call_session" (
  "id"           UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  "chat_id"      UUID NOT NULL REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "initiator_id" UUID NOT NULL REFERENCES "user"("id") ON UPDATE CASCADE,
  "type"         "CallType" NOT NULL,
  "status"       "CallStatus" NOT NULL DEFAULT 'RINGING',
  "started_at"   TIMESTAMP,
  "ended_at"     TIMESTAMP,
  "duration"     INT,
  "created_at"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"   TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "call_session_chat_id_created_at_idx" ON "call_session" ("chat_id","created_at");

-- call_participant
CREATE TABLE IF NOT EXISTS "call_participant" (
  "id"        UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  "call_id"   UUID NOT NULL REFERENCES "call_session"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "user_id"   UUID NOT NULL REFERENCES "user"("id") ON UPDATE CASCADE,
  "joined_at" TIMESTAMP,
  "left_at"   TIMESTAMP,
  "accepted"  BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE UNIQUE INDEX IF NOT EXISTS "call_participant_call_id_user_id_key" ON "call_participant" ("call_id","user_id");


-- ═══════════════════════════════════════════════════════════════════════
-- 3. Chat Phase 3 (chat-phase3.sql)
--    Forward attribution, Group visibility, Invite, Block, Clear history
-- ═══════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE "GroupVisibility" AS ENUM ('PRIVATE','PUBLIC');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- chat: group fields
ALTER TABLE "chat"
  ADD COLUMN IF NOT EXISTS "visibility" "GroupVisibility" DEFAULT 'PRIVATE',
  ADD COLUMN IF NOT EXISTS "username" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "invite_code" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "allow_member_invite" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "allow_member_send_media" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS "allow_member_pin" BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS "chat_username_key" ON "chat" ("username");
CREATE UNIQUE INDEX IF NOT EXISTS "chat_invite_code_key" ON "chat" ("invite_code");
CREATE INDEX IF NOT EXISTS "chat_username_idx" ON "chat" ("username");

-- chat_member: clear history
ALTER TABLE "chat_member"
  ADD COLUMN IF NOT EXISTS "history_cleared_at" TIMESTAMP;

-- chat_message: forward attribution
ALTER TABLE "chat_message"
  ADD COLUMN IF NOT EXISTS "forwarded_from_user_id" UUID,
  ADD COLUMN IF NOT EXISTS "forwarded_from_chat_id" UUID,
  ADD COLUMN IF NOT EXISTS "forwarded_from_name" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "forwarded_from_chat_title" VARCHAR(255);

-- user_block table
CREATE TABLE IF NOT EXISTS "user_block" (
  "id"         UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  "blocker_id" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "blocked_id" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "user_block_blocker_blocked_key" ON "user_block" ("blocker_id","blocked_id");
CREATE INDEX IF NOT EXISTS "user_block_blocked_idx" ON "user_block" ("blocked_id");


-- ═══════════════════════════════════════════════════════════════════════
-- 4. Performance indexes (performance-indexes.sql)
--    CONCURRENTLY olib tashlandi (Prisma transactionda ishlaydi).
-- ═══════════════════════════════════════════════════════════════════════

-- Document number bo'yicha prefix search (startsWith) uchun
CREATE INDEX IF NOT EXISTS "documents_document_number_pattern_idx"
  ON "documents" ("document_number" text_pattern_ops);

-- Audit log — entity + entityId + sana bo'yicha tez qidirish
CREATE INDEX IF NOT EXISTS "audit_log_entity_entity_id_idx"
  ON "audit_log" ("entity", "entity_id", "created_at" DESC);

-- Audit log — user + sana
CREATE INDEX IF NOT EXISTS "audit_log_performed_by_created_at_idx"
  ON "audit_log" ("performed_by_user_id", "created_at" DESC);

-- Chat message — chat ichida vaqt bo'yicha
CREATE INDEX IF NOT EXISTS "chat_message_chat_created_idx"
  ON "chat_message" ("chat_id", "created_at" DESC);

-- Notification — user + o'qilmagan + vaqt (partial index)
CREATE INDEX IF NOT EXISTS "notification_user_unread_idx"
  ON "notification" ("user_id", "is_read", "created_at" DESC)
  WHERE "deleted_at" IS NULL;

-- Task — project + completed + due date (kanban/filter uchun, partial index)
CREATE INDEX IF NOT EXISTS "task_project_status_idx"
  ON "task" ("project_id", "completed_at", "due_date")
  WHERE "deleted_at" IS NULL AND "is_archived" = false;

-- Workflow — document + status (partial index)
CREATE INDEX IF NOT EXISTS "workflow_document_status_idx"
  ON "workflow" ("document_id", "status")
  WHERE "deleted_at" IS NULL;

-- User monthly KPI — tez aggregate
CREATE INDEX IF NOT EXISTS "user_monthly_kpi_period_idx"
  ON "user_monthly_kpi" ("year", "month", "department_id");
