-- ============================================================
-- Colony Connect — PostgreSQL + PostGIS Schema
-- Run this on Supabase SQL editor
-- ============================================================

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── COLONIES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS colonies (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  address       TEXT NOT NULL,
  location      GEOGRAPHY(POINT, 4326) NOT NULL,  -- PostGIS point
  geofence_radius INTEGER NOT NULL DEFAULT 500,   -- meters
  total_units   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_colonies_location ON colonies USING GIST(location);

-- ─── USERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  colony_id     UUID NOT NULL REFERENCES colonies(id) ON DELETE CASCADE,
  phone         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  flat_number   TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('resident', 'secretary', 'guard')),
  fcm_token     TEXT,
  avatar_url    TEXT,
  is_verified   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_colony  ON users(colony_id);
CREATE INDEX idx_users_phone   ON users(phone);
CREATE INDEX idx_users_role    ON users(colony_id, role);

-- ─── ANNOUNCEMENTS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  colony_id     UUID NOT NULL REFERENCES colonies(id) ON DELETE CASCADE,
  created_by    UUID NOT NULL REFERENCES users(id),
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  is_pinned     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_colony ON announcements(colony_id, created_at DESC);

-- ─── CHAT ROOMS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_rooms (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  colony_id     UUID NOT NULL REFERENCES colonies(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('general', 'maintenance', 'events', 'private')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_rooms_colony ON chat_rooms(colony_id);

-- ─── MESSAGES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id       UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  colony_id     UUID NOT NULL,   -- denormalized for RLS
  sender_id     UUID NOT NULL REFERENCES users(id),
  content       TEXT,            -- null if media-only
  type          TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'file')),
  media_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cursor-based pagination needs this composite index
CREATE INDEX idx_messages_room ON messages(room_id, created_at DESC);
CREATE INDEX idx_messages_colony ON messages(colony_id);

-- ─── COMPLAINTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaints (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  colony_id     UUID NOT NULL REFERENCES colonies(id) ON DELETE CASCADE,
  raised_by     UUID NOT NULL REFERENCES users(id),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('maintenance', 'security', 'cleanliness', 'other')),
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_complaints_colony  ON complaints(colony_id, created_at DESC);
CREATE INDEX idx_complaints_status  ON complaints(colony_id, status);

-- ─── VISITORS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visitors (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  colony_id       UUID NOT NULL REFERENCES colonies(id) ON DELETE CASCADE,
  resident_id     UUID NOT NULL REFERENCES users(id),
  visitor_name    TEXT NOT NULL,
  purpose         TEXT NOT NULL,
  otp             TEXT NOT NULL,
  otp_expires_at  TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','entered','exited','expired')),
  vehicle_number  TEXT,
  entry_time      TIMESTAMPTZ,
  exit_time       TIMESTAMPTZ,
  guard_id        UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_visitors_colony    ON visitors(colony_id, created_at DESC);
CREATE INDEX idx_visitors_resident  ON visitors(resident_id);
CREATE INDEX idx_visitors_otp       ON visitors(otp, colony_id);

-- ─── EVENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  colony_id     UUID NOT NULL REFERENCES colonies(id) ON DELETE CASCADE,
  created_by    UUID NOT NULL REFERENCES users(id),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  venue         TEXT NOT NULL,
  event_date    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_rsvps (
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

CREATE INDEX idx_events_colony ON events(colony_id, event_date ASC);

-- ─── MARKETPLACE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  colony_id     UUID NOT NULL REFERENCES colonies(id) ON DELETE CASCADE,
  seller_id     UUID NOT NULL REFERENCES users(id),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  price         NUMERIC(10,2) NOT NULL,
  category      TEXT NOT NULL,
  image_urls    TEXT[] NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_marketplace_colony ON marketplace_listings(colony_id, created_at DESC);

-- ─── SOS ALERTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sos_alerts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  colony_id     UUID NOT NULL REFERENCES colonies(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id),
  location      GEOGRAPHY(POINT, 4326),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at   TIMESTAMPTZ
);

CREATE INDEX idx_sos_colony ON sos_alerts(colony_id, created_at DESC);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
-- Enable RLS on all tables (colony isolation at DB level)
ALTER TABLE announcements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms            ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints            ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors              ENABLE ROW LEVEL SECURITY;
ALTER TABLE events                ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps           ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_alerts            ENABLE ROW LEVEL SECURITY;

-- NOTE: RLS policies use jwt() claim — set via Supabase Auth or custom JWT
-- For custom JWT (our setup), use service_role key in backend (bypasses RLS)
-- RLS is a safety net — backend always filters by colony_id explicitly

-- ─── SEED: Default chat rooms per colony (call after colony creation) ─────────
-- INSERT INTO chat_rooms (colony_id, name, type) VALUES
--   ($1, 'General',     'general'),
--   ($1, 'Maintenance', 'maintenance'),
--   ($1, 'Events',      'events');
