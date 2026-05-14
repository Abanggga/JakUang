"use client";

import { mockAccounts } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils/currency";
import Link from "next/link";

export function AccountSummary() {
  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-4 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-8 min-h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-headline-sm text-xl font-bold text-on-surface">
          Ringkasan Kas & Tabungan
        </h3>
        <button className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>

      <ul className="space-y-4 flex-1">
        {mockAccounts.map((account) => (
          <li
            key={account.id}
            className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-outline-variant/40 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
          >
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
                  {account.bankName || account.name}
                </p>
                <p className="text-label-sm text-xs text-on-surface-variant mt-0.5">
                  {account.type === "KAS_TUNAI" ? "Fisik" : "Tabungan"}
                </p>
              </div>
            </div>
            <p className="text-label-md text-base text-on-surface font-bold font-financial">
              {formatCurrency(account.balance)}
            </p>
          </li>
        ))}
      </ul>

      <Link href="/cash">
        <button className="w-full mt-6 text-primary text-label-md text-sm font-bold py-3.5 hover:bg-primary-fixed/30 rounded-2xl transition-all border-2 border-dashed border-primary-fixed hover:border-primary">
          + Tambah Rekening
        </button>
      </Link>
    </div>
  );
}
