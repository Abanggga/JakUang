Jakuang
Pajak & Uang  ·  Bijak & Uang
Product Requirements Document
Financial OS untuk Seluruh Lapisan Pekerja Indonesia
Versi 1.0  |  Platform: Next.js Web  |  Deploy: Docker → Google Cloud Run

1. Visi & Tagline
Jakuang (Pajak & Uang / Bijak & Uang) adalah Financial OS berbasis web yang membantu seluruh lapisan pekerja Indonesia — dari karyawan kantoran, UMKM, freelancer, petani, peternak, hingga nelayan — mengelola keuangan dan memenuhi kewajiban pajak secara otomatis melalui teknologi AI.

"Satu foto nota. Satu input suara. Laporan pajak siap lapor."

2. Changelog
Versi	Perubahan Utama
v1.0	Rilis pertama Jakuang. Rebranding dari SakuBijak. Platform: Next.js Web. Stack: Next.js 14 + Tailwind + shadcn/ui. Deploy: Docker → Cloud Run. Fitur: Multi-income profiling (9 profil), Financial Ledger, Asset & Liability Tracking, Interactive Dashboard dengan grafik swipeable.

3. Sasaran Pengguna
Jakuang mendukung 9 profil pendapatan yang dapat diaktifkan secara bersamaan (multi-income profiling):

Profil	Contoh Pengguna	Mekanisme Pajak
Karyawan Tetap/Kontrak	Staf kantor, PNS, pegawai swasta	PPh 21 TER + Progresif Pasal 17
Karyawan Tidak Tetap	Pekerja harian, mingguan	PPh 21 (bebas s.d. Rp2,5jt/hari)
UMKM	Toko kelontong, online shop, warung	PPh Final 0,5% (bebas s.d. Rp500jt/thn)
Freelance & Profesional	Desainer, fotografer, dokter, notaris	PPh 21 Non-Pegawai + NPPN per KLU
Ekonomi Kreatif	YouTuber, influencer, penulis, musisi	NPPN KLU 90002 (50%)
Gig & Informal	Driver ojek online, kurir, tukang	PPh 21 Non-Pegawai
Petani & Pekebun	Petani padi, sayur, sawit, kopi	NPPN per KLU (10–15%)
Peternak	Peternak sapi, ayam, kambing	NPPN per KLU (9–11%)
Nelayan & Pembudidaya	Nelayan laut, tambak, kolam ikan	NPPN per KLU (22–25%)

4. Arsitektur Financial Ledger
Semua transaksi diklasifikasikan ke empat ledger utama. Gemini AI menentukan routing secara otomatis:

Ledger	Isi	Contoh	Output SPT
Pendapatan & Pengeluaran	Arus kas operasional	Gaji, penjualan, beli bahan baku	PKP & pajak terutang
Aset	Harta yang dimiliki	Beli motor, tanah, laptop, traktor	Daftar Harta SPT (011–044)
Kewajiban	Hutang & pinjaman	KPR, KKB, KUR, pinjaman online	Daftar Kewajiban SPT
Kas & Tabungan	Saldo rekening & kas tunai	Transfer, top-up, tarik tunai	Daftar Harta SPT (041)

5. Fitur Utama MVP
5.1 Onboarding — Advanced Tax Profiling
4 langkah onboarding untuk setup profil lengkap:
Langkah	Pertanyaan	Input
1	Dari mana saja penghasilanmu?	Multi-select: 9 profil tersedia
2	Status PTKP?	TK/0, K/0, K/1, K/2, K/3
3	Kota domisili termasuk?	Ibukota Provinsi / Ibukota Lainnya / Daerah Lainnya
4 (kondisional)	KLU terdaftar di DJP?	Ya → input KLU / Tidak → sistem assign default

5.2 Multimodal AI Input (Snap & Speak)
•	Foto nota / struk / invoice / bukti potong — OCR via Gemini API
•	Input suara kasual — speech-to-text via Gemini API
•	Input manual via form
•	Semua input di-routing otomatis ke ledger yang tepat dengan Confirm-First pattern

