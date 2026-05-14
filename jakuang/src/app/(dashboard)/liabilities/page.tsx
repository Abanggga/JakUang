"use client";

import { mockLiabilities, mockSummary } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils/currency";
import Link from "next/link";

export default function LiabilitiesPage() {
  const totalLiabilities = mockSummary.totalLiabilities;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-display-lg text-on-surface tracking-tight">Kewajiban</h2>
          <p className="text-body-lg text-on-surface-variant">Daftar seluruh kewajiban dan cicilan Anda.</p>
        </div>
        <Link href="/assets" className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-label-md shadow-sm hover:shadow-md transition-shadow flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
          Lihat Aset & Kewajiban
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-card-gap">
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-4 translate-y-4">
            <span className="material-symbols-outlined" style={{ fontSize: "100px" }}>credit_card</span>
          </div>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-error-container/50 flex items-center justify-center text-error">
              <span className="material-symbols-outlined">trending_down</span>
            </div>
          </div>
          <p className="text-label-md text-on-surface-variant mb-1">Total Kewajiban</p>
          <h3 className="text-headline-md text-on-surface font-financial">{formatCurrency(totalLiabilities)}</h3>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/30 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">pie_chart</span>
            </div>
          </div>
          <p className="text-label-md text-on-surface-variant mb-1">Jumlah Kreditur</p>
          <h3 className="text-headline-md text-on-surface">{mockLiabilities.length}</h3>
        </div>

        <div className="bg-primary text-on-primary rounded-3xl shadow-sm p-6 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <span className="material-symbols-outlined mb-3" style={{ fontSize: "28px" }}>verified_user</span>
            <p className="text-label-md text-on-primary/80 mb-1">Rasio Hutang</p>
            <h3 className="text-headline-md text-on-primary">
              {Math.round((totalLiabilities / mockSummary.totalAssets) * 100)}% — Aman
            </h3>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm overflow-hidden">
        <div className="p-8">
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
        </div>
      </div>
    </div>
  );
}
