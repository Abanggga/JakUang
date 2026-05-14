"use client";

import { mockCashflowData } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils/currency";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function CashflowLineChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockCashflowData.monthly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}jt`}
            width={45}
          />
          <Tooltip
            formatter={(value, name) => [
              formatCurrency(Number(value)),
              String(name) === "income" ? "Pemasukan" : "Pengeluaran",
            ]}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid var(--border)",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
              fontSize: "13px",
            }}
          />
          <Legend
            formatter={(value) =>
              value === "income" ? "Pemasukan" : "Pengeluaran"
            }
            iconType="circle"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#22C55E"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#22C55E", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            stroke="#EF4444"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#EF4444", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
