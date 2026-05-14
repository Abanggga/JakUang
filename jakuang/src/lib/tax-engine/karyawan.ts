import { TaxProfile, TaxInput, TaxResult } from "./base";

export class KaryawanTaxProfile extends TaxProfile {
  readonly profileType = "KARYAWAN";

  calculate(input: TaxInput): TaxResult {
    const biayaJabatan = Math.min(input.grossIncome * 0.05, 6_000_000);
    const neto = input.grossIncome - biayaJabatan - (input.bpjsEmployee ?? 0);
    const pkp = Math.max(0, neto - input.ptkp);
    return {
      profile: "KARYAWAN",
      grossIncome: input.grossIncome,
      netIncome: neto,
      taxableIncome: pkp,
      taxDue: this.progressiveTax(pkp),
      breakdown: [
        { label: "Biaya Jabatan (5%)", amount: biayaJabatan },
        { label: "Neto", amount: neto },
        { label: "PKP", amount: pkp },
      ],
    };
  }
}
