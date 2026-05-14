Jakuang
Pajak & Uang  ·  Bijak & Uang
Technical Documentation
Architecture, API Routes, Tax Engine & Database Schema
Versi 1.0  |  Next.js 14 + TypeScript + Firebase + Gemini API

1. Arsitektur Sistem
Layer	Teknologi	Pattern
Frontend	Next.js 14 App Router + Tailwind CSS + shadcn/ui	Server Components + Client Components
Backend	Next.js API Routes (TypeScript)	Polymorphic Tax Engine, Repository Pattern
AI	Gemini API (Google AI SDK JS)	Multimodal: image + text → JSON
Database	Firebase Firestore	NoSQL Document Store
Storage	Firebase Cloud Storage	Blob storage untuk foto nota
Auth	Firebase Auth	httpOnly session cookie
Charts	Recharts + shadcn chart	Client-side rendering
Carousel	embla-carousel-react	CSS scroll-snap based
Validation	Zod	Schema validation di API routes
Deploy	Docker + Google Cloud Run	Single container, auto HTTPS

1.1 Struktur Folder Project
jakuang/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              // Sidebar layout
│   │   ├── dashboard/page.tsx      // Main dashboard + grafik
│   │   ├── ledger/page.tsx         // Transaksi + AI input
│   │   ├── assets/page.tsx         // Daftar harta
│   │   ├── liabilities/page.tsx    // Daftar kewajiban
│   │   ├── cash/page.tsx           // Kas & tabungan
│   │   └── tax-export/page.tsx     // Laporan & ekspor SPT
│   └── api/
│       ├── auth/session/route.ts
│       ├── ai/
│       │   ├── classify/route.ts   // Gemini classifier
│       │   └── ocr/route.ts        // OCR nota
│       ├── tax/
│       │   └── calculate/route.ts  // Tax Engine endpoint
│       ├── transactions/route.ts
│       ├── assets/route.ts
│       ├── liabilities/route.ts
│       ├── accounts/route.ts
│       ├── charts/
│       │   ├── asset-distribution/route.ts
│       │   ├── cashflow/route.ts   // Filter: day/week/month/year
│       │   ├── income-by-profile/route.ts
│       │   ├── tax-trend/route.ts
│       │   └── networth-trend/route.ts
│       └── export/spt/route.ts
├── lib/
│   ├── tax-engine/
│   │   ├── base.ts                 // Abstract TaxProfile class
│   │   ├── karyawan.ts
│   │   ├── karyawan-harian.ts
│   │   ├── umkm.ts
│   │   ├── freelance.ts
│   │   ├── nppn.ts                 // NPPN calculator
│   │   ├── nppn-klu.json           // KLU rate table
│   │   └── index.ts               // TaxEngineFactory
│   ├── firebase/
│   │   ├── admin.ts
│   │   └── client.ts
│   ├── gemini/
│   │   ├── client.ts
│   │   └── prompts.ts
│   ├── repositories/
│   │   ├── base.repository.ts
│   │   ├── transaction.repository.ts
│   │   ├── asset.repository.ts
│   │   ├── liability.repository.ts
│   │   └── account.repository.ts
│   └── utils/
│       ├── mask.ts                 // NPWP masking
│       └── currency.ts
├── components/
│   ├── ui/                         // shadcn/ui components
│   ├── layout/
│   │   └── sidebar.tsx
│   ├── dashboard/
│   │   ├── summary-cards.tsx
│   │   ├── chart-carousel.tsx      // Swipeable chart container
│   │   ├── charts/
│   │   │   ├── asset-donut.tsx
│   │   │   ├── cashflow-line.tsx
│   │   │   ├── income-bar.tsx
│   │   │   ├── tax-area.tsx
│   │   │   └── networth-line.tsx
│   │   ├── account-summary.tsx
│   │   ├── recent-activity.tsx
│   │   └── tax-monitor.tsx
│   ├── ledger/
│   │   ├── ai-input-bar.tsx        // Foto/Suara/Manual
│   │   └── confirm-card.tsx        // Confirm-First UI
│   └── shared/
│       └── npwp-display.tsx
├── Dockerfile
├── .env.local
└── docker-compose.yml

1.2 Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]

2. Polymorphic Tax Engine
Tax Engine menggunakan pola polimorfisme — setiap profil pajak adalah class yang mengimplementasikan interface TaxProfile. TaxEngineFactory memilih implementasi yang tepat berdasarkan profil aktif user.

// lib/tax-engine/base.ts
export interface TaxResult {
  profile: string;
  grossIncome: number;
  netIncome: number;
  taxableIncome: number;  // PKP
  taxDue: number;         // Pajak terutang
  breakdown: TaxBreakdown[];
}

