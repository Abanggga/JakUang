export const TRANSACTION_CATEGORY_CONFIG: Record<string, { label: string; bgClass: string; textClass: string; icon: string; iconBg: string; iconText: string }> = {
  Gaji: { label: "PENDAPATAN", bgClass: "bg-green-50", textClass: "text-green-700", icon: "payments", iconBg: "bg-green-50", iconText: "text-green-600" },
  Penjualan: { label: "PENDAPATAN", bgClass: "bg-green-50", textClass: "text-green-700", icon: "storefront", iconBg: "bg-green-50", iconText: "text-green-600" },
  Cicilan: { label: "KEWAJIBAN", bgClass: "bg-red-50", textClass: "text-red-700", icon: "credit_score", iconBg: "bg-red-50", iconText: "text-red-600" },
  Transfer: { label: "TRANSFER", bgClass: "bg-blue-50", textClass: "text-blue-700", icon: "swap_horiz", iconBg: "bg-blue-50", iconText: "text-blue-600" },
};

export const TRANSACTION_DEFAULT_CONFIG = { 
  label: "PENGELUARAN", 
  bgClass: "bg-amber-50", 
  textClass: "text-amber-700", 
  icon: "receipt", 
  iconBg: "bg-amber-50", 
  iconText: "text-amber-600" 
};
