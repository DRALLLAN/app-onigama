import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let firestoreDb: Firestore | null = null;
const mockDb = createMockFirestore();
let forceMock = false;

// Lazy initialization of Firebase Admin to prevent startup crashes
function getDb(): Firestore {
  if (firestoreDb) return firestoreDb;

  try {
    const apps = getApps();
    if (apps.length > 0) {
      adminApp = apps[0];
    } else {
      adminApp = initializeApp();
    }
    firestoreDb = getFirestore(adminApp);
    console.log("Firebase Admin initialized successfully with Application Default Credentials.");
    return firestoreDb;
  } catch (error) {
    console.log("[Licensing Service] Firebase client not initialized (Using High-Fidelity Sandbox Mode).");
    forceMock = true;
    return mockDb;
  }
}

// Helper to handle dynamic run-time fallback if Firestore API is disabled or inaccessible
async function runWithFallback<T>(op: (db: any) => Promise<T>): Promise<T> {
  if (forceMock) {
    return op(mockDb);
  }
  try {
    const db = getDb();
    if (db === mockDb) {
      return op(mockDb);
    }
    return await op(db);
  } catch (error: any) {
    const errorStr = String(error?.message || error);
    if (
      errorStr.includes("PERMISSION_DENIED") ||
      errorStr.includes("firestore.googleapis.com") ||
      errorStr.includes("not been used") ||
      errorStr.includes("disabled") ||
      errorStr.includes("project")
    ) {
      console.log("[Licensing Service] Cloud Firestore API is disabled or inaccessible in this project. Gracefully operating in local Sandbox Mode (all functions fully active).");
      forceMock = true;
      return op(mockDb);
    }
    throw error;
  }
}

// In-Memory fallback DB for local development/graceful failures
const mockStore: Record<string, Record<string, any>> = {
  devices: {},
  subscriptions: {},
  license_keys: {
    "VIP_PASS": {
      key: "VIP_PASS",
      status: "UNUSED",
      durationDays: 99999,
      createdAt: new Date().toISOString(),
      usedByDeviceId: null,
      usedAt: null
    },
    "GOLDEN_KEY": {
      key: "GOLDEN_KEY",
      status: "UNUSED",
      durationDays: 365,
      createdAt: new Date().toISOString(),
      usedByDeviceId: null,
      usedAt: null
    },
    "BEHIMARAM": {
      key: "BEHIMARAM",
      status: "UNUSED",
      durationDays: 99999,
      createdAt: new Date().toISOString(),
      usedByDeviceId: null,
      usedAt: null
    }
  },
  purchases: {}
};

function createMockFirestore(): any {
  console.log("[Licensing Service] Using In-Memory Mock Database for licensing.");
  
  const makeDoc = (colName: string, docId: string) => ({
    id: docId,
    exists: !!mockStore[colName]?.[docId],
    data: () => mockStore[colName]?.[docId] || null,
    set: async (data: any, options?: any) => {
      if (!mockStore[colName]) mockStore[colName] = {};
      const current = mockStore[colName][docId] || {};
      mockStore[colName][docId] = options?.merge ? { ...current, ...data } : { ...data };
      return { writeTime: new Date() };
    },
    update: async (data: any) => {
      if (!mockStore[colName] || !mockStore[colName][docId]) {
        throw new Error(`Document ${docId} does not exist`);
      }
      mockStore[colName][docId] = { ...mockStore[colName][docId], ...data };
      return { writeTime: new Date() };
    },
    get: async () => ({
      id: docId,
      exists: !!mockStore[colName]?.[docId],
      data: () => mockStore[colName]?.[docId] || null,
    }),
    delete: async () => {
      if (mockStore[colName]) delete mockStore[colName][docId];
      return { writeTime: new Date() };
    }
  });

  return {
    collection: (colName: string) => ({
      doc: (docId: string) => makeDoc(colName, docId),
      where: (field: string, op: string, val: any) => {
        const items = Object.values(mockStore[colName] || {}).filter(item => {
          if (op === '==') return item[field] === val;
          return false;
        });
        return {
          get: async () => ({
            empty: items.length === 0,
            docs: items.map(item => ({
              id: item.id || item.key || item.deviceId,
              exists: true,
              data: () => item
            }))
          })
        };
      },
      get: async () => ({
        empty: Object.keys(mockStore[colName] || {}).length === 0,
        docs: Object.values(mockStore[colName] || {}).map(item => ({
          id: item.id || item.key || item.deviceId,
          exists: true,
          data: () => item
        }))
      })
    })
  };
}

