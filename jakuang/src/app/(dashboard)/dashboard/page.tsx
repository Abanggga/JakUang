import { SummaryCards } from "@/components/dashboard/summary-cards";
import { ChartCarousel } from "@/components/dashboard/chart-carousel";
import { AccountSummary } from "@/components/dashboard/account-summary";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { TaxMonitor } from "@/components/dashboard/tax-monitor";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 w-full">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-on-background tracking-tight">Dashboard Utama</h2>
          <p className="text-body-md sm:text-body-lg text-on-surface-variant mt-2">
            Ringkasan kesehatan finansial Anda hari ini.
          </p>
        </div>
        <Link href="/tax-export" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto bg-surface-container-lowest text-primary text-label-md px-5 py-2.5 rounded-xl border border-outline-variant shadow-sm hover:bg-surface-container-low hover:shadow transition-all flex items-center justify-center gap-2 font-semibold cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Unduh Laporan
          </button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-card-gap w-full">
        <SummaryCards />
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-card-gap w-full">
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
