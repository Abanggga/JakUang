"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { syncFirestoreToLocalStorage } from "@/lib/firebase/auth-helper";
import Image from "next/image";

const AuthContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setSyncing(true);
        try {
          await syncFirestoreToLocalStorage(currentUser.uid);
        } catch (e) {
          console.error("Auth provider sync error:", e);
        } finally {
          setSyncing(false);
        }
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  // Redirection and Guard Logic
  useEffect(() => {
    if (initializing || syncing) return;

    const isAuthPath = ["/login", "/register"].includes(pathname);
    const isOnboardingPath = pathname === "/onboarding";
    const isDashboardPath = [
      "/dashboard",
      "/ledger",
      "/assets",
      "/liabilities",
      "/cash",
      "/tax-export",
      "/input",
      "/settings",
    ].some(path => pathname.startsWith(path)) || pathname === "/";

    if (user) {
      // Check if user profile is loaded in localStorage
      const profileStr = localStorage.getItem("jakuang_profile");
      let hasProfile = false;
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          hasProfile = Array.isArray(profile.activeProfiles) && profile.activeProfiles.length > 0;
        } catch (e) {
          // invalid json
        }
      }

      if (!hasProfile) {
        if (!isOnboardingPath) {
          router.push("/onboarding");
        }
      } else {
        if (isAuthPath || isOnboardingPath) {
          router.push("/dashboard");
        }
      }
    } else {
      if (isDashboardPath || isOnboardingPath) {
        router.push("/login");
      }
    }
  }, [user, initializing, syncing, pathname, router]);

  const isLoading = initializing || syncing;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F6F9FF] via-[#E5DEFF] to-[#F6F9FF] p-4">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#5A45CB]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" />

        <div className="relative z-10 flex flex-col items-center space-y-6">
          <div className="relative h-20 w-20 animate-bounce">
            <Image
              src="/logo.png"
              alt="JakUang Logo"
              width={80}
              height={80}
              className="object-contain rounded-2xl shadow-xl shadow-[#5A45CB]/10"
              priority
            />
          </div>
          <div className="flex flex-col items-center space-y-2 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5A45CB] to-[#7360E5] bg-clip-text text-transparent tracking-tight">
              JakUang
            </h1>
            <p className="text-sm text-muted-foreground animate-pulse font-medium">
              Memuat data keuangan Anda...
            </p>
          </div>
          {/* Modern Premium Spinner */}
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-[#5A45CB]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#5A45CB] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading: isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
