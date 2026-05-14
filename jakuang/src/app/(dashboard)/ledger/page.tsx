"use client";

import { useState } from "react";
import { mockTransactions } from "@/lib/mock-data";
import { formatCurrency, relativeTime } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";

const categoryConfig: Record<string, { label: string; bgClass: string; textClass: string; icon: string; iconBg: string; iconHover: string }> = {
  Gaji: { label: "Pendapatan", bgClass: "bg-surface-container-highest", textClass: "text-on-surface", icon: "payments", iconBg: "bg-surface-container-highest text-primary", iconHover: "group-hover:bg-primary group-hover:text-on-primary" },
  Penjualan: { label: "Pendapatan", bgClass: "bg-surface-container-highest", textClass: "text-on-surface", icon: "storefront", iconBg: "bg-surface-container-highest text-primary", iconHover: "group-hover:bg-primary group-hover:text-on-primary" },
  Cicilan: { label: "Pengeluaran", bgClass: "bg-surface-container-highest", textClass: "text-on-surface", icon: "credit_score", iconBg: "bg-surface-container-highest text-on-surface", iconHover: "group-hover:bg-error group-hover:text-on-error" },
  Transfer: { label: "Transfer", bgClass: "bg-surface-container-highest", textClass: "text-on-surface", icon: "swap_horiz", iconBg: "bg-surface-container-highest text-secondary", iconHover: "group-hover:bg-secondary group-hover:text-on-secondary" },
};
const defaultCfg = { label: "Pengeluaran", bgClass: "bg-surface-container-highest", textClass: "text-on-surface", icon: "receipt", iconBg: "bg-surface-container-highest text-on-surface", iconHover: "group-hover:bg-error group-hover:text-on-error" };

const tabs = ["All Transactions", "Pendapatan", "Pengeluaran", "Aset", "Kewajiban"];

const totalIncome = mockTransactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
const totalExpense = mockTransactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

export default function LedgerPage() {
  const [activeTab, setActiveTab] = useState(0);

  const filteredTransactions = activeTab === 0
    ? mockTransactions
    : activeTab === 1
    ? mockTransactions.filter(t => t.type === "INCOME")
    : mockTransactions.filter(t => t.type === "EXPENSE");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md text-on-surface">Ledger</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Manage and verify your recorded transactions.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-lowest border border-outline-variant text-on-surface px-4 py-2 rounded-lg text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">filter_list</span> Filter
          </button>
          <button className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-md hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">add</span> New Entry
          </button>
        </div>
      </div>

      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-card-gap">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-surface-container-low rounded-bl-full -z-0" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-label-md text-on-surface-variant uppercase tracking-wide">Cash In (Mei)</p>
              <p className="text-headline-md text-on-surface mt-2 font-financial">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">arrow_downward</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-error-container/30 rounded-bl-full -z-0" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-label-md text-on-surface-variant uppercase tracking-wide">Cash Out (Mei)</p>
              <p className="text-headline-md text-on-surface mt-2 font-financial">{formatCurrency(totalExpense)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined">arrow_upward</span>
            </div>
          </div>
        </div>

        <div className="bg-primary text-on-primary rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/50 rounded-bl-full -z-0" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-label-md text-on-primary/80 uppercase tracking-wide">Net Flow (Mei)</p>
              <p className="text-headline-md text-on-primary mt-2 font-financial">{formatCurrency(totalIncome - totalExpense)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant pb-px overflow-x-auto no-scrollbar">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={cn(
              "px-4 py-2 text-label-md whitespace-nowrap transition-colors",
              i === activeTab
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest rounded-t-lg"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Transaction Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-outline-variant bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase tracking-wider">
          <div className="col-span-5 md:col-span-4">Details</div>
          <div className="hidden md:block col-span-2">Category</div>
          <div className="col-span-4 md:col-span-3 text-center">Verification</div>
          <div className="col-span-3 text-right">Amount</div>
        </div>

        {filteredTransactions.map((txn) => {
          const config = categoryConfig[txn.category] || defaultCfg;
          const isIncome = txn.type === "INCOME";

          return (
            <div
              key={txn.id}
              className="grid grid-cols-12 gap-4 p-4 items-center border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors cursor-pointer group"
            >
              <div className="col-span-5 md:col-span-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center shrink-0 ${config.iconHover} transition-colors`}>
                  <span className="material-symbols-outlined">{config.icon}</span>
                </div>
                <div>
                  <p className="text-label-md text-on-surface">{txn.description}</p>
                  <p className="text-body-md text-on-surface-variant text-[13px]">{relativeTime(txn.date)}</p>
                </div>
              </div>
              <div className="hidden md:flex col-span-2 items-center">
                <span className={`px-2.5 py-1 rounded-md ${config.bgClass} ${config.textClass} text-label-sm`}>
                  {config.label}
                </span>
              </div>
              <div className="col-span-4 md:col-span-3 flex items-center justify-center">
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border",
                  txn.isConfirmed
                    ? "bg-surface-container-high text-primary border-primary/20"
                    : "bg-surface-container-lowest border-outline-variant text-on-surface-variant"
                )}>
                  <span className="material-symbols-outlined text-[16px]">{txn.isConfirmed ? "verified" : "pending"}</span>
                  <span className="text-label-sm">{txn.isConfirmed ? "AI Confirmed" : "Review Needed"}</span>
                </div>
              </div>
              <div className="col-span-3 text-right">
                <p className={cn("text-headline-sm font-financial", isIncome ? "text-green-600" : "text-on-surface")}>
                  {isIncome ? "+ " : "- "}{formatCurrency(txn.amount)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