5.3 Interactive Dashboard
Dashboard utama menampilkan ringkasan finansial dengan komponen interaktif:

Widget	Deskripsi	Interaksi
Summary Cards	4 kartu: Kekayaan Bersih, Total Aset, Total Kewajiban, Kas & Tabungan	Klik untuk detail
Grafik Swipeable	Carousel grafik yang bisa digeser — lihat penjelasan di bawah	Swipe kiri/kanan atau tab selector
Ringkasan Kas & Tabungan	Menampilkan saldo masing-masing rekening & kas tunai	Tambah rekening, lihat detail
Aktivitas Terbaru	10 transaksi terbaru yang dialihkan oleh AI	Klik untuk edit/konfirmasi
Tax Monitoring	Estimasi pajak terutang per profil, progress omzet UMKM, countdown 7 tahun fasilitas	Klik untuk detail laporan

5.4 Grafik Swipeable — Spesifikasi Detail
Grafik ditampilkan dalam carousel horizontal yang bisa digeser. User dapat berpindah antar tipe grafik dengan swipe atau klik tab di atas carousel.

Urutan	Tipe Grafik	Library	Filter Tersedia	Deskripsi
1	Sebaran Aset (Donut Chart)	Recharts PieChart	Per kategori aset	Proporsi harta: Properti, Kendaraan, Alat Usaha, Kas, dll
2	Pemasukan vs Pengeluaran (Line Chart)	Recharts LineChart	Hari / Minggu / Bulan / Tahun	Tren pemasukan (hijau) dan pengeluaran (merah) dalam satu grafik
3	Komposisi Pendapatan per Profil (Bar Chart)	Recharts BarChart	Bulan / Tahun	Perbandingan pendapatan UMKM vs Karyawan vs Freelance dll
4	Estimasi Pajak Bulanan (Area Chart)	Recharts AreaChart	Bulan / Tahun	Akumulasi estimasi pajak terutang per bulan
5	Net Worth Trend (Line Chart)	Recharts LineChart	Bulan / Tahun	Tren kekayaan bersih (Aset − Kewajiban) dari waktu ke waktu

Catatan Implementasi Grafik
Filter hari/minggu/bulan/tahun pada Line Chart mengubah granularitas data yang di-query dari Firestore.
Semua grafik menggunakan Recharts — sudah terintegrasi dengan shadcn/ui chart component.
Carousel diimplementasikan dengan CSS scroll-snap atau library embla-carousel.
Tab selector di atas carousel menampilkan nama grafik aktif dan indikator titik (dot indicator).

5.5 Asset & Liability Tracking
Event	Contoh Input	Efek Ledger
Beli aset tunai	Beli motor Rp18jt	Aset +18jt | Kas -18jt
Beli aset kredit	DP motor Rp3jt + KKB Rp15jt	Aset +18jt | Kas -3jt | Kewajiban +15jt
Cair pinjaman	Cair KUR Rp50jt	Kas +50jt | Kewajiban +50jt
Bayar cicilan	Cicilan KUR Rp2,5jt (pokok 2,3jt + bunga 200rb)	Kas -2,5jt | Kewajiban -2,3jt | Biaya Bunga +200rb

5.6 Tax Export
Satu klik menghasilkan 3 sheet CSV siap lapor SPT 1770:
•	Sheet 1 — Penghasilan & Pajak Terutang: dasar kalkulasi PPh per profil
•	Sheet 2 — Daftar Harta: aset + saldo rekening dengan kode SPT
•	Sheet 3 — Daftar Kewajiban: sisa hutang per akhir periode

