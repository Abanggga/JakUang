import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
Kamu adalah asisten pencatatan keuangan untuk aplikasi pajak Indonesia (JakUang).
Analisis transaksi dari input (teks atau gambar nota) dan kembalikan HANYA JSON valid.
Jangan tambahkan teks apapun di luar JSON, markdown, atau pembungkus lainnya.

Format output WAJIB:
{
  "amount": number,
  "date": "YYYY-MM-DD",
  "description": "string (deskripsi singkat)",
  "routing_type": "INCOME|EXPENSE|ASSET_PURCHASE|ASSET_CREDIT|LOAN_DISBURSEMENT|LOAN_PAYMENT|TRANSFER|PERSONAL",
  "profile": "UMKM|KARYAWAN|KARYAWAN_HARIAN|FREELANCE|KREATIF|GIG|PETANI|PETERNAK|NELAYAN|PEMBUDIDAYA|null",
  "category": "string (kategori transaksi sesuai profil)",
  "spt_asset_code": "string|null",
  "asset_name": "string|null",
  "loan_type": "string|null",
  "principal_amount": number|null,
  "interest_amount": number|null,
  "confidence": "HIGH|MEDIUM|LOW",
  "reasoning": "string (1 kalimat penjelasan, Bahasa Indonesia)"
}

Aturan klasifikasi:
1. "INCOME": Pendapatan operasional dari salah satu profil bisnis/pekerjaan.
2. "EXPENSE": Pengeluaran biaya operasional bisnis/pekerjaan (contoh: pupuk untuk PETANI, pakan untuk PEMBUDIDAYA).
3. "ASSET_PURCHASE": Beli aset secara tunai (contoh: laptop, motor tunai, traktor). Isi "spt_asset_code" (011-044) dan "asset_name".
4. "ASSET_CREDIT": Beli aset secara kredit/cicilan. "amount" adalah harga total aset (DP + Pokok Kredit), sedangkan "principal_amount" adalah jumlah pokok kredit (di luar DP).
5. "LOAN_DISBURSEMENT": Pencairan pinjaman baru (contoh: KUR cair).
6. "LOAN_PAYMENT": Bayar cicilan pinjaman (pokok + bunga).
7. "TRANSFER": Transfer antar rekening sendiri.
8. "PERSONAL": Pengeluaran pribadi non-bisnis (contoh: makan siang pribadi, nonton bioskop). Profile = null.

Contoh kategori pengeluaran sektor primer:
- PETANI: BIBIT, PUPUK, PESTISIDA, SEWA_LAHAN
- PETERNAK: PAKAN, OBAT_HEWAN, KANDANG
- NELAYAN: BBM_KAPAL, ALAT_TANGKAP, ES_BATU
- PEMBUDIDAYA: PAKAN_IKAN, BENIH, OBAT_IKAN, SEWA_KOLAM