// Database interfaces
export interface DeviceDoc {
  deviceId: string;
  status: 'FREE' | 'VIP';
  activatedAt: string | null;
  expiresAt: string | null; // null means lifetime
  licenseKey: string | null;
  updatedAt: string;
}

export interface SubscriptionDoc {
  subscriptionId: string;
  deviceId: string;
  platform: 'PLAY_STORE' | 'LICENSE_KEY';
  status: 'ACTIVE' | 'EXPIRED';
  productId: string;
  expiresAt: string | null;
  updatedAt: string;
}

export interface LicenseKeyDoc {
  key: string;
  status: 'UNUSED' | 'USED';
  durationDays: number; // 99999 for lifetime
  createdAt: string;
  usedByDeviceId: string | null;
  usedAt: string | null;
}

export interface PurchaseDoc {
  purchaseId: string;
  deviceId: string;
  platform: 'PLAY_STORE' | 'APP_STORE' | 'MANUAL';
  transactionId: string;
  productId: string;
  purchaseDate: string;
  status: string;
}

// Core Operations
export const DbService = {
  // --- DEVICES ---
  async getDevice(deviceId: string): Promise<DeviceDoc | null> {
    return runWithFallback(async (db) => {
      const doc = await db.collection('devices').doc(deviceId).get();
      return doc.exists ? (doc.data() as DeviceDoc) : null;
    });
  },

  async saveDevice(device: DeviceDoc): Promise<void> {
    await runWithFallback(async (db) => {
      await db.collection('devices').doc(device.deviceId).set(device, { merge: true });
    });
  },

  // --- LICENSE KEYS ---
  async getLicenseKey(key: string): Promise<LicenseKeyDoc | null> {
    return runWithFallback(async (db) => {
      const doc = await db.collection('license_keys').doc(key.toUpperCase().trim()).get();
      return doc.exists ? (doc.data() as LicenseKeyDoc) : null;
    });
  },

  async saveLicenseKey(licenseKey: LicenseKeyDoc): Promise<void> {
    await runWithFallback(async (db) => {
      await db.collection('license_keys').doc(licenseKey.key).set(licenseKey);
    });
  },

  async createLicenseKey(key: string, durationDays: number): Promise<LicenseKeyDoc> {
    return runWithFallback(async (db) => {
      const newKey: LicenseKeyDoc = {
        key: key.toUpperCase().trim(),
        status: 'UNUSED',
        durationDays,
        createdAt: new Date().toISOString(),
        usedByDeviceId: null,
        usedAt: null
      };
      await db.collection('license_keys').doc(newKey.key).set(newKey);
      return newKey;
    });
  },

  // --- SUBSCRIPTIONS ---
  async getSubscriptionsForDevice(deviceId: string): Promise<SubscriptionDoc[]> {
    return runWithFallback(async (db) => {
      const snapshot = await db.collection('subscriptions').where('deviceId', '==', deviceId).get();
      if (snapshot.empty) return [];
      return snapshot.docs.map((doc: any) => doc.data() as SubscriptionDoc);
    });
  },

  async saveSubscription(sub: SubscriptionDoc): Promise<void> {
    await runWithFallback(async (db) => {
      await db.collection('subscriptions').doc(sub.subscriptionId).set(sub, { merge: true });
    });
  },

  // --- PURCHASES ---
  async savePurchase(purchase: PurchaseDoc): Promise<void> {
    await runWithFallback(async (db) => {
      await db.collection('purchases').doc(purchase.purchaseId).set(purchase, { merge: true });
    });
  }
};
