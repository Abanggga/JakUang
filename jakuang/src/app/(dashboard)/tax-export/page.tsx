"use client";

import { useEffect, useState } from "react";
import { getProfile, getTransactions, getAssets, getLiabilities } from "@/lib/utils/storage-util";
import { formatCurrency } from "@/lib/utils/currency";
import { TaxEngineFactory } from "@/lib/tax-engine";
import { ptkpValues, profileLabels } from "@/lib/mock-data";

export default function TaxExportPage() {
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);

  // Computed values
  const [totalPKP, setTotalPKP] = useState(0);
  const [totalTaxDue, setTotalTaxDue] = useState(0);
  const [profileTaxList, setProfileTaxList] = useState<any[]>([]);

  // Local storage accounts for asset counting
  const [accountsCount, setAccountsCount] = useState(0);

  useEffect(() => {
    const prof = getProfile();
    const txs = getTransactions();
    const asts = getAssets();
    const lias = getLiabilities();

    // Fetch accounts count
    let accs: any[] = [];
    try {
      const item = localStorage.getItem("jakuang_accounts");
      accs = item ? JSON.parse(item) : [];
    } catch {
      accs = [];
    }

    setProfile(prof);
    setTransactions(txs);
    setAssets(asts);
    setLiabilities(lias);
    setAccountsCount(accs.length);

    // Compute Tax Engine
    const calculatedTaxes = prof.activeProfiles.map((pType: string) => {
      const profileIncomes = txs
        .filter((t) => t.isConfirmed && t.profile === pType && t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0);

      const ptkp = ptkpValues[prof.ptkpStatus] || 54_000_000;
      const bpjsEmployee = pType === "KARYAWAN" ? 200_000 * 12 : 0;

      try {
        const engine = TaxEngineFactory.create(pType as any, prof.kluCode, prof.domisiliType);
        const result = engine.calculate({
          grossIncome: profileIncomes,
          ptkp,
          bpjsEmployee,
        });

        return {
          type: pType,
          label: profileLabels[pType] || pType,
          grossIncome: profileIncomes,
          netIncome: result.netIncome,
          taxableIncome: result.taxableIncome,
          taxDue: result.taxDue,
          breakdown: result.breakdown,
        };
      } catch (err) {
        console.error(`Error calculating tax in export page for ${pType}`, err);
        return {
          type: pType,
          label: profileLabels[pType] || pType,
          grossIncome: profileIncomes,
          netIncome: 0,
          taxableIncome: 0,
          taxDue: 0,
          breakdown: [],
        };
      }
    });

    setProfileTaxList(calculatedTaxes);
    setTotalPKP(calculatedTaxes.reduce((sum, item) => sum + item.taxableIncome, 0));
    setTotalTaxDue(calculatedTaxes.reduce((sum, item) => sum + item.taxDue, 0));
  }, []);

  // Export to CSV helper
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // --- SHEET 1: PENGHASILAN & PAJAK ---
    csvContent += "=== SHEET 1: PENGHASILAN & PAJAK ===\n";
    csvContent += "Profil,Bruto Tahunan,Penghasilan Neto,PKP,Pajak Terutang\n";
    profileTaxList.forEach((item) => {
      csvContent += `"${item.label}",${item.grossIncome},${item.netIncome},${item.taxableIncome},${item.taxDue}\n`;
    });
    csvContent += `\nTOTAL,,,${totalPKP},${totalTaxDue}\n\n`;

    // --- SHEET 2: DAFTAR HARTA ---
    csvContent += "=== SHEET 2: DAFTAR HARTA ===\n";
    csvContent += "Nama Harta,Kategori,Kode SPT,Nilai Perolehan,Status\n";
    
    // assets
    assets.forEach((ast) => {
      csvContent += `"${ast.name}","${ast.category}","${ast.sptCode}",${ast.value},"${ast.status}"\n`;
    });
    // bank accounts
    let accs: any[] = [];
    try {
      const item = localStorage.getItem("jakuang_accounts");
      accs = item ? JSON.parse(item) : [];
    } catch {}
    accs.forEach((acc) => {
      csvContent += `"${acc.name}","KAS_DAN_TABUNGAN","041",${acc.balance},"TUNAI"\n`;
    });
    csvContent += "\n";

    // --- SHEET 3: DAFTAR KEWAJIBAN ---
    csvContent += "=== SHEET 3: DAFTAR KEWAJIBAN ===\n";
    csvContent += "Nama Kreditur,Jenis Pinjaman,Nilai Pokok,Sisa Hutang\n";
    liabilities.forEach((l) => {
      csvContent += `"${l.creditor}","${l.type}",${l.principal},${l.remaining}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SPT_Tahunan_Jakuang_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-display-lg text-on-surface tracking-tight">Laporan Pajak</h1>
        <p className="text-body-lg text-on-surface-variant mt-2 max-w-2xl">
          Ringkasan estimasi kewajiban perpajakan Anda. Pastikan seluruh data aset dan liabilitas telah dimutakhirkan sebelum mengekspor dokumen SPT.
        </p>
      </div>

      {/* Deadline Alert */}
      <div className="bg-error-container/20 border border-error-container rounded-3xl p-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center shrink-0 text-error">
          <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>campaign</span>
        </div>
        <div>
          <h3 className="text-headline-sm text-lg font-bold text-on-surface mb-1">Pengingat Batas Waktu Pelaporan</h3>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            Batas akhir penyampaian SPT Tahunan Wajib Pajak Orang Pribadi adalah tanggal <span className="font-bold text-on-surface">31 Maret</span>. Silakan ekspor data Anda dan laporkan melalui DJP Online untuk menghindari sanksi administrasi.
          </p>
        </div>
      </div>

      {/* Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* PKP */}
        <div className="col-span-12 md:col-span-4 bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant p-6 flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
              </div>
              <h3 className="text-label-md text-on-surface-variant font-semibold">Estimasi PKP (Mulai Pajak)</h3>
            </div>
            <div className="text-display-lg-mobile text-on-surface font-financial font-bold">
              {formatCurrency(totalPKP)}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-outline-variant/40">
            <p className="text-label-sm text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">info</span>
              Penghasilan Kena Pajak disetahunkan
            </p>
          </div>
        </div>

        {/* Pajak Terutang */}
        <div className="col-span-12 md:col-span-4 bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant p-6 flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary text-[20px]">receipt_long</span>
              </div>
              <h3 className="text-label-md text-on-surface-variant font-semibold">Total Pajak Terutang (PPh)</h3>
            </div>
            <div className="text-display-lg-mobile text-on-surface font-financial font-bold">
              {formatCurrency(totalTaxDue)}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-outline-variant/40 flex justify-between items-center text-xs">
            <p className="text-label-sm text-on-surface-variant">Berdasarkan data profil aktif Anda</p>
          </div>
        </div>

        {/* Status & Export */}
        <div className="col-span-12 md:col-span-4 bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant p-6 flex flex-col h-full">
          <h3 className="text-headline-sm text-lg font-bold text-on-surface mb-6">Status Kesiapan Data</h3>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-label-md text-on-surface-variant font-semibold">Kelengkapan Form SPT</span>
              <span className="text-label-md text-primary font-bold">100%</span>
            </div>
            <div className="w-full bg-surface-variant rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: "100%" }} />
            </div>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-body-md text-on-surface text-sm">Sheet 1: Penghasilan & Pajak ({profile?.activeProfiles.length || 0} profil)</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-body-md text-on-surface text-sm">Sheet 2: Daftar Harta ({assets.length} aset, {accountsCount} rekening)</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-body-md text-on-surface text-sm">Sheet 3: Daftar Kewajiban ({liabilities.length} pinjaman)</span>
            </li>
          </ul>

          <button 
            onClick={handleExportCSV}
            className="w-full bg-primary text-on-primary text-label-md py-3.5 px-4 rounded-xl hover:bg-primary-container transition-colors flex items-center justify-center gap-2 shadow-md font-bold cursor-pointer h-12"
          >
            <span className="material-symbols-outlined">download</span>
            Ekspor SPT (.csv)
          </button>
        </div>
      </div>

      {/* Calculation Breakdown Detail */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-8 mt-6">
        <h3 className="text-headline-sm text-lg font-bold text-on-surface mb-6 pb-4 border-b border-outline-variant/40">
          Rincian Perhitungan Pajak per Profil
        </h3>
        
        <div className="space-y-6">
          {profileTaxList.map((item) => (
            <div key={item.type} className="border border-outline-variant/40 rounded-2xl p-6 bg-surface">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h4 className="text-headline-sm text-base font-bold text-primary">{item.label}</h4>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-on-surface-variant font-medium">Omzet: {formatCurrency(item.grossIncome)}</span>
                  <span className="bg-primary-container/20 text-primary text-xs px-3 py-1 rounded-full font-bold">
                    Pajak Terutang: {formatCurrency(item.taxDue)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold text-on-surface-variant">
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20">
                  <p className="text-[10px] uppercase text-on-surface-variant/75 mb-1">Penghasilan Neto</p>
                  <p className="text-sm font-bold text-on-surface font-financial">{formatCurrency(item.netIncome)}</p>
                </div>
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20">
                  <p className="text-[10px] uppercase text-on-surface-variant/75 mb-1">PKP (Kena Pajak)</p>
                  <p className="text-sm font-bold text-on-surface font-financial">{formatCurrency(item.taxableIncome)}</p>
                </div>
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20 col-span-1 sm:col-span-2 md:col-span-1">
                  <p className="text-[10px] uppercase text-on-surface-variant/75 mb-1">Status PTKP</p>
                  <p className="text-sm font-bold text-on-surface">{profile?.ptkpStatus}</p>
                </div>
              </div>

              {item.breakdown.length > 0 && (
                <div className="mt-4 pt-4 border-t border-outline-variant/30">
                  <p className="text-[10px] uppercase text-on-surface-variant/75 font-bold mb-2">Rincian Perhitungan</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-on-surface-variant">
                    {item.breakdown.map((bd: any) => (
                      <li key={bd.label} className="flex justify-between border-b border-outline-variant/10 pb-1">
                        <span>{bd.label}</span>
                        <span className="font-bold text-on-surface font-financial">
                          {bd.label.includes("Rate") ? `${(bd.amount * 100).toFixed(0)}%` : formatCurrency(bd.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
