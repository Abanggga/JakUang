import { TaxProfile, TaxInput, TaxResult, DomisiliType } from "./base";
import nppnRates from "./nppn-klu.json";

export function getNPPNRate(klu: string, domisili: DomisiliType): number {
  const entry = (nppnRates as Record<string, Record<string, number>>)[klu];
  if (!entry) return 0.5; // Default 50%
  return (entry[domisili] ?? 50) / 100;
}

export class NPPNTaxProfile extends TaxProfile {
  readonly profileType: string;
  constructor(
    private klu: string,
    private domisili: DomisiliType
  ) {
    super();
    this.profileType = klu;
  }

  calculate(input: TaxInput): TaxResult {
    const rate = getNPPNRate(this.klu, this.domisili);
    const neto = input.grossIncome * rate;
    const pkp = Math.max(0, neto - input.ptkp);
    return {
      profile: this.profileType,
      grossIncome: input.grossIncome,
      netIncome: neto,
      taxableIncome: pkp,
      taxDue: this.progressiveTax(pkp),
      breakdown: [
        { label: `NPPN Rate (${(rate * 100).toFixed(0)}%)`, amount: rate },
        { label: "Neto", amount: neto },
        { label: "PKP", amount: pkp },
      ],
    };
  }
}
