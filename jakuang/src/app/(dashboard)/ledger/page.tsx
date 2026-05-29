"use client";

import { useEffect, useState } from "react";
import { getTransactions, addTransaction, getProfile, confirmTransaction } from "@/lib/utils/storage-util";
import { formatCurrency, relativeTime } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { TRANSACTION_CATEGORY_CONFIG, TRANSACTION_DEFAULT_CONFIG } from "@/lib/config/ui-config";
import Link from "next/link";

const tabs = ["Semua Transaksi", "Pendapatan", "Pengeluaran", "Aset", "Kewajiban"];

export default function LedgerPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cashIn, setCashIn] = useState(0);
  const [cashOut, setCashOut] = useState(0);
  const [netFlow, setNetFlow] = useState(0);

  // Manual Transaction Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualDesc, setManualDesc] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualRouting, setManualRouting] = useState("EXPENSE");
  const [manualProfile, setManualProfile] = useState("");
  const [manualCategory, setManualCategory] = useState("Lainnya");
  const [activeProfiles, setActiveProfiles] = useState<string[]>([]);

  const loadData = () => {
    const txs = getTransactions();
    const prof = getProfile();
    setTransactions(txs);
    setActiveProfiles(prof.activeProfiles);

    const totalIncome = txs
      .filter((t) => t.isConfirmed && (t.type === "INCOME" || t.routingType === "INCOME"))
      .reduce((s, t) => s + t.amount, 0);
    const totalExpense = txs
      .filter((t) => t.isConfirmed && (t.type === "EXPENSE" || t.routingType === "EXPENSE"))
      .reduce((s, t) => s + t.amount, 0);

    setCashIn(totalIncome);
    setCashOut(totalExpense);
    setNetFlow(totalIncome - totalExpense);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmTransaction = (id: string) => {
    confirmTransaction(id);
    loadData();
  };

  const handleAddManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDesc.trim() || !manualAmount) return;

    addTransaction({
      description: manualDesc,
      amount: parseInt(manualAmount, 10),
      routingType: manualRouting,
      profile: manualProfile || null,
      category: manualCategory,
      date: new Date().toISOString(),
      source: "MANUAL",
      confidence: "HIGH",
      isConfirmed: true,
    });

    setIsModalOpen(false);
    setManualDesc("");
    setManualAmount("");
    setManualRouting("EXPENSE");
    setManualProfile("");
    setManualCategory("Lainnya");
    loadData();
  };

  const getFilteredTransactions = () => {
    switch (activeTab) {
      case 1: // Income
        return transactions.filter((t) => t.type === "INCOME" || t.routingType === "INCOME");
      case 2: // Expense
        return transactions.filter((t) => t.type === "EXPENSE" || t.routingType === "EXPENSE");
      case 3: // Asset
        return transactions.filter(
          (t) => t.routingType === "ASSET_PURCHASE" || t.routingType === "ASSET_CREDIT"
        );
      case 4: // Liability
        return transactions.filter(
          (t) =>
            t.routingType === "ASSET_CREDIT" ||
            t.routingType === "LOAN_DISBURSEMENT" ||
            t.routingType === "LOAN_PAYMENT"
        );
      default: // All
        return transactions;
    }
  };

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-display-lg text-on-surface tracking-tight">Ledger</h2>
          <p className="text-body-lg text-on-surface-variant">Kelola dan konfirmasikan semua data transaksi keuangan Anda.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/input">
            <button className="bg-surface-container-lowest border border-outline-variant text-primary px-4 py-3 rounded-xl text-label-md hover:bg-surface-container-low transition-all flex items-center gap-2 font-semibold cursor-pointer shadow-sm">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              Snap & Speak AI
            </button>
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-on-primary px-5 py-3 rounded-xl text-label-md hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Entri Manual
          </button>
        </div>
      </div>

      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-card-gap">
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-surface-container-low rounded-bl-full -z-0" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Total Pendapatan</p>
              <p className="text-headline-md text-on-surface mt-2 font-financial">{formatCurrency(cashIn)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">arrow_downward</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-error-container/30 rounded-bl-full -z-0" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Total Pengeluaran</p>
              <p className="text-headline-md text-on-surface mt-2 font-financial">{formatCurrency(cashOut)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined">arrow_upward</span>
            </div>
          </div>
        </div>

        <div className="bg-primary text-on-primary rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/50 rounded-bl-full -z-0" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-label-md text-on-primary/80 uppercase tracking-wider font-semibold">Selisih Bersih (Arus Kas)</p>
              <p className="text-headline-md text-on-primary mt-2 font-financial">{formatCurrency(netFlow)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-px overflow-x-auto no-scrollbar">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={cn(
              "px-5 py-3 text-label-md font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer",
              i === activeTab
                ? "text-primary border-primary font-bold"
                : "text-on-surface-variant border-transparent hover:text-on-surface"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Transaction Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-outline-variant/40 bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">
          <div className="col-span-5 md:col-span-4">Detail Transaksi</div>
          <div className="hidden md:block col-span-2">Kategori</div>
          <div className="col-span-4 md:col-span-3 text-center">Status Verifikasi</div>
          <div className="col-span-3 text-right">Jumlah (IDR)</div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant text-body-md">
            Tidak ada transaksi terdaftar untuk kategori ini.
          </div>
        ) : (
          filteredTransactions.map((txn) => {
            const config = TRANSACTION_CATEGORY_CONFIG[txn.category] || TRANSACTION_DEFAULT_CONFIG;
            const isIncome = txn.type === "INCOME" || txn.routingType === "INCOME";

            return (
              <div
                key={txn.id}
                className="grid grid-cols-12 gap-4 p-4 items-center border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors cursor-pointer group"
              >
                <div className="col-span-5 md:col-span-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${config.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                    <span className="material-symbols-outlined">{config.icon}</span>
                  </div>
                  <div>
                    <p className="text-label-md text-base font-bold text-on-surface">{txn.description}</p>
                    <p className="text-label-sm text-xs text-on-surface-variant mt-0.5">{relativeTime(txn.date)}</p>
                  </div>
                </div>
                <div className="hidden md:flex col-span-2 items-center">
                  <span className={`px-2.5 py-1 rounded-md ${config.bgClass} ${config.textClass} text-label-sm font-bold`}>
                    {txn.category || config.label}
                  </span>
                </div>
                <div className="col-span-4 md:col-span-3 flex items-center justify-center">
                  {txn.isConfirmed ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-emerald-500/5 text-emerald-700 border-emerald-500/20 font-semibold">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span className="text-label-sm text-xs">Terverifikasi</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConfirmTransaction(txn.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-amber-500/10 text-amber-800 border-amber-500/20 font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">pending</span>
                      <span className="text-label-sm text-xs">Konfirmasi AI</span>
                    </button>
                  )}
                </div>
                <div className="col-span-3 text-right">
                  <p className={cn("text-headline-sm font-bold font-financial", isIncome ? "text-green-600" : "text-on-surface")}>
                    {isIncome ? "+ " : "- "}{formatCurrency(txn.amount)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-surface/50 border-b border-outline-variant/40 px-6 py-4 flex justify-between items-center">
              <h3 className="text-headline-sm text-lg font-bold">Tambah Entri Transaksi</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:bg-surface-container p-1 rounded-full cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddManualEntry} className="p-6 space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-semibold">Deskripsi</label>
                <input
                  type="text"
                  required
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                  placeholder="Contoh: Beli pakan ternak harian"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label-md font-semibold">Nominal (IDR)</label>
                <input
                  type="number"
                  required
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  placeholder="250000"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface outline-none font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label-md font-semibold">Tipe Transaksi</label>
                <select
                  value={manualRouting}
                  onChange={(e) => setManualRouting(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface outline-none cursor-pointer"
                >
                  <option value="EXPENSE">Pengeluaran Usaha</option>
                  <option value="INCOME">Pendapatan Usaha</option>
                  <option value="PERSONAL">Pengeluaran Pribadi</option>
                  <option value="ASSET_PURCHASE">Pembelian Aset Tunai</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label-md font-semibold">Profil Pemilik</label>
                <select
                  value={manualProfile}
                  onChange={(e) => setManualProfile(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface outline-none cursor-pointer"
                >
                  <option value="">Pribadi (Non-Bisnis)</option>
                  {activeProfiles.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label-md font-semibold">Kategori</label>
                <input
                  type="text"
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  placeholder="Contoh: Pakan / Bahan Baku"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface outline-none"
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
