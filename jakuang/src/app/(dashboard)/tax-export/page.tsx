"use client";

import { formatCurrency } from "@/lib/utils/currency";

export default function TaxExportPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-display-lg text-on-surface">Laporan Pajak</h1>
        <p className="text-body-lg text-on-surface-variant mt-2 max-w-2xl">
          Ringkasan estimasi kewajiban perpajakan Anda. Pastikan seluruh data aset dan liabilitas telah dimutakhirkan sebelum mengekspor dokumen SPT.
        </p>
      </div>

      {/* Deadline Alert */}
      <div className="bg-error-container/20 border border-error-container rounded-lg p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-error">campaign</span>
        </div>
        <div>
          <h3 className="text-headline-sm text-on-surface mb-1">Pengingat Batas Waktu Pelaporan</h3>
          <p className="text-body-md text-on-surface-variant">
            Batas akhir penyampaian SPT Tahunan Wajib Pajak Orang Pribadi adalah tanggal <span className="font-bold text-on-surface">31 Maret</span>. Silakan ekspor data Anda dan laporkan melalui DJP Online untuk menghindari sanksi administrasi.
          </p>
        </div>
      </div>

      {/* Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* PKP */}
        <div className="col-span-1 md:col-span-4 bg-surface-container-lowest rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant p-6 flex flex-col h-full hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
              </div>
              <h3 className="text-label-md text-on-surface-variant">Estimasi PKP</h3>
            </div>
            <div className="text-display-lg-mobile text-on-surface font-financial">
              {formatCurrency(450_000_000)}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-outline-variant">
            <p className="text-label-sm text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">info</span>
              Penghasilan Kena Pajak disetahunkan
            </p>
          </div>
        </div>

        {/* Pajak Terutang */}
        <div className="col-span-1 md:col-span-4 bg-surface-container-lowest rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant p-6 flex flex-col h-full hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary text-[20px]">receipt_long</span>
              </div>
              <h3 className="text-label-md text-on-surface-variant">Pajak Terutang (PPh 21)</h3>
            </div>
            <div className="text-display-lg-mobile text-on-surface font-financial">
              {formatCurrency(65_500_000)}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-outline-variant flex justify-between items-center">
            <p className="text-label-sm text-on-surface-variant">Berdasarkan tarif progresif</p>
            <a href="#" className="text-label-sm text-primary hover:underline">Lihat Detail</a>
          </div>
        </div>

        {/* Status & Export */}
        <div className="col-span-1 md:col-span-4 bg-surface-container-lowest rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant p-6 flex flex-col h-full">
          <h3 className="text-headline-sm text-on-surface mb-6">Status Kesiapan Data</h3>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-label-md text-on-surface-variant">Kelengkapan Form SPT</span>
              <span className="text-label-md text-primary font-bold">100%</span>
            </div>
            <div className="w-full bg-surface-variant rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: "100%" }} />
            </div>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {["Sheet Penghasilan", "Sheet Harta (Assets)", "Sheet Kewajiban (Liabilities)"].map((sheet) => (
              <li key={sheet} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="text-body-md text-on-surface">{sheet}</span>
              </li>
            ))}
          </ul>

          <button className="w-full bg-primary text-on-primary text-label-md py-3 px-4 rounded-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-2 shadow-sm">
            <span className="material-symbols-outlined">download</span>
            Ekspor SPT (.xlsx)
          </button>
        </div>
      </div>
    </div>
  );
}
