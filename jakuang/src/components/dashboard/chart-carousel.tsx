"use client";

import { useState, useEffect } from "react";
import { getTransactions, getAssets, getAccounts } from "@/lib/utils/storage-util";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { AssetChart } from "./charts/asset-chart";
import { CashflowChart } from "./charts/cashflow-chart";
import { TaxChart } from "./charts/tax-chart";

const COLORS = ["#3b82f6", "#eab308", "#9ca3af", "#818cf8"];

// Helper: group transactions by month for the current year
function computeCashflow(transactions: any[]) {
  const now = new Date();
  const year = now.getFullYear();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  const monthlyData: Record<number, { income: number; expense: number }> = {};
  for (let m = 0; m < 12; m++) {
    monthlyData[m] = { income: 0, expense: 0 };
  }

  for (const tx of transactions) {
    if (!tx.isConfirmed || !tx.date) continue;
    const d = new Date(tx.date);
    if (d.getFullYear() !== year) continue;
    const month = d.getMonth();
    if (tx.type === "INCOME") {
      monthlyData[month].income += tx.amount;
    } else {
      monthlyData[month].expense += tx.amount;
    }
  }

  // Only return months up to the current month
  const result = [];
  for (let m = 0; m <= now.getMonth(); m++) {
    result.push({
      label: months[m],
      income: monthlyData[m].income,
      expense: monthlyData[m].expense,
    });
  }
  return result;
}

function computeAssetDistribution(assets: any[], accounts: any[]) {
  const categories: Record<string, { name: string; value: number }> = {};

  for (const ast of assets) {
    const cat = ast.category || "Lainnya";
    const displayName =
      cat === "PROPERTI" ? "Properti" :
      cat === "KENDARAAN" ? "Kendaraan" :
      cat === "ALAT_USAHA" ? "Alat Usaha" : cat;

    if (!categories[cat]) {
      categories[cat] = { name: displayName, value: 0 };
    }
    categories[cat].value += ast.value || 0;
  }

  // Add cash/savings as a category
  const cashTotal = accounts.reduce((sum: number, a: any) => sum + (a.balance || 0), 0);
  if (cashTotal > 0) {
    categories["KAS"] = { name: "Kas & Tabungan", value: cashTotal };
  }

  return Object.values(categories).filter(c => c.value > 0);
}

function computeTaxTrend(transactions: any[]) {
  const now = new Date();
  const year = now.getFullYear();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  // Accumulate income per month for UMKM 0.5% estimate
  let cumulative = 0;
  const result = [];

  for (let m = 0; m <= now.getMonth(); m++) {
    const monthIncome = transactions
      .filter((tx: any) => {
        if (!tx.isConfirmed || !tx.date || tx.type !== "INCOME") return false;
        const d = new Date(tx.date);
        return d.getFullYear() === year && d.getMonth() === m;
      })
      .reduce((sum: number, tx: any) => sum + tx.amount, 0);

    cumulative += monthIncome;
    // Simple estimate: 0.5% of cumulative income above threshold
    const taxable = Math.max(0, cumulative - 500_000_000);
    const estimasi = taxable * 0.005;

    result.push({ month: months[m], estimasi });
  }

  return result;
}