6. Syarat & Ketentuan Per Profil (Ringkasan)
Profil	Syarat Utama	Batas Kena Pajak (TK/0)	Warning di App
Karyawan Tetap	Tanpa NPWP = tarif +20%. Biaya jabatan 5% maks Rp500rb/bln.	Sesuai PTKP + TER	Alert jika tidak ada NPWP
Karyawan Harian	Upah ≤ Rp2,5jt/hari DAN kumulatif ≤ Rp2,5jt/bulan = bebas pajak	Akumulatif Rp2.500.000/bln	Progress bar akumulasi
Freelance & Profesional	NPPN wajib notifikasi DJP sebelum 31 Maret. Omzet < Rp4,8 Miliar.	Rp108jt/thn (NPPN 50%)	Reminder 31 Maret tiap tahun
Dokter / Content Creator	Bisa pilih: NPPN, PPh Final UMKM, atau dipotong pihak ketiga	Rp108jt/thn	Tampilkan estimasi 3 opsi
UMKM	Bebas pajak s.d. Rp500jt. PPh Final 0,5% berlaku maks 7 tahun.	Rp500jt/thn	Progress bar + countdown 7thn
Petani Padi	NPPN 15%, notifikasi DJP sama dengan freelance	Rp360jt/thn	Warning mendekati batas
Peternak	NPPN 9% — tarif terendah	Rp600jt/thn	Warning mendekati batas
Nelayan/Pembudidaya	NPPN 22–25%	Rp245jt/thn	Warning mendekati batas

7. Arsitektur Teknologi
Layer	Teknologi	Fungsi
Frontend	Next.js 14 + Tailwind CSS + shadcn/ui	UI web responsive, sidebar, SSR
Backend	Next.js API Routes (TypeScript)	Gemini call, Tax Engine, Firestore Admin — server-side only
AI Engine	Gemini API (Google AI SDK JS)	OCR nota, speech-to-text, klasifikasi & routing transaksi
Tax Engine	TypeScript (Deterministik)	Hitung PPh — tidak menggunakan AI
Database	Firebase Firestore	Persistensi transaksi, aset, kewajiban, profil
Storage	Firebase Cloud Storage	Foto nota & bukti transaksi
Auth	Firebase Auth (Google Sign-In + Email)	Session via httpOnly cookie
Charts	Recharts + shadcn/ui chart	Semua grafik dashboard
Carousel	embla-carousel	Grafik swipeable
Deploy	Docker → Google Cloud Run	Container tunggal, auto HTTPS

8. Standar Keamanan (Ringkasan)
Item	Standar	Prioritas
Firestore Security Rules	uid-based — user hanya akses data sendiri	Wajib
Session Cookie	httpOnly cookie — tidak di localStorage	Wajib
API Keys	Server-side only di API Routes	Wajib
Secret Manager	Google Secret Manager di Cloud Run	Wajib
HTTPS	Otomatis via Cloud Run	Otomatis
NPWP Masking	12.345.XXX.X-XXX.XXX di UI	Wajib
Input Validation	Zod schema di setiap API route	Recommended

9. Kriteria Keberhasilan
Metrik	Target
Akurasi klasifikasi transaksi ke ledger	≥ 85%
Akurasi routing aset vs pengeluaran biasa	≥ 90%
Akurasi kalkulasi pajak (deterministik)	100%
Coverage profil	9 profil + kombinasi multi-profile
Grafik swipeable	5 tipe grafik, filter hari/minggu/bulan/tahun
Kelengkapan export SPT	3 sheet: Penghasilan, Harta, Kewajiban
Waktu onboarding	< 60 detik

10. Disclaimer
Disclaimer Wajib (Tampil di UI & Dokumen Ekspor)
Estimasi pajak dan laporan keuangan Jakuang adalah kalkulasi otomatis berdasarkan data yang diinput pengguna
dan tidak merupakan konsultasi pajak atau keuangan resmi.

Untuk keputusan pelaporan pajak final, konsultasikan dengan konsultan pajak terdaftar atau KPP setempat.

Referensi regulasi: UU HPP, PP No. 55/2022, PER-17/PJ/2015.

