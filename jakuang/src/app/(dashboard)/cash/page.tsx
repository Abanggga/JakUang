"use client";

import { useEffect, useState } from "react";
import { getAccounts, saveAccounts } from "@/lib/utils/storage-util";
import { formatCurrency } from "@/lib/utils/currency";

export default function CashPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [totalCash, setTotalCash] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccName, setNewAccName] = useState("");
  const [newAccType, setNewAccType] = useState("REKENING");
  const [newAccBalance, setNewAccBalance] = useState("");
  const [newAccBank, setNewAccBank] = useState("");

  const loadData = () => {
    const accs = getAccounts();
    setAccounts(accs);
    setTotalCash(accs.reduce((sum, a) => sum + a.balance, 0));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim() || !newAccBalance) return;

    const accs = getAccounts();
    accs.push({
      id: `acc-${Date.now()}`,
      name: newAccName,
      type: newAccType,
      balance: parseInt(newAccBalance, 10),
      bankName: newAccType === "REKENING" ? newAccBank || "Bank" : null,
    });

    saveAccounts(accs);
    setIsModalOpen(false);
    setNewAccName("");
    setNewAccBalance("");
    setNewAccBank("");
    loadData();
  };

  const largestAccount = accounts.length > 0 ? [...accounts].sort((a, b) => b.balance - a.balance)[0] : null;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-display-lg text-on-surface tracking-tight">Cash & Savings</h2>
          <p className="text-body-lg text-on-surface-variant">Monitor semua rekening dan kas fisik Anda.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-label-md shadow-sm hover:shadow-md transition-shadow flex items-center gap-2 cursor-pointer font-bold"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Rekening
        </button>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-card-gap">
        <div className="md:col-span-2 bg-primary text-on-primary rounded-3xl shadow-sm p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[20px] bg-on-primary/20 p-1.5 rounded-lg">savings</span>
              <h3 className="text-label-md uppercase tracking-wider text-on-primary/80">Total Kas & Tabungan</h3>
            </div>
            <p className="text-4xl font-bold mt-4 font-financial">{formatCurrency(totalCash)}</p>
            <p className="text-on-primary/70 text-body-md mt-2">{accounts.length} rekening aktif</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
            <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>pie_chart</span>
          </div>
          <p className="text-label-md text-on-surface-variant mb-1">Alokasi Terbesar</p>
          <h3 className="text-headline-sm text-on-surface">
            {largestAccount ? largestAccount.bankName || largestAccount.name : "N/A"}
          </h3>
          <p className="text-label-sm text-on-surface-variant mt-1">
            {largestAccount && totalCash > 0 ? ((largestAccount.balance / totalCash) * 100).toFixed(0) : 0}% dari total
          </p>
        </div>
      </div>

      {/* Account List */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-8">
        <h3 className="text-headline-sm text-on-surface mb-6 pb-4 border-b border-outline-variant/40">
          Daftar Rekening
        </h3>
        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-outline-variant/40 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  account.type === "KAS_TUNAI"
                    ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30"
                    : "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                }`}>
                  <span className="material-symbols-outlined">
                    {account.type === "KAS_TUNAI" ? "payments" : "account_balance"}
                  </span>
                </div>
                <div>
                  <p className="text-label-md text-base font-bold text-on-surface">
                    {account.name}
                  </p>
                  <p className="text-label-sm text-xs text-on-surface-variant mt-0.5">
                    {account.type === "KAS_TUNAI" ? "Kas Fisik" : account.bankName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-label-md text-base text-on-surface font-bold font-financial">
                  {formatCurrency(account.balance)}
                </p>
                <p className="text-label-sm text-on-surface-variant mt-0.5">
                  {totalCash > 0 ? ((account.balance / totalCash) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Allocation Bar */}
        {accounts.length > 0 && (
          <div className="mt-8 pt-6 border-t border-outline-variant/40">
            <h4 className="text-label-md text-on-surface-variant mb-3 uppercase tracking-wider">Distribusi</h4>
            <div className="w-full h-4 rounded-full bg-surface-container flex overflow-hidden">
              {accounts.map((account, i) => {
                const colors = ["bg-blue-500", "bg-blue-400", "bg-indigo-500", "bg-indigo-400"];
                return (
                  <div
                    key={account.id}
                    className={`${colors[i % colors.length]} h-full transition-all`}
                    style={{ width: `${totalCash > 0 ? (account.balance / totalCash) * 100 : 0}%` }}
                    title={`${account.name}: ${formatCurrency(account.balance)}`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              {accounts.map((account, i) => {
                const colors = ["bg-blue-500", "bg-blue-400", "bg-indigo-500", "bg-indigo-400"];
                return (
                  <div key={account.id} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`} />
                    <span className="text-label-sm text-on-surface-variant">{account.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-surface/50 border-b border-outline-variant/40 px-6 py-4 flex justify-between items-center">
              <h3 className="text-headline-sm text-lg font-bold">Tambah Rekening</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:bg-surface-container p-1 rounded-full cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddAccount} className="p-6 space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-semibold">Nama Rekening</label>
                <input
                  type="text"
                  required
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  placeholder="Contoh: BCA Personal"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label-md font-semibold">Tipe Rekening</label>
                <select
                  value={newAccType}
                  onChange={(e) => setNewAccType(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface outline-none cursor-pointer"
                >
                  <option value="REKENING">Rekening Bank / e-Wallet</option>
                  <option value="KAS_TUNAI">Kas Fisik / Tunai</option>
                </select>
              </div>

              {newAccType === "REKENING" && (
                <div className="flex flex-col gap-2">
                  <label className="text-label-md font-semibold">Nama Bank / Penerbit</label>
                  <input
                    type="text"
                    value={newAccBank}
                    onChange={(e) => setNewAccBank(e.target.value)}
                    placeholder="Contoh: BCA, Mandiri, GoPay"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface outline-none"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-label-md font-semibold">Saldo Awal (IDR)</label>
                <input
                  type="number"
                  required
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(e.target.value)}
                  placeholder="5000000"
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
