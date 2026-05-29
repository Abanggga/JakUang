"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { getAccounts, getAssets, getLiabilities, getTransactions } from "@/lib/utils/storage-util";
import Link from "next/link";

export function SummaryCards() {
  const [netWorth, setNetWorth] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalLiabilities, setTotalLiabilities] = useState(0);
  const [totalCash, setTotalCash] = useState(0);
  const [monthlyChange, setMonthlyChange] = useState<number | null>(null);

  useEffect(() => {
    const accounts = getAccounts();
    const assets = getAssets();
    const liabilities = getLiabilities();
    const transactions = getTransactions();

    const cash = accounts.reduce((sum: number, a: any) => sum + (a.balance || 0), 0);
    const ast = assets.reduce((sum: number, a: any) => sum + (a.value || 0), 0) + cash;
    const lia = liabilities.reduce((sum: number, l: any) => sum + (l.remaining || 0), 0);
    const nw = ast - lia;

    setTotalCash(cash);
    setTotalAssets(ast);
    setTotalLiabilities(lia);
    setNetWorth(nw);

    // Compute real monthly income change
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    let thisMonthIncome = 0;
    let lastMonthIncome = 0;

    for (const tx of transactions) {
      if (!tx.isConfirmed || tx.type !== "INCOME" || !tx.date) continue;
      const d = new Date(tx.date);
      if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) {
        thisMonthIncome += tx.amount;
      } else if (
        (d.getFullYear() === thisYear && d.getMonth() === thisMonth - 1) ||
        (thisMonth === 0 && d.getFullYear() === thisYear - 1 && d.getMonth() === 11)
      ) {
        lastMonthIncome += tx.amount;
      }
    }

    if (lastMonthIncome > 0) {
      setMonthlyChange(((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100);
    }
  }, []);

  const trendText = monthlyChange !== null
    ? `${monthlyChange >= 0 ? "+" : ""}${monthlyChange.toFixed(1)}% vs bulan lalu`
    : null;
  const trendIcon = monthlyChange !== null
    ? (monthlyChange >= 0 ? "trending_up" : "trending_down")
    : null;

  const cards = [
    {
      title: "Kekayaan Bersih",
      value: netWorth,
      icon: "account_balance_wallet",
      trend: trendText,
      trendIcon: trendIcon,
      bgClass: "bg-green-50/50 border-green-100 dark:bg-green-950/20 dark:border-green-900/30",
      iconBg: "bg-green-100 dark:bg-green-900/45",
      iconColor: "text-green-700 dark:text-green-400",
      labelColor: "text-green-800/70 dark:text-green-300/70",
      valueColor: "text-green-900 dark:text-green-100",
      trendClass: monthlyChange !== null && monthlyChange >= 0
        ? "text-green-700 dark:text-green-400 bg-green-100/50 dark:bg-green-900/20"
        : "text-red-700 dark:text-red-400 bg-red-100/50 dark:bg-red-900/20",
      blobClass: "bg-green-200/40 dark:bg-green-900/20 group-hover:bg-green-300/40 dark:group-hover:bg-green-800/20",
      colSpan: "col-span-1 md:col-span-3 lg:col-span-4",
    },
    {
      title: "Total Aset",
      value: totalAssets,
      icon: "account_balance",
      trend: null,
      trendIcon: null,
      bgClass: "bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30",
      iconBg: "bg-blue-100 dark:bg-blue-900/45",
      iconColor: "text-blue-700 dark:text-blue-400",
      labelColor: "text-blue-800/70 dark:text-blue-300/70",
      valueColor: "text-blue-950 dark:text-blue-100",
      trendClass: "",
      blobClass: "",
      colSpan: "col-span-1 md:col-span-3 lg:col-span-3",
      progressColor: "bg-blue-500",
      progressPercent: totalAssets > 0 ? Math.round((totalAssets / (totalAssets + totalLiabilities || 1)) * 100) : 100,
    },
    {
      title: "Total Kewajiban",
      value: totalLiabilities,
      icon: "credit_card",
      trend: null,
      trendIcon: null,
      bgClass: "bg-red-50/50 border-red-100 dark:bg-red-950/20 dark:border-red-900/30",
      iconBg: "bg-red-100 dark:bg-red-900/45",
      iconColor: "text-red-700 dark:text-red-400",
      labelColor: "text-red-800/70 dark:text-red-300/70",
      valueColor: "text-red-950 dark:text-red-100",
      trendClass: "",
      blobClass: "",
      colSpan: "col-span-1 md:col-span-3 lg:col-span-3",
      progressColor: "bg-red-500",
      progressPercent: totalAssets > 0 ? Math.round((totalLiabilities / (totalAssets + totalLiabilities || 1)) * 100) : 0,
    },
    {
      title: "Kas & Tabungan",
      value: totalCash,
      icon: "savings",
      trend: null,
      trendIcon: null,
      bgClass: "bg-indigo-50/50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/45",
      iconColor: "text-indigo-700 dark:text-indigo-400",
      labelColor: "text-indigo-800/70 dark:text-indigo-300/70",
      valueColor: "text-indigo-950 dark:text-indigo-100",
      trendClass: "",
      blobClass: "",
      colSpan: "col-span-1 md:col-span-3 lg:col-span-2",
    },
  ];

  return (
    <>
      {cards.map((card) => (
        <div
          key={card.title}
          className={`${card.colSpan} ${card.bgClass} rounded-3xl p-6 border shadow-sm flex flex-col justify-between h-48 hover:shadow-md transition-all relative overflow-hidden group`}
        >
          {card.blobClass && (
            <div className={`absolute -right-8 -top-8 w-32 h-32 ${card.blobClass} rounded-full blur-2xl transition-colors duration-500`} />
          )}
          <div>
            <div className={`flex items-center gap-2 ${card.labelColor} mb-2`}>
              <span className={`material-symbols-outlined text-[20px] ${card.iconBg} p-1.5 rounded-lg ${card.iconColor}`}>
                {card.icon}
              </span>
              <h3 className="text-label-md text-sm uppercase tracking-wider font-semibold">
                {card.title}
              </h3>
            </div>
            <p className={`${card.colSpan.includes("lg:col-span-4") ? "text-3xl" : card.colSpan.includes("lg:col-span-2") ? "text-xl" : "text-2xl"} font-bold ${card.valueColor} mt-4 font-financial`}>
              {formatCurrency(card.value)}
            </p>
          </div>

          {card.trend && (
            <div className={`flex items-center ${card.trendClass} text-sm font-semibold w-fit px-3 py-1 rounded-full mt-auto`}>
              <span className="material-symbols-outlined text-[16px] mr-1">{card.trendIcon}</span>
              {card.trend}
            </div>
          )}

          {"progressPercent" in card && card.progressPercent !== undefined && (
            <div className={`w-full ${card.bgClass.includes("blue") ? "bg-blue-100/50 dark:bg-blue-900/20" : "bg-red-100/50 dark:bg-red-900/20"} h-2 rounded-full mt-auto overflow-hidden`}>
              <div className={`${card.progressColor} h-full rounded-full`} style={{ width: `${card.progressPercent}%` }} />
            </div>
          )}

          {card.colSpan.includes("lg:col-span-2") && (
            <div className="flex justify-start mt-auto">
              <Link
                href="/cash"
                className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center group/btn"
              >
                Detail
                <span className="material-symbols-outlined text-[16px] ml-1 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
