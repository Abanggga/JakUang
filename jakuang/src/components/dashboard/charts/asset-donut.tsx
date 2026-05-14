"use client";

import { mockAssetDistribution } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils/currency";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = ["#5A45CB", "#7360E5", "#FFD700", "#22C55E"];

export function AssetDonutChart() {
  const total = mockAssetDistribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 h-full">
      <div className="w-full md:w-1/2 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={mockAssetDistribution}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {mockAssetDistribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid var(--border)",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                fontSize: "13px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-3 w-full md:w-1/2">
        {mockAssetDistribution.map((item, i) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[i] }}
              />
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
            <div className="text-right">
              <p className="text-financial-md">{formatCurrency(item.value)}</p>
              <p className="text-xs text-muted-foreground">
                {((item.value / total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
