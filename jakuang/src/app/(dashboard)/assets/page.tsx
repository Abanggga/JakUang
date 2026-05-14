"use client";

import { useState } from "react";
import { mockAssets, mockLiabilities, mockSummary } from "@/lib/mock-data";
import { formatCurrency, formatDateShort } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";

const assetIcons: Record<string, string> = { PROPERTI: "home", KENDARAAN: "directions_car", ALAT_USAHA: "laptop_mac" };
const assetCategories: Record<string, string> = { PROPERTI: "Properti", KENDARAAN: "Kendaraan", ALAT_USAHA: "Alat Usaha" };

export default function AssetsPage() {
  const [tab, setTab] = useState<"assets" | "liabilities">("assets");
  const totalAssets = mockSummary.totalAssets;
  const totalLiabilities = mockSummary.totalLiabilities;
  const netWorth = totalAssets - totalLiabilities;
  const debtRatio = Math.round((totalLiabilities / totalAssets) * 100);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-display-lg text-on-surface tracking-tight">Aset & Kewajiban</h2>
          <p className="text-body-lg text-on-surface-variant">Ringkasan kekayaan bersih dan rekam jejak finansial Anda.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 rounded-xl border-2 border-primary text-primary text-label-md hover:bg-primary-fixed/30 transition-colors">Unduh Laporan</button>
          <button className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-label-md shadow-sm hover:shadow-md transition-shadow">Tambah Entri</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 md:col-span-4 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <span className="bg-surface-container-low text-primary text-label-sm px-3 py-1 rounded-full">+12.5% YoY</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant mb-1">Total Harta Bersih</p>
            <h3 className="text-headline-md text-on-surface font-financial">{formatCurrency(netWorth)}</h3>
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
            <h3 className="text-headline-md text-on-surface font-financial">{formatCurrency(totalAssets)}</h3>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-4 translate-y-4">
            <span className="material-symbols-outlined" style={{ fontSize: "120px" }}>credit_card</span>
          </div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-error-container/50 flex items-center justify-center text-error">
              <span className="material-symbols-outlined">trending_down</span>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-label-md text-on-surface-variant mb-1">Total Kewajiban</p>
            <h3 className="text-headline-md text-on-surface font-financial">{formatCurrency(totalLiabilities)}</h3>
          </div>
        </div>

        {/* Chart */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-8">
          <h3 className="text-headline-sm text-on-surface mb-6 border-b border-outline-variant/40 pb-4">Perbandingan Harta vs Hutang</h3>
          <div className="flex h-48 gap-8 items-end justify-center px-8">
            <div className="flex flex-col items-center gap-3 w-32">
              <div className="w-full bg-primary rounded-t-md relative group" style={{ height: `${Math.min(192, Math.max(40, (totalAssets / (totalAssets + totalLiabilities)) * 192))}px` }}>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-label-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {100 - debtRatio}%
                </div>
              </div>
              <span className="text-label-md text-on-surface-variant">Aset</span>
            </div>
            <div className="flex flex-col items-center gap-3 w-32">
              <div className="w-full bg-tertiary-fixed-dim rounded-t-md relative group" style={{ height: `${Math.min(192, Math.max(20, (totalLiabilities / (totalAssets + totalLiabilities)) * 192))}px` }}>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-label-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {debtRatio}%
                </div>
              </div>
              <span className="text-label-md text-on-surface-variant">Kewajiban</span>
            </div>
          </div>
        </div>

        {/* Debt Status */}
        <div className="col-span-12 lg:col-span-4 bg-primary text-on-primary rounded-3xl shadow-sm p-8 flex flex-col justify-between overflow-hidden relative border border-primary/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <span className="material-symbols-outlined mb-4" style={{ fontSize: "32px" }}>verified_user</span>
            <h3 className="text-headline-sm mb-2">Status Rasio Hutang Aman</h3>
            <p className="text-body-md text-on-primary/90 mb-6">
              Rasio hutang Anda berada di angka {debtRatio}%, jauh di bawah batas maksimal yang direkomendasikan (35%).
            </p>
          </div>
          <button className="relative z-10 bg-secondary text-on-secondary text-label-md py-3 px-4 rounded-xl w-full flex items-center justify-between hover:bg-secondary-fixed-dim transition-colors">
            Lihat Analisis Lengkap
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

        {/* Asset/Liability Registry */}
        <div className="col-span-12 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm overflow-hidden mt-4">
          <div className="flex border-b border-outline-variant/40 px-8 pt-4 gap-8">
            <button
              onClick={() => setTab("assets")}
              className={cn("pb-3 text-label-md px-2", tab === "assets" ? "text-primary font-bold border-b-2 border-primary" : "text-on-surface-variant hover:text-on-surface")}
            >
              Daftar Aset
            </button>
            <button
              onClick={() => setTab("liabilities")}
              className={cn("pb-3 text-label-md px-2", tab === "liabilities" ? "text-primary font-bold border-b-2 border-primary" : "text-on-surface-variant hover:text-on-surface")}
            >
              Daftar Kewajiban
            </button>
          </div>

          <div className="p-8">
            {tab === "assets" ? (
              <>
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-surface-container-low/50 rounded-xl mb-4 text-label-sm text-on-surface-variant uppercase tracking-wider">
                  <div className="col-span-4">Nama Aset</div>
                  <div className="col-span-3">Kategori</div>
                  <div className="col-span-2">Kode SPT</div>
                  <div className="col-span-3 text-right">Nilai (IDR)</div>
                </div>
                <div className="space-y-2">
                  {mockAssets.map((asset) => (
                    <div key={asset.id} className="grid grid-cols-12 gap-4 px-4 py-4 items-center rounded-xl hover:bg-surface-container-low transition-colors group cursor-pointer border border-transparent hover:border-outline-variant/30">
                      <div className="col-span-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed group-hover:bg-primary group-hover:text-on-primary transition-colors">
                          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>{assetIcons[asset.category] || "inventory_2"}</span>
                        </div>
                        <span className="text-body-md text-on-surface font-medium">{asset.name}</span>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <span className="bg-surface-container border border-outline-variant/50 text-on-surface-variant px-3 py-1 rounded-full text-label-sm">
                          {assetCategories[asset.category] || asset.category}
                        </span>
                      </div>
                      <div className="col-span-2 text-on-surface-variant text-body-md">{asset.sptCode}</div>
                      <div className="col-span-3 text-right text-body-md text-on-surface font-semibold font-financial">
                        {formatCurrency(asset.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-surface-container-low/50 rounded-xl mb-4 text-label-sm text-on-surface-variant uppercase tracking-wider">
                  <div className="col-span-4">Kreditur</div>
                  <div className="col-span-2">Jenis</div>
                  <div className="col-span-3 text-right">Pokok</div>
                  <div className="col-span-3 text-right">Sisa</div>
                </div>
                <div className="space-y-2">
                  {mockLiabilities.map((l) => (
                    <div key={l.id} className="grid grid-cols-12 gap-4 px-4 py-4 items-center rounded-xl hover:bg-surface-container-low transition-colors group cursor-pointer border border-transparent hover:border-outline-variant/30">
                      <div className="col-span-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-error-container/40 flex items-center justify-center text-error group-hover:bg-error group-hover:text-on-error transition-colors">
                          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>credit_card</span>
                        </div>
                        <span className="text-body-md text-on-surface font-medium">{l.creditor}</span>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <span className="bg-surface-container border border-outline-variant/50 text-on-surface-variant px-3 py-1 rounded-full text-label-sm">{l.type}</span>
                      </div>
                      <div className="col-span-3 text-right text-body-md text-on-surface font-financial">{formatCurrency(l.principal)}</div>
                      <div className="col-span-3 text-right text-body-md text-error font-semibold font-financial">{formatCurrency(l.remaining)}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-6 flex justify-center border-t border-outline-variant/50 pt-6">
              <button className="text-primary text-label-md flex items-center gap-2 hover:bg-surface-container-low px-4 py-2 rounded-xl transition-colors">
                Lihat Semua {tab === "assets" ? "Aset" : "Kewajiban"}
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>expand_more</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-outline-variant/50 py-6 px-8 flex justify-between items-center text-on-surface-variant text-label-sm mt-auto">
        <p>© 2025 JakUang Financial OS. Hak Cipta Dilindungi.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
          <a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
        </div>
      </footer>
    </div>
  );
}
