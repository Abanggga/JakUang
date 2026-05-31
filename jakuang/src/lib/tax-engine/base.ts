export type DomisiliType = "ibukota_provinsi" | "ibukota_lainnya" | "daerah_lainnya";

export type ProfileType =
  | "KARYAWAN"
  | "KARYAWAN_HARIAN"
  | "UMKM"
  | "FREELANCE"
  | "KREATIF"
  | "GIG"
  | "PETANI"
  | "PETERNAK"
  | "NELAYAN"
  | "PEMBUDIDAYA";

export interface TaxInput {
  grossIncome: number;
  ptkp: number;
  bpjsEmployee?: number;
}

export interface TaxBreakdown {
  label: string;
  amount: number;
}

export interface TaxResult {
  profile: string;
  grossIncome: number;
  netIncome: number;
  taxableIncome: number;
  taxDue: number;
  breakdown: TaxBreakdown[];
}

/**
 * Daftar KLU Pekerjaan Bebas yang DIKECUALIKAN dari PPh Final UMKM
 * Sumber: PP No. 20/2026 Pasal 56 ayat 4
 *
 * Profesi ini wajib menggunakan NPPN atau tarif progresif Pasal 17.
 */
export const PEKERJAAN_BEBAS_KLU: string[] = [
  // Tenaga Ahli (pengacara, akuntan, arsitek, konsultan, notaris, penilai, aktuaris)
  "69100", // Jasa Hukum
  "66291", // Aktuaria

  // Ekonomi Kreatif — Influencer, selebgram, blogger, vlogger, content creator
  "90002", // Kegiatan Pekerja Seni (termasuk YouTuber/Content Creator)

  // Seni & Hiburan
  "90001", // Kegiatan Seni Pertunjukan
  "90003", // Jasa Penunjang Hiburan
  "90004", // Jasa Impresariat Bidang Seni

  // Jurnalis
  "90005", // Jurnalis Berita Independen

  // Kesehatan — Dokter
  "86201", // Praktik Dokter Umum
  "86202", // Praktik Dokter Spesialis
  "86203", // Praktik Dokter Gigi

  // Konsultasi & Manajemen
  "70201", // Jasa Konsultan Pariwisata
  "70202", // Jasa Konsultan Transportasi
  "70209", // Kegiatan Konsultasi Manajemen Lainnya

  // Periklanan
  "73100", // Periklanan

  // Fotografi
  "74201", // Jasa Fotografi

  // Asuransi & MLM
  "66221", // Jasa Agen Asuransi
  "66222", // Jasa Broker Asuransi
];

/**
 * Mapping internal dari ProfileType ke KLU default.
 * User tidak perlu tahu tentang KLU — sistem otomatis memetakan.
 */
export const PROFILE_DEFAULT_KLU: Record<string, string> = {
  FREELANCE: "62010",   // Kegiatan Pemrograman Komputer
  KREATIF: "90002",     // Kegiatan Pekerja Seni (YouTuber, Content Creator)
  GIG: "53200",         // Kurir
  PETANI: "01120",      // Pertanian Padi
  PETERNAK: "01461",    // Pembibitan Ayam Ras Pedaging
  NELAYAN: "03111",     // Penangkapan Ikan di Laut
  PEMBUDIDAYA: "03221", // Pembesaran Ikan Air Tawar
};

/**
 * Cek apakah sebuah KLU termasuk pekerjaan bebas (dikecualikan dari UMKM)
 */
export function isPekerjaanBebas(klu: string): boolean {
  return PEKERJAAN_BEBAS_KLU.includes(klu);
}

export abstract class TaxProfile {
  abstract readonly profileType: string;
  abstract calculate(input: TaxInput): TaxResult;

  /**
   * Tarif Progresif Pasal 17 — UU HPP No. 7/2021
   * Berlaku sejak 1 Januari 2022.
   *
   * | Lapisan | PKP                                | Tarif |
   * |---------|------------------------------------|-------|
   * | 1       | s.d. Rp60.000.000                  |  5%   |
   * | 2       | Rp60.000.001 s.d. Rp250.000.000    | 15%   |
   * | 3       | Rp250.000.001 s.d. Rp500.000.000   | 25%   |
   * | 4       | Rp500.000.001 s.d. Rp5.000.000.000 | 30%   |
   * | 5       | Di atas Rp5.000.000.000            | 35%   |
   */
  protected progressiveTax(pkp: number): number {
    const brackets = [
      { limit: 60_000_000, rate: 0.05 },
      { limit: 190_000_000, rate: 0.15 },   // 250M - 60M = 190M range
      { limit: 250_000_000, rate: 0.25 },   // 500M - 250M = 250M range
      { limit: 4_500_000_000, rate: 0.30 }, // 5B - 500M = 4.5B range
      { limit: Infinity, rate: 0.35 },
    ];
    let tax = 0;
    let remaining = pkp;
    for (const b of brackets) {
      const taxable = Math.min(remaining, b.limit);
      tax += taxable * b.rate;
      remaining -= taxable;
      if (remaining <= 0) break;
    }
    return tax;
  }
}
