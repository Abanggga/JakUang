import { TaxProfile, TaxInput, TaxResult } from "./base";

export class UMKMTaxProfile extends TaxProfile {
  readonly profileType = "UMKM";

  calculate(input: TaxInput): TaxResult {
    const threshold = 500_000_000;
    const taxable = Math.max(0, input.grossIncome - threshold);
    return {
      profile: "UMKM",
      grossIncome: input.grossIncome,
      netIncome: input.grossIncome,
      taxableIncome: taxable,
      taxDue: taxable * 0.005,
      breakdown: [
        { label: "Omzet", amount: input.grossIncome },
        { label: "Batas Bebas Pajak", amount: threshold },
        { label: "Kena Pajak", amount: taxable },
      ],
    };
  }
}
