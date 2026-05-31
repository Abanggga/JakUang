"use client";

import { useEffect, useState } from "react";
import { getAccounts, getTransactions } from "@/lib/utils/storage-util";
import { formatCurrency } from "@/lib/utils/currency";
import Link from "next/link";

export function AccountSummary() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);

  useEffect(() => {
    setAccounts(getAccounts());

    const transactions = getTransactions();
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    let inc = 0;
    let exp = 0;

    for (const tx of transactions) {
      if (!tx.isConfirmed || !tx.date) continue;
      const d = new Date(tx.date);
      if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) {
        if (tx.type === "INCOME") {
          inc += tx.amount;
        } else if (tx.type === "EXPENSE") {
          exp += tx.amount;
        }
      }
    }

    setMonthlyIncome(inc);
    setMonthlyExpense(exp);
  }, []);

  const total = monthlyIncome + monthlyExpense;
  const incomePercent = total > 0 ? (monthlyIncome / total) * 100 : 50;
  const expensePercent = total > 0 ? (monthlyExpense / total) * 100 : 50;
  const netCashflow = monthlyIncome - monthlyExpense;

  return (
    <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 md:p-8 h-auto flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-headline-sm text-lg font-bold text-on-surface">
            Rekening & Ringkasan Kas
          </h3>
        </div>

        <ul className="space-y-3.5">
          {accounts.slice(0, 3).map((account) => (
            <li
              key={account.id}
              className="flex items-center justify-between p-3.5 bg-surface rounded-2xl border border-outline-variant/40 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  account.type === "KAS_TUNAI"
                    ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30"
                    : "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                }`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {account.type === "KAS_TUNAI" ? "payments" : "account_balance"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">
                    {account.bankName || account.name}
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    {account.type === "KAS_TUNAI" ? "Fisik" : "Tabungan"}
                  </p>
                </div>
              </div>
              <p className="text-sm text-on-surface font-bold font-financial">
                {formatCurrency(account.balance)}
              </p>
            </li>
          ))}
          {accounts.length === 0 && (
            <p className="text-xs text-on-surface-variant text-center py-4">Belum ada akun rekening.</p>
          )}
        </ul>
      </div>

      {/* Ringkasan Arus Kas */}
      <div className="mt-6 pt-6 border-t border-outline-variant/60">
        <h4 className="text-xs font-semibold text-on-surface uppercase tracking-wider mb-4">
          Ringkasan Kas (Bulan Ini)
        </h4>
        <div className="space-y-4">
          {/* Uang Masuk */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-1">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Uang Masuk
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-financial">{formatCurrency(monthlyIncome)}</span>
            </div>
            <div className="w-full bg-blue-50 dark:bg-blue-900/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${incomePercent}%` }} />
            </div>
          </div>

          {/* Uang Keluar */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-1">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Uang Keluar
              </span>
              <span className="text-red-600 dark:text-red-400 font-financial">{formatCurrency(monthlyExpense)}</span>
            </div>
            <div className="w-full bg-red-50 dark:bg-red-900/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${expensePercent}%` }} />
            </div>
          </div>

          {/* Net Cashflow */}
          <div className="flex justify-between items-center pt-3.5 border-t border-outline-variant/30 text-xs font-semibold">
            <span className="text-on-surface-variant">Sisa Kas (Net)</span>
            <span className={`font-financial ${netCashflow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {netCashflow >= 0 ? "+" : ""}{formatCurrency(netCashflow)}
            </span>
          </div>
        </div>
      </div>

      <Link href="/cash">
        <button className="w-full mt-6 text-primary text-xs font-bold py-3 hover:bg-primary-fixed/20 rounded-2xl transition-all border border-dashed border-primary hover:border-primary-variant cursor-pointer">
          + Detail Rekening
        </button>
      </Link>
    </div>
  );
}
