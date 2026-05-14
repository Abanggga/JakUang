"use client";

import { mockUser } from "@/lib/mock-data";

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-headline-md text-on-surface mb-2">Pengaturan Profil & Pajak</h2>
        <p className="text-body-md text-on-surface-variant">Kelola informasi pribadi, klasifikasi usaha, dan preferensi keamanan Anda.</p>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Profile Summary */}
        <div className="col-span-12 md:col-span-4 bg-surface rounded-xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface shadow-sm bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "64px" }}>person</span>
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors border-2 border-surface">
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
          </div>
          <h3 className="text-headline-sm text-on-surface mb-1">{mockUser.name}</h3>
          <p className="text-body-md text-on-surface-variant mb-4">{mockUser.email}</p>
          <span className="inline-block bg-surface-container-high text-primary text-label-sm px-3 py-1 rounded-full uppercase tracking-wider mb-6">Verified User</span>
          <div className="w-full border-t border-outline-variant pt-6 mt-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-body-md text-on-surface-variant">Status NPWP</span>
              <span className="flex items-center text-secondary text-label-md">
                <span className="material-symbols-outlined text-[18px] mr-1">check_circle</span> Valid
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-md text-on-surface-variant">Terakhir Login</span>
              <span className="text-label-md text-on-surface">Hari ini, 09:41</span>
            </div>
          </div>
        </div>

        {/* Personal Info Form */}
        <div className="col-span-12 md:col-span-8 bg-surface rounded-xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
          <h3 className="text-headline-sm text-on-surface mb-6 pb-4 border-b border-outline-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            Informasi Pribadi & Usaha
          </h3>
          <form className="grid grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
              <label className="text-label-md text-on-surface">Nama Lengkap Sesuai KTP</label>
              <input type="text" defaultValue={mockUser.name} required minLength={3} maxLength={100} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
              <label className="text-label-md text-on-surface">Nomor Telepon</label>
              <input type="tel" defaultValue="+62 812 3456 7890" required pattern="^\+?[0-9\s\-]{9,20}$" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <label className="text-label-md text-on-surface">Nomor Pokok Wajib Pajak (NPWP)</label>
              <input type="text" defaultValue="12.345.678.9-012.000" required pattern="[0-9.-]+" minLength={15} maxLength={20} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono" />
              <p className="text-label-sm text-on-surface-variant mt-1">Pastikan NPWP 15 atau 16 digit sesuai format terbaru DJP.</p>
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <label className="text-label-md text-on-surface">Klasifikasi Lapangan Usaha (KLU)</label>
              <div className="relative">
                <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer">
                  <option value="62010">6201 - Kegiatan Pemrograman Komputer</option>
                  <option value="4711">4711 - Perdagangan Eceran Berbagai Macam Barang</option>
                  <option value="5610">5610 - Restoran dan Penyediaan Makanan Keliling</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </div>
            <div className="col-span-2 flex justify-end mt-4">
              <button type="button" className="bg-primary text-on-primary text-label-md px-6 py-3 rounded-lg shadow-sm hover:bg-primary/90 transition-colors">
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>

        {/* Tax Scheme */}
        <div className="col-span-12 bg-surface rounded-xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
          <h3 className="text-headline-sm text-on-surface mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">account_balance_wallet</span>
            Skema Pajak
          </h3>
          <p className="text-body-md text-on-surface-variant mb-6">Pilih skema perpajakan yang sesuai dengan profil pendapatan Anda.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { value: "karyawan", icon: "work", title: "Karyawan (Pegawai)", desc: "Penghasilan dari satu pemberi kerja. Menggunakan skema PPh 21 tarif efektif.", selected: false },
              { value: "umkm", icon: "storefront", title: "UMKM (PP 55/2022)", desc: "Peredaran bruto hingga Rp4,8 M. Tarif final 0.5% (Bebas pajak hingga Rp500jt).", selected: true },
              { value: "freelance", icon: "laptop_mac", title: "Pekerja Bebas", desc: "Tenaga ahli, dokter, konsultan. Menggunakan Norma Penghitungan Penghasilan Neto (NPPN).", selected: false },
            ].map((scheme) => (
              <label key={scheme.value} className={`relative flex flex-col border-2 rounded-xl p-6 cursor-pointer transition-colors ${
                scheme.selected
                  ? "bg-surface-container-low border-primary shadow-[0_0_0_1px_rgba(90,69,203,1)]"
                  : "bg-surface-container-lowest border-outline-variant hover:border-primary/50 group"
              }`}>
                <input type="radio" name="tax_scheme" value={scheme.value} defaultChecked={scheme.selected} className="absolute right-4 top-4 w-5 h-5 text-primary border-outline-variant focus:ring-primary" />
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  scheme.selected
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-low text-primary group-hover:bg-primary-fixed transition-colors"
                }`}>
                  <span className="material-symbols-outlined">{scheme.icon}</span>
                </div>
                <h4 className="text-headline-sm text-on-surface mb-2">{scheme.title}</h4>
                <p className="text-body-md text-on-surface-variant">{scheme.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="col-span-12 bg-surface rounded-xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
          <h3 className="text-headline-sm text-on-surface mb-6 pb-4 border-b border-outline-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-error">security</span>
            Keamanan Akun
          </h3>
          <div className="flex flex-col gap-6 divide-y divide-outline-variant/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-2">
              <div>
                <h4 className="text-label-md text-on-surface">Kata Sandi</h4>
                <p className="text-body-md text-on-surface-variant mt-1">Terakhir diubah 3 bulan yang lalu.</p>
              </div>
              <button className="mt-4 md:mt-0 px-4 py-2 border-[1.5px] border-outline-variant text-on-surface text-label-md rounded-lg hover:bg-surface-container-low transition-colors">
                Ubah Kata Sandi
              </button>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-6">
              <div>
                <h4 className="text-label-md text-on-surface">Autentikasi Dua Langkah (2FA)</h4>
                <p className="text-body-md text-on-surface-variant mt-1">Tambahkan lapisan keamanan ekstra.</p>
              </div>
              <label className="mt-4 md:mt-0 relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner" />
                <span className="ml-3 text-label-md text-primary">Aktif</span>
              </label>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-6">
              <div>
                <h4 className="text-label-md text-on-surface">Sesi Perangkat</h4>
                <p className="text-body-md text-on-surface-variant mt-1">Kelola perangkat yang saat ini masuk ke akun Anda.</p>
              </div>
              <button className="mt-4 md:mt-0 px-4 py-2 text-error text-label-md hover:bg-error-container rounded-lg transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Keluar dari Semua Perangkat
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-16 py-8 border-t border-outline-variant text-center">
        <p className="text-body-md text-on-surface-variant">© 2025 JakUang Financial OS. Hak Cipta Dilindungi.</p>
      </footer>
    </div>
  );
}
