"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProfile, addTransaction, ProfileData } from "@/lib/utils/storage-util";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Mic, Play, Square, Save, RotateCcw, AlertCircle, CheckCircle, HelpCircle } from "lucide-react";
import { profileLabels } from "@/lib/mock-data";

type InputMode = "camera" | "voice" | "manual";

const routingLabels: Record<string, string> = {
  INCOME: "Pendapatan Usaha",
  EXPENSE: "Pengeluaran Usaha",
  ASSET_PURCHASE: "Pembelian Aset (Tunai)",
  ASSET_CREDIT: "Pembelian Aset (Kredit)",
  LOAN_DISBURSEMENT: "Pencairan Pinjaman",
  LOAN_PAYMENT: "Pembayaran Cicilan Pinjaman",
  TRANSFER: "Transfer Antar Rekening",
  PERSONAL: "Pengeluaran Pribadi",
};

const sptAssetCodes = [
  { code: "011", label: "011 - Rumah / Tanah Tempat Tinggal" },
  { code: "012", label: "012 - Ruko / Gudang / Tempat Usaha" },
  { code: "021", label: "021 - Sepeda Motor" },
  { code: "022", label: "022 - Mobil / Kendaraan Roda 4+" },
  { code: "031", label: "031 - Alat Usaha (Traktor, Jaring, Mesin)" },
  { code: "041", label: "041 - Tabungan / Deposito" },
  { code: "042", label: "042 - Piutang / Saham" },
  { code: "043", label: "043 - Laptop / HP / Elektronik" },
  { code: "044", label: "044 - Hewan Ternak / Harta Lainnya" },
];