ATURAN FORMATTING PENTING:
- JANGAN PERNAH menyertakan tanda kutip ganda (") di dalam string deskripsi (description) atau alasan (reasoning), karena akan merusak format JSON. Gunakan tanda kutip tunggal (') jika diperlukan.
- Seluruh nilai string harus bersih dari karakter baru (\n) yang tidak di-escape.
`;

export async function POST(request: Request) {
  let parsedText = "";
  let parsedImage = "";
  let parsedActiveProfiles: string[] = [];
  let parsedDomisili = "";

  try {
    const body = await request.json();
    parsedText = body.text || "";
    parsedImage = body.image || "";
    parsedActiveProfiles = body.activeProfiles || [];
    parsedDomisili = body.domisili || "";
  } catch (parseError) {
    console.error("Failed to parse request JSON:", parseError);
  }

  try {
    const keysToTry = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_SECONDARY,
    ].filter(Boolean) as string[];

    if (keysToTry.length === 0) {
      console.warn("No GEMINI_API_KEY defined. Falling back to local heuristic classifier.");
      const mockResult = runLocalHeuristicClassifier(parsedText, parsedImage, parsedActiveProfiles);
      return NextResponse.json(mockResult);
    }

    // Call Gemini API
    const userPrompt = `
Profil aktif user: ${parsedActiveProfiles.join(", ")}
Domisili: ${parsedDomisili || "daerah_lainnya"}
Input transaksi: ${parsedText || "Gambar terlampir"}
    `;

    const parts: any[] = [];
    if (parsedImage) {
      // image should be base64 string without data:image/jpeg;base64, prefix
      const cleanBase64 = parsedImage.includes("base64,") ? parsedImage.split("base64,")[1] : parsedImage;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64,
        },
      });
    }
    parts.push({ text: SYSTEM_PROMPT + "\n\n" + userPrompt });

    let lastError: any = null;
    let generatedText = "";

    for (let i = 0; i < keysToTry.length; i++) {
      const currentKey = keysToTry[i];
      try {
        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": currentKey,
            },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API error with key ${i + 1}: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error(`Empty response from Gemini API with key ${i + 1}`);
        }
        generatedText = text;
        break; // Successfully got response, stop loop!
      } catch (err: any) {
        console.warn(`Key ${i + 1} failed:`, err.message || err);
        lastError = err;
      }
    }

    if (!generatedText) {
      throw lastError || new Error("All Gemini API keys failed");
    }

    console.log("Gemini raw response text:", generatedText);

    // Parse output JSON with robust repair fallback
    const result = tryParseJSON(generatedText);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Classification failed, falling back to heuristics:", error);
    // Return heuristic fallback so UI always works
    try {
      const mockResult = runLocalHeuristicClassifier(parsedText, parsedImage, parsedActiveProfiles);
      return NextResponse.json({
        ...mockResult,
        reasoning: `[Sistem Klasifikasi] ${mockResult.reasoning}`,
      });
    } catch (fallbackError: any) {
      console.error("Heuristic fallback also failed:", fallbackError);
      return NextResponse.json({
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        description: "Gagal memproses input",
        routing_type: "PERSONAL",
        profile: null,
        category: "Umum",
        spt_asset_code: null,
        asset_name: null,
        loan_type: null,
        principal_amount: null,
        interest_amount: null,
        confidence: "LOW",
        reasoning: `Sistem sedang menggunakan klasifikasi otomatis. Silakan tinjau kategori secara manual.`,
      });
    }
  }
}

function runLocalHeuristicClassifier(text: string = "", image?: string, activeProfiles: string[] = []) {
  const normalizedText = text.toLowerCase();
  const todayStr = new Date().toISOString().split("T")[0];

  const parsedFinancial = parseTransactionText(text);
  const amount = parsedFinancial.amount;

  // Default structure
  const result: any = {
    amount: amount || 0, // Fallback if no amount found
    date: todayStr,
    description: text ? (text.length > 50 ? text.substring(0, 47) + "..." : text) : "Nota Belanja",
    routing_type: "EXPENSE",
    profile: activeProfiles[0] || null,
    category: "Lainnya",
    spt_asset_code: null,
    asset_name: null,
    loan_type: null,
    principal_amount: parsedFinancial.principal_amount,
    interest_amount: null,
    confidence: "MEDIUM",
    reasoning: "Mengkategorikan berdasarkan kata kunci input teks.",
  };

  // 1. Motor/Mobil Kredit (ASSET_CREDIT)
  if (normalizedText.includes("motor") || normalizedText.includes("mobil") || normalizedText.includes("honda beat") || normalizedText.includes("avanza") || normalizedText.includes("pcx")) {
    if (normalizedText.includes("kredit") || normalizedText.includes("cicil") || normalizedText.includes("dp")) {
      result.routing_type = "ASSET_CREDIT";
      result.category = "KENDARAAN";
      result.spt_asset_code = normalizedText.includes("motor") ? "021" : "022";
      result.asset_name = normalizedText.includes("motor") ? "Motor Honda Beat" : "Mobil Toyota Avanza";
      result.loan_type = "KKB";
      result.amount = amount || 15000000;
      result.principal_amount = parsedFinancial.principal_amount || (result.amount > 10000000 ? result.amount - 3000000 : 12000000);
      result.description = normalizedText.includes("motor") ? "Beli motor Honda Beat kredit" : "Beli mobil Toyota Avanza kredit";
      result.confidence = "HIGH";
      result.reasoning = "Pembelian aset kendaraan bermotor dengan skema kredit (KKB).";
      return result;
    } else {
      result.routing_type = "ASSET_PURCHASE";
      result.category = "KENDARAAN";
      result.spt_asset_code = normalizedText.includes("motor") ? "021" : "022";
      result.asset_name = normalizedText.includes("motor") ? "Motor Honda Beat" : "Mobil Toyota Avanza";
      result.description = normalizedText.includes("motor") ? "Beli motor Honda Beat tunai" : "Beli mobil Toyota Avanza tunai";
      result.confidence = "HIGH";
      result.reasoning = "Pembelian aset kendaraan bermotor secara tunai.";
      return result;
    }
  }

  // 2. Gaji / Income
  if (normalizedText.includes("gaji") || normalizedText.includes("salary") || normalizedText.includes("payroll")) {
    result.routing_type = "INCOME";
    result.profile = "KARYAWAN";
    result.category = "Gaji";
    result.description = "Gaji bulanan";
    result.amount = amount || 0;
    result.confidence = "HIGH";
    result.reasoning = "Mendeteksi penerimaan gaji karyawan tetap.";
    return result;
  }

  // 3. Panen / Hasil Tangkap
  if (normalizedText.includes("panen") || normalizedText.includes("lele") || normalizedText.includes("jual") || normalizedText.includes("ikan") || normalizedText.includes("tangkap")) {
    result.routing_type = "INCOME";
    if (activeProfiles.includes("PEMBUDIDAYA")) {
      result.profile = "PEMBUDIDAYA";
      result.category = "PENJUALAN_IKAN";
      result.description = "Penjualan hasil panen kolam lele";
    } else if (activeProfiles.includes("NELAYAN")) {
      result.profile = "NELAYAN";
      result.category = "HASIL_TANGKAP";
      result.description = "Penjualan hasil tangkapan laut";
    } else if (activeProfiles.includes("PETERNAK")) {
      result.profile = "PETERNAK";
      result.category = "PENJUALAN_TERNAK";
      result.description = "Penjualan hewan ternak";
    } else if (activeProfiles.includes("PETANI")) {
      result.profile = "PETANI";
      result.category = "HASIL_PANEN";
      result.description = "Penjualan hasil panen padi";
    } else {
      result.profile = "UMKM";
      result.category = "Penjualan";
      result.description = "Penjualan produk UMKM";
    }
    result.confidence = "HIGH";
    result.reasoning = "Mendeteksi penerimaan hasil penjualan produk atau panen usaha.";
    return result;
  }

  // 4. Pakan / Pupuk / Bibit
  if (normalizedText.includes("pakan") || normalizedText.includes("pupuk") || normalizedText.includes("bibit") || normalizedText.includes("pestisida")) {
    result.routing_type = "EXPENSE";
    if (normalizedText.includes("pakan")) {
      if (activeProfiles.includes("PEMBUDIDAYA")) {
        result.profile = "PEMBUDIDAYA";
        result.category = "PAKAN_IKAN";
        result.description = "Beli pakan lele";
      } else if (activeProfiles.includes("PETERNAK")) {
        result.profile = "PETERNAK";
        result.category = "PAKAN";
        result.description = "Beli pakan ternak";
      } else {
        result.profile = activeProfiles[0] || "PEMBUDIDAYA";
        result.category = "PAKAN_IKAN";
      }
    } else if (normalizedText.includes("pupuk") || normalizedText.includes("bibit") || normalizedText.includes("pestisida")) {
      result.profile = "PETANI";
      result.category = normalizedText.includes("pupuk") ? "PUPUK" : "BIBIT";
      result.description = `Beli ${normalizedText.includes("pupuk") ? "pupuk urea" : "bibit tanaman"}`;
    }
    result.confidence = "HIGH";
    result.reasoning = "Pengeluaran biaya operasional primer (HPP) usaha.";
    return result;
  }

  // 5. KUR / Pinjaman
  if (normalizedText.includes("kur") || normalizedText.includes("pinjaman") || normalizedText.includes("cair")) {
    if (normalizedText.includes("cair") || normalizedText.includes("diterima")) {
      result.routing_type = "LOAN_DISBURSEMENT";
      result.loan_type = "KUR";
      result.creditor_name = "Bank Mandiri/BRI";
      result.description = "Pencairan pinjaman KUR";
      result.amount = amount || 50000000;
      result.confidence = "HIGH";
      result.reasoning = "Pencairan pinjaman kredit modal kerja (KUR).";
      return result;
    } else if (normalizedText.includes("cicilan") || normalizedText.includes("bayar")) {
      result.routing_type = "LOAN_PAYMENT";
      result.loan_type = "KUR";
      result.creditor_name = "Bank Mandiri/BRI";
      result.description = "Bayar cicilan KUR";
      result.amount = amount || 2500000;
      result.principal_amount = Math.round(result.amount * 0.9);
      result.interest_amount = Math.round(result.amount * 0.1);
      result.confidence = "HIGH";
      result.reasoning = "Pembayaran cicilan pokok beserta bunga pinjaman usaha.";
      return result;
    }
  }

  // 6. Makan / Minum / Pribadi (PERSONAL)
  if (normalizedText.includes("makan") || normalizedText.includes("minum") || normalizedText.includes("kopi") || normalizedText.includes("nasi goreng") || normalizedText.includes("bioskop") || normalizedText.includes("pribadi")) {
    result.routing_type = "PERSONAL";
    result.profile = null;
    result.category = "Pribadi";
    result.description = text || "Makan siang";
    result.confidence = "HIGH";
    result.reasoning = "Pengeluaran pribadi yang tidak dimasukkan ke dalam ledger bisnis.";
    return result;
  }

  // Default fallback description parsing
  if (normalizedText.includes("beli") || normalizedText.includes("bayar") || normalizedText.includes("belanja")) {
    result.routing_type = "EXPENSE";
    result.category = "Utilitas";
    result.description = text || "Beli keperluan operasional";
  }

  return result;
}

function tryParseJSON(generatedText: string): any {
  const clean = generatedText.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(clean);
  } catch (err: any) {
    console.warn("Initial JSON parsing failed. Attempting to repair unescaped quotes...", err.message);
    try {
      // Replace unescaped double quotes inside string fields with single quotes
      const stringKeys = ["description", "reasoning", "asset_name", "category", "creditor_name", "loan_type", "routing_type", "profile", "date"];
      let repaired = clean;

      for (const key of stringKeys) {
        const regex = new RegExp(`("${key}"\\s*:\\s*")([\\s\\S]*?)("\\s*(?:,|\\n|\\r|\\}))`, "g");
        repaired = repaired.replace(regex, (match, prefix, val, suffix) => {
          const escapedVal = val.replace(/(?<!\\)"/g, "'");
          return `${prefix}${escapedVal}${suffix}`;
        });
      }

      return JSON.parse(repaired);
    } catch (repairErr: any) {
      console.error("JSON repair failed:", repairErr.message);
      throw err;
    }
  }
}

interface ParsedTransaction {
  amount: number;
  dp: number;
  principal_amount: number | null;
  installment: number;
  durationMonths: number;
}

function parseIndonesianNumber(numStr: string, multiplierStr: string = ""): number {
  let cleaned = numStr.replace(/,/g, ".");
  
  const dotCount = (cleaned.match(/\./g) || []).length;
  if (dotCount > 1) {
    cleaned = cleaned.replace(/\./g, "");
  } else if (dotCount === 1) {
    const parts = cleaned.split(".");
    if (parts[1].length === 3 && !multiplierStr) {
      cleaned = cleaned.replace(/\./g, "");
    }
  }

  let value = parseFloat(cleaned);
  if (isNaN(value)) return 0;

  if (multiplierStr) {
    const mult = multiplierStr.toLowerCase();
    if (mult === "juta" || mult === "jt") {
      value *= 1000000;
    } else if (mult === "ribu" || mult === "rb") {
      value *= 1000;
    } else if (mult === "miliar" || mult === "milyar") {
      value *= 1000000000;
    }
  }

  return value;
}

function parseTransactionText(text: string): ParsedTransaction {
  const normalized = text.toLowerCase();
  
  let dp = 0;
  let installment = 0;
  let durationMonths = 0;
  let totalPrice = 0;

  // 1. Parse DP
  const dpRegex = /(?:dp|down\s*payment|uang\s*muka)(?:\s*(?:sebesar|nya|rp)?\s*)*([0-9]+(?:[\.,][0-9]+)*)\s*(juta|jt|ribu|rb|miliar|milyar)?\b/i;
  const dpMatch = normalized.match(dpRegex);
  if (dpMatch) {
    dp = parseIndonesianNumber(dpMatch[1], dpMatch[2]);
  }

  // 2. Parse Installment (Cicilan)
  const cicilRegex = /(?:cicilan|cicil|angsuran|angsur)(?:\s*(?:sebesar|nya|rp)?\s*)*([0-9]+(?:[\.,][0-9]+)*)\s*(juta|jt|ribu|rb|miliar|milyar)?\b/i;
  const cicilMatch = normalized.match(cicilRegex);
  if (cicilMatch) {
    installment = parseIndonesianNumber(cicilMatch[1], cicilMatch[2]);
  }

  // 3. Parse Duration (Tenor)
  const durationRegex = /(?:selama|tenor|durasi)?\s*([0-9]+)\s*(bulan|bln|tahun|thn|kali)\b/i;
  const durationMatch = normalized.match(durationRegex);
  if (durationMatch) {
    const num = parseInt(durationMatch[1], 10);
    const unit = durationMatch[2].toLowerCase();
    if (unit.startsWith("t")) {
      durationMonths = num * 12;
    } else {
      durationMonths = num;
    }
  }

  // 4. Parse Total Price (any other number phrase that is large, and not already parsed as dp or installment)
  const numberPhraseRegex = /(?:rp\.?\s*)?([0-9]+(?:[\.,][0-9]+)*)\s*(juta|jt|ribu|rb|miliar|milyar)?\b/gi;
  let match;
  const foundValues: number[] = [];
  while ((match = numberPhraseRegex.exec(normalized)) !== null) {
    const val = parseIndonesianNumber(match[1], match[2]);
    if (val > 0) {
      foundValues.push(val);
    }
  }

  // Find a total price candidate: a value that is NOT dp and NOT installment, and is relatively large (e.g. > 100000)
  for (const val of foundValues) {
    if (val !== dp && val !== installment && val > 100000) {
      totalPrice = val;
      break;
    }
  }

  // Calculate fields
  let principal_amount = 0;
  let amount = 0;

  if (dp > 0 || installment > 0) {
    if (totalPrice > 0) {
      amount = totalPrice;
      principal_amount = amount - dp;
    } else {
      const computedPrincipal = installment * (durationMonths || 1);
      amount = dp + computedPrincipal;
      principal_amount = computedPrincipal;
    }
  } else {
    amount = totalPrice || foundValues[0] || 0;
  }

  return {
    amount,
    dp,
    principal_amount: principal_amount || null,
    installment,
    durationMonths,
  };
}