export abstract class TaxProfile {
  abstract readonly profileType: string;
  abstract calculate(input: TaxInput): TaxResult;
  protected progressiveTax(pkp: number): number {
    const brackets = [
      { limit: 60_000_000,    rate: 0.05 },
      { limit: 190_000_000,   rate: 0.15 },
      { limit: 250_000_000,   rate: 0.25 },
      { limit: 4_500_000_000, rate: 0.30 },
      { limit: Infinity,      rate: 0.35 },
    ];
    let tax = 0; let remaining = pkp;
    for (const b of brackets) {
      const taxable = Math.min(remaining, b.limit);
      tax += taxable * b.rate;
      remaining -= taxable;
      if (remaining <= 0) break;
    }
    return tax;
  }
}

// lib/tax-engine/karyawan.ts
export class KaryawanTaxProfile extends TaxProfile {
  readonly profileType = 'KARYAWAN';
  calculate(input: TaxInput): TaxResult {
    const biayaJabatan = Math.min(input.grossIncome * 0.05, 6_000_000);
    const neto = input.grossIncome - biayaJabatan - (input.bpjsEmployee ?? 0);
    const pkp = Math.max(0, neto - input.ptkp);
    return { profile: 'KARYAWAN', grossIncome: input.grossIncome,
             netIncome: neto, taxableIncome: pkp,
             taxDue: this.progressiveTax(pkp), breakdown: [] };
  }
}

// lib/tax-engine/nppn.ts
export class NPPNTaxProfile extends TaxProfile {
  readonly profileType: string;
  constructor(private klu: string, private domisili: DomisiliType) {
    super(); this.profileType = klu;
  }
  calculate(input: TaxInput): TaxResult {
    const rate = getNPPNRate(this.klu, this.domisili);
    const neto = input.grossIncome * rate;
    const pkp  = Math.max(0, neto - input.ptkp);
    return { profile: this.profileType, grossIncome: input.grossIncome,
             netIncome: neto, taxableIncome: pkp,
             taxDue: this.progressiveTax(pkp), breakdown: [] };
  }
}

// lib/tax-engine/umkm.ts
export class UMKMTaxProfile extends TaxProfile {
  readonly profileType = 'UMKM';
  calculate(input: TaxInput): TaxResult {
    const threshold = 500_000_000;
    const taxable   = Math.max(0, input.grossIncome - threshold);
    return { profile: 'UMKM', grossIncome: input.grossIncome,
             netIncome: input.grossIncome, taxableIncome: taxable,
             taxDue: taxable * 0.005, breakdown: [] };
  }
}

// lib/tax-engine/index.ts — Factory
export class TaxEngineFactory {
  static create(profile: ProfileType, klu?: string, domisili?: DomisiliType): TaxProfile {
    switch (profile) {
      case 'KARYAWAN':     return new KaryawanTaxProfile();
      case 'UMKM':         return new UMKMTaxProfile();
      case 'FREELANCE':
      case 'PETANI':
      case 'PETERNAK':
      case 'NELAYAN':
      case 'PEMBUDIDAYA':  return new NPPNTaxProfile(klu!, domisili!);
      default: throw new Error(`Unknown profile: ${profile}`);
    }
  }
  static calculateAll(profiles: ProfileInput[]): TaxResult[] {
    return profiles.map(p => this.create(p.type, p.klu, p.domisili).calculate(p.input));
  }
}

3. Transaction Routing Engine
Gemini AI menghasilkan routing_type yang menentukan ke ledger mana transaksi diarahkan.

// Enum routing type
enum RoutingType {
  INCOME, EXPENSE, ASSET_PURCHASE, ASSET_CREDIT,
  LOAN_DISBURSEMENT, LOAN_PAYMENT, TRANSFER, PERSONAL
}

// Gemini prompt template
function buildClassifyPrompt(activeProfiles: string[]): string {
  return `Analisis transaksi berikut. Kembalikan HANYA JSON.
  Profil aktif: ${activeProfiles.join(', ')}
  Format output:
  {
    'amount': number,
    'date': 'YYYY-MM-DD',
    'description': string,
    'routing_type': 'INCOME|EXPENSE|ASSET_PURCHASE|ASSET_CREDIT|LOAN_DISBURSEMENT|LOAN_PAYMENT|TRANSFER|PERSONAL',
    'profile': 'UMKM|KARYAWAN|FREELANCE|PETANI|PETERNAK|NELAYAN|PEMBUDIDAYA|null',
    'category': string,
    'spt_asset_code': string|null,
    'asset_name': string|null,
    'loan_type': string|null,
    'principal_amount': number|null,
    'interest_amount': number|null,
    'confidence': 'HIGH|MEDIUM|LOW',
    'reasoning': string
  }`;
}

routing_type	Efek Ledger
INCOME	Pendapatan +amount | Kas +amount
EXPENSE	Pengeluaran +amount | Kas -amount
ASSET_PURCHASE	Aset +amount | Kas -amount
ASSET_CREDIT	Aset +total | Kas -dp | Kewajiban +sisa
LOAN_DISBURSEMENT	Kas +amount | Kewajiban +amount
LOAN_PAYMENT	Kas -total | Kewajiban -pokok | Biaya Bunga +bunga
TRANSFER	Kas bergeser antar rekening
PERSONAL	Tidak masuk ledger bisnis

4. Chart API Routes
Setiap grafik memiliki API route tersendiri. Filter waktu mengubah granularitas query Firestore.

