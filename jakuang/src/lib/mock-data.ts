// Reference labels and values — NOT mock/dummy data
// These are static configuration constants used by the UI and tax engine

export const profileLabels: Record<string, string> = {
  KARYAWAN: "Karyawan Tetap/Kontrak",
  KARYAWAN_HARIAN: "Karyawan Tidak Tetap",
  UMKM: "UMKM",
  FREELANCE: "Freelance & Profesional",
  KREATIF: "Ekonomi Kreatif",
  GIG: "Gig & Informal",
  PETANI: "Petani & Pekebun",
  PETERNAK: "Peternak",
  NELAYAN: "Nelayan",
  PEMBUDIDAYA: "Pembudidaya Ikan",
};

export const ptkpValues: Record<string, number> = {
  "TK/0": 54_000_000,
  "K/0": 58_500_000,
  "K/1": 63_000_000,
  "K/2": 67_500_000,
  "K/3": 72_000_000,
};
