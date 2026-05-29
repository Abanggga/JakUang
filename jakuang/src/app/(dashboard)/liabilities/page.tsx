"use client";

import { useEffect, useState } from "react";
import { getLiabilities, getAssets, saveLiabilities } from "@/lib/utils/storage-util";
import { formatCurrency } from "@/lib/utils/currency";
import Link from "next/link";

export default function LiabilitiesPage() {
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [totalLiabilities, setTotalLiabilities] = useState(0);
  const [debtRatio, setDebtRatio] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creditor, setCreditor] = useState("");
  const [loanType, setLoanType] = useState("KUR");
  const [principal, setPrincipal] = useState("");
  const [remaining, setRemaining] = useState("");

  const loadData = () => {
    const lias = getLiabilities();
    const assets = getAssets();
    const accounts = getAssets(); // wait! getAccounts in storage-util.ts: getAccounts() is what we want!
    // Wait, let's look at getAccounts: we can compute total assets as:
    // assets value + cash (which is accounts balance)
    // Let's import getAccounts if we need, but wait, we already have getAccounts in storage-util.ts.
    // Let's make sure we compute the debt ratio correctly.
    // Let's import getAccounts.
    const getAccounts = () => {
      try {
        const item = localStorage.getItem("jakuang_accounts");
        return item ? JSON.parse(item) : [];
      } catch {
        return [];
      }
    };
    const accs = getAccounts();
    const totalCash = accs.reduce((sum: number, a: any) => sum + a.balance, 0);
    const totalAssets = assets.reduce((sum: number, a: any) => sum + a.value, 0) + totalCash;

    const liaTotal = lias.reduce((sum, l) => sum + l.remaining, 0);

    setLiabilities(lias);
    setTotalLiabilities(liaTotal);
    setDebtRatio(totalAssets > 0 ? Math.round((liaTotal / totalAssets) * 100) : 0);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddLiability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditor.trim() || !principal || !remaining) return;

    const lias = getLiabilities();
    lias.push({
      id: `lia-${Date.now()}`,
      creditor: creditor,
      type: loanType,
      principal: parseInt(principal, 10),
      remaining: parseInt(remaining, 10),
      startDate: new Date().toISOString().split("T")[0],
    });

    saveLiabilities(lias);
    setIsModalOpen(false);
    setCreditor("");
    setPrincipal("");
    setRemaining("");
    loadData();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-display-lg text-on-surface tracking-tight">Kewajiban (Liabilities)</h2>
          <p className="text-body-lg text-on-surface-variant">Daftar seluruh kewajiban, cicilan, dan hutang pinjaman Anda.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/assets" className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface text-label-md hover:bg-surface-container transition-colors flex items-center gap-2 cursor-pointer font-semibold bg-surface-container-lowest shadow-sm">
            <span className="material-symbols-outlined text-[20px]">account_balance</span>
            Daftar Aset
          </Link>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-label-md shadow-sm hover:shadow-md transition-shadow flex items-center gap-2 cursor-pointer font-bold animate-pulse-glow"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Kewajiban
          </button>
        </div>
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
          <h3 className="text-headline-md text-on-surface font-financial font-bold">{formatCurrency(totalLiabilities)}</h3>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/30 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">pie_chart</span>
            </div>
          </div>
          <p className="text-label-md text-on-surface-variant mb-1">Jumlah Kreditur</p>
          <h3 className="text-headline-md text-on-surface font-bold">{liabilities.length}</h3>
        </div>

        <div className="bg-primary text-on-primary rounded-3xl shadow-sm p-6 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <span className="material-symbols-outlined mb-3" style={{ fontSize: "28px" }}>verified_user</span>
            <p className="text-label-md text-on-primary/80 mb-1">Rasio Hutang terhadap Aset (Debt Ratio)</p>
            <h3 className="text-headline-md text-on-primary font-bold">
              {debtRatio}% — {debtRatio <= 35 ? "Aman" : "Tinggi"}
            </h3>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-surface-container-low/50 rounded-xl mb-4 text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">
            <div className="col-span-4">Kreditur</div>
            <div className="col-span-2">Jenis</div>
            <div className="col-span-3 text-right">Nilai Pokok</div>
            <div className="col-span-3 text-right">Sisa Hutang</div>
          </div>
          <div className="space-y-2">
            {liabilities.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-body-md">
                Tidak ada kewajiban terdaftar.
              </div>
            ) : (
              liabilities.map((l) => (
                <div key={l.id} className="grid grid-cols-12 gap-4 px-4 py-4 items-center rounded-xl hover:bg-surface-container-low transition-colors group cursor-pointer border border-transparent hover:border-outline-variant/30">
                  <div className="col-span-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-error-container/40 flex items-center justify-center text-error group-hover:bg-error group-hover:text-on-error transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>credit_card</span>
                    </div>
                    <span className="text-body-md text-on-surface font-medium">{l.creditor}</span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="bg-surface-container border border-outline-variant/50 text-on-surface-variant px-3 py-1 rounded-full text-label-sm font-semibold">{l.type}</span>
                  </div>
                  <div className="col-span-3 text-right text-body-md text-on-surface font-financial">{formatCurrency(l.principal)}</div>
                  <div className="col-span-3 text-right text-body-md text-error font-semibold font-financial">{formatCurrency(l.remaining)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Liability Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-surface/50 border-b border-outline-variant/40 px-6 py-4 flex justify-between items-center">
              <h3 className="text-headline-sm text-lg font-bold">Tambah Kewajiban</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:bg-surface-container p-1 rounded-full cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddLiability} className="p-6 space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-semibold">Nama Kreditur / Institusi</label>
                <input
                  type="text"
                  required
                  value={creditor}
                  onChange={(e) => setCreditor(e.target.value)}
                  placeholder="Contoh: Bank Mandiri KUR"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label-md font-semibold">Jenis Pinjaman / Cicilan</label>
                <select
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface outline-none cursor-pointer"
                >
                  <option value="KUR">KUR (Kredit Usaha Rakyat)</option>
                  <option value="KKB">KKB (Kredit Kendaraan Bermotor)</option>
                  <option value="KPR">KPR (Kredit Pemilikan Rumah)</option>
                  <option value="PINJOL">Pinjaman Online</option>
                  <option value="HUTANG_USAHA">Hutang Dagang / Usaha</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label-md font-semibold">Jumlah Pokok Awal (IDR)</label>
                <input
                  type="number"
                  required
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder="50000000"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface outline-none font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label-md font-semibold">Sisa Hutang Saat Ini (IDR)</label>
                <input
                  type="number"
                  required
                  value={remaining}
                  onChange={(e) => setRemaining(e.target.value)}
                  placeholder="35000000"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded-xl text-label-md hover:bg-surface-container cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-on-primary rounded-xl text-label-md font-bold hover:opacity-95 cursor-pointer shadow-md"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