export default function SnapSpeakPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [mode, setMode] = useState<InputMode>("camera");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Camera / Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Voice states
  const [voiceText, setVoiceText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Manual states
  const [manualAmount, setManualAmount] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);

  // AI Classification Result (Confirm-First)
  const [aiResult, setAiResult] = useState<any | null>(null);

  useEffect(() => {
    setProfile(getProfile());

    // Initialize Web Speech API if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = "id-ID";
      rec.interimResults = false;

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceText(transcript);
        setIsRecording(false);
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition error", e);
        setIsRecording(false);
        setError("Gagal merekam suara. Silakan coba lagi atau ketik manual.");
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  // Handle Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Speech Recording
  const toggleRecording = () => {
    if (!recognition) {
      setError("Browser Anda tidak mendukung perekaman suara langsung. Silakan ketik detail transaksi Anda.");
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      setError(null);
      setIsRecording(true);
      recognition.start();
    }
  };

  // Call API for AI classification
  const handleProcessInput = async () => {
    setLoading(true);
    setError(null);
    try {
      let requestBody: any = {
        activeProfiles: profile?.activeProfiles || [],
        domisili: profile?.domisiliType || "daerah_lainnya",
      };

      if (mode === "camera") {
        if (!imagePreview) {
          throw new Error("Silakan pilih atau ambil foto nota terlebih dahulu.");
        }
        requestBody.image = imagePreview;
        requestBody.text = "Mengekstrak data dari foto nota.";
      } else if (mode === "voice") {
        if (!voiceText.trim()) {
          throw new Error("Silakan rekam suara Anda atau ketik deskripsi transaksi.");
        }
        requestBody.text = voiceText;
      } else {
        if (!manualDesc.trim() || !manualAmount) {
          throw new Error("Deskripsi dan nominal wajib diisi.");
        }
        requestBody.text = `${manualDesc} sebesar Rp ${manualAmount}`;
      }

      const res = await fetch("/api/ai/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error("Gagal menghubungi layanan AI.");
      }

      const classification = await res.json();
      
      // Override manual inputs if manual mode was used but retain date
      if (mode === "manual") {
        const userAmt = parseInt(manualAmount.replace(/[^0-9]/g, ""), 10) || 0;
        classification.description = manualDesc;
        classification.date = manualDate;

        if (classification.routing_type === "ASSET_CREDIT") {
          // In manual credit purchase, user enters the DP as the nominal.
          // If the AI predicted a principal amount, the total amount is DP + principal.
          // Otherwise, default principal to a realistic value if description matches motor/mobil.
          let principal = classification.principal_amount || classification.principalAmount || 0;
          if (!principal) {
            const descLower = manualDesc.toLowerCase();
            if (descLower.includes("motor") || descLower.includes("honda") || descLower.includes("beat") || descLower.includes("pcx")) {
              principal = 15000000;
            } else if (descLower.includes("mobil") || descLower.includes("avanza") || descLower.includes("car")) {
              principal = 150000000;
            } else {
              principal = userAmt * 10; // general fallback
            }
          }
          classification.principal_amount = principal;
          classification.principalAmount = principal;
          classification.amount = userAmt + principal;
        } else {
          classification.amount = userAmt || classification.amount;
        }
      }

      setAiResult(classification);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses data.");
    } finally {
      setLoading(false);
    }
  };

  // Save the confirmed transaction
  const handleSaveTransaction = () => {
    if (!aiResult) return;

    addTransaction({
      description: aiResult.description,
      amount: Number(aiResult.amount),
      routingType: aiResult.routing_type,
      profile: aiResult.profile,
      category: aiResult.category,
      date: aiResult.date || new Date().toISOString(),
      source: mode === "camera" ? "OCR" : mode === "voice" ? "VOICE" : "MANUAL",
      confidence: aiResult.confidence || "MEDIUM",
      isConfirmed: true,
      assetName: aiResult.asset_name,
      sptAssetCode: aiResult.spt_asset_code,
      creditorName: aiResult.creditor_name || aiResult.creditorName,
      loanType: aiResult.loan_type || aiResult.loanType,
      principalAmount: Number(aiResult.principal_amount || aiResult.principalAmount || 0),
      interestAmount: Number(aiResult.interest_amount || aiResult.interestAmount || 0),
    });

    router.push("/ledger");
  };

  const confidenceColors = {
    HIGH: "border-emerald-500 bg-emerald-500/5 text-emerald-700",
    MEDIUM: "border-amber-500 bg-amber-500/5 text-amber-700",
    LOW: "border-red-500 bg-red-500/5 text-red-700",
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-display-lg text-on-surface tracking-tight">Snap & Speak</h2>
        <p className="text-body-lg text-on-surface-variant">
          Catat transaksi otomatis secara instan melalui foto nota atau input suara berbasis AI Gemini.
        </p>
      </div>

      {!aiResult ? (
        <Card className="border border-outline-variant/60 shadow-xl overflow-hidden rounded-3xl bg-surface-container-lowest">
          {/* Tab Selector */}
          <div className="flex border-b border-outline-variant/40 bg-surface/50">
            {(["camera", "voice", "manual"] as InputMode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={cn(
                  "flex-1 py-4 text-label-md font-semibold transition-all flex items-center justify-center gap-2 border-b-2",
                  mode === m
                    ? "border-primary text-primary bg-primary-fixed/10"
                    : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/50"
                )}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {m === "camera" ? "camera_alt" : m === "voice" ? "mic" : "edit_note"}
                </span>
                {m === "camera" ? "Foto Nota (OCR)" : m === "voice" ? "Suara / Teks" : "Input Manual"}
              </button>
            ))}
          </div>

          <CardContent className="p-8 space-y-6">
            {error && (
              <div className="bg-error-container/20 border border-error-container text-error rounded-2xl p-4 flex items-center gap-3 animate-shake">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* CAMERA MODE */}
            {mode === "camera" && (
              <div className="space-y-4 flex flex-col items-center">
                {imagePreview ? (
                  <div className="relative w-full max-w-md h-64 border-2 border-outline-variant rounded-2xl overflow-hidden shadow-inner bg-surface-container-low flex items-center justify-center">
                    <img src={imagePreview} alt="Nota" className="max-h-full max-w-full object-contain" />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="absolute top-4 right-4 bg-inverse-surface text-inverse-on-surface p-2.5 rounded-full hover:opacity-90 transition-opacity shadow-md"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full border-2 border-dashed border-outline-variant/80 hover:border-primary/50 transition-colors rounded-3xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer bg-surface hover:bg-primary-fixed/5 group">
                    <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Camera className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                      <p className="text-label-md text-on-surface font-semibold">Unggah Foto Nota Anda</p>
                      <p className="text-body-md text-on-surface-variant text-sm mt-1">
                        Klik untuk mengambil foto atau pilih gambar dari galeri.
                      </p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            )}

            {/* VOICE MODE */}
            {mode === "voice" && (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={toggleRecording}
                    className={cn(
                      "w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-md",
                      isRecording
                        ? "bg-red-600 animate-pulse scale-110"
                        : "bg-primary hover:bg-primary-container hover:scale-105"
                    )}
                  >
                    {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                  </button>
                  <p className="text-label-md font-semibold text-on-surface">
                    {isRecording ? "Sedang mendengarkan... Bicara sekarang." : "Ketuk mikrofon untuk mulai merekam"}
                  </p>
                  <p className="text-xs text-on-surface-variant text-center max-w-sm">
                    Contoh: &quot;Beli pupuk padi urea 2 karung Rp 350.000&quot; atau &quot;Gaji bulanan masuk Rp 8 juta&quot;
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Hasil Transkripsi Suara (Atau Ketik Detail Transaksi)</Label>
                  <textarea
                    value={voiceText}
                    onChange={(e) => setVoiceText(e.target.value)}
                    placeholder="Contoh: Beli motor Honda PCX bekas tunai Rp 24.500.000 untuk operasional kolam."
                    className="w-full h-32 bg-surface-container-low border border-outline-variant rounded-2xl p-4 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* MANUAL MODE */}
            {mode === "manual" && (
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                  <Label htmlFor="manual-desc">Deskripsi Transaksi</Label>
                  <Input
                    id="manual-desc"
                    placeholder="Contoh: Penjualan lele panen"
                    value={manualDesc}
                    onChange={(e) => setManualDesc(e.target.value)}
                  />
                </div>
                <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                  <Label htmlFor="manual-amount">Nominal (IDR)</Label>
                  <Input
                    id="manual-amount"
                    type="number"
                    placeholder="1200000"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                  />
                </div>
                <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                  <Label htmlFor="manual-date">Tanggal</Label>
                  <Input
                    id="manual-date"
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Process Button */}
            <div className="flex justify-end pt-4 border-t border-outline-variant/40">
              <Button
                onClick={handleProcessInput}
                disabled={loading}
                className="bg-primary hover:bg-primary-container text-white px-8 py-3 rounded-xl shadow-md h-12 text-label-md font-bold"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <span className="material-symbols-outlined mr-2 text-[20px]">smart_toy</span>
                )}
                {loading ? "Menganalisis..." : "Proses dengan AI Gemini"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* CONFIRM-FIRST PATTERN */
        <div className="space-y-6">
          {/* Confidence Indicator Card */}
          <div className={cn("border border-2 rounded-3xl p-6 flex gap-4 items-start", confidenceColors[aiResult.confidence as keyof typeof confidenceColors] || confidenceColors.MEDIUM)}>
            <div className="shrink-0 mt-0.5">
              {aiResult.confidence === "HIGH" ? (
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              ) : aiResult.confidence === "LOW" ? (
                <AlertCircle className="h-6 w-6 text-red-600" />
              ) : (
                <HelpCircle className="h-6 w-6 text-amber-600" />
              )}
            </div>
            <div>
              <h3 className="text-headline-sm text-base font-bold uppercase tracking-wider">
                Akurasi Deteksi AI: {aiResult.confidence}
              </h3>
              <p className="text-body-md text-sm mt-1 opacity-90">
                {aiResult.reasoning || "AI berhasil mengelompokkan jenis transaksi Anda secara otomatis."}
              </p>
            </div>
          </div>

          <Card className="border border-outline-variant/60 shadow-xl rounded-3xl bg-surface-container-lowest overflow-hidden">
            <div className="bg-surface/50 border-b border-outline-variant/40 px-8 py-5">
              <h3 className="text-headline-sm text-lg font-bold text-on-surface">Konfirmasi Detail Transaksi</h3>
              <p className="text-label-sm text-on-surface-variant text-xs mt-1">Silakan sesuaikan data sebelum disimpan ke ledger.</p>
            </div>

            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 flex flex-col gap-2">
                  <Label>Deskripsi Transaksi</Label>
                  <Input
                    value={aiResult.description || ""}
                    onChange={(e) => setAiResult({ ...aiResult, description: e.target.value })}
                  />
                </div>

                {aiResult.routing_type === "ASSET_CREDIT" && (
                  <div className="col-span-2 bg-primary-fixed/5 p-5 rounded-2xl border border-primary-fixed-dim/20 space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <span className="material-symbols-outlined text-[20px]">credit_card</span>
                      <span className="text-label-md font-bold uppercase tracking-wider">Struktur Kredit Aset</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-xs text-on-surface-variant block mb-1">Uang Muka (DP)</span>
                        <p className="text-body-lg font-bold text-on-surface">
                          {formatCurrency(aiResult.amount - (aiResult.principal_amount || aiResult.principalAmount || 0))}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-on-surface-variant block mb-1">Jumlah Kredit Pokok</span>
                        <p className="text-body-lg font-bold text-on-surface">
                          {formatCurrency(aiResult.principal_amount || aiResult.principalAmount || 0)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-on-surface-variant block mb-1">Harga Perolehan Aset</span>
                        <p className="text-body-lg font-extrabold text-primary">
                          {formatCurrency(aiResult.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {aiResult.routing_type === "ASSET_CREDIT" ? (
                  <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                    <Label>Uang Muka / Down Payment (DP)</Label>
                    <Input
                      type="number"
                      value={(aiResult.amount - (aiResult.principal_amount || aiResult.principalAmount || 0)) || ""}
                      onChange={(e) => {
                        const newDP = Number(e.target.value);
                        setAiResult({
                          ...aiResult,
                          amount: newDP + (aiResult.principal_amount || aiResult.principalAmount || 0),
                        });
                      }}
                      className="font-mono font-semibold"
                    />
                  </div>
                ) : (
                  <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                    <Label>Nominal (IDR)</Label>
                    <Input
                      type="number"
                      value={aiResult.amount || ""}
                      onChange={(e) => setAiResult({ ...aiResult, amount: Number(e.target.value) })}
                      className="font-mono font-semibold"
                    />
                  </div>
                )}

                <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                  <Label>Tanggal</Label>
                  <Input
                    type="date"
                    value={aiResult.date || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setAiResult({ ...aiResult, date: e.target.value })}
                  />
                </div>

                <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                  <Label>Tipe Alur Keuangan (Routing)</Label>
                  <select
                    value={aiResult.routing_type}
                    onChange={(e) => setAiResult({ ...aiResult, routing_type: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer h-10"
                  >
                    {Object.entries(routingLabels).map(([val, lbl]) => (
                      <option key={val} value={val}>{lbl}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                  <Label>Kategori Transaksi</Label>
                  <Input
                    value={aiResult.category || ""}
                    onChange={(e) => setAiResult({ ...aiResult, category: e.target.value })}
                  />
                </div>

                <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                  <Label>Profil Pemilik Penghasilan</Label>
                  <select
                    value={aiResult.profile || ""}
                    onChange={(e) => setAiResult({ ...aiResult, profile: e.target.value || null })}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer h-10"
                  >
                    <option value="">Pribadi (Non-Bisnis)</option>
                    {profile?.activeProfiles.map((p) => (
                      <option key={p} value={p}>{profileLabels[p] || p}</option>
                    ))}
                  </select>
                </div>

                {/* Conditional Asset Fields */}
                {(aiResult.routing_type === "ASSET_PURCHASE" || aiResult.routing_type === "ASSET_CREDIT") && (
                  <>
                    <div className="col-span-2 md:col-span-1 flex flex-col gap-2 border-t border-dashed border-outline-variant/40 pt-4">
                      <Label>Nama Harta / Aset</Label>
                      <Input
                        value={aiResult.asset_name || ""}
                        onChange={(e) => setAiResult({ ...aiResult, asset_name: e.target.value })}
                        placeholder="Contoh: Motor Honda Beat"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1 flex flex-col gap-2 border-t border-dashed border-outline-variant/40 pt-4">
                      <Label>Kode Harta SPT 1770</Label>
                      <select
                        value={aiResult.spt_asset_code || "031"}
                        onChange={(e) => setAiResult({ ...aiResult, spt_asset_code: e.target.value })}
                        className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer h-10"
                      >
                        {sptAssetCodes.map((item) => (
                          <option key={item.code} value={item.code}>{item.label}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Conditional Loan / Debt Fields */}
                {(aiResult.routing_type === "ASSET_CREDIT" || aiResult.routing_type === "LOAN_DISBURSEMENT" || aiResult.routing_type === "LOAN_PAYMENT") && (
                  <>
                    <div className="col-span-2 md:col-span-1 flex flex-col gap-2 border-t border-dashed border-outline-variant/40 pt-4">
                      <Label>Nama Kreditur / Bank</Label>
                      <Input
                        value={aiResult.creditor_name || aiResult.creditorName || ""}
                        onChange={(e) => setAiResult({ ...aiResult, creditor_name: e.target.value })}
                        placeholder="Contoh: BRI KUR / Mandiri KPR"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1 flex flex-col gap-2 border-t border-dashed border-outline-variant/40 pt-4">
                      <Label>Jenis Kewajiban / Kredit</Label>
                      <select
                        value={aiResult.loan_type || aiResult.loanType || "KUR"}
                        onChange={(e) => setAiResult({ ...aiResult, loan_type: e.target.value })}
                        className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer h-10"
                      >
                        <option value="KUR">KUR (Kredit Usaha Rakyat)</option>
                        <option value="KKB">Kredit Kendaraan Bermotor</option>
                        <option value="KPR">KPR (Kredit Pemilikan Rumah)</option>
                        <option value="PINJOL">Pinjaman Online</option>
                        <option value="HUTANG_USAHA">Hutang Dagang / Usaha</option>
                      </select>
                    </div>
                    {aiResult.routing_type === "LOAN_PAYMENT" && (
                      <>
                        <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                          <Label>Alokasi Pokok Cicilan (IDR)</Label>
                          <Input
                            type="number"
                            value={aiResult.principal_amount || aiResult.principalAmount || ""}
                            onChange={(e) => setAiResult({ ...aiResult, principal_amount: Number(e.target.value) })}
                          />
                        </div>
                        <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                          <Label>Alokasi Bunga Cicilan (IDR)</Label>
                          <Input
                            type="number"
                            value={aiResult.interest_amount || aiResult.interestAmount || ""}
                            onChange={(e) => setAiResult({ ...aiResult, interest_amount: Number(e.target.value) })}
                          />
                        </div>
                      </>
                    )}
                    {aiResult.routing_type === "ASSET_CREDIT" && (
                      <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                        <Label>Jumlah Kredit Pokok (di luar DP)</Label>
                        <Input
                          type="number"
                          value={aiResult.principal_amount || aiResult.principalAmount || ""}
                          onChange={(e) => {
                            const newPrincipal = Number(e.target.value);
                            const currentDP = aiResult.amount - (aiResult.principal_amount || aiResult.principalAmount || 0);
                            setAiResult({
                              ...aiResult,
                              principal_amount: newPrincipal,
                              principalAmount: newPrincipal,
                              amount: currentDP + newPrincipal,
                            });
                          }}
                          placeholder="Nilai yang dikreditkan"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-outline-variant/40 mt-8">
                <Button
                  variant="ghost"
                  onClick={() => setAiResult(null)}
                  className="px-6 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container"
                >
                  <RotateCcw className="h-4 w-4 mr-2" /> Ulangi
                </Button>

                <Button
                  onClick={handleSaveTransaction}
                  className="bg-primary hover:bg-primary-container text-white px-8 py-3 rounded-xl shadow-md h-12 text-label-md font-bold"
                >
                  <Save className="h-4 w-4 mr-2" /> Konfirmasi & Simpan ke Ledger
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