// app/api/charts/cashflow/route.ts
import { z } from 'zod';

const QuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']),
  from: z.string().datetime().optional(),
  to:   z.string().datetime().optional(),
});

export async function GET(request: Request) {
  const session = await verifySession();
  const { searchParams } = new URL(request.url);
  const { period } = QuerySchema.parse(Object.fromEntries(searchParams));

  // Query Firestore berdasarkan period
  const data = await getCashflowData(session.uid, period);

  // Return format untuk Recharts LineChart
  return Response.json({
    data: data.map(d => ({
      label: d.label,        // '01 Jan', 'Minggu 1', 'Jan', '2025'
      income:  d.totalIncome,
      expense: d.totalExpense,
    }))
  });
}

5. Firestore Schema Lengkap
users/
└── {userId}/
    ├── profile
    │   ├── name: string
    │   ├── npwp: string              // Masked saat tampil di UI
    │   ├── active_profiles: string[] // ['KARYAWAN','PEMBUDIDAYA']
    │   ├── ptkp_status: string       // 'TK0','K1', dll
    │   ├── klu_code: string
    │   └── domisili_type: string     // 'ibukota_provinsi'|...
    │
    ├── accounts/{accountId}/
    │   ├── account_name: string
    │   ├── account_type: string      // 'REKENING'|'KAS_TUNAI'
    │   ├── current_balance: number
    │   ├── bank_name: string|null
    │   └── last_updated: timestamp
    │
    ├── assets/{assetId}/
    │   ├── asset_name: string
    │   ├── category: string          // 'KENDARAAN'|'PROPERTI'|...
    │   ├── spt_code: string          // '011','022','031','042'
    │   ├── acquisition_value: number
    │   ├── acquisition_date: timestamp
    │   ├── ownership_status: string  // 'TUNAI'|'KREDIT'
    │   ├── linked_liability_id: string|null
    │   ├── attachment_url: string|null
    │   └── created_at: timestamp
    │
    ├── liabilities/{liabilityId}/
    │   ├── creditor_name: string
    │   ├── loan_type: string         // 'KPR'|'KKB'|'KUR'|...
    │   ├── principal_amount: number
    │   ├── remaining_balance: number
    │   ├── start_date: timestamp
    │   ├── linked_asset_id: string|null
    │   ├── attachment_url: string|null
    │   └── created_at: timestamp
    │
    └── periods/{periodId}/           // 'YYYY-MM'
        ├── metadata
        │   ├── period: string
        │   ├── status: string        // 'OPEN'|'LOCKED'
        │   └── locked_at: timestamp|null
        └── transactions/{transactionId}/
            ├── date: timestamp
            ├── description: string
            ├── amount: number
            ├── routing_type: string
            ├── type: string          // 'INCOME'|'EXPENSE'
            ├── profile: string
            ├── category: string
            ├── source: string        // 'OCR'|'VOICE'|'MANUAL'
            ├── confidence: string    // 'HIGH'|'MEDIUM'|'LOW'
            ├── is_confirmed: boolean
            ├── principal_amount: number|null
            ├── interest_amount: number|null
            ├── linked_asset_id: string|null
            ├── linked_liability_id: string|null
            ├── ai_suggestion: map
            │   ├── suggested_routing: string
            │   ├── suggested_category: string
            │   ├── reasoning: string
            │   └── raw_extracted: map
            ├── attachment_url: string|null
            └── created_at: timestamp

6. NPPN KLU Reference
KLU	Uraian	Ibukota Prov.	Prov. Lainnya	Daerah Lain
62010	Pemrograman Komputer (Developer)	50%	50%	50%
69100	Jasa Hukum (Pengacara, Notaris)	51%	50%	50%
74100	Jasa Perancangan (Desainer Grafis)	32%	31%	29%
74201	Jasa Fotografi	50%	50%	50%
86201	Praktik Dokter Umum	50%	50%	50%
86202	Praktik Dokter Spesialis	50%	50%	50%
90001	Seni Pertunjukan (Band, Musisi)	35%	32,5%	31,5%
90002	Pekerja Seni (YouTuber, Penulis)	50%	50%	50%
90005	Jurnalis Independen	35%	32,5%	31,5%
53200	Kurir / Ojek Online	50%	50%	50%
01120	Pertanian Padi	15%	15%	15%
01131	Pertanian Sayuran	11,5%	11%	10%
01411	Budidaya Sapi	11%	10%	9%
01461	Budidaya Ayam	11%	10%	9%
03111	Penangkapan Ikan Laut	25%	23%	22%
3221	Budidaya Ikan Air Tawar (Kolam)	25%	23%	22%
3251	Budidaya Tambak Air Payau	25%	23%	22%

7. Disclaimer
Disclaimer Wajib
Estimasi pajak Jakuang adalah kalkulasi otomatis berdasarkan data input pengguna.
Bukan merupakan konsultasi pajak atau keuangan resmi.
Referensi: UU HPP, PP No. 55/2022, PER-17/PJ/2015.

