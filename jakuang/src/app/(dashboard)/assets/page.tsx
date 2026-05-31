"use client";

import { useState, useEffect } from "react";
import { getAssets, getAccounts, saveAssets } from "@/lib/utils/storage-util";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import Link from "next/link";

const assetIcons: Record<string, string> = {
  PROPERTI: "home",
  KENDARAAN: "directions_car",
  ALAT_USAHA: "handyman",
  TABUNGAN: "savings",
  PIUTANG: "account_balance",
  ELECTRONIC: "laptop_mac",
  TERNAK: "pets",
  LAINNYA: "inventory_2"
};

const assetCategories: Record<string, string> = {
  PROPERTI: "Properti / Rumah",
  KENDARAAN: "Kendaraan Bermotor",
  ALAT_USAHA: "Alat Usaha / Mesin",
  TABUNGAN: "Tabungan & Investasi",
  PIUTANG: "Piutang",
  ELECTRONIC: "Elektronik / HP / Laptop",
  TERNAK: "Hewan Ternak / Komoditas",
  LAINNYA: "Aset Lainnya"
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    setAssets(getAssets());
    setAccounts(getAccounts());
  }, []);

  const handleDeleteAsset = (id: string) => {
    const updated = assets.filter(a => a.id !== id);
    setAssets(updated);
    saveAssets(updated);
  };

  // Calculations
  const totalCash = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  
  // Aset Lancar categories
  const liquidAssetValue = totalCash + assets
    .filter(a => a.category === "TABUNGAN" || a.category === "PIUTANG")
    .reduce((sum, a) => sum + (a.value || 0), 0);
    
  // Aset Tetap categories
  const fixedAssetValue = assets
    .filter(a => a.category !== "TABUNGAN" && a.category !== "PIUTANG")
    .reduce((sum, a) => sum + (a.value || 0), 0);

  const totalValue = liquidAssetValue + fixedAssetValue;

  const liquidPercent = totalValue > 0 ? Math.round((liquidAssetValue / totalValue) * 100) : 0;
  const fixedPercent = totalValue > 0 ? Math.round((fixedAssetValue / totalValue) * 100) : 0;

  // Donut chart grouping
  const categoryGroups: Record<string, { label: string; value: number; code: string; color: string }> = {};

  // Add cash
  if (totalCash > 0) {
    categoryGroups["KAS"] = {
      label: "Kas & Tabungan",
      value: totalCash,
      code: "012",
      color: "#3b82f6" // Blue
    };
  }

  assets.forEach(a => {
    const cat = a.category || "LAINNYA";
    const label = assetCategories[cat] || cat;
    const code = a.sptCode || "039";
    
    const colors: Record<string, string> = {
      PROPERTI: "#ef4444", // Red
      KENDARAAN: "#f59e0b", // Amber
      ALAT_USAHA: "#10b981", // Emerald
      TABUNGAN: "#22c55e", // Green
      PIUTANG: "#06b6d4", // Cyan
      ELECTRONIC: "#8b5cf6", // Purple
      TERNAK: "#ec4899", // Pink
      LAINNYA: "#6b7280" // Gray
    };

    if (!categoryGroups[cat]) {
      categoryGroups[cat] = {
        label,
        value: 0,
        code,
        color: colors[cat] || "#6b7280"
      };
    }
    categoryGroups[cat].value += a.value || 0;
  });

  const categoriesList = Object.values(categoryGroups).filter(c => c.value > 0);

  // conic gradient generation
  let accumulatedPercent = 0;
  const gradientSlices = categoriesList.map((c) => {
    const percent = totalValue > 0 ? (c.value / totalValue) * 100 : 0;
    const start = accumulatedPercent;
    accumulatedPercent += percent;
    return `${c.color} ${start}% ${accumulatedPercent}%`;
  });

  const conicGradientStyle = {
    background: totalValue > 0 
      ? `conic-gradient(${gradientSlices.join(", ")})`
      : "#e5e7eb"
  };

  // Search and Filter Assets
  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/60 shadow-sm">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Manajemen Aset</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola data aset lancar dan aset tetap Anda untuk pencatatan SPT Tahunan.
          </p>
        </div>
        <Link href="/input">
          <button className="bg-primary text-on-primary text-xs font-bold px-5 py-3 rounded-2xl hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Aset Baru
          </button>
        </Link>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-12 gap-6">
        {/* Total Value Card (col-span-8) */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group min-h-[250px]">
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-6 translate-y-6">
            <span className="material-symbols-outlined" style={{ fontSize: "160px" }}>domain</span>
          </div>
          
          <div>
            <div className="flex items-center gap-2.5 text-on-surface-variant mb-3">
              <span className="material-symbols-outlined text-primary text-[24px]">account_balance_wallet</span>
              <span className="text-xs uppercase tracking-wider font-extrabold">Total Nilai Perolehan</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-on-surface font-financial tracking-tight">
              {formatCurrency(totalValue)}
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 pt-6 border-t border-outline-variant/40">
            {/* Aset Lancar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-on-surface-variant flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Aset Lancar (Kas & Bank)
                </span>
                <span className="font-financial text-on-surface">{formatCurrency(liquidAssetValue)}</span>
              </div>
              <div className="w-full bg-blue-50 dark:bg-blue-900/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${liquidPercent}%` }}></div>
              </div>
              <p className="text-[10px] text-on-surface-variant/80 font-medium">Persentase porsi: {liquidPercent}%</p>
            </div>

            {/* Aset Tetap */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-on-surface-variant flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Aset Tetap (Barang Modal)
                </span>
                <span className="font-financial text-on-surface">{formatCurrency(fixedAssetValue)}</span>
              </div>
              <div className="w-full bg-amber-50 dark:bg-amber-900/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${fixedPercent}%` }}></div>
              </div>
              <p className="text-[10px] text-on-surface-variant/80 font-medium">Persentase porsi: {fixedPercent}%</p>
            </div>
          </div>
        </div>

        {/* Donut Chart Category Sebaran (col-span-4) */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 flex flex-col justify-between items-center min-h-[250px]">
          <div className="w-full text-left mb-4">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Sebaran Aset</h3>
          </div>
          
          <div className="flex items-center justify-center flex-1 w-full gap-6">
            {/* CSS Conic Donut Chart */}
            <div className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-sm shrink-0" style={conicGradientStyle}>
              <div className="absolute w-22 h-22 rounded-full bg-surface-container-lowest flex flex-col items-center justify-center">
                <span className="text-[9px] uppercase font-bold text-on-surface-variant">Aset</span>
                <span className="text-xs font-black font-financial text-on-surface mt-0.5">
                  {totalValue >= 1_000_000_000 
                    ? `${(totalValue / 1_000_000_000).toFixed(1)}M` 
                    : totalValue >= 1_000_000 
                      ? `${(totalValue / 1_000_000).toFixed(1)}jt`
                      : formatCurrency(totalValue)
                  }
                </span>
              </div>
            </div>

            {/* Legend list */}
            <div className="flex-1 space-y-2 max-h-[140px] overflow-y-auto no-scrollbar pr-1 w-full">
              {categoriesList.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-[10px] font-semibold text-on-surface-variant">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-on-surface font-bold">{c.label}</p>
                    <p className="text-[9px] opacity-75">SPT {c.code} • {Math.round((c.value / totalValue) * 100)}%</p>
                  </div>
                </div>
              ))}
              {categoriesList.length === 0 && (
                <p className="text-[10px] text-center text-on-surface-variant py-8">Belum ada aset terdaftar</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Asset List & Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-lg font-bold text-on-surface">Daftar Aset Terdaftar</h3>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="flex items-center bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30 w-full sm:w-60">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant mr-2">search</span>
              <input
                type="text"
                placeholder="Cari aset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-on-surface w-full"
              />
            </div>
            
            {/* Filter Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-surface-container-low border border-outline-variant/30 text-on-surface-variant text-xs font-semibold rounded-xl px-4 py-2.5 outline-none cursor-pointer w-full sm:w-auto"
            >
              <option value="ALL">Semua Kategori</option>
              {Object.keys(assetCategories).map((key) => (
                <option key={key} value={key}>
                  {assetCategories[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table view */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-on-surface-variant font-bold border-b border-outline-variant/30 uppercase tracking-wider text-[10px]">
                <th className="pb-3 pr-4">Nama Aset</th>
                <th className="pb-3 pr-4">Kategori (SPT)</th>
                <th className="pb-3 pr-4">Tgl Perolehan</th>
                <th className="pb-3 pr-4 text-right">Nilai Perolehan</th>
                <th className="pb-3 pr-4 text-center">Status Pembiayaan</th>
                <th className="pb-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-on-surface">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-surface-container-low/20 transition-colors">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-fixed/50 flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[16px]">{assetIcons[asset.category] || "inventory_2"}</span>
                      </div>
                      <span className="font-bold text-on-surface text-sm">{asset.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-on-surface-variant">
                        {assetCategories[asset.category] || asset.category}
                      </span>
                      <span className="text-[9px] text-on-surface-variant/80 font-mono">Kode SPT: {asset.sptCode || "031"}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-on-surface-variant font-medium">
                    {asset.date ? new Date(asset.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                  </td>
                  <td className="py-3.5 pr-4 text-right font-bold font-financial text-sm">{formatCurrency(asset.value)}</td>
                  <td className="py-3.5 pr-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      asset.status === "KREDIT" 
                        ? "bg-amber-50 text-amber-700 border-amber-200" 
                        : "bg-green-50 text-green-700 border-green-200"
                    }`}>
                      {asset.status || "TUNAI"}
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                      title="Hapus Aset"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              
              {/* Cash & accounts as asset entries */}
              {categoryFilter === "ALL" && accounts.map((acc) => (
                <tr key={acc.id} className="bg-surface-container-low/10 divide-y divide-outline-variant/10">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/25 flex items-center justify-center text-blue-600 shrink-0">
                        <span className="material-symbols-outlined text-[16px]">savings</span>
                      </div>
                      <span className="font-bold text-on-surface text-sm">{acc.bankName || acc.name} (Rekening Bank)</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-on-surface-variant">Tabungan & Investasi</span>
                      <span className="text-[9px] text-on-surface-variant/80 font-mono">Kode SPT: 012</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-on-surface-variant/75 font-medium">-</td>
                  <td className="py-3.5 pr-4 text-right font-bold font-financial text-sm">{formatCurrency(acc.balance)}</td>
                  <td className="py-3.5 pr-4 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border bg-green-50 text-green-700 border-green-200">
                      TUNAI
                    </span>
                  </td>
                  <td className="py-3.5 text-center text-on-surface-variant/60 font-medium">Sistem</td>
                </tr>
              ))}

              {filteredAssets.length === 0 && (categoryFilter !== "ALL" || accounts.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant font-medium">
                    Tidak ada aset terdaftar yang cocok dengan pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
