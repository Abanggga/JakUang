"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";
import { AlertTriangle, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getProfile, getTransactions } from "@/lib/utils/storage-util";
import { TaxEngineFactory } from "@/lib/tax-engine";
import { ptkpValues, profileLabels } from "@/lib/mock-data";

export function TaxMonitor() {
  const [activeProfiles, setActiveProfiles] = useState<string[]>([]);
  const [profileTaxList, setProfileTaxList] = useState<any[]>([]);
  const [totalTaxDue, setTotalTaxDue] = useState(0);

  useEffect(() => {
    const prof = getProfile();
    const txs = getTransactions();

    setActiveProfiles(prof.activeProfiles);

    const calculatedTaxes = prof.activeProfiles.map((pType) => {
      // 1. Calculate gross income for this profile from confirmed incomes
      const profileIncomes = txs
        .filter((t) => t.isConfirmed && t.profile === pType && t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0);

      // 2. Set default inputs
      const ptkp = ptkpValues[prof.ptkpStatus] || 54_000_000;
      const bpjsEmployee = pType === "KARYAWAN" ? 200_000 * 12 : 0; // standard mock iuran

      try {
        const engine = TaxEngineFactory.create(pType as any, prof.kluCode, prof.domisiliType);
        const result = engine.calculate({
          grossIncome: profileIncomes,
          ptkp,
          bpjsEmployee,
        });

        return {
          type: pType,
          label: profileLabels[pType] || pType,
          grossIncome: profileIncomes,
          taxDue: result.taxDue,
          breakdown: result.breakdown,
        };
      } catch (err) {
        console.error(`Error calculating tax for profile ${pType}`, err);
        return {
          type: pType,
          label: profileLabels[pType] || pType,
          grossIncome: profileIncomes,
          taxDue: 0,
          breakdown: [],
        };
      }
    });

    setProfileTaxList(calculatedTaxes);
    setTotalTaxDue(calculatedTaxes.reduce((sum, item) => sum + item.taxDue, 0));
  }, []);

  if (activeProfiles.length === 0) {
    return (
      <Card className="col-span-12 lg:col-span-4 border border-outline-variant/60 shadow-sm rounded-3xl p-6 bg-surface-container-lowest animate-fade-in flex flex-col justify-center items-center text-center min-h-[300px]">
        <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">account_balance_wallet</span>
        <h3 className="text-headline-sm font-semibold">Skema Pajak Belum Diaktifkan</h3>
        <p className="text-body-md text-on-surface-variant mt-2 max-w-xs">
          Silakan lengkapi profil onboarding atau buka pengaturan untuk memilih skema pajak.
        </p>
        <Link
          href="/settings"
          className="mt-6 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-label-md font-semibold hover:opacity-90 transition-opacity cursor-pointer inline-block"
        >
          Buka Pengaturan
        </Link>
      </Card>
    );
  }

  return (
    <Card className="col-span-12 lg:col-span-4 border border-outline-variant/60 shadow-sm rounded-3xl bg-surface-container-lowest overflow-hidden animate-fade-in flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-outline-variant/40 px-6 py-5 bg-surface/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-on-surface">
            Tax Monitoring
          </CardTitle>
          <Badge
            variant="outline"
            className="text-[10px] border-[#5A45CB]/30 text-[#5A45CB] bg-[#5A45CB]/5 font-semibold"
          >
            Tahun Pajak 2026
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6 flex-1 overflow-y-auto max-h-[420px] no-scrollbar">
        {profileTaxList.map((item) => {
          if (item.type === "UMKM") {
            const threshold = 500_000_000;
            const umkmProgress = Math.min(100, (item.grossIncome / threshold) * 100);
            return (
              <div key={item.type} className="space-y-3 p-4 bg-surface rounded-2xl border border-outline-variant/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-sm font-bold text-on-surface">{item.label}</span>
                  </div>
                  <span className={item.grossIncome > threshold ? "text-financial-md text-red-500 font-bold" : "text-financial-md text-emerald-600 font-bold"}>
                    {item.grossIncome > threshold ? formatCurrency(item.taxDue) : "BEBAS PAJAK"}
                  </span>
                </div>

                <div className="space-y-2 pl-4">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
                    <span>Omzet: {formatCurrency(item.grossIncome)}</span>
                    <span>Batas: {formatCurrency(threshold)}</span>
                  </div>
                  <Progress value={umkmProgress} className="h-2 bg-outline-variant/35" />
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {item.grossIncome > threshold
                      ? `Omzet melebihi batas bebas pajak. Dikenakan PPh Final 0.5% dari selisihnya.`
                      : `${formatCurrency(threshold - item.grossIncome)} lagi omzet bebas pajak sebelum dikenakan PPh Final 0.5%.`}
                  </p>
                </div>

                <div className="flex items-center gap-2 pl-4 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-800 leading-normal">
                    Fasilitas PPh Final 0.5% tersisa <strong>5 tahun</strong> lagi (s.d. 2031).
                  </p>
                </div>
              </div>
            );
          }

          // Karyawan or NPPN Profiles
          const isKaryawan = item.type.startsWith("KARYAWAN");
          const colorClass = isKaryawan ? "bg-[#5A45CB]" : "bg-emerald-500";

          return (
            <div key={item.type} className="space-y-3 p-4 bg-surface rounded-2xl border border-outline-variant/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                  <span className="text-sm font-bold text-on-surface">{item.label}</span>
                </div>
                <span className="text-financial-md text-primary font-bold">
                  {formatCurrency(item.taxDue)}
                </span>
              </div>
              <div className="pl-4 space-y-1 text-xs text-on-surface-variant font-medium">
                <div className="flex justify-between">
                  <span>Bruto Terkumpul:</span>
                  <span>{formatCurrency(item.grossIncome)}</span>
                </div>
                {item.breakdown.map((bd: any) => (
                  <div key={bd.label} className="flex justify-between">
                    <span>{bd.label}:</span>
                    <span>{bd.label.includes("Rate") ? `${(bd.amount * 100).toFixed(0)}%` : formatCurrency(bd.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>

      {/* Total Footer Summary */}
      <div className="p-6 bg-surface-container border-t border-outline-variant/40 flex items-center justify-between">
        <div>
          <p className="text-label-sm text-on-surface-variant text-xs uppercase tracking-wider font-semibold">Total Pajak Terutang</p>
          <p className="text-2xl font-bold text-on-surface font-financial mt-1">{formatCurrency(totalTaxDue)}</p>
        </div>
        <Link
          href="/tax-export"
          className="bg-primary text-on-primary px-4 py-2 rounded-xl text-label-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm inline-block"
        >
          Lihat SPT
        </Link>
      </div>
    </Card>
  );
}
