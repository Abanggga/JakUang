"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils/currency";

export function CashflowChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
  );
}
