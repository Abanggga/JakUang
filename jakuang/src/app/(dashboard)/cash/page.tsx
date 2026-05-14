"use client";

import { mockAccounts, mockSummary } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils/currency";

export default function CashPage() {
  const totalCash = mockSummary.totalCash;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-display-lg text-on-surface tracking-tight">Cash & Savings</h2>
          <p className="text-body-lg text-on-surface-variant">Monitor semua rekening dan kas fisik Anda.</p>
        </div>
        <button className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-label-md shadow-sm hover:shadow-md transition-shadow flex items-center gap-2">
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
            <p className="text-on-primary/70 text-body-md mt-2">{mockAccounts.length} rekening aktif</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
            <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>pie_chart</span>
          </div>
          <p className="text-label-md text-on-surface-variant mb-1">Alokasi Terbesar</p>
          <h3 className="text-headline-sm text-on-surface">
            {mockAccounts.sort((a, b) => b.balance - a.balance)[0]?.bankName || "N/A"}
          </h3>
          <p className="text-label-sm text-on-surface-variant mt-1">
            {((mockAccounts.sort((a, b) => b.balance - a.balance)[0]?.balance / totalCash) * 100).toFixed(0)}% dari total
          </p>
        </div>
      </div>

      {/* Account List */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-8">
        <h3 className="text-headline-sm text-on-surface mb-6 pb-4 border-b border-outline-variant/40">
          Daftar Rekening
        </h3>
        <div className="space-y-4">
          {mockAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-outline-variant/40 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  account.type === "KAS_TUNAI"
                    ? "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100"
                    : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
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
                  {((account.balance / totalCash) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Allocation Bar */}
        <div className="mt-8 pt-6 border-t border-outline-variant/40">
          <h4 className="text-label-md text-on-surface-variant mb-3 uppercase tracking-wider">Distribusi</h4>
          <div className="w-full h-4 rounded-full bg-surface-container flex overflow-hidden">
            {mockAccounts.map((account, i) => {
              const colors = ["bg-blue-500", "bg-blue-400", "bg-indigo-500", "bg-indigo-400"];
              return (
                <div
                  key={account.id}
                  className={`${colors[i % colors.length]} h-full transition-all`}
                  style={{ width: `${(account.balance / totalCash) * 100}%` }}
                  title={`${account.name}: ${formatCurrency(account.balance)}`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            {mockAccounts.map((account, i) => {
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
      </div>
    </div>
  );
}
