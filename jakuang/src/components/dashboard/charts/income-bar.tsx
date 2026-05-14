"use client";

import { mockIncomeByProfile } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils/currency";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function IncomeBarChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={mockIncomeByProfile} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
            tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}jt`}
            width={45}
          />
          <Tooltip
            formatter={(value, name) => [formatCurrency(Number(value)), String(name)]}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid var(--border)",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
              fontSize: "13px",
            }}
          />
          <Legend iconType="circle" iconSize={8} />
          <Bar
            dataKey="KARYAWAN"
            name="Karyawan"
            fill="#5A45CB"
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
          <Bar
            dataKey="UMKM"
            name="UMKM"
            fill="#FFD700"
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
