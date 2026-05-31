"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase/client";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { saveProfile } from "@/lib/utils/storage-util";
import { syncFirestoreToLocalStorage } from "@/lib/firebase/auth-helper";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update display name
      await updateProfile(user, { displayName: name });
      
      // Save local profile info
      saveProfile({
        name: name,
        email: email,
      });

      router.push("/onboarding");
    } catch (err: any) {
      console.error("Register error:", err);
      let errMsg = "Gagal membuat akun.";
      if (err.code === "auth/email-already-in-use") {
        errMsg = "Email sudah digunakan oleh akun lain.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Format email tidak valid.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password terlalu lemah (minimal 6 karakter).";
      } else if (err.code) {
        errMsg = err.message;
      }
      setError(errMsg);
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      
      // Sync from Firestore to LocalStorage if user exists
      const hasProfile = await syncFirestoreToLocalStorage(user.uid);
      
      if (hasProfile) {
        router.push("/dashboard");
      } else {
        // Save local profile info
        saveProfile({
          name: user.displayName || "Pengguna JakUang",
          email: user.email || "",
        });
        router.push("/onboarding");
      }
    } catch (err: any) {
      console.error("Google Register error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Gagal daftar menggunakan Google.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F6F9FF] via-[#E5DEFF] to-[#F6F9FF] p-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#5A45CB]/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-2xl shadow-[#5A45CB]/5">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="flex justify-center">
            <div className="relative h-14 w-14">
              <Image src="/logo.png" alt="JakUang" fill className="object-contain rounded-xl" priority />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#5A45CB] to-[#7360E5] bg-clip-text text-transparent">
              Buat Akun JakUang
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Mulai kelola keuangan & pajak Anda
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-2">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3.5 rounded-xl border border-red-200 flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-name">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="register-name" 
                  placeholder="Contoh Nama" 
                  className="pl-10" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="register-email" 
                  type="email" 
                  placeholder="contoh@email.com" 
                  className="pl-10" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="terms" className="mt-1" required />
              <Label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                Saya menyetujui{" "}
                <a href="#" className="text-[#5A45CB] hover:underline">Syarat & Ketentuan</a>
                {" "}dan{" "}
                <a href="#" className="text-[#5A45CB] hover:underline">Kebijakan Privasi</a>
                {" "}JakUang.
              </Label>
            </div>

            <Button type="submit" className="w-full bg-[#5A45CB] hover:bg-[#442BB5] text-white font-medium h-11 cursor-pointer" disabled={loading}>
              {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Daftar"}
            </Button>
          </form>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">atau</span>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-11 gap-3 font-medium cursor-pointer" 
            onClick={handleGoogleRegister}
            disabled={loading}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Daftar dengan Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-[#5A45CB] font-medium hover:underline">Masuk</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
