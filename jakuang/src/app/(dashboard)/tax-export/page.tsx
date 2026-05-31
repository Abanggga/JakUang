"use client";

import { useEffect, useState } from "react";
import {
  getProfile,
  getTransactionsForYear,
  getAssetsAtEndOfYear,
  getLiabilitiesAtEndOfYear,
  getAccountBalancesAtEndOfYear,
  getAvailableTaxYears,
} from "@/lib/utils/storage-util";
import { formatCurrency } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/badge";

export default function TaxExportPage() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  
  // Data lists
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  // UI Expand state
  const [expandedSheet, setExpandedSheet] = useState<"penghasilan" | "harta" | "kewajiban" | null>("penghasilan");

  // Load and filter data dynamically based on year
  useEffect(() => {
    const years = getAvailableTaxYears();
    setAvailableYears(years);
    if (years.length > 0 && !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, []);

  useEffect(() => {
    const prof = getProfile();
    setProfile(prof);

    // Get all records for selected year
    const rawTxs = getTransactionsForYear(selectedYear);
    const rawAssets = getAssetsAtEndOfYear(selectedYear);
    const rawLiabilities = getLiabilitiesAtEndOfYear(selectedYear);
    const rawAccounts = getAccountBalancesAtEndOfYear(selectedYear);

    setTransactions(rawTxs);
    setAssets(rawAssets);
    setLiabilities(rawLiabilities);
    setAccounts(rawAccounts);
  }, [selectedYear]);

  // Compute profile summary values
  const getProfilesSummary = () => {
    const summaries: any[] = [];
    const activeProfs = profile?.activeProfiles || [];
    
    // If empty active profiles list, fall back to showing all to avoid completely empty view before onboarding/settings are configured
    const isEmpty = activeProfs.length === 0;
    const hasEmployee = isEmpty || activeProfs.includes("KARYAWAN") || activeProfs.includes("KARYAWAN_HARIAN");
    const hasUmkm = isEmpty || activeProfs.includes("UMKM");
    const hasFreelance = isEmpty || activeProfs.some((p: string) => 
      ["FREELANCE", "KREATIF", "GIG", "PETANI", "PETERNAK", "NELAYAN", "PEMBUDIDAYA"].includes(p)
    );

    let profileIndex = 1;
    
    // 1. UMKM
    if (hasUmkm) {
      const umkmIncome = transactions
        .filter((t) => t.type === "INCOME" && t.profile === "UMKM")
        .reduce((sum, t) => sum + t.amount, 0);
      summaries.push({
        id: "prof-umkm",
        badge: `Profil ${profileIndex++}`,
        badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        icon: "store",
        title: "Peredaran Bruto UMKM",
        type: "Peredaran Bruto",
        amount: umkmIncome,
        desc: "Dikenakan PPh Final 0.5%"
      });
    }

    // 2. Karyawan
    if (hasEmployee) {
      const karyawanIncome = transactions
        .filter((t) => t.type === "INCOME" && t.profile === "KARYAWAN")
        .reduce((sum, t) => sum + t.amount, 0);
      summaries.push({
        id: "prof-karyawan",
        badge: `Profil ${profileIndex++}`,
        badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        icon: "badge",
        title: "Penghasilan Karyawan",
        type: "Penghasilan Netto",
        amount: karyawanIncome,
        desc: "Dikenakan PPh Pasal 21"
      });
    }

    // 3. Pekerjaan Bebas (NPPN)
    if (hasFreelance) {
      const nppnIncome = transactions
        .filter((t) => t.type === "INCOME" && t.profile !== "UMKM" && t.profile !== "KARYAWAN")
        .reduce((sum, t) => sum + t.amount, 0);
      summaries.push({
        id: "prof-nppn",
        badge: `Profil ${profileIndex++}`,
        badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
        icon: "psychology",
        title: "Pekerjaan Bebas (NPPN)",
        type: "Penghasilan Netto (Norma)",
        amount: nppnIncome * 0.5, // standard 50% norm
        desc: "Dihitung dari Norma 50%"
      });
    }

    return summaries;
  };

  const summaries = getProfilesSummary();

  // Combined assets listing (assets + cash balances)
  const totalAssetsValue = assets.reduce((sum, a) => sum + (a.value || 0), 0) + accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalLiabilitiesValue = liabilities.reduce((sum, l) => sum + (l.remaining || 0), 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Filter Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/60 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Tax Export (SPT 1770)</h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-xl">
            Review your financial records, assets, and liabilities as of December 31 for tax filing.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Year selector */}
          <div className="flex items-center bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/30 w-full sm:w-auto">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant ml-2.5">calendar_today</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent border-none text-on-surface text-sm font-semibold pr-8 pl-2 py-1 outline-none cursor-pointer w-full sm:w-auto"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Tahun Pajak {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tax Profile Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaries.map((sum) => (
          <div
            key={sum.id}
            className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between min-h-[150px]"
          >
            <div className="flex justify-between items-start">
              <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sum.badgeColor}`}>
                {sum.badge}
              </Badge>
              <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[20px]">{sum.icon}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-bold text-on-surface line-clamp-1">{sum.title}</h4>
              <p className="text-[10px] text-on-surface-variant mt-0.5">{sum.type}</p>
              <p className="text-2xl font-extrabold text-on-surface font-financial mt-2 tracking-tight">
                {formatCurrency(sum.amount)}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-outline-variant/30 text-[10px] text-on-surface-variant/80 font-medium">
              {sum.desc}
            </div>
          </div>
        ))}
        
        {/* Placeholder if profile empty */}
        {summaries.length === 0 && (
          <div className="col-span-3 bg-surface-container-lowest border border-dashed border-outline-variant rounded-3xl p-8 text-center text-on-surface-variant text-sm">
            Tidak ada profil pajak aktif untuk akun ini.
          </div>
        )}
      </div>

      {/* SPT 1770 Data Sheets */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-outline-variant/40">
          <div>
            <h3 className="text-xl font-extrabold text-on-surface">SPT 1770 Data Sheets</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Review details of your tax schedules for filing.
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary font-bold border border-primary/20 text-xs px-3 py-1 rounded-full shrink-0">
            Tahun Pajak: {selectedYear}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* 1. Lampiran I */}
          <div className="border border-outline-variant/40 rounded-2xl overflow-hidden bg-surface">
            <button
              onClick={() => setExpandedSheet(expandedSheet === "penghasilan" ? null : "penghasilan")}
              className="w-full flex items-center justify-between p-4 bg-surface-container-low/50 hover:bg-surface-container-low transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[22px]">receipt_long</span>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">Lampiran I — Penghasilan Tahun Berjalan</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Rekapitulasi seluruh sumber penghasilan selama satu tahun</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-500/10 text-green-600 border border-green-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Ready
                </Badge>
                <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${expandedSheet === "penghasilan" ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </div>
            </button>

            {expandedSheet === "penghasilan" && (
              <div className="p-4 border-t border-outline-variant/20 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-on-surface-variant font-bold border-b border-outline-variant/30 uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pr-4">Tgl Transaksi</th>
                      <th className="pb-3 pr-4">Deskripsi</th>
                      <th className="pb-3 pr-4">Profil Pajak</th>
                      <th className="pb-3 pr-4 text-right">Nilai Bruto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                    {transactions
                      .filter((tx) => tx.type === "INCOME")
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="py-2.5 pr-4 whitespace-nowrap font-medium text-on-surface-variant">
                            {tx.date ? new Date(tx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                          </td>
                          <td className="py-2.5 pr-4 font-bold">{tx.description}</td>
                          <td className="py-2.5 pr-4">
                            <span className="bg-surface-container px-2 py-0.5 rounded-md text-[10px] font-bold text-on-surface-variant">
                              {tx.profile || "UMKM"}
                            </span>
                          </td>
                          <td className="py-2.5 pr-4 text-right font-bold font-financial">{formatCurrency(tx.amount)}</td>
                        </tr>
                      ))}
                    {transactions.filter((tx) => tx.type === "INCOME").length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-on-surface-variant font-medium">
                          Belum ada data penghasilan di tahun ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 2. Lampiran IV - Harta */}
          <div className="border border-outline-variant/40 rounded-2xl overflow-hidden bg-surface">
            <button
              onClick={() => setExpandedSheet(expandedSheet === "harta" ? null : "harta")}
              className="w-full flex items-center justify-between p-4 bg-surface-container-low/50 hover:bg-surface-container-low transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[22px]">account_balance</span>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">Lampiran IV (Harta) — Daftar Aset & Tabungan</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Daftar kekayaan dan saldo rekening per 31 Desember</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full font-financial">
                  {formatCurrency(totalAssetsValue)}
                </Badge>
                <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${expandedSheet === "harta" ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </div>
            </button>

            {expandedSheet === "harta" && (
              <div className="p-4 border-t border-outline-variant/20 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-on-surface-variant font-bold border-b border-outline-variant/30 uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pr-4">Kode SPT</th>
                      <th className="pb-3 pr-4">Nama Harta / Rekening</th>
                      <th className="pb-3 pr-4">Tahun Perolehan</th>
                      <th className="pb-3 pr-4">Status Pembiayaan</th>
                      <th className="pb-3 pr-4 text-right">Nilai Perolehan / Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                    {/* Bank account balances as of Dec 31 */}
                    {accounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="py-2.5 pr-4 font-bold text-primary">041</td>
                        <td className="py-2.5 pr-4 font-bold">{acc.bankName || acc.name} (Saldo per 31 Des)</td>
                        <td className="py-2.5 pr-4 text-on-surface-variant">{selectedYear}</td>
                        <td className="py-2.5 pr-4">
                          <span className="bg-green-500/10 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            TUNAI
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-right font-bold font-financial">{formatCurrency(acc.balance)}</td>
                      </tr>
                    ))}
                    
                    {/* Other assets */}
                    {assets.map((a) => (
                      <tr key={a.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="py-2.5 pr-4 font-bold text-primary">{a.sptCode || "031"}</td>
                        <td className="py-2.5 pr-4 font-bold">{a.name}</td>
                        <td className="py-2.5 pr-4 text-on-surface-variant">
                          {a.date ? new Date(a.date).getFullYear() : selectedYear}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            a.status === "KREDIT" 
                              ? "bg-amber-500/10 text-amber-600" 
                              : "bg-green-500/10 text-green-600"
                          }`}>
                            {a.status || "TUNAI"}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-right font-bold font-financial">{formatCurrency(a.value)}</td>
                      </tr>
                    ))}
                    
                    {assets.length === 0 && accounts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-on-surface-variant font-medium">
                          Tidak ada daftar harta per 31 Desember.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 3. Lampiran IV - Kewajiban */}
          <div className="border border-outline-variant/40 rounded-2xl overflow-hidden bg-surface">
            <button
              onClick={() => setExpandedSheet(expandedSheet === "kewajiban" ? null : "kewajiban")}
              className="w-full flex items-center justify-between p-4 bg-surface-container-low/50 hover:bg-surface-container-low transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[22px]">credit_card</span>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">Lampiran IV (Kewajiban) — Daftar Hutang Akhir Tahun</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Sisa saldo hutang/liabilitas outstanding per 31 Desember</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full font-financial">
                  {formatCurrency(totalLiabilitiesValue)}
                </Badge>
                <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${expandedSheet === "kewajiban" ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </div>
            </button>

            {expandedSheet === "kewajiban" && (
              <div className="p-4 border-t border-outline-variant/20 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-on-surface-variant font-bold border-b border-outline-variant/30 uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pr-4">Kode SPT</th>
                      <th className="pb-3 pr-4">Nama Pemberi Pinjaman (Kreditur)</th>
                      <th className="pb-3 pr-4">Jenis Pinjaman</th>
                      <th className="pb-3 pr-4">Tahun Peminjaman</th>
                      <th className="pb-3 pr-4 text-right">Sisa Hutang per 31 Des</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                    {liabilities.map((l) => (
                      <tr key={l.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="py-2.5 pr-4 font-bold text-primary">101</td>
                        <td className="py-2.5 pr-4 font-bold">{l.creditor}</td>
                        <td className="py-2.5 pr-4 uppercase text-on-surface-variant">{l.type || "KPR"}</td>
                        <td className="py-2.5 pr-4 text-on-surface-variant">
                          {l.startDate ? new Date(l.startDate).getFullYear() : selectedYear}
                        </td>
                        <td className="py-2.5 pr-4 text-right font-bold font-financial">{formatCurrency(l.remaining)}</td>
                      </tr>
                    ))}
                    {liabilities.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-on-surface-variant font-medium">
                          Tidak ada daftar kewajiban per 31 Desember.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer Info */}
      <div className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-5 flex items-start gap-4">
        <span className="material-symbols-outlined text-primary text-[24px] shrink-0 mt-0.5">info</span>
        <div>
          <h4 className="text-sm font-bold text-on-surface mb-1">Disclaimer Pelaporan Pajak</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Perhitungan dan visualisasi SPT 1770 di atas didasarkan pada transaksi terkonfirmasi yang tersimpan di aplikasi JakUang Anda. Estimasi di atas dibuat untuk membantu Anda mengisi formulir SPT Tahunan resmi di portal DJP Online. Harap verifikasi seluruh angka dengan bukti potong pajak asli Anda sebelum melakukan pelaporan.
          </p>
        </div>
      </div>
    </div>
  );
}
