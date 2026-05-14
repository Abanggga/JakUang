"use client";

import { mockTransactions } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import Link from "next/link";

const categoryConfig: Record<string, { label: string; bgClass: string; textClass: string; icon: string; iconBg: string; iconText: string }> = {
  Gaji: { label: "PENDAPATAN", bgClass: "bg-green-50", textClass: "text-green-700", icon: "payments", iconBg: "bg-green-50", iconText: "text-green-600" },
  Penjualan: { label: "PENDAPATAN", bgClass: "bg-green-50", textClass: "text-green-700", icon: "storefront", iconBg: "bg-green-50", iconText: "text-green-600" },
  Cicilan: { label: "KEWAJIBAN", bgClass: "bg-red-50", textClass: "text-red-700", icon: "credit_score", iconBg: "bg-red-50", iconText: "text-red-600" },
  Transfer: { label: "TRANSFER", bgClass: "bg-blue-50", textClass: "text-blue-700", icon: "swap_horiz", iconBg: "bg-blue-50", iconText: "text-blue-600" },
};

const defaultConfig = { label: "PENGELUARAN", bgClass: "bg-amber-50", textClass: "text-amber-700", icon: "receipt", iconBg: "bg-amber-50", iconText: "text-amber-600" };

export function RecentActivity() {
  const transactions = mockTransactions.slice(0, 5);

  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-12 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm overflow-hidden flex flex-col">
      <div className="p-8 border-b border-outline-variant/40 flex justify-between items-center bg-surface/50">
        <div>
          <h3 className="text-headline-sm text-xl font-bold text-on-surface">Aktivitas Terakhir</h3>
          <p className="text-label-sm text-sm text-on-surface-variant mt-1.5">Transaksi yang dialihkan oleh AI</p>
        </div>
        <Link href="/ledger" className="text-primary text-label-md font-semibold text-sm flex items-center gap-1.5 hover:bg-primary-fixed/30 px-4 py-2 rounded-xl transition-colors">
          Lihat Semua <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-on-surface-variant text-label-sm text-xs uppercase tracking-widest border-b border-outline-variant/40">
              <th className="p-4 font-bold">Deskripsi</th>
              <th className="p-4 font-bold">Kategori</th>
              <th className="p-4 font-bold text-right">Jumlah</th>
              <th className="p-4 font-bold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {transactions.map((txn) => {
              const config = categoryConfig[txn.category] || defaultConfig;
              const isIncome = txn.type === "INCOME";

              return (
                <tr key={txn.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="p-4 rounded-l-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center ${config.iconText} group-hover:scale-110 transition-transform`}>
                        <span className="material-symbols-outlined text-[20px]">{config.icon}</span>
                      </div>
                      <span className="text-body-md font-semibold text-on-surface">{txn.description}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`${config.bgClass} ${config.textClass} px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide`}>
                      {config.label}
                    </span>
                  </td>
                  <td className={cn("p-4 text-right text-body-md font-bold font-financial", isIncome ? "text-green-600" : "text-on-surface")}>
                    {isIncome ? "+" : "-"}{formatCurrency(txn.amount)}
                  </td>
                  <td className="p-4 text-center rounded-r-xl">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                      txn.isConfirmed
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-surface-container-lowest text-on-surface-variant border-outline-variant"
                    )}>
                      <span className="material-symbols-outlined text-[14px]">
                        {txn.isConfirmed ? "check_circle" : "pending"}
                      </span>
                      {txn.isConfirmed ? "Confirmed" : "Review"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
