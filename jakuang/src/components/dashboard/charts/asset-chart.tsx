"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatCurrency } from "@/lib/utils/currency";

const COLORS = ["#3b82f6", "#eab308", "#9ca3af", "#818cf8"];

export function AssetChart({ 
  data, 
  type, 
  totalDisplay 
}: { 
  data: any[], 
  type: "pie" | "bar",
  totalDisplay: string
}) {
  return (
    <>
      {type === "pie" ? (
        <div className="w-64 h-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
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
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" opacity={0.5} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-on-surface-variant)" }} dy={10} />
              <YAxis hide />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
                cursor={{ fill: "var(--color-surface-container)" }}
                contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }}
              />
              <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}
