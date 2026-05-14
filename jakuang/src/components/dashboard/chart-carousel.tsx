"use client";

import { useState } from "react";
import { mockAssetDistribution, mockCashflowData, mockTaxTrend } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { AssetChart } from "./charts/asset-chart";
import { CashflowChart } from "./charts/cashflow-chart";
import { TaxChart } from "./charts/tax-chart";

const COLORS = ["#3b82f6", "#eab308", "#9ca3af", "#818cf8"];

export function ChartCarousel() {
  const [activeTab, setActiveTab] = useState<"aset" | "arus-kas" | "pajak">("arus-kas");
  const [timeFilter, setTimeFilter] = useState<"3M" | "6M" | "YTD">("YTD");
  const [assetChartType, setAssetChartType] = useState<"pie" | "bar">("pie");

  // Fix slicing logic: if we ask for -6 but array length is 5, it slices from -6 which is fine in JS but 
  // explicitly using Math.max ensures we understand the bounds.
  const sliceCount = timeFilter === "3M" ? 3 : timeFilter === "6M" ? 6 : 0;
  
  const cashflowData = sliceCount 
    ? mockCashflowData.monthly.slice(Math.max(0, mockCashflowData.monthly.length - sliceCount)) 
    : mockCashflowData.monthly;
    
  const taxData = sliceCount 
    ? mockTaxTrend.slice(Math.max(0, mockTaxTrend.length - sliceCount)) 
    : mockTaxTrend;

  const totalAssets = mockAssetDistribution.reduce((s, i) => s + i.value, 0);
  const totalDisplay = `${(totalAssets / 1_000_000_000).toFixed(1)}M`;

  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 md:p-8 min-h-[400px] flex flex-col">
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
        {activeTab === "arus-kas" && <CashflowChart data={cashflowData} />}
        {activeTab === "pajak" && <TaxChart data={taxData} />}
        {activeTab === "aset" && (
          <div className="flex flex-col md:flex-row items-center justify-center w-full gap-8 lg:gap-12">
            <AssetChart data={mockAssetDistribution} type={assetChartType} totalDisplay={totalDisplay} />
            
            {/* Legend */}
            <div className="flex flex-col gap-4 w-full md:w-auto">
              {mockAssetDistribution.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center gap-4 bg-surface p-3 rounded-2xl border border-outline-variant/30"
                >
                  <div
                    className="w-4 h-4 rounded-full shadow-sm shrink-0"
                    style={{ backgroundColor: COLORS[i] }}
                  />
                  <div>
                    <p className="text-label-md text-base font-semibold text-on-surface">{item.name}</p>
                    <p className="text-label-sm text-sm text-on-surface-variant">
                      {((item.value / totalAssets) * 100).toFixed(0)}% • {formatCurrency(item.value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
