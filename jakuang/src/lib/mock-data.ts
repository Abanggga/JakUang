// Mock data for development — replaces Firebase/Gemini until integration

export const mockUser = {
  uid: "mock-user-001",
  email: "andi@jakuang.id",
  name: "Andi Pratama",
  npwp: "123456789012345",
  activeProfiles: ["KARYAWAN", "UMKM"],
  ptkpStatus: "K/1",
  kluCode: "62010",
  domisiliType: "ibukota_provinsi" as const,
};

export const mockAccounts = [
  { id: "acc-1", name: "BCA Tabungan", type: "REKENING" as const, balance: 45_000_000, bankName: "BCA" },
  { id: "acc-2", name: "Mandiri Bisnis", type: "REKENING" as const, balance: 128_500_000, bankName: "Mandiri" },
  { id: "acc-3", name: "Kas Toko", type: "KAS_TUNAI" as const, balance: 5_200_000, bankName: null },
  { id: "acc-4", name: "GoPay", type: "REKENING" as const, balance: 2_350_000, bankName: "GoPay" },
];

export const mockAssets = [
  { id: "ast-1", name: "Rumah Depok", category: "PROPERTI", sptCode: "011", value: 850_000_000, date: "2020-03-15", status: "TUNAI" },
  { id: "ast-2", name: "Honda PCX 160", category: "KENDARAAN", sptCode: "042", value: 35_000_000, date: "2023-06-20", status: "KREDIT" },
  { id: "ast-3", name: "MacBook Pro M3", category: "ALAT_USAHA", sptCode: "031", value: 32_000_000, date: "2024-01-10", status: "TUNAI" },
  { id: "ast-4", name: "Tanah Bogor", category: "PROPERTI", sptCode: "011", value: 250_000_000, date: "2022-08-01", status: "TUNAI" },
  { id: "ast-5", name: "Toyota Avanza", category: "KENDARAAN", sptCode: "042", value: 220_000_000, date: "2024-06-15", status: "KREDIT" },
];

export const mockLiabilities = [
  { id: "lia-1", creditor: "Bank Mandiri", type: "KPR", principal: 500_000_000, remaining: 380_000_000, startDate: "2020-03-15" },
  { id: "lia-2", creditor: "Adira Finance", type: "KKB", principal: 28_000_000, remaining: 18_500_000, startDate: "2023-06-20" },
  { id: "lia-3", creditor: "BRI", type: "KUR", principal: 50_000_000, remaining: 35_000_000, startDate: "2024-01-15" },
];

export const mockTransactions = [
  {
    id: "txn-1",
    date: "2025-05-14T08:30:00",
    description: "Gaji bulan Mei",
    amount: 12_500_000,
    type: "INCOME" as const,
    routingType: "INCOME",
    profile: "KARYAWAN",
    category: "Gaji",
    source: "MANUAL" as const,
    confidence: "HIGH" as const,
    isConfirmed: true,
  },
  {
    id: "txn-2",
    date: "2025-05-13T14:20:00",
    description: "Penjualan produk online — Shopee",
    amount: 3_450_000,
    type: "INCOME" as const,
    routingType: "INCOME",
    profile: "UMKM",
    category: "Penjualan",
    source: "OCR" as const,
    confidence: "HIGH" as const,
    isConfirmed: true,
  },
  {
    id: "txn-3",
    date: "2025-05-13T11:00:00",
    description: "Beli bahan baku packaging",
    amount: 850_000,
    type: "EXPENSE" as const,
    routingType: "EXPENSE",
    profile: "UMKM",
    category: "Bahan Baku",
    source: "OCR" as const,
    confidence: "MEDIUM" as const,
    isConfirmed: true,
  },
  {
    id: "txn-4",
    date: "2025-05-12T16:45:00",
    description: "Cicilan KUR BRI bulan Mei",
    amount: 2_500_000,
    type: "EXPENSE" as const,
    routingType: "LOAN_PAYMENT",
    profile: null,
    category: "Cicilan",
    source: "MANUAL" as const,
    confidence: "HIGH" as const,
    isConfirmed: true,
  },
  {
    id: "txn-5",
    date: "2025-05-12T09:15:00",
    description: "Makan siang meeting klien",
    amount: 285_000,
    type: "EXPENSE" as const,
    routingType: "EXPENSE",
    profile: "KARYAWAN",
    category: "Makan & Minum",
    source: "OCR" as const,
    confidence: "HIGH" as const,
    isConfirmed: true,
  },
  {
    id: "txn-6",
    date: "2025-05-11T20:00:00",
    description: "Penjualan langsung — walk-in customer",
    amount: 1_200_000,
    type: "INCOME" as const,
    routingType: "INCOME",
    profile: "UMKM",
    category: "Penjualan",
    source: "VOICE" as const,
    confidence: "MEDIUM" as const,
    isConfirmed: false,
  },
  {
    id: "txn-7",
    date: "2025-05-11T15:30:00",
    description: "Listrik toko bulan Mei",
    amount: 450_000,
    type: "EXPENSE" as const,
    routingType: "EXPENSE",
    profile: "UMKM",
    category: "Utilitas",
    source: "MANUAL" as const,
    confidence: "HIGH" as const,
    isConfirmed: true,
  },
  {
    id: "txn-8",
    date: "2025-05-10T10:00:00",
    description: "Transfer ke rekening tabungan",
    amount: 5_000_000,
    type: "EXPENSE" as const,
    routingType: "TRANSFER",
    profile: null,
    category: "Transfer",
    source: "MANUAL" as const,
    confidence: "HIGH" as const,
    isConfirmed: true,
  },
  {
    id: "txn-9",
    date: "2025-05-09T13:00:00",
    description: "Penjualan produk custom order",
    amount: 5_800_000,
    type: "INCOME" as const,
    routingType: "INCOME",
    profile: "UMKM",
    category: "Penjualan",
    source: "MANUAL" as const,
    confidence: "HIGH" as const,
    isConfirmed: true,
  },
  {
    id: "txn-10",
    date: "2025-05-08T08:00:00",
    description: "Bensin motor operasional",
    amount: 150_000,
    type: "EXPENSE" as const,
    routingType: "EXPENSE",
    profile: "UMKM",
    category: "Transportasi",
    source: "VOICE" as const,
    confidence: "LOW" as const,
    isConfirmed: false,
  },
];

