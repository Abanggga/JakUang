import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

function initFirebaseAdmin() {
  if (getApps().length > 0) return;

  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      // In production (Cloud Run), application default credentials will be used automatically
      initializeApp({
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    // Fallback or empty initialization so dependencies don't crash compile time
    initializeApp();
  }
}

initFirebaseAdmin();

export const adminDb = getFirestore();
export const adminAuth = getAuth();
export const adminStorage = getStorage();
