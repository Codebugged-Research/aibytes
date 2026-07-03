-- AIBites PostgreSQL schema
-- Applied on startup via server.py ensure_schema(); kept here as the source of truth.

CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL DEFAULT '',
    auth_method TEXT NOT NULL DEFAULT 'email',   -- 'email' | 'phone' | 'google' | 'apple'
    phone       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One progress row per user. JSONB blobs mirror the MVP's localStorage keys so
-- the client logic (completed lessons list, per-lesson resume point) ports 1:1.
CREATE TABLE IF NOT EXISTS progress (
    user_id           BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    xp                INTEGER NOT NULL DEFAULT 0,
    streak            INTEGER NOT NULL DEFAULT 0,
    last_lesson_date  TEXT,                          -- JS toDateString(), matches MVP streak logic
    current_lesson    TEXT NOT NULL DEFAULT 'u0-l1',
    completed_lessons JSONB NOT NULL DEFAULT '[]'::jsonb,   -- ["u0-l1", ...]
    lesson_progress   JSONB NOT NULL DEFAULT '{}'::jsonb,   -- { "u0-l1": {segmentIndex,exerciseIndex} }
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
