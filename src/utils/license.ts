// license.ts — ماژول کلاینت برای سیستم لایسنس
// مسیر: src/utils/license.ts
// نیازمند: @capacitor/device  (برای گرفتن شناسه یکتای دستگاه)
//   اگر نصب نیست: npm install @capacitor/device

import { Device } from '@capacitor/device';

export interface LicenseStatus {
  tier: 'free' | 'premium' | 'vip';
  isActivated: boolean;
  source?: string;
  expiresAt?: string | null;
  expired?: boolean;
}

// شناسه یکتای دستگاه را می‌گیرد (روی هر دستگاه ثابت است)
export async function getDeviceId(): Promise<string> {
  try {
    const info = await Device.getId();
    // در نسخه‌های جدید Capacitor، identifier برمی‌گردد
    return (info as any).identifier || (info as any).uuid || 'unknown-device';
  } catch {
    // fallback: یک شناسه محلی بساز و ذخیره کن
    let id = localStorage.getItem('onigama_device_fallback');
    if (!id) {
      id = 'web-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('onigama_device_fallback', id);
    }
    return id;
  }
}

// وضعیت VIP را از سرور می‌پرسد
export async function checkLicense(fullName?: string, email?: string): Promise<LicenseStatus> {
  const deviceId = await getDeviceId();
  try {
    const res = await fetch('/api/license/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, fullName, email }),
    });
    if (!res.ok) throw new Error('check failed');
    return await res.json();
  } catch (e) {
    // اگر سرور در دسترس نبود، حالت امن = free
    return { tier: 'free', isActivated: false };
  }
}

// فعال‌سازی با کد دستی
export async function activateLicense(keyCode: string): Promise<{ ok: boolean; tier?: string; error?: string; expiresAt?: string | null }> {
  const deviceId = await getDeviceId();
  try {
    const res = await fetch('/api/license/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, keyCode }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error || 'فعال‌سازی ناموفق بود' };
    }
    return { ok: true, tier: data.tier, expiresAt: data.expiresAt };
  } catch (e) {
    return { ok: false, error: 'اتصال به سرور برقرار نشد' };
  }
}
