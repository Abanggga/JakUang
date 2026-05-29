"use client";

import { useEffect, useState } from "react";
import { getTransactions } from "@/lib/utils/storage-util";
import { TransactionRow } from "./transaction-row";
import Link from "next/link";

export function RecentActivity() {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    setTransactions(getTransactions().slice(0, 5));
  }, []);

  return (
    <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm overflow-hidden flex flex-col">
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
