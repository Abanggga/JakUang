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

export abstract class TaxProfile {
  abstract readonly profileType: string;
  abstract calculate(input: TaxInput): TaxResult;

  protected progressiveTax(pkp: number): number {
    const brackets = [
      { limit: 60_000_000, rate: 0.05 },
      { limit: 190_000_000, rate: 0.15 },
      { limit: 250_000_000, rate: 0.25 },
      { limit: 4_500_000_000, rate: 0.30 },
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
