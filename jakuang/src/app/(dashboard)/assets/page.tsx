"use client";

import { useState, useEffect } from "react";
import { getAssets, getLiabilities, getAccounts } from "@/lib/utils/storage-util";
import { formatCurrency, formatDateShort } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertTriangle, AlertCircle, TrendingUp, Info } from "lucide-react";
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
  const [tab, setTab] = useState<"assets" | "liabilities">("assets");
  const [assets, setAssets] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  useEffect(() => {
    // Load dynamic data on mount
    setAssets(getAssets());
    setLiabilities(getLiabilities());
    setAccounts(getAccounts());
  }, []);

  const totalCash = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0) + totalCash;
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.remaining, 0);
  const netWorth = totalAssets - totalLiabilities;
  const debtRatio = totalAssets > 0 ? Math.round((totalLiabilities / totalAssets) * 100) : 0;
  const liquidityRatio = totalAssets > 0 ? Math.round((totalCash / totalAssets) * 100) : 0;

  // Determine financial state based on Debt-to-Asset ratio
  let statusColor = "bg-emerald-500 text-white border-emerald-600";
  let statusText = "Aman (Sangat Sehat)";
  let statusIcon = "verified_user";
  let recommendationTitle = "Kondisi Finansial Aman";
  let recommendationDesc = "Rasio hutang Anda berada di bawah batas maksimal yang aman. Anda memiliki fleksibilitas keuangan yang tinggi. Usaha Anda dapat dengan aman mengambil pinjaman produktif (seperti KUR) jika diperlukan untuk ekspansi bisnis.";
  let checklist = [
    "Pertahankan cadangan kas minimal 6 bulan biaya operasional.",
    "Prioritaskan pembiayaan mandiri sebelum mengambil pinjaman baru.",
    "Gunakan dana pinjaman hanya untuk belanja modal produktif (mesin, alat, kolam, pupuk)."
  ];

  if (debtRatio >= 35 && debtRatio <= 50) {
    statusColor = "bg-amber-500 text-white border-amber-600";
    statusText = "Waspada (Sedang)";
    statusIcon = "warning";
    recommendationTitle = "Kondisi Waspada";
    recommendationDesc = "Rasio hutang Anda cukup tinggi. Meskipun masih terkendali, pengambilan pinjaman baru sebaiknya dihindari. Mulailah mempercepat pembayaran pokok pinjaman untuk menekan beban bunga bulanan.";
    checklist = [
      "Lakukan review pengeluaran non-primer untuk dialokasikan ke pelunasan hutang.",
      "Hindari pinjaman konsumtif atau cicilan baru.",
      "Pertimbangkan negosiasi tenor jika cicilan terasa mulai memberatkan cashflow."
    ];
  } else if (debtRatio > 50) {
    statusColor = "bg-red-500 text-white border-red-600";
    statusText = "Bahaya (Over-Leveraged)";
    statusIcon = "gavel";
    recommendationTitle = "Kondisi Bahaya (Kritis)";
    recommendationDesc = "Peringatan: Beban hutang Anda melebihi 50% dari total aset. Anda berisiko mengalami gagal bayar jika terjadi penurunan pendapatan usaha secara mendadak. Fokus utama Anda haruslah pemulihan rasio kesehatan keuangan (debt reduction).";
    checklist = [
      "Segera hubungi pihak bank/kreditur untuk mengajukan restrukturisasi cicilan.",
      "Jual aset non-produktif untuk melunasi pinjaman dengan bunga tertinggi.",
      "Hentikan seluruh pengeluaran opsional dan prioritaskan cadangan kas darurat."
    ];
  }

  return (
    <div className="space-y-6 pb-16 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-display-lg text-on-surface tracking-tight">Aset & Kewajiban</h2>
          <p className="text-body-lg text-on-surface-variant">Ringkasan kekayaan bersih dan rekam jejak finansial Anda secara real-time.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/tax-export">
            <button className="px-6 py-2.5 rounded-xl border-2 border-primary text-primary text-label-md hover:bg-primary-fixed/30 transition-colors cursor-pointer bg-transparent">
              Unduh Laporan
            </button>
          </Link>
          <Link href="/input">
            <button className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-label-md shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              Tambah Entri
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 md:col-span-4 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <span className="bg-surface-container-low text-primary text-label-sm px-3 py-1 rounded-full font-semibold">Aktif</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant mb-1">Total Harta Bersih</p>
            <h3 className={cn("text-headline-md font-financial font-bold", netWorth >= 0 ? "text-on-surface" : "text-error")}>
              {formatCurrency(netWorth)}
            </h3>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/30 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant mb-1">Total Aset</p>
            <h3 className="text-headline-md text-on-surface font-financial font-bold">{formatCurrency(totalAssets)}</h3>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-4 translate-y-4">
            <span className="material-symbols-outlined" style={{ fontSize: "120px" }}>credit_card</span>
          </div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-error-container/20 flex items-center justify-center text-error">
              <span className="material-symbols-outlined">trending_down</span>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-label-md text-on-surface-variant mb-1">Total Kewajiban (Hutang)</p>
            <h3 className="text-headline-md text-on-surface font-financial font-bold">{formatCurrency(totalLiabilities)}</h3>
          </div>
        </div>

        {/* Chart */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-8">
          <h3 className="text-headline-sm text-on-surface mb-6 border-b border-outline-variant/40 pb-4">Perbandingan Harta vs Hutang</h3>
          {totalAssets === 0 && totalLiabilities === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center text-on-surface-variant/70 gap-2">
              <span className="material-symbols-outlined text-[36px]">insert_chart</span>
              <p className="text-sm">Belum ada data untuk dirender dalam grafik.</p>
            </div>
          ) : (
            <div className="flex h-48 gap-8 items-end justify-center px-8">
              <div className="flex flex-col items-center gap-3 w-32">
                <div className="w-full bg-primary rounded-t-md relative group" style={{ height: `${Math.min(192, Math.max(40, (totalAssets / (totalAssets + totalLiabilities || 1)) * 192))}px` }}>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-label-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Aset: {totalAssets > 0 ? Math.round((totalAssets / (totalAssets + totalLiabilities)) * 100) : 100}%
                  </div>
                </div>
                <span className="text-label-md text-on-surface-variant">Aset</span>
              </div>
              <div className="flex flex-col items-center gap-3 w-32">
                <div className="w-full bg-tertiary-fixed-dim rounded-t-md relative group" style={{ height: `${Math.min(192, Math.max(20, (totalLiabilities / (totalAssets + totalLiabilities || 1)) * 192))}px` }}>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-label-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Kewajiban: {debtRatio}%
                  </div>
                </div>
                <span className="text-label-md text-on-surface-variant">Kewajiban</span>
              </div>
            </div>
          )}
        </div>

        {/* Debt Status Card */}
        <div className="col-span-12 lg:col-span-4 bg-primary text-on-primary rounded-3xl shadow-sm p-8 flex flex-col justify-between overflow-hidden relative border border-primary/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse" />
          <div className="relative z-10">
            <span className="material-symbols-outlined mb-4" style={{ fontSize: "32px" }}>
              {debtRatio > 50 ? "gavel" : debtRatio >= 35 ? "warning" : "verified_user"}
            </span>
            <h3 className="text-headline-sm mb-2">
              Status Rasio Hutang {debtRatio > 50 ? "Kritis" : debtRatio >= 35 ? "Waspada" : "Aman"}
            </h3>
            <p className="text-body-md text-on-primary/90 mb-6">
              {debtRatio > 50 
                ? `Rasio hutang Anda berada di angka ${debtRatio}%, berada di atas batas maksimal aman (35%). Harap lakukan review.` 
                : debtRatio >= 35 
                ? `Rasio hutang Anda berada di angka ${debtRatio}%, mendekati batas maksimal aman (35%). Harap waspada.` 
                : `Rasio hutang Anda berada di angka ${debtRatio}%, jauh di bawah batas maksimal yang direkomendasikan (35%).`}
            </p>
          </div>
          <button 
            onClick={() => setIsAnalysisOpen(true)}
            className="relative z-10 bg-secondary text-on-secondary text-label-md py-3.5 px-4 rounded-xl w-full flex items-center justify-between hover:bg-secondary-fixed-dim transition-colors cursor-pointer border-none font-bold"
          >
            Lihat Analisis Lengkap
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

        {/* Asset/Liability Registry */}
        <div className="col-span-12 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm overflow-hidden mt-4">
          <div className="flex border-b border-outline-variant/40 px-8 pt-4 gap-8">
            <button
              onClick={() => setTab("assets")}
              className={cn("pb-3 text-label-md px-2 cursor-pointer bg-transparent border-none", tab === "assets" ? "text-primary font-bold border-b-2 border-primary" : "text-on-surface-variant hover:text-on-surface")}
            >
              Daftar Aset
            </button>
            <button
              onClick={() => setTab("liabilities")}
              className={cn("pb-3 text-label-md px-2 cursor-pointer bg-transparent border-none", tab === "liabilities" ? "text-primary font-bold border-b-2 border-primary" : "text-on-surface-variant hover:text-on-surface")}
            >
              Daftar Kewajiban
            </button>
          </div>

          <div className="p-8">
            {tab === "assets" ? (
              <>
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-surface-container-low/50 rounded-xl mb-4 text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                  <div className="col-span-5">Nama Aset</div>
                  <div className="col-span-3">Kategori</div>
                  <div className="col-span-2">Kode SPT</div>
                  <div className="col-span-2 text-right">Nilai (IDR)</div>
                </div>
                
                {assets.length === 0 ? (
                  <div className="text-center py-12 text-on-surface-variant flex flex-col items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-[40px] text-muted-foreground/50">inventory_2</span>
                    <p className="text-body-md font-medium">Belum ada aset terdaftar</p>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Daftarkan aset usaha Anda secara tunai atau kredit melalui Snap & Record.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assets.map((asset) => (
                      <div key={asset.id} className="grid grid-cols-12 gap-4 px-4 py-4 items-center rounded-xl hover:bg-surface-container-low transition-colors group border border-transparent hover:border-outline-variant/30">
                        <div className="col-span-5 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed group-hover:bg-primary group-hover:text-on-primary transition-colors">
                            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>{assetIcons[asset.category] || "inventory_2"}</span>
                          </div>
                          <span className="text-body-md text-on-surface font-semibold">{asset.name}</span>
                        </div>
                        <div className="col-span-3 flex items-center">
                          <span className="bg-surface-container border border-outline-variant/50 text-on-surface-variant px-3 py-1 rounded-full text-label-sm font-medium">
                            {assetCategories[asset.category] || asset.category}
                          </span>
                        </div>
                        <div className="col-span-2 text-on-surface-variant text-body-md font-mono">{asset.sptCode}</div>
                        <div className="col-span-2 text-right text-body-md text-on-surface font-semibold font-financial">
                          {formatCurrency(asset.value)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-surface-container-low/50 rounded-xl mb-4 text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                  <div className="col-span-4">Kreditur</div>
                  <div className="col-span-2">Jenis</div>
                  <div className="col-span-3 text-right">Pokok Awal</div>
                  <div className="col-span-3 text-right">Sisa Hutang</div>
                </div>
                
                {liabilities.length === 0 ? (
                  <div className="text-center py-12 text-on-surface-variant flex flex-col items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-[40px] text-muted-foreground/50">credit_card</span>
                    <p className="text-body-md font-medium">Belum ada kewajiban terdaftar</p>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Daftarkan utang bank, KUR, atau cicilan kendaraan Anda melalui menu Snap & Record.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {liabilities.map((l) => (
                      <div key={l.id} className="grid grid-cols-12 gap-4 px-4 py-4 items-center rounded-xl hover:bg-surface-container-low transition-colors group border border-transparent hover:border-outline-variant/30">
                        <div className="col-span-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-error-container/30 flex items-center justify-center text-error group-hover:bg-error group-hover:text-on-error transition-colors">
                            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>credit_card</span>
                          </div>
                          <span className="text-body-md text-on-surface font-semibold">{l.creditor}</span>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className="bg-surface-container border border-outline-variant/50 text-on-surface-variant px-3 py-1 rounded-full text-label-sm font-semibold">{l.type}</span>
                        </div>
                        <div className="col-span-3 text-right text-body-md text-on-surface font-financial">{formatCurrency(l.principal)}</div>
                        <div className="col-span-3 text-right text-body-md text-error font-bold font-financial">{formatCurrency(l.remaining)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* FULL ANALYSIS MODAL */}
      {isAnalysisOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/60 w-full max-w-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 py-5 border-b border-outline-variant/40 bg-surface/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: "24px" }}>analytics</span>
                <h3 className="text-headline-sm text-lg font-bold text-on-surface">Analisis Rasio Hutang & Likuiditas</h3>
              </div>
              <button 
                onClick={() => setIsAnalysisOpen(false)}
                className="p-1.5 hover:bg-surface-container rounded-full transition-colors cursor-pointer border-none bg-transparent"
              >
                <X className="h-5 w-5 text-on-surface-variant" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              {/* Ratio Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-low/40 p-6 rounded-2xl border border-outline-variant/30">
                <div className="flex flex-col justify-center items-center text-center p-4 border-r border-outline-variant/40 last:border-none">
                  <p className="text-label-md text-on-surface-variant mb-1 font-semibold uppercase tracking-wider text-xs">Debt-to-Asset Ratio</p>
                  <h2 className={cn("text-display-lg font-extrabold tracking-tight font-financial", debtRatio > 50 ? "text-error" : debtRatio >= 35 ? "text-amber-600" : "text-emerald-600")}>
                    {debtRatio}%
                  </h2>
                  <span className={cn("text-label-sm font-bold px-3 py-1 rounded-full uppercase mt-2 text-[10px]", debtRatio > 50 ? "bg-red-100 text-red-700" : debtRatio >= 35 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                    {statusText}
                  </span>
                </div>

                <div className="flex flex-col justify-center items-center text-center p-4">
                  <p className="text-label-md text-on-surface-variant mb-1 font-semibold uppercase tracking-wider text-xs">Rasio Likuiditas Kas</p>
                  <h2 className="text-display-lg text-primary font-extrabold tracking-tight font-financial">
                    {liquidityRatio}%
                  </h2>
                  <span className="text-label-sm bg-primary/10 text-primary font-bold px-3 py-1 rounded-full uppercase mt-2 text-[10px]">
                    {liquidityRatio >= 10 ? "Sehat" : "Rendah"}
                  </span>
                </div>
              </div>

              {/* Progress Slider (Visual Indicator) */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-on-surface-variant font-semibold">
                  <span>Sangat Sehat (0%)</span>
                  <span>Batas Aman (35%)</span>
                  <span>Kritis (100%)</span>
                </div>
                <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden relative">
                  <div className="absolute top-0 bottom-0 left-0 bg-emerald-500 w-[35%]" />
                  <div className="absolute top-0 bottom-0 left-[35%] bg-amber-500 w-[15%]" />
                  <div className="absolute top-0 bottom-0 left-[50%] bg-red-500 w-[50%]" />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 bg-white rounded-full border-2 border-primary shadow-md transition-all duration-500" 
                    style={{ left: `${Math.min(100, Math.max(0, debtRatio))}%` }}
                  />
                </div>
                <p className="text-[11px] text-on-surface-variant text-center mt-1">
                  Penunjuk lingkaran putih menandakan posisi rasio beban hutang Anda saat ini.
                </p>
              </div>

              {/* Detailed Recommendations */}
              <div className="space-y-4">
                <div className="flex gap-3 items-start p-4 rounded-xl border border-outline-variant/30 bg-surface/50">
                  <span className="material-symbols-outlined text-[#5A45CB] shrink-0 mt-0.5" style={{ fontSize: "22px" }}>
                    {debtRatio > 50 ? "error" : debtRatio >= 35 ? "warning" : "shield"}
                  </span>
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">{recommendationTitle}</h4>
                    <p className="text-body-md text-sm text-on-surface-variant mt-1 leading-relaxed">
                      {recommendationDesc}
                    </p>
                  </div>
                </div>

                {/* Liquidity Warning */}
                {liquidityRatio < 10 && (
                  <div className="flex gap-3 items-start p-4 rounded-xl border border-red-200 bg-red-50/50">
                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-label-md font-bold text-red-700">Peringatan Likuiditas Rendah</h4>
                      <p className="text-body-md text-sm text-red-800/90 mt-1 leading-relaxed">
                        Aset likuid Anda (Kas/Tabungan) berada di bawah 10% dari total harta. Sebaiknya hindari membeli barang modal tidak bergerak (tanah, properti) dan tingkatkan cadangan uang tunai Anda.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Checklist Advice */}
              <div className="space-y-3">
                <h4 className="text-label-md font-bold text-on-surface">Panduan Langkah Selanjutnya (Rekomendasi AI)</h4>
                <div className="space-y-2">
                  {checklist.map((item, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="mt-1 flex items-center justify-center w-5 h-5 rounded bg-primary/10 text-primary shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-sm text-on-surface-variant font-medium leading-normal">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-outline-variant/40 px-8 py-5 flex justify-end bg-surface/50">
              <button 
                onClick={() => setIsAnalysisOpen(false)}
                className="bg-primary hover:bg-primary-container text-white px-6 py-2.5 rounded-xl text-label-md font-bold cursor-pointer border-none shadow-sm"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-outline-variant/50 py-6 px-8 flex justify-between items-center text-on-surface-variant text-label-sm mt-auto">
        <p>© 2026 JakUang Financial OS. Hak Cipta Dilindungi.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
          <a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
        </div>
      </footer>
    </div>
  );
}
