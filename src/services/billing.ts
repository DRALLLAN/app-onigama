import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { StorageManager } from './api';
import { UserProfile } from '../types';
import { activateLicense, getDeviceId } from '../utils/license';

// Product IDs باید دقیقاً با Google Play Console و RevenueCat یکسان باشند
export const PLAY_STORE_PRODUCTS = {
  PRO_MONTHLY: 'onigama_pro_monthly',
  PRO_ANNUAL: 'onigama_pro_annual',
  VIP_LIFETIME: 'onigama_vip_lifetime_pack'
};

// کلید عمومی RevenueCat برای Google Play (از Project Settings -> API Keys)
const REVENUECAT_API_KEY = 'goog_zNqIBtHVvNootJmeGcyFXEnrTfU';

// نام Entitlement که در RevenueCat تعریف کرده‌ای (معمولا 'vip' یا 'pro')
const ENTITLEMENT_ID = 'vip';

export interface PurchaseState {
  isProcessing: boolean;
  statusText: string;
  error: string | null;
  success: boolean;
}

let isConfigured = false;

export const PlayBillingService = {
  isNativeEnvironment(): boolean {
    const win = window as any;
    return !!(win.Capacitor && win.Capacitor.platform !== 'web' && win.Capacitor.isNativePlatform?.());
  },

  // راه‌اندازی RevenueCat - باید یک‌بار در ابتدای اپ صدا زده شود
  async initializeBilling(
    onPurchaseVerified: (tier: 'premium' | 'vip', method: string) => void,
    onStatusChange?: (text: string) => void
  ) {
    if (!this.isNativeEnvironment()) {
      console.log('محیط وب/مرورگر است؛ RevenueCat فقط روی اپ نصب‌شده کار می‌کند.');
      return;
    }
    if (isConfigured) return;

    try {
      onStatusChange?.('در حال راه‌اندازی سیستم پرداخت...');

      await Purchases.setLogLevel({ level: LOG_LEVEL.ERROR });

      const deviceId = await getDeviceId();
      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
        appUserID: deviceId, // همان شناسه دستگاه که در سیستم لایسنس خودمان استفاده می‌کنیم
      });

      isConfigured = true;
      onStatusChange?.('سیستم پرداخت آماده است.');

      // چک وضعیت فعلی (اگر کاربر قبلا خریده، VIP فعال شود)
      await this.syncEntitlements(onPurchaseVerified);
    } catch (err: any) {
      console.error('RevenueCat init error:', err);
      onStatusChange?.('خطا در راه‌اندازی سیستم پرداخت: ' + err.message);
    }
  },

  // وضعیت فعلی Entitlement را از RevenueCat می‌خواند و در صورت VIP بودن، به سرور خودمان اطلاع می‌دهد
  async syncEntitlements(onPurchaseVerified: (tier: 'premium' | 'vip', method: string) => void) {
    try {
      const info = await Purchases.getCustomerInfo();
      const entitlement = info.customerInfo.entitlements.active[ENTITLEMENT_ID];
      if (entitlement) {
        const profile = StorageManager.getProfile();
        const updated: UserProfile = {
          ...profile,
          isActivated: true,
          subscriptionTier: 'vip',
        };
        StorageManager.saveProfile(updated);
        onPurchaseVerified('vip', 'GOOGLE_PLAY_STORE');
      }
    } catch (err) {
      console.error('syncEntitlements error:', err);
    }
  },

  // خرید واقعی از Google Play
  async launchPlayCheckout(
    productId: string,
    onProgress: (status: PurchaseState) => void,
    onComplete: (updatedProfile: UserProfile) => void
  ) {
    if (!this.isNativeEnvironment()) {
      onProgress({
        isProcessing: false,
        statusText: '',
        error: 'خرید فقط در اپ نصب‌شده روی اندروید امکان‌پذیر است.',
        success: false
      });
      return;
    }

    onProgress({
      isProcessing: true,
      statusText: 'در حال اتصال به فروشگاه گوگل پلی...',
      error: null,
      success: false
    });

    try {
      // گرفتن لیست محصولات موجود از RevenueCat
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;
      if (!currentOffering) {
        throw new Error('هیچ بسته‌ای در حال حاضر در دسترس نیست.');
      }

      // پیدا کردن پکیج متناظر با productId
      const pkg = currentOffering.availablePackages.find(
        (p: any) => p.product.identifier === productId
      );
      if (!pkg) {
        throw new Error('این محصول یافت نشد: ' + productId);
      }

      onProgress({
        isProcessing: true,
        statusText: 'در حال باز شدن صفحه پرداخت گوگل...',
        error: null,
        success: false
      });

      const purchaseResult = await Purchases.purchasePackage({ aPackage: pkg });
      const entitlement = purchaseResult.customerInfo.entitlements.active[ENTITLEMENT_ID];

      if (entitlement) {
        const isVip = productId === PLAY_STORE_PRODUCTS.VIP_LIFETIME;
        const originalProfile = StorageManager.getProfile();
        const updated: UserProfile = {
          ...originalProfile,
          isActivated: true,
          subscriptionTier: isVip ? 'vip' : 'premium',
        };
        StorageManager.saveProfile(updated);

        onProgress({
          isProcessing: false,
          statusText: 'خرید با موفقیت تأیید شد!',
          error: null,
          success: true
        });
        onComplete(updated);
      } else {
        throw new Error('خرید انجام شد ولی تأیید نشد. لطفا با پشتیبانی تماس بگیرید.');
      }
    } catch (err: any) {
      // کاربر می‌تواند خرید را لغو کند - این خطا نیست
      const isCancelled = err?.code === 'PURCHASE_CANCELLED' || err?.userCancelled;
      onProgress({
        isProcessing: false,
        statusText: '',
        error: isCancelled ? null : (err?.message || 'خطا در فرآیند خرید'),
        success: false
      });
    }
  },

  // بازیابی خریدهای قبلی (وقتی کاربر اپ را روی دستگاه جدید نصب می‌کند)
  async restorePurchases(onComplete: (updatedProfile: UserProfile | null) => void) {
    if (!this.isNativeEnvironment()) {
      onComplete(null);
      return;
    }
    try {
      const result = await Purchases.restorePurchases();
      const entitlement = result.customerInfo.entitlements.active[ENTITLEMENT_ID];
      if (entitlement) {
        const profile = StorageManager.getProfile();
        const updated: UserProfile = {
          ...profile,
          isActivated: true,
          subscriptionTier: 'vip',
        };
        StorageManager.saveProfile(updated);
        onComplete(updated);
      } else {
        onComplete(null);
      }
    } catch (err) {
      console.error('restorePurchases error:', err);
      onComplete(null);
    }
  }
};
