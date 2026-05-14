"use client";

import { mockTaxTrend } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils/currency";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function TaxAreaChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={mockTaxTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="taxGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}jt`}
            width={45}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), "Estimasi Pajak"]}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid var(--border)",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
              fontSize: "13px",
            }}
          />
          <Area
            type="monotone"
            dataKey="estimasi"
            stroke="#F59E0B"
            strokeWidth={2.5}
            fill="url(#taxGradient)"
            dot={{ r: 4, fill: "#F59E0B", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
