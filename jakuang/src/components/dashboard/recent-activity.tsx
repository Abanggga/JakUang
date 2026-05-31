"use client";

import { useEffect, useState } from "react";
import { getTransactions } from "@/lib/utils/storage-util";
import { TransactionRow } from "./transaction-row";
import { TRANSACTION_CATEGORY_CONFIG, TRANSACTION_DEFAULT_CONFIG } from "@/lib/config/ui-config";
import { formatCurrency } from "@/lib/utils/currency";
import Link from "next/link";

export function RecentActivity() {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    setTransactions(getTransactions().slice(0, 5));
  }, []);

  return (
    <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 md:p-8 border-b border-outline-variant/40 flex justify-between items-center bg-surface/50">
        <div>
          <h3 className="text-headline-sm text-lg md:text-xl font-bold text-on-surface">Aktivitas Terakhir</h3>
          <p className="text-label-sm text-xs md:text-sm text-on-surface-variant mt-1.5">Transaksi yang dialihkan oleh AI</p>
        </div>
        <Link href="/ledger" className="text-primary text-label-md font-semibold text-xs md:text-sm flex items-center gap-1.5 hover:bg-primary-fixed/30 px-3 py-1.5 md:px-4 md:py-2 rounded-xl transition-colors">
          Lihat Semua <span className="material-symbols-outlined text-[16px] md:text-[18px]">arrow_forward</span>
        </Link>
      </div>

      {/* Mobile view: Card list */}
      <div className="block md:hidden p-4 space-y-3">
        {transactions.map((txn) => {
          const config = TRANSACTION_CATEGORY_CONFIG[txn.category] || TRANSACTION_DEFAULT_CONFIG;
          const isIncome = txn.type === "INCOME";
          return (
            <div key={txn.id} className="flex items-center justify-between p-3.5 bg-surface rounded-2xl border border-outline-variant/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-full ${config.iconBg} flex items-center justify-center ${config.iconText} shrink-0`}>
                  <span className="material-symbols-outlined text-[18px]">{config.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{txn.description}</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">
                    {txn.date ? new Date(txn.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold font-financial ${isIncome ? "text-green-600" : "text-on-surface"}`}>
                  {isIncome ? "+" : "-"}{formatCurrency(txn.amount)}
                </p>
                <span className={`inline-flex items-center gap-0.5 mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                  txn.isConfirmed
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {txn.isConfirmed ? "Confirmed" : "Review"}
                </span>
              </div>
            </div>
          );
        })}
        {transactions.length === 0 && (
          <p className="text-xs text-on-surface-variant text-center py-6">Belum ada transaksi.</p>
        )}
      </div>

      {/* Desktop view: Table */}
      <div className="hidden md:block overflow-x-auto p-4">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="text-on-surface-variant text-label-sm text-xs uppercase tracking-widest border-b border-outline-variant/40">
              <th className="p-4 font-bold">Deskripsi</th>
              <th className="p-4 font-bold">Kategori</th>
              <th className="p-4 font-bold text-right">Jumlah</th>
              <th className="p-4 font-bold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {transactions.map((txn) => (
              <TransactionRow key={txn.id} txn={txn} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
