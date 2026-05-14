"use client";

import { mockNetworthTrend } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils/currency";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function NetworthLineChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockNetworthTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="networthGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5A45CB" />
              <stop offset="100%" stopColor="#7360E5" />
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
            tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(2)}M`}
            width={55}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), "Kekayaan Bersih"]}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid var(--border)",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
              fontSize: "13px",
            }}
          />
          <Line
            type="monotone"
            dataKey="networth"
            stroke="url(#networthGradient)"
            strokeWidth={3}
            dot={{ r: 5, fill: "#5A45CB", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 7, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
