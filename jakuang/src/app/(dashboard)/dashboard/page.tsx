import { SummaryCards } from "@/components/dashboard/summary-cards";
import { ChartCarousel } from "@/components/dashboard/chart-carousel";
import { AccountSummary } from "@/components/dashboard/account-summary";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { TaxMonitor } from "@/components/dashboard/tax-monitor";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold text-on-background tracking-tight">Dashboard Utama</h2>
          <p className="text-body-lg text-on-surface-variant mt-2">
            Ringkasan kesehatan finansial Anda hari ini.
          </p>
        </div>
        <Link href="/tax-export">
          <button className="bg-surface-container-lowest text-primary text-label-md px-5 py-2.5 rounded-xl border border-outline-variant shadow-sm hover:bg-surface-container-low hover:shadow transition-all flex items-center gap-2 font-semibold cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Unduh Laporan
          </button>
        </Link>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-card-gap">
        {/* KPI Cards */}
        <SummaryCards />

        {/* Chart + Cash Summary */}
        <ChartCarousel />
        <AccountSummary />

        {/* Recent Activity & Tax Monitor */}
        <RecentActivity />
        <TaxMonitor />
      </div>
    </div>
  );
}
