-- Chat Faza 3: Forward attribution, Group visibility, Invite, Block, Clear history

-- GroupVisibility enum
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

GRANT ALL PRIVILEGES ON TABLE "user_block" TO docflow_user;
