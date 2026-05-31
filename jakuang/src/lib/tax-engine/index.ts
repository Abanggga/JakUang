import { TaxProfile, ProfileType, DomisiliType, TaxInput, TaxResult, PROFILE_DEFAULT_KLU } from "./base";
import { KaryawanTaxProfile } from "./karyawan";
import { UMKMTaxProfile } from "./umkm";
import { NPPNTaxProfile } from "./nppn";

export interface ProfileInput {
  type: ProfileType;
  input: TaxInput;
  domisili?: DomisiliType;
}

export class TaxEngineFactory {
  /**
   * Create a tax profile calculator.
   * KLU is automatically determined from the profile type (not user input).
   */
  static create(profile: ProfileType, domisili?: DomisiliType): TaxProfile {
    switch (profile) {
      case "KARYAWAN":
      case "KARYAWAN_HARIAN":
        return new KaryawanTaxProfile();
      case "UMKM":
        return new UMKMTaxProfile();
      case "FREELANCE":
      case "KREATIF":
      case "GIG":
      case "PETANI":
      case "PETERNAK":
      case "NELAYAN":
      case "PEMBUDIDAYA": {
        // KLU otomatis dari mapping internal — user tidak perlu input
        const klu = PROFILE_DEFAULT_KLU[profile] || "62010";
        return new NPPNTaxProfile(klu, domisili || "daerah_lainnya");
      }
      default:
        throw new Error(`Unknown profile: ${profile}`);
    }
  }

  static calculateAll(profiles: ProfileInput[]): TaxResult[] {
    return profiles.map((p) =>
      this.create(p.type, p.domisili).calculate(p.input)
    );
  }
}

export type { TaxProfile, TaxInput, TaxResult, ProfileType, DomisiliType };
