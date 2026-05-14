"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils/currency";

export function TaxChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
  );
}