export function ChartCarousel() {
  const [activeTab, setActiveTab] = useState<"aset" | "arus-kas" | "pajak">("arus-kas");
  const [timeFilter, setTimeFilter] = useState<"3M" | "6M" | "YTD">("YTD");
  const [assetChartType, setAssetChartType] = useState<"pie" | "bar">("pie");

  const [cashflowData, setCashflowData] = useState<any[]>([]);
  const [assetDistribution, setAssetDistribution] = useState<any[]>([]);
  const [taxTrendData, setTaxTrendData] = useState<any[]>([]);

  useEffect(() => {
    const transactions = getTransactions();
    const assets = getAssets();
    const accounts = getAccounts();

    setCashflowData(computeCashflow(transactions));
    setAssetDistribution(computeAssetDistribution(assets, accounts));
    setTaxTrendData(computeTaxTrend(transactions));
  }, []);

  // Apply time filter to cashflow and tax data
  const sliceCount = timeFilter === "3M" ? 3 : timeFilter === "6M" ? 6 : 0;
  
  const filteredCashflow = sliceCount 
    ? cashflowData.slice(Math.max(0, cashflowData.length - sliceCount)) 
    : cashflowData;
    
  const filteredTax = sliceCount 
    ? taxTrendData.slice(Math.max(0, taxTrendData.length - sliceCount)) 
    : taxTrendData;

  const totalAssets = assetDistribution.reduce((s, i) => s + i.value, 0);
  const totalDisplay = totalAssets >= 1_000_000_000
    ? `${(totalAssets / 1_000_000_000).toFixed(1)}M`
    : formatCurrency(totalAssets);

  return (
    <div className="hidden md:flex md:col-span-6 lg:col-span-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 md:p-8 min-h-[400px] flex-col w-full min-w-0 overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex bg-surface-container-low p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab("arus-kas")}
            className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap", activeTab === "arus-kas" ? "bg-surface shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface")}
          >
            Arus Kas
          </button>
          <button
            onClick={() => setActiveTab("aset")}
            className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap", activeTab === "aset" ? "bg-surface shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface")}
          >
            Aset
          </button>
          <button
            onClick={() => setActiveTab("pajak")}
            className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap", activeTab === "pajak" ? "bg-surface shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface")}
          >
            Tren Pajak
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "aset" ? (
            <div className="flex bg-surface-container-low p-1 rounded-lg">
              <button
                onClick={() => setAssetChartType("pie")}
                className={cn("px-3 py-1.5 rounded-md text-sm font-medium transition-colors", assetChartType === "pie" ? "bg-surface shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface")}
              >
                Donut
              </button>
              <button
                onClick={() => setAssetChartType("bar")}
                className={cn("px-3 py-1.5 rounded-md text-sm font-medium transition-colors", assetChartType === "bar" ? "bg-surface shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface")}
              >
                Bar
              </button>
            </div>
          ) : (
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="bg-surface-container-low border-none text-on-surface-variant hover:text-on-surface text-sm font-medium rounded-lg px-3 py-2 outline-none cursor-pointer"
            >
              <option value="3M">3 Bulan Terakhir</option>
              <option value="6M">6 Bulan Terakhir</option>
              <option value="YTD">Tahun Ini (YTD)</option>
            </select>
          )}
        </div>
      </div>
      
      {/* Chart Content */}
      <div className="flex-1 min-h-[250px] w-full mt-4 flex items-center justify-center">
        {activeTab === "arus-kas" && <CashflowChart data={filteredCashflow} />}
        {activeTab === "pajak" && <TaxChart data={filteredTax} />}
        {activeTab === "aset" && (
          <div className="flex flex-col md:flex-row items-center justify-center w-full gap-8 lg:gap-12">
            <AssetChart data={assetDistribution} type={assetChartType} totalDisplay={typeof totalDisplay === 'string' ? totalDisplay : ''} />
            
            {/* Legend */}
            <div className="flex flex-col gap-4 w-full md:w-auto">
              {assetDistribution.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center gap-4 bg-surface p-3 rounded-2xl border border-outline-variant/30"
                >
                  <div
                    className="w-4 h-4 rounded-full shadow-sm shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <div>
                    <p className="text-label-md text-base font-semibold text-on-surface">{item.name}</p>
                    <p className="text-label-sm text-sm text-on-surface-variant">
                      {totalAssets > 0 ? ((item.value / totalAssets) * 100).toFixed(0) : 0}% • {formatCurrency(item.value)}
                    </p>
                  </div>
                </div>
              ))}
              {assetDistribution.length === 0 && (
                <p className="text-sm text-on-surface-variant text-center py-8">Belum ada data aset.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
