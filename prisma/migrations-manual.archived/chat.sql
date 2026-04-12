-- Chat system migration (manual)

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

-- Grant permissions to app user
GRANT ALL PRIVILEGES ON TABLE "chat","chat_member","chat_message","chat_message_read","chat_message_reaction","user_chat_settings","call_session","call_participant" TO docflow_user;
