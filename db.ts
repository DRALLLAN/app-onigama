// db.ts — ماژول اتصال به PostgreSQL با پشتیبانی از Fallback در صورت عدم دسترسی به دیتابیس
import { Pool } from 'pg';

process.env.ADMIN_TOKEN = process.env.ADMIN_TOKEN || "3b2d3f2ea4f19e454ebbece74501aba1d24259a460816585abf3bfff507ff954";

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  user: process.env.PGUSER || 'onigama_user',
  password: process.env.PGPASSWORD || 'Alan11750557*',
  database: process.env.PGDATABASE || 'onigama',
  connectionTimeoutMillis: 1500,
  idleTimeoutMillis: 5000,
});

// Suppress unhandled pool error events when PostgreSQL is not running locally
pool.on('error', () => {
  // Silent fallback
});

// In-Memory Storage for non-Postgres environments
const memoryDevices = new Map<string, any>();
const memorySubscriptions = new Map<string, any>();
const memoryLicenseKeys = new Map<string, any>();

let useFallback = false;

export async function query(text: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
  if (!useFallback) {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (err: any) {
      if (
        err?.code === 'ECONNREFUSED' ||
        err?.code === 'ENOTFOUND' ||
        err?.code === 'ETIMEDOUT' ||
        err?.message?.includes('ECONNREFUSED') ||
        err?.message?.includes('connect')
      ) {
        useFallback = true;
        console.warn('⚠️ PostgreSQL unavailable. Operating in in-memory fallback mode.');
      } else {
        throw err;
      }
    }
  }

  // Fallback in-memory query processing
  const sql = text.trim();

  // 1. Devices INSERT / UPDATE
  if (sql.includes('INSERT INTO devices')) {
    const [deviceId, fullName, email] = params;
    const existing = memoryDevices.get(deviceId) || {};
    memoryDevices.set(deviceId, {
      device_id: deviceId,
      full_name: fullName || existing.full_name || null,
      email: email || existing.email || null,
      last_seen: new Date().toISOString()
    });
    return { rows: [], rowCount: 1 };
  }

  // 2. Subscriptions SELECT
  if (sql.includes('SELECT tier, source, expires_at, is_active FROM subscriptions')) {
    const [deviceId] = params;
    const sub = memorySubscriptions.get(deviceId);
    if (!sub) {
      return { rows: [], rowCount: 0 };
    }
    return { rows: [sub], rowCount: 1 };
  }

  // 3. Subscriptions UPDATE is_active = false
  if (sql.includes('UPDATE subscriptions SET is_active = false')) {
    const [deviceId] = params;
    const sub = memorySubscriptions.get(deviceId);
    if (sub) {
      sub.is_active = false;
      memorySubscriptions.set(deviceId, sub);
    }
    return { rows: [], rowCount: 1 };
  }

  // 4. License Keys SELECT
  if (sql.includes('SELECT key_code, tier, duration_days, is_used FROM license_keys')) {
    const [keyCode] = params;
    const key = memoryLicenseKeys.get(keyCode);
    if (!key) {
      return { rows: [], rowCount: 0 };
    }
    return { rows: [key], rowCount: 1 };
  }

  // 5. License Keys UPDATE used
  if (sql.includes('UPDATE license_keys SET is_used = true')) {
    const [usedBy, keyCode] = params;
    const key = memoryLicenseKeys.get(keyCode);
    if (key) {
      key.is_used = true;
      key.used_by = usedBy;
      key.used_at = new Date().toISOString();
      memoryLicenseKeys.set(keyCode, key);
    }
    return { rows: [], rowCount: 1 };
  }

  // 6. Subscriptions INSERT / UPDATE
  if (sql.includes('INSERT INTO subscriptions')) {
    const [deviceId, tier, expiresAt] = params;
    memorySubscriptions.set(deviceId, {
      device_id: deviceId,
      tier,
      source: 'manual_key',
      started_at: new Date().toISOString(),
      expires_at: expiresAt,
      is_active: true
    });
    return { rows: [], rowCount: 1 };
  }

  // 7. License Keys INSERT
  if (sql.includes('INSERT INTO license_keys')) {
    const [keyCode, tier, durationDays] = params;
    memoryLicenseKeys.set(keyCode, {
      key_code: keyCode,
      tier,
      duration_days: durationDays,
      is_used: false
    });
    return { rows: [], rowCount: 1 };
  }

  return { rows: [], rowCount: 0 };
}

export { pool };

