"use client";

import { useState, useEffect } from "react";
import { getProfile, saveProfile, ProfileData } from "@/lib/utils/storage-util";
import { profileLabels } from "@/lib/mock-data";
import { CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [domisiliType, setDomisiliType] = useState<any>("daerah_lainnya");
  const [ptkpStatus, setPtkpStatus] = useState("TK/0");
  const [activeProfiles, setActiveProfiles] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const data = getProfile();
    setProfile(data);
    setName(data.name);
    setEmail(data.email);
    setDomisiliType(data.domisiliType);
    setPtkpStatus(data.ptkpStatus);
    setActiveProfiles(data.activeProfiles);
  }, []);

  const toggleProfile = (p: string) => {
    setActiveProfiles((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveProfile({
      name,
      email,
      domisiliType,
      ptkpStatus,
      activeProfiles,
    });
    setProfile(updated);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (!profile) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-headline-md text-on-surface mb-2">Pengaturan Profil & Pajak</h2>
          <p className="text-body-md text-on-surface-variant">Kelola informasi pribadi, klasifikasi usaha, dan preferensi keamanan Anda.</p>
        </div>
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold animate-fade-in shrink-0">
            <CheckCircle2 className="h-5 w-5" />
            Pengaturan berhasil disimpan!
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Profile Summary Card */}
        <div className="col-span-12 md:col-span-4 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 flex flex-col items-center text-center h-fit">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface shadow-sm bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "64px" }}>person</span>
            </div>
          </div>
          <h3 className="text-headline-sm text-on-surface mb-1">{name}</h3>
          <p className="text-body-md text-on-surface-variant mb-4">{email}</p>
          <span className="inline-block bg-[#5A45CB]/10 text-primary text-label-sm px-3 py-1 rounded-full uppercase tracking-wider mb-6 font-semibold">
            WP Orang Pribadi
          </span>
          <div className="w-full border-t border-outline-variant/40 pt-6 mt-auto space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-body-md text-on-surface-variant text-sm">PTKP Status</span>
              <span className="text-label-md text-on-surface text-sm font-semibold">{ptkpStatus}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-md text-on-surface-variant text-sm">Domisili</span>
              <span className="text-label-md text-on-surface text-sm font-semibold">
                {domisiliType === "ibukota_provinsi"
                  ? "Ibukota Provinsi"
                  : domisiliType === "ibukota_lainnya"
                  ? "Ibukota Lainnya"
                  : "Daerah Lainnya"}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Info Form */}
        <div className="col-span-12 md:col-span-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-8">
          <h3 className="text-headline-sm text-lg font-bold text-on-surface mb-6 pb-4 border-b border-outline-variant/40 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            Informasi Pribadi & Usaha
          </h3>
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
              <label className="text-label-md text-on-surface font-semibold">Nama Lengkap Sesuai KTP</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
                maxLength={100}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
              <label className="text-label-md text-on-surface font-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
              <label className="text-label-md text-on-surface font-semibold">Status PTKP</label>
              <select
                value={ptkpStatus}
                onChange={(e) => setPtkpStatus(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer h-[50px]"
              >
                <option value="TK/0">TK/0 (Tidak Kawin, 0 Tanggungan)</option>
                <option value="TK/1">TK/1 (Tidak Kawin, 1 Tanggungan)</option>
                <option value="TK/2">TK/2 (Tidak Kawin, 2 Tanggungan)</option>
                <option value="TK/3">TK/3 (Tidak Kawin, 3 Tanggungan)</option>
                <option value="K/0">K/0 (Kawin, 0 Tanggungan)</option>
                <option value="K/1">K/1 (Kawin, 1 Tanggungan)</option>
                <option value="K/2">K/2 (Kawin, 2 Tanggungan)</option>
                <option value="K/3">K/3 (Kawin, 3 Tanggungan)</option>
              </select>
            </div>
            <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
              <label className="text-label-md text-on-surface font-semibold">Domisili (Kategori Wilayah)</label>
              <select
                value={domisiliType}
                onChange={(e) => setDomisiliType(e.target.value as any)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer h-[50px]"
              >
                <option value="ibukota_provinsi">Ibukota Provinsi (Medan, Jakarta, Surabaya, dll)</option>
                <option value="ibukota_lainnya">Ibukota Kabupaten/Kota Lainnya</option>
                <option value="daerah_lainnya">Daerah Lainnya</option>
              </select>
            </div>

            {/* Active Profiles Multi-Select */}
            <div className="col-span-2 flex flex-col gap-3 border-t border-outline-variant/40 pt-6 mt-4">
              <label className="text-label-md text-on-surface font-semibold">Profil Penghasilan Aktif (Multi-income)</label>
              <p className="text-xs text-on-surface-variant -mt-1 mb-2">Pilih semua profil pekerjaan yang Anda jalankan saat ini.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(profileLabels).map(([key, label]) => {
                  const isActive = activeProfiles.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleProfile(key)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        isActive
                          ? "border-[#5A45CB] bg-[#5A45CB]/5 text-[#5A45CB]"
                          : "border-outline-variant hover:border-[#5A45CB]/30 text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                        {isActive ? "check_box" : "check_box_outline_blank"}
                      </span>
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="col-span-2 flex justify-end mt-6 pt-4 border-t border-outline-variant/40">
              <button
                type="submit"
                className="bg-primary hover:bg-primary-container text-white text-label-md px-8 py-3 rounded-xl shadow-md transition-colors font-bold h-12"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
