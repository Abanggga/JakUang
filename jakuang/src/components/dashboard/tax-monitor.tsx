"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";
import Link from "next/link";
import { getProfile, getTransactions } from "@/lib/utils/storage-util";
import { TaxEngineFactory } from "@/lib/tax-engine";
import { ptkpValues } from "@/lib/mock-data";

export function TaxMonitor() {
  const [pphAmount, setPphAmount] = useState(0);
  const [ppnAmount, setPpnAmount] = useState(0);
  const [taxYear, setTaxYear] = useState(2026);

  useEffect(() => {
    const prof = getProfile();
    const txs = getTransactions();
    const currentYear = new Date().getFullYear();
    setTaxYear(currentYear);

    let calculatedPph = 0;
    let businessIncomes = 0;

    prof.activeProfiles.forEach((pType) => {
      // Calculate gross income for this profile from confirmed incomes
      const profileIncomes = txs
        .filter((t) => t.isConfirmed && t.profile === pType && t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0);

      const ptkp = ptkpValues[prof.ptkpStatus] || 54_000_000;
      const bpjsEmployee = pType === "KARYAWAN" ? 200_000 * 12 : 0;

      try {
        const engine = TaxEngineFactory.create(pType as any, prof.domisiliType);
        const result = engine.calculate({
          grossIncome: profileIncomes,
          ptkp,
          bpjsEmployee,
        });
        calculatedPph += result.taxDue;
        if (pType !== "KARYAWAN") {
          businessIncomes += profileIncomes;
        }
      } catch (err) {
        console.error(`Error calculating tax for profile ${pType}`, err);
      }
    });

    setPphAmount(calculatedPph > 0 ? calculatedPph : 1250000); // use fallback if 0
    setPpnAmount(businessIncomes > 0 ? businessIncomes * 0.11 : 4500000); // 11% PPN fallback
  }, []);

  return (
    <Card className="col-span-12 lg:col-span-4 border border-outline-variant/60 shadow-sm rounded-3xl bg-surface-container-lowest overflow-hidden flex flex-col justify-between h-auto min-h-[400px]">
      <CardHeader className="pb-3 border-b border-outline-variant/40 px-6 py-5 bg-surface/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-on-surface">
            Tax Monitor
          </CardTitle>
          <Badge
            variant="outline"
            className="text-[10px] border-[#5A45CB]/30 text-[#5A45CB] bg-[#5A45CB]/5 font-semibold px-2 py-0.5 rounded-full"
          >
            Tahun Pajak {taxYear}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-5 flex-1 flex flex-col justify-center">
        {/* Card 1: Estimasi PPh 21 */}
        <div className="p-4 bg-surface rounded-2xl border border-outline-variant/40 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-on-surface-variant">Estimasi PPh 21 / OP</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 border border-green-200">
              ON TRACK
            </span>
          </div>
          <p className="text-xl font-bold text-on-surface font-financial mb-3">
            {formatCurrency(pphAmount)}
          </p>
          <div className="space-y-1.5">
            <Progress value={65} className="h-1.5 bg-outline-variant/30" />
            <div className="flex justify-between text-[10px] text-on-surface-variant font-medium">
              <span>Batas Penghasilan Kena Pajak</span>
              <span>65%</span>
            </div>
          </div>
        </div>

        {/* Card 2: PPN Keluaran */}
        <div className="p-4 bg-surface rounded-2xl border border-outline-variant/40 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-on-surface-variant">PPN Keluaran</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              DUE SOON
            </span>
          </div>
          <p className="text-xl font-bold text-on-surface font-financial mb-3">
            {formatCurrency(ppnAmount)}
          </p>
          <div className="space-y-1.5">
            <Progress value={40} className="h-1.5 bg-outline-variant/30" />
            <div className="flex justify-between text-[10px] text-on-surface-variant font-medium">
              <span>Tempo: 12 hari lagi</span>
              <span>40%</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <div className="p-6 bg-surface-container/50 border-t border-outline-variant/40 flex items-center justify-center">
        <Link
          href="/tax-export"
          className="w-full text-center bg-primary text-on-primary py-3 rounded-2xl text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
        >
          View Full Report
        </Link>
      </div>
    </Card>
  );
}
