import { doc, getDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { db } from "./client";
import { 
  saveProfile, 
  saveTransactions, 
  saveAccounts, 
  saveAssets, 
  saveLiabilities,
  ProfileData,
  sanitizeObject,
  initializeStorage
} from "../utils/storage-util";

export async function syncFirestoreToLocalStorage(uid: string): Promise<boolean> {
  try {
    const profileRef = doc(db, "users", uid);
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      // Clear leftover local storage to prevent data inheritance from other users
      if (typeof window !== "undefined") {
        localStorage.removeItem("jakuang_profile");
        localStorage.removeItem("jakuang_transactions");
        localStorage.removeItem("jakuang_accounts");
        localStorage.removeItem("jakuang_assets");
        localStorage.removeItem("jakuang_liabilities");
      }
      initializeStorage(true);
      return false; // No profile found, needs onboarding
    }
    
    // Sync Profile
    const profileData = profileSnap.data() as ProfileData;
    saveProfile(profileData);
    
    // Sync Accounts
    const accountsRef = collection(db, "users", uid, "accounts");
    const accountsSnap = await getDocs(accountsRef);
    if (!accountsSnap.empty) {
      const accounts = accountsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      saveAccounts(accounts);
    } else {
      saveAccounts([
        { id: "acc-1", name: "Kas Utama", type: "KAS_TUNAI", balance: 0 },
        { id: "acc-2", name: "BCA Tabungan", type: "REKENING", balance: 0 },
      ]);
    }
    
    // Sync Assets
    const assetsRef = collection(db, "users", uid, "assets");
    const assetsSnap = await getDocs(assetsRef);
    if (!assetsSnap.empty) {
      const assets = assetsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      saveAssets(assets);
    } else {
      saveAssets([]);
    }

    // Sync Liabilities
    const liabilitiesRef = collection(db, "users", uid, "liabilities");
    const liabilitiesSnap = await getDocs(liabilitiesRef);
    if (!liabilitiesSnap.empty) {
      const liabilities = liabilitiesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      saveLiabilities(liabilities);
    } else {
      saveLiabilities([]);
    }

    // Sync Transactions
    const transactionsRef = collection(db, "users", uid, "transactions");
    const transactionsSnap = await getDocs(transactionsRef);
    if (!transactionsSnap.empty) {
      const transactions = transactionsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by date desc
      transactions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      saveTransactions(transactions);
    } else {
      saveTransactions([]);
    }
    
    return true;
  } catch (error) {
    console.error("Error syncing from Firestore:", error);
    return false;
  }
}

export async function syncLocalStorageToFirestore(
  uid: string,
  profile: ProfileData,
  transactions: any[],
  accounts: any[],
  assets: any[],
  liabilities: any[]
) {
  try {
    // Use batched writes for efficiency (max 500 per batch)
    const batch = writeBatch(db);

    // Save Profile
    const profileRef = doc(db, "users", uid);
    batch.set(profileRef, sanitizeObject(profile));

    // Save Accounts
    for (const acc of accounts) {
      const ref = doc(db, "users", uid, "accounts", acc.id);
      batch.set(ref, sanitizeObject(acc));
    }

    // Save Assets
    for (const ast of assets) {
      const ref = doc(db, "users", uid, "assets", ast.id);
      batch.set(ref, sanitizeObject(ast));
    }

    // Save Liabilities
    for (const lia of liabilities) {
      const ref = doc(db, "users", uid, "liabilities", lia.id);
      batch.set(ref, sanitizeObject(lia));
    }

    // Save Transactions (limit to latest 50 to prevent over quota during onboarding seed)
    const latestTx = transactions.slice(0, 50);
    for (const tx of latestTx) {
      const ref = doc(db, "users", uid, "transactions", tx.id);
      batch.set(ref, sanitizeObject(tx));
    }

    await batch.commit();
  } catch (error) {
    console.error("Error syncing to Firestore:", error);
  }
}
