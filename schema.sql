-- ============================================================
-- Onigama FX — License System Schema
-- اجرا: sudo -u postgres psql -d onigama -f schema.sql
-- ============================================================

-- جدول دستگاه‌ها: هر نصب اپ یک ردیف (بر اساس device_id یکتا)
CREATE TABLE IF NOT EXISTS devices (
  id            SERIAL PRIMARY KEY,
  device_id     TEXT UNIQUE NOT NULL,          -- شناسه یکتای دستگاه از Capacitor
  full_name     TEXT,
  email         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول اشتراک‌ها: وضعیت VIP/Premium هر دستگاه
CREATE TABLE IF NOT EXISTS subscriptions (
  id            SERIAL PRIMARY KEY,
  device_id     TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  tier          TEXT NOT NULL DEFAULT 'free',  -- 'free' | 'premium' | 'vip'
  source        TEXT NOT NULL DEFAULT 'none',  -- 'manual_key' | 'google_play' | 'none'
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ,                   -- NULL = مادام‌العمر
  is_active     BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(device_id)                            -- هر دستگاه یک اشتراک فعال
);

-- جدول کدهای لایسنس: کدهایی که تو می‌سازی و دستی می‌فروشی
CREATE TABLE IF NOT EXISTS license_keys (
  id            SERIAL PRIMARY KEY,
  key_code      TEXT UNIQUE NOT NULL,          -- خود کد، مثلا ONG-XXXX-XXXX
  tier          TEXT NOT NULL DEFAULT 'vip',   -- این کد چه سطحی می‌دهد
  duration_days INTEGER,                       -- NULL = مادام‌العمر، یا تعداد روز
  is_used       BOOLEAN NOT NULL DEFAULT false,
  used_by       TEXT REFERENCES devices(device_id) ON DELETE SET NULL,
  used_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول خریدهای Google Play (برای فاز بعد)
CREATE TABLE IF NOT EXISTS purchases (
  id              SERIAL PRIMARY KEY,
  device_id       TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  purchase_token  TEXT UNIQUE NOT NULL,        -- توکن از Google Play
  product_id      TEXT NOT NULL,
  tier            TEXT NOT NULL DEFAULT 'vip',
  verified        BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ایندکس‌ها برای سرعت
CREATE INDEX IF NOT EXISTS idx_sub_device ON subscriptions(device_id);
CREATE INDEX IF NOT EXISTS idx_keys_code ON license_keys(key_code);
CREATE INDEX IF NOT EXISTS idx_purch_device ON purchases(device_id);