export const mockCashflowData = {
  monthly: [
    { label: "Jan", income: 15_200_000, expense: 8_500_000 },
    { label: "Feb", income: 14_800_000, expense: 9_200_000 },
    { label: "Mar", income: 16_500_000, expense: 7_800_000 },
    { label: "Apr", income: 18_200_000, expense: 10_100_000 },
    { label: "Mei", income: 17_950_000, expense: 9_735_000 },
  ],
};

export const mockAssetDistribution = [
  { name: "Properti", value: 1_100_000_000, color: "#5A45CB" },
  { name: "Kendaraan", value: 255_000_000, color: "#7360E5" },
  { name: "Alat Usaha", value: 32_000_000, color: "#FFD700" },
  { name: "Kas & Tabungan", value: 181_050_000, color: "#22C55E" },
];

export const mockIncomeByProfile = [
  { month: "Jan", KARYAWAN: 12_500_000, UMKM: 2_700_000 },
  { month: "Feb", KARYAWAN: 12_500_000, UMKM: 2_300_000 },
  { month: "Mar", KARYAWAN: 12_500_000, UMKM: 4_000_000 },
  { month: "Apr", KARYAWAN: 12_500_000, UMKM: 5_700_000 },
  { month: "Mei", KARYAWAN: 12_500_000, UMKM: 5_450_000 },
];

export const mockTaxTrend = [
  { month: "Jan", estimasi: 425_000 },
  { month: "Feb", estimasi: 850_000 },
  { month: "Mar", estimasi: 1_310_000 },
  { month: "Apr", estimasi: 1_820_000 },
  { month: "Mei", estimasi: 2_275_000 },
];

export const mockNetworthTrend = [
  { month: "Jan", networth: 985_000_000 },
  { month: "Feb", networth: 992_000_000 },
  { month: "Mar", networth: 1_005_000_000 },
  { month: "Apr", networth: 1_018_000_000 },
  { month: "Mei", networth: 1_030_550_000 },
];

// Computed summary values
export const mockSummary = {
  totalAssets: mockAssets.reduce((sum, a) => sum + a.value, 0) +
    mockAccounts.reduce((sum, a) => sum + a.balance, 0),
  totalLiabilities: mockLiabilities.reduce((sum, l) => sum + l.remaining, 0),
  totalCash: mockAccounts.reduce((sum, a) => sum + a.balance, 0),
  get netWorth() {
    return this.totalAssets - this.totalLiabilities;
  },
};

export const profileLabels: Record<string, string> = {
  KARYAWAN: "Karyawan Tetap/Kontrak",
  KARYAWAN_HARIAN: "Karyawan Tidak Tetap",
  UMKM: "UMKM",
  FREELANCE: "Freelance & Profesional",
  KREATIF: "Ekonomi Kreatif",
  GIG: "Gig & Informal",
  PETANI: "Petani & Pekebun",
  PETERNAK: "Peternak",
  NELAYAN: "Nelayan & Pembudidaya",
};

export const ptkpValues: Record<string, number> = {
  "TK/0": 54_000_000,
  "K/0": 58_500_000,
  "K/1": 63_000_000,
  "K/2": 67_500_000,
  "K/3": 72_000_000,
};
