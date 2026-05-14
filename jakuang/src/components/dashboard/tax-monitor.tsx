"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";
import { AlertTriangle, Clock, TrendingUp } from "lucide-react";

export function TaxMonitor() {
  const umkmOmzet = 78_950_000;
  const umkmThreshold = 500_000_000;
  const umkmProgress = (umkmOmzet / umkmThreshold) * 100;
  const umkmFacilityYearsLeft = 5;

  const karyawanTax = 2_275_000;

  return (
    <Card className="border border-border animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Tax Monitoring
          </CardTitle>
          <Badge
            variant="outline"
            className="text-[10px] border-[#5A45CB]/30 text-[#5A45CB] bg-[#5A45CB]/5"
          >
            Tahun Pajak 2025
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Karyawan Tax */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#5A45CB]" />
              <span className="text-sm font-medium">PPh 21 — Karyawan</span>
            </div>
            <span className="text-financial-md text-[#5A45CB]">
              {formatCurrency(karyawanTax)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground pl-4">
            Estimasi pajak terutang (akumulasi Jan–Mei)
          </p>
        </div>

        {/* UMKM Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
              <span className="text-sm font-medium">PPh Final — UMKM</span>
            </div>
            <span className="text-financial-md text-emerald-500">
              BEBAS PAJAK
            </span>
          </div>

          <div className="pl-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Omzet: {formatCurrency(umkmOmzet)}
              </span>
              <span className="text-muted-foreground">
                Batas: {formatCurrency(umkmThreshold)}
              </span>
            </div>
            <Progress value={umkmProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {formatCurrency(umkmThreshold - umkmOmzet)} lagi sebelum kena
              pajak 0.5%
            </p>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2 pl-4 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <Clock className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700">
              Fasilitas PPh Final 0,5% tersisa{" "}
              <strong>{umkmFacilityYearsLeft} tahun</strong> lagi (s.d. 2030)
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Estimasi pajak adalah kalkulasi otomatis berdasarkan data input.
              Bukan konsultasi pajak resmi. Referensi: UU HPP, PP No. 55/2022.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
