"use client";

import { useState } from "react";
import { mockAssetDistribution, mockCashflowData, mockTaxTrend } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils/currency";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  LineChart, Line, Legend, AreaChart, Area
} from "recharts";
import { cn } from "@/lib/utils";

const COLORS = ["#3b82f6", "#eab308", "#9ca3af", "#818cf8"];

export function ChartCarousel() {
  const [activeTab, setActiveTab] = useState<"aset" | "arus-kas" | "pajak">("arus-kas");
  const [timeFilter, setTimeFilter] = useState<"3M" | "6M" | "YTD">("YTD");
  const [assetChartType, setAssetChartType] = useState<"pie" | "bar">("pie");

  // Mock filtering based on timeFilter
  const sliceCount = timeFilter === "3M" ? -3 : timeFilter === "6M" ? -6 : 0;
  
  const cashflowData = sliceCount ? mockCashflowData.monthly.slice(sliceCount) : mockCashflowData.monthly;
  const taxData = sliceCount ? mockTaxTrend.slice(sliceCount) : mockTaxTrend;

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
        {activeTab === "arus-kas" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cashflowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" opacity={0.5} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-on-surface-variant)" }} dy={10} />
              <YAxis tickFormatter={(val) => `${val / 1000000}M`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-on-surface-variant)" }} />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{ borderRadius: "12px", border: "1px solid var(--color-outline-variant)", backgroundColor: "var(--color-surface-container-lowest)" }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
              <Line type="monotone" name="Pemasukan" dataKey="income" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              <Line type="monotone" name="Pengeluaran" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === "pajak" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={taxData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEstimasi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fcd400" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#fcd400" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" opacity={0.5} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-on-surface-variant)" }} dy={10} />
              <YAxis tickFormatter={(val) => `${val / 1000}k`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-on-surface-variant)" }} />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{ borderRadius: "12px", border: "1px solid var(--color-outline-variant)" }}
              />
              <Area type="monotone" name="Estimasi PPh" dataKey="estimasi" stroke="#fcd400" strokeWidth={3} fillOpacity={1} fill="url(#colorEstimasi)" />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === "aset" && (
          <div className="flex flex-col md:flex-row items-center justify-center w-full gap-8 lg:gap-12">
            {assetChartType === "pie" ? (
              <div className="w-64 h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockAssetDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {mockAssetDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-label-sm text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1">
                    Total Aset
                  </span>
                  <span className="text-3xl font-bold text-on-surface">{totalDisplay}</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-64 relative flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockAssetDistribution} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" opacity={0.5} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-on-surface-variant)" }} dy={10} />
                    <YAxis hide />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      cursor={{ fill: "var(--color-surface-container)" }}
                      contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                      {mockAssetDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

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
