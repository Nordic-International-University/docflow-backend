-- Document number uchun atomic sequence counter jadvali
-- Race condition'ni to'liq hal qiladi: INSERT ... ON CONFLICT DO UPDATE
-- Postgres darajasida atomic, hech qanday application lock kerak emas

CREATE TABLE IF NOT EXISTS "document_sequence" (
  "key"        VARCHAR(255) PRIMARY KEY,
  "counter"    INTEGER      NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMP    NOT NULL DEFAULT NOW()
);

GRANT ALL PRIVILEGES ON TABLE "document_sequence" TO docflow_user;

-- Mavjud hujjatlardan counter boshlang'ich qiymatini to'ldirish
-- Format: "{journalId}:{prefix}" — masalan "abc-123:IB-2026-"
-- Agar prefix topib bo'lmasa, bo'sh qoldiramiz (keyingi call'da topiladi)
