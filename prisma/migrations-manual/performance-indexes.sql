-- Performance indexes — tez-tez ishlatiladigan so'rovlar uchun

-- Document number bo'yicha prefix search (startsWith) uchun
CREATE INDEX CONCURRENTLY IF NOT EXISTS "documents_document_number_pattern_idx"
  ON "documents" ("document_number" text_pattern_ops);

-- Audit log — entity + entityId + sana bo'yicha tez qidirish
CREATE INDEX CONCURRENTLY IF NOT EXISTS "audit_log_entity_entity_id_idx"
  ON "audit_log" ("entity", "entity_id", "created_at" DESC);

-- Audit log — user + sana
CREATE INDEX CONCURRENTLY IF NOT EXISTS "audit_log_performed_by_created_at_idx"
  ON "audit_log" ("performed_by_user_id", "created_at" DESC);

-- Chat message — chat ichida vaqt bo'yicha (allaqachon bor bo'lishi mumkin)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "chat_message_chat_created_idx"
  ON "chat_message" ("chat_id", "created_at" DESC);

-- Notification — user + o'qilmagan + vaqt
CREATE INDEX CONCURRENTLY IF NOT EXISTS "notification_user_unread_idx"
  ON "notification" ("user_id", "is_read", "created_at" DESC)
  WHERE "deleted_at" IS NULL;

-- Task — project + completed + due date (kanban/filter uchun)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "task_project_status_idx"
  ON "task" ("project_id", "completed_at", "due_date")
  WHERE "deleted_at" IS NULL AND "is_archived" = false;

-- Workflow — document + status
CREATE INDEX CONCURRENTLY IF NOT EXISTS "workflow_document_status_idx"
  ON "workflow" ("document_id", "status")
  WHERE "deleted_at" IS NULL;

-- User monthly KPI — tez aggregate
CREATE INDEX CONCURRENTLY IF NOT EXISTS "user_monthly_kpi_period_idx"
  ON "user_monthly_kpi" ("year", "month", "department_id");

-- Document sequence — allaqachon PK, lekin UPSERT tezligi uchun
-- (PK allaqachon index, bu ortiqcha emas)
