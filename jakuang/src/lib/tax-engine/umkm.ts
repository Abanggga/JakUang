import { TaxProfile, TaxInput, TaxResult } from "./base";
import { PEKERJAAN_BEBAS_KLU } from "./base";

/**
 * PPh Final UMKM 0,5% — PP No. 20/2026
 *
 * Perubahan utama dari PP 55/2022:
 * - Batas waktu 7 tahun dihapus untuk WP OP (tanpa batas waktu)
 * - Influencer/content creator dikecualikan (pekerjaan bebas)
 * - Tarif 0,5% dikenakan atas SELURUH omzet, bukan hanya di atas Rp500jt
 * - Threshold Rp500jt hanya menentukan kena pajak atau tidak
 *
 * Cara hitung:
 * - Omzet ≤ Rp500.000.000 → PPh = 0 (bebas pajak)
 * - Omzet > Rp500.000.000 s.d. Rp4.800.000.000 → PPh = seluruh omzet × 0,5%
 * - Omzet > Rp4.800.000.000 → keluar dari fasilitas, wajib pembukuan
 */
export class UMKMTaxProfile extends TaxProfile {
  readonly profileType = "UMKM";

  calculate(input: TaxInput): TaxResult {
    const exemptionThreshold = 500_000_000;
    const maxOmzet = 4_800_000_000;
    const gross = input.grossIncome;

    // Validasi: omzet > Rp4,8M → di luar scope fasilitas UMKM
    const exceedsMax = gross > maxOmzet;

    // PP 20/2026: 0% jika omzet ≤ 500jt
    const isExempt = gross <= exemptionThreshold;

    // Tarif 0,5% dikenakan atas SELURUH omzet (bukan hanya selisih)
    const taxDue = isExempt ? 0 : gross * 0.005;

    const breakdown: { label: string; amount: number }[] = [
      { label: "Peredaran Bruto (Omzet)", amount: gross },
      { label: "Batas Bebas Pajak (Rp500jt)", amount: exemptionThreshold },
    ];

    if (exceedsMax) {
      breakdown.push({
        label: "⚠ Omzet melebihi Rp4,8M — wajib pembukuan",
        amount: maxOmzet,
      });
    }

    if (isExempt) {
      breakdown.push({ label: "Status: Bebas Pajak (omzet ≤ Rp500jt)", amount: 0 });
    } else {
      breakdown.push({ label: "PPh Final 0,5% × seluruh omzet", amount: taxDue });
    }

    return {
      profile: "UMKM",
      grossIncome: gross,
      netIncome: gross,
      taxableIncome: isExempt ? 0 : gross,
      taxDue,
      breakdown,
    };
  }
}
