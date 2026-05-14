"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { profileLabels } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";

const ptkpOptions = ["TK/0", "K/0", "K/1", "K/2", "K/3"];
const domisiliOptions = [
  { value: "ibukota_provinsi", label: "Ibukota Provinsi" },
  { value: "ibukota_lainnya", label: "Ibukota Kabupaten/Kota Lainnya" },
  { value: "daerah_lainnya", label: "Daerah Lainnya" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [profiles, setProfiles] = useState<string[]>([]);
  const [ptkp, setPtkp] = useState("");
  const [domisili, setDomisili] = useState("");
  const [klu, setKlu] = useState("");
  const router = useRouter();

  const needsKLU = profiles.some((p) =>
    ["FREELANCE", "KREATIF", "PETANI", "PETERNAK", "NELAYAN"].includes(p)
  );
  const totalSteps = needsKLU ? 4 : 3;

  const toggleProfile = (p: string) => {
    setProfiles((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const canNext = () => {
    if (step === 0) return profiles.length > 0;
    if (step === 1) return ptkp !== "";
    if (step === 2) return domisili !== "";
    return true;
  };

  const handleFinish = () => router.push("/dashboard");

  const steps = [
    {
      title: "Dari mana saja penghasilanmu?",
      subtitle: "Pilih satu atau lebih sumber pendapatan.",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(profileLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleProfile(key)}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
                profiles.includes(key)
                  ? "border-[#5A45CB] bg-[#5A45CB]/5 shadow-sm"
                  : "border-border hover:border-[#5A45CB]/30"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                profiles.includes(key) ? "bg-[#5A45CB] border-[#5A45CB]" : "border-muted-foreground/30"
              )}>
                {profiles.includes(key) && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Status PTKP Anda?",
      subtitle: "Penghasilan Tidak Kena Pajak berdasarkan status pernikahan.",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ptkpOptions.map((option) => (
            <button
              key={option}
              onClick={() => setPtkp(option)}
              className={cn(
                "p-5 rounded-xl border-2 text-center transition-all",
                ptkp === option
                  ? "border-[#5A45CB] bg-[#5A45CB]/5 shadow-sm"
                  : "border-border hover:border-[#5A45CB]/30"
              )}
            >
              <p className="text-lg font-bold">{option}</p>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Kota domisili Anda?",
      subtitle: "Untuk menentukan tarif NPPN.",
      content: (
        <div className="space-y-3">
          {domisiliOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDomisili(opt.value)}
              className={cn(
                "w-full p-5 rounded-xl border-2 text-left transition-all",
                domisili === opt.value
                  ? "border-[#5A45CB] bg-[#5A45CB]/5 shadow-sm"
                  : "border-border hover:border-[#5A45CB]/30"
              )}
            >
              <p className="font-medium">{opt.label}</p>
            </button>
          ))}
        </div>
      ),
    },
  ];

  if (needsKLU) {
    steps.push({
      title: "Kode KLU Anda?",
      subtitle: "Klasifikasi Lapangan Usaha yang terdaftar di DJP.",
      content: (
        <div className="space-y-4">
          <Input
            placeholder="Contoh: 62010 (Pemrograman Komputer)"
            value={klu}
            onChange={(e) => setKlu(e.target.value)}
            className="text-lg h-14"
          />
          <p className="text-xs text-muted-foreground">
            Tidak tahu KLU? Biarkan kosong, sistem akan assign default.
          </p>
        </div>
      ),
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F9FF] via-[#E5DEFF] to-[#F6F9FF] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-500",
                i <= step ? "bg-[#5A45CB]" : "bg-[#5A45CB]/15"
              )}
            />
          ))}
        </div>

        <Card className="border-border/50 shadow-2xl shadow-[#5A45CB]/5">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative h-8 w-8">
                <Image src="/logo.png" alt="JakUang" fill className="object-contain" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                Langkah {step + 1} dari {totalSteps}
              </span>
            </div>

            <h2 className="text-xl font-bold mt-4">{steps[step].title}</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-6">{steps[step].subtitle}</p>

            <div className="animate-fade-in" key={step}>
              {steps[step].content}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Kembali
              </Button>

              {step < totalSteps - 1 ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canNext()}
                  className="bg-[#5A45CB] hover:bg-[#442BB5] text-white gap-2"
                >
                  Lanjut <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  className="bg-[#FFD700] text-[#212529] hover:bg-[#E9C400] font-semibold rounded-full gap-2 px-8"
                >
                  <Sparkles className="h-4 w-4" /> Mulai JakUang
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
