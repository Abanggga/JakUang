"use client";

import { formatCurrency } from "@/lib/utils/currency";
import { mockSummary } from "@/lib/mock-data";

const cards = [
  {
    title: "Kekayaan Bersih",
    value: mockSummary.netWorth,
    icon: "account_balance_wallet",
    trend: "+2.4% vs bulan lalu",
    trendIcon: "trending_up",
    bgClass: "bg-green-50/50 border-green-100",
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
    labelColor: "text-green-800/70",
    valueColor: "text-green-900",
    trendClass: "text-green-700 bg-green-100/50",
    blobClass: "bg-green-200/40 group-hover:bg-green-300/40",
    colSpan: "col-span-1 md:col-span-3 lg:col-span-4",
  },
  {
    title: "Total Aset",
    value: mockSummary.totalAssets,
    icon: "account_balance",
    trend: null,
    trendIcon: null,
    bgClass: "bg-blue-50/50 border-blue-100",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    labelColor: "text-blue-800/70",
    valueColor: "text-blue-950",
    trendClass: "",
    blobClass: "",
    colSpan: "col-span-1 md:col-span-3 lg:col-span-3",
    progressColor: "bg-blue-500",
    progressPercent: 75,
  },
  {
    title: "Total Kewajiban",
    value: mockSummary.totalLiabilities,
    icon: "credit_card",
    trend: null,
    trendIcon: null,
    bgClass: "bg-red-50/50 border-red-100",
    iconBg: "bg-red-100",
    iconColor: "text-red-700",
    labelColor: "text-red-800/70",
    valueColor: "text-red-950",
    trendClass: "",
    blobClass: "",
    colSpan: "col-span-1 md:col-span-3 lg:col-span-3",
    progressColor: "bg-red-500",
    progressPercent: 25,
  },
  {
    title: "Kas & Tabungan",
    value: mockSummary.totalCash,
    icon: "savings",
    trend: null,
    trendIcon: null,
    bgClass: "bg-indigo-50/50 border-indigo-100",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-700",
    labelColor: "text-indigo-800/70",
    valueColor: "text-indigo-950",
    trendClass: "",
    blobClass: "",
    colSpan: "col-span-1 md:col-span-3 lg:col-span-2",
  },
];

export function SummaryCards() {
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
            <div className={`w-full ${card.bgClass.includes("blue") ? "bg-blue-100/50" : "bg-red-100/50"} h-2 rounded-full mt-auto overflow-hidden`}>
              <div className={`${card.progressColor} h-full rounded-full`} style={{ width: `${card.progressPercent}%` }} />
            </div>
          )}

          {card.colSpan.includes("lg:col-span-2") && (
            <div className="flex justify-start mt-auto">
              <button className="text-indigo-600 text-sm font-semibold hover:text-indigo-800 flex items-center group/btn">
                Detail
                <span className="material-symbols-outlined text-[16px] ml-1 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
