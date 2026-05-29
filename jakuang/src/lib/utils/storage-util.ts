"use client";

import { auth, db } from "../firebase/client";
import { doc, setDoc, writeBatch } from "firebase/firestore";

export interface ProfileData {
  name: string;
  email: string;
  npwp: string;
  activeProfiles: string[];
  ptkpStatus: string;
  kluCode: string;
  domisiliType: "ibukota_provinsi" | "ibukota_lainnya" | "daerah_lainnya";
}

const IS_SERVER = typeof window === "undefined";
let _initialized = false;

// ── Helpers ──

export function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (val !== undefined) {
          sanitized[key] = sanitizeObject(val);
        }
      }
    }
    return sanitized;
  }
  return obj;
}

/** Generate a unique ID with prefix to avoid collisions */
function uniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function safeGet(key: string, defaultValue: any) {
  if (IS_SERVER) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
}

function safeSet(key: string, value: any) {
  if (IS_SERVER) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

// ── Default empty data for new logged-in users ──

const EMPTY_PROFILE: ProfileData = {
  name: "Pengguna JakUang",
  email: "",
  npwp: "",
  activeProfiles: [],
  ptkpStatus: "TK/0",
  kluCode: "",
  domisiliType: "daerah_lainnya",
};

const DEFAULT_ACCOUNTS = [
  { id: "acc-1", name: "Kas Utama", type: "KAS_TUNAI", balance: 0 },
];

// ── Initialize ──

export function initializeStorage(force = false) {
  if (IS_SERVER) return;
  if (_initialized && !force) return;

  const currentUser = auth.currentUser;

  if (force || !localStorage.getItem("jakuang_profile")) {
    safeSet("jakuang_profile", {
      ...EMPTY_PROFILE,
      name: currentUser?.displayName || EMPTY_PROFILE.name,
      email: currentUser?.email || EMPTY_PROFILE.email,
    });
  }
  if (force || !localStorage.getItem("jakuang_transactions")) {
    safeSet("jakuang_transactions", []);
  }
  if (force || !localStorage.getItem("jakuang_accounts")) {
    safeSet("jakuang_accounts", DEFAULT_ACCOUNTS);
  }
  if (force || !localStorage.getItem("jakuang_assets")) {
    safeSet("jakuang_assets", []);
  }
  if (force || !localStorage.getItem("jakuang_liabilities")) {
    safeSet("jakuang_liabilities", []);
  }

  _initialized = true;
}

// ── Profile ──

export function getProfile(): ProfileData {
  initializeStorage();
  return safeGet("jakuang_profile", {
    ...EMPTY_PROFILE,
    name: auth.currentUser?.displayName || EMPTY_PROFILE.name,
    email: auth.currentUser?.email || EMPTY_PROFILE.email,
  });
}

export function saveProfile(profile: Partial<ProfileData>) {
  const current = getProfile();
  const updated = { ...current, ...profile };
  safeSet("jakuang_profile", updated);

  // Fire-and-forget Firestore write
  if (!IS_SERVER && auth.currentUser) {
    setDoc(doc(db, "users", auth.currentUser.uid), sanitizeObject(updated))
      .catch(e => console.error("Error writing profile to Firestore:", e));
  }
  return updated;
}

// ── Transactions ──

export function getTransactions(): any[] {
  initializeStorage();
  return safeGet("jakuang_transactions", []);
}

export function saveTransactions(transactions: any[]) {
  safeSet("jakuang_transactions", transactions);
}

// ── Accounts ──

export function getAccounts(): any[] {
  initializeStorage();
  return safeGet("jakuang_accounts", DEFAULT_ACCOUNTS);
}

export function saveAccounts(accounts: any[]) {
  safeSet("jakuang_accounts", accounts);
  batchWriteToFirestore("accounts", accounts);
}

// ── Assets ──

export function getAssets(): any[] {
  initializeStorage();
  return safeGet("jakuang_assets", []);
}

export function saveAssets(assets: any[]) {
  safeSet("jakuang_assets", assets);
  batchWriteToFirestore("assets", assets);
}

// ── Liabilities ──

export function getLiabilities(): any[] {
  initializeStorage();
  return safeGet("jakuang_liabilities", []);
}

export function saveLiabilities(liabilities: any[]) {
  safeSet("jakuang_liabilities", liabilities);
  batchWriteToFirestore("liabilities", liabilities);
}

// ── Batch Firestore Writer ──

function batchWriteToFirestore(subcollection: string, items: any[]) {
  if (IS_SERVER || !auth.currentUser || items.length === 0) return;
  const uid = auth.currentUser.uid;

  const batch = writeBatch(db);
  for (const item of items) {
    const ref = doc(db, "users", uid, subcollection, item.id);
    batch.set(ref, sanitizeObject(item));
  }
  batch.commit().catch(e =>
    console.error(`Error batch-writing ${subcollection} to Firestore:`, e)
  );
}

// ── Routing Effects Helper (shared between addTransaction and confirmTransaction) ──

function applyRoutingEffects(
  tx: any,
  accounts: any[],
  assets: any[],
  liabilities: any[]
) {
  const amount = tx.amount;
  const principal = tx.principalAmount || 0;
  const interest = tx.interestAmount || 0;
  const activeAccount = accounts[0] || { id: "acc-default", name: "Kas Utama", type: "KAS_TUNAI", balance: 0 };

  switch (tx.routingType) {
    case "INCOME":
      activeAccount.balance += amount;
      break;
    case "EXPENSE":
    case "PERSONAL":
      activeAccount.balance -= amount;
      break;
    case "ASSET_PURCHASE":
      activeAccount.balance -= amount;
      assets.push({
        id: uniqueId("ast"),
        name: tx.assetName || tx.description,
        category: tx.category || "ALAT_USAHA",
        sptCode: tx.sptAssetCode || "031",
        value: amount,
        date: tx.date?.split("T")[0] || new Date().toISOString().split("T")[0],
        status: "TUNAI",
      });
      break;
    case "ASSET_CREDIT": {
      const dp = amount - principal;
      activeAccount.balance -= dp;
      const linkedLiaId = uniqueId("lia");
      assets.push({
        id: uniqueId("ast"),
        name: tx.assetName || tx.description,
        category: tx.category || "KENDARAAN",
        sptCode: tx.sptAssetCode || "042",
        value: amount,
        date: tx.date?.split("T")[0] || new Date().toISOString().split("T")[0],
        status: "KREDIT",
        linkedLiabilityId: linkedLiaId,
      });
      liabilities.push({
        id: linkedLiaId,
        creditor: tx.creditorName || "Lembaga Pembiayaan",
        type: tx.loanType || "KKB",
        principal: principal,
        remaining: principal,
        startDate: tx.date?.split("T")[0] || new Date().toISOString().split("T")[0],
      });
      break;
    }
    case "LOAN_DISBURSEMENT":
      activeAccount.balance += amount;
      liabilities.push({
        id: uniqueId("lia"),
        creditor: tx.creditorName || tx.description,
        type: tx.loanType || "KUR",
        principal: amount,
        remaining: amount,
        startDate: tx.date?.split("T")[0] || new Date().toISOString().split("T")[0],
      });
      break;
    case "LOAN_PAYMENT":
      // Total payment = principal + interest, deducted from balance
      activeAccount.balance -= (principal + interest);
      if (liabilities.length > 0) {
        const matchingLia =
          liabilities.find(l =>
            l.creditor.toLowerCase().includes((tx.creditorName || "").toLowerCase())
          ) || liabilities[liabilities.length - 1];
        if (matchingLia) {
          matchingLia.remaining = Math.max(0, matchingLia.remaining - principal);
        }
      }
      break;
    case "TRANSFER":
      if (accounts.length > 1) {
        accounts[0].balance -= amount;
        accounts[1].balance += amount;
      }
      break;
  }
}

// ── Add Transaction ──

export function addTransaction(tx: {
  description: string;
  amount: number;
  routingType: string;
  profile: string | null;
  category: string;
  date: string;
  source: "OCR" | "VOICE" | "MANUAL";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  isConfirmed: boolean;
  assetName?: string;
  sptAssetCode?: string;
  creditorName?: string;
  loanType?: string;
  principalAmount?: number;
  interestAmount?: number;
}) {
  const transactions = getTransactions();
  const accounts = getAccounts();
  const assets = getAssets();
  const liabilities = getLiabilities();

  const newTx = {
    id: uniqueId("txn"),
    ...tx,
    type: tx.routingType === "INCOME" ? "INCOME" : "EXPENSE",
    isConfirmed: tx.isConfirmed,
  };

  transactions.unshift(newTx);
  saveTransactions(transactions);

  // Apply routing effects if transaction is confirmed
  if (tx.isConfirmed) {
    applyRoutingEffects(newTx, accounts, assets, liabilities);
    saveAccounts(accounts);
    saveAssets(assets);
    saveLiabilities(liabilities);
  }

  // Firestore write for added transaction
  if (!IS_SERVER && auth.currentUser) {
    const uid = auth.currentUser.uid;
    setDoc(doc(db, "users", uid, "transactions", newTx.id), sanitizeObject(newTx))
      .catch(e => console.error("Error writing transaction to Firestore:", e));
  }

  return newTx;
}

// ── Confirm Transaction ──

export function confirmTransaction(id: string) {
  const transactions = getTransactions();
  const txIndex = transactions.findIndex(t => t.id === id);
  if (txIndex === -1) return;

  const tx = transactions[txIndex];
  if (tx.isConfirmed) return;

  // 1. Mark as confirmed
  tx.isConfirmed = true;
  saveTransactions(transactions);

  // 2. Apply routing effects via shared helper
  const accounts = getAccounts();
  const assets = getAssets();
  const liabilities = getLiabilities();

  applyRoutingEffects(tx, accounts, assets, liabilities);

  saveAccounts(accounts);
  saveAssets(assets);
  saveLiabilities(liabilities);

  // 3. Write confirmed transaction to Firestore
  if (!IS_SERVER && auth.currentUser) {
    const uid = auth.currentUser.uid;
    setDoc(doc(db, "users", uid, "transactions", tx.id), sanitizeObject(tx))
      .catch(e => console.error("Error confirming transaction in Firestore:", e));
  }
}
