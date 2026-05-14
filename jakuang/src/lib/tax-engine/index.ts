import { TaxProfile, ProfileType, DomisiliType, TaxInput, TaxResult } from "./base";
import { KaryawanTaxProfile } from "./karyawan";
import { UMKMTaxProfile } from "./umkm";
import { NPPNTaxProfile } from "./nppn";

export interface ProfileInput {
  type: ProfileType;
  input: TaxInput;
  klu?: string;
  domisili?: DomisiliType;
}

export class TaxEngineFactory {
  static create(profile: ProfileType, klu?: string, domisili?: DomisiliType): TaxProfile {
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
      case "PEMBUDIDAYA":
        return new NPPNTaxProfile(klu!, domisili!);
      default:
        throw new Error(`Unknown profile: ${profile}`);
    }
  }

  static calculateAll(profiles: ProfileInput[]): TaxResult[] {
    return profiles.map((p) =>
      this.create(p.type, p.klu, p.domisili).calculate(p.input)
    );
  }
}

export type { TaxProfile, TaxInput, TaxResult, ProfileType, DomisiliType };
