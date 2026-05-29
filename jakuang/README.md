# 🪙 JakUang — Aplikasi Pengelolaan Keuangan & Pajak Pintar

**JakUang** adalah aplikasi asisten keuangan personal dan bisnis mikro (UMKM, Freelancer, Gig Worker, dan Karyawan) yang dirancang untuk melacak kekayaan bersih (*net worth*), aset, kewajiban, serta menghitung estimasi kewajiban pajak Penghasilan (PPh 21 / PPh Final UMKM) secara otomatis dan real-time. Aplikasi ini dilengkapi dengan klasifikasi transaksi bertenaga AI (Gemini) dan sinkronisasi data cloud melalui Firebase Firestore.

---

## ✨ Fitur Utama

1.  **Dashboard Keuangan Komprehensif**:
    *   Pemantauan Kekayaan Bersih (*Net Worth*), Total Aset, Kewajiban, dan Kas & Tabungan secara real-time.
    *   Statistik perubahan bulanan arus kas masuk dan keluar secara dinamis.
2.  **Visualisasi Data Interaktif**:
    *   Grafik Arus Kas Bulanan (Pemasukan vs Pengeluaran).
    *   Grafik Donut & Bar untuk Distribusi Aset.
    *   Grafik Estimasi Tren Pajak Tahunan.
3.  **AI Transaction Classifier & OCR**:
    *   Klasifikasi otomatis deskripsi transaksi ke kategori dan *routing type* perpajakan yang sesuai (seperti `ASSET_PURCHASE`, `LOAN_PAYMENT`, `EXPENSE`, `INCOME`) menggunakan AI Gemini.
4.  **Engine Pajak Terintegrasi (PPh 21 & PPh Final)**:
    *   Perhitungan PPh Pasal 21 untuk Karyawan Tetap/Kontrak dan Karyawan Harian.
    *   Perhitungan PPh Final UMKM (0.5%) dengan batas peredaran bruto tidak dikenai pajak Rp500 juta.
    *   Perhitungan pajak NPPN (Norma Penghitungan Penghasilan Netto) untuk Freelance, Kreatif, Gig Worker, Petani, Peternak, Nelayan, dan Pembudidaya Ikan.
5.  **Sinkronisasi Firebase Efisien**:
    *   Penyimpanan lokal cepat dengan sinkronisasi otomatis ke cloud Firestore menggunakan sistem *batched writes* untuk menghemat kuota dan mempercepat pemrosesan data.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 16 (App Router, Turbopack, Standalone Output)
*   **Styling**: Vanilla CSS (Tailwind UI design pattern)
*   **Database & Auth**: Firebase (Authentication & Cloud Firestore)
*   **AI Engine**: Google Gemini API (model 3.5 Flash)
*   **Charts**: Recharts (dioptimalkan untuk responsivitas)

---

## 🚀 Memulai di Lokal (Local Development)

### 1. Prasyarat
Pastikan Anda sudah menginstal **Node.js (v20+)** dan **npm** di mesin Anda.

### 2. Kloning Proyek & Install Dependency
```bash
git clone https://github.com/Abanggga/JakUang.git
cd jakuang
npm install
```

### 3. Konfigurasi Environment Variables
Buat file bernama `.env.local` di folder root proyek dan lengkapi konfigurasi berikut:

```env
# Firebase Client Config (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini API Key (Server-side)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_KEY_SECONDARY=your_backup_gemini_key

# Session Secret
SESSION_SECRET=string_random_untuk_enkripsi_session_cookie
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 🏗️ Struktur Folder Proyek

```text
jakuang/
├── src/
│   ├── app/                # Next.js Pages & API routes
│   │   ├── (auth)/         # Halaman Login, Register, & Onboarding
│   │   ├── (dashboard)/    # Halaman Dashboard, Input AI, & Ledger
│   │   └── api/ai/         # Route klasifikasi transaksi AI Gemini
│   ├── components/         # Komponen UI Reusable
│   │   ├── dashboard/      # Card, Tabel, & Chart carousel
│   │   ├── layout/         # Sidebar & Navigation
│   │   └── providers/      # Context Provider (Auth & Theme)
│   ├── lib/                # Engine & Utilitas Utama
│   │   ├── firebase/       # Inisialisasi & Helper Sync Firestore
│   │   ├── tax-engine/     # Logika kalkulasi PPh 21, UMKM, & NPPN
│   │   ├── utils/          # Storage utilitas lokal & converter mata uang
│   │   └── config/         # Konfigurasi konstanta UI
├── public/                 # Aset gambar statis
├── next.config.ts          # Konfigurasi Next.js (Standalone build enabled)
├── package.json            # Daftar package & script npm
└── Dockerfile              # Konfigurasi kontainerisasi untuk Cloud Run
```

---

## 🚢 Deployment ke Google Cloud Run

Aplikasi ini telah dioptimalkan untuk dideploy secara instan menggunakan kontainer Docker di **Google Cloud Run**.

### 1. Build-Time vs. Runtime Env Variables
*   **Build-time arguments (`NEXT_PUBLIC_*`)**: Harus dimasukkan pada saat proses build Docker dijalankan karena di-bake ke static JS bundle.
*   **Runtime variables (`GEMINI_API_KEY`, `SESSION_SECRET`)**: Cukup dimasukkan pada konfigurasi environment variables Google Cloud Run.

### 2. Perintah Build & Deploy (via Cloud Shell / CLI)

Jalankan perintah berikut di folder root aplikasi Anda:

```bash
# 1. Build image Docker di Cloud Registry
gcloud builds submit --tag gcr.io/[PROJECT_ID]/jakuang:latest \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..." \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="jakuang-xxxx.firebaseapp.com" \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="jakuang-xxxx" \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="jakuang-xxxx.firebasestorage.app" \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="xxxx" \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="1:xxxx:web:xxxx"

# 2. Deploy Container ke Cloud Run
gcloud run deploy jakuang \
  --image gcr.io/[PROJECT_ID]/jakuang:latest \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=AIzaSy...,SESSION_SECRET=default-jakuang-secret"
```

*Jangan lupa menambahkan domain URL Cloud Run yang dihasilkan ke **Authorized Domains** di halaman konsol Firebase Authentication Anda.*
