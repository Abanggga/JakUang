"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const SEARCHABLE_ROUTES = [
  { name: "Dashboard", desc: "Ringkasan keuangan & statistik pajak", href: "/dashboard" },
  { name: "Snap & Record", desc: "Catat transaksi dengan foto nota & suara AI", href: "/input" },
  { name: "Ledger", desc: "Riwayat lengkap transaksi masuk & keluar", href: "/ledger" },
  { name: "Assets (Daftar Harta)", desc: "Kelola properti, kendaraan, & alat usaha", href: "/assets" },
  { name: "Liabilities (Daftar Utang)", desc: "Kelola cicilan pinjaman & kartu kredit", href: "/liabilities" },
  { name: "Cash & Savings (Kas & Tabungan)", desc: "Kelola bank balance & kas utama", href: "/cash" },
  { name: "Tax Export (SPT)", desc: "Unduh laporan perpajakan PPh 21 / Final", href: "/tax-export" },
  { name: "Settings (Pengaturan)", desc: "Ubah data profil, PTKP, & domisili", href: "/settings" },
];

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<typeof SEARCHABLE_ROUTES>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter routes based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const filtered = SEARCHABLE_ROUTES.filter(route =>
      route.name.toLowerCase().includes(query.toLowerCase()) ||
      route.desc.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query]);

  const handleSelectRoute = (href: string) => {
    router.push(href);
    setQuery("");
    setShowResults(false);
  };

  return (
    <header className="bg-surface/80 backdrop-blur-md text-primary fixed top-0 right-0 left-0 lg:left-72 z-30 border-b border-outline-variant/50 flex items-center justify-between px-4 md:px-8 h-20 transition-all">
      {/* Mobile Menu & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="lg:hidden text-on-surface-variant hover:text-on-surface p-2 rounded-lg hover:bg-surface-container-low transition-colors"
          onClick={onMenuClick}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        
        {/* Functional Search Bar */}
        <div ref={containerRef} className="relative w-full max-w-md hidden sm:block">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            type="text"
            placeholder="Cari fitur (Pajak, Aset, Cash)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="w-full bg-surface-container-low text-on-surface rounded-full py-2.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all text-body-md border border-outline-variant/50"
          />
          
          {/* Search Dropdown Results */}
          {showResults && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-outline-variant rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
              {results.map((route) => (
                <button
                  key={route.href}
                  onClick={() => handleSelectRoute(route.href)}
                  className="w-full text-left px-5 py-3 hover:bg-surface-container-low transition-colors flex flex-col gap-0.5 border-b border-outline-variant/30 last:border-b-0 cursor-pointer"
                >
                  <span className="text-body-md font-semibold text-on-surface">{route.name}</span>
                  <span className="text-label-sm text-on-surface-variant">{route.desc}</span>
                </button>
              ))}
            </div>
          )}
          
          {showResults && query.trim() && results.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-outline-variant rounded-2xl shadow-xl z-50 p-4 text-center text-sm text-on-surface-variant">
              Fitur tidak ditemukan. Coba ketik: Dashboard, Aset, atau Pajak.
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <button className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors p-2 rounded-full flex items-center justify-center cursor-pointer">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="hidden md:flex text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors p-2 rounded-full items-center justify-center cursor-pointer">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
        
        {/* Settings Icon */}
        <Link href="/settings" title="Pengaturan">
          <span className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors p-2 rounded-full flex items-center justify-center cursor-pointer">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              settings
            </span>
          </span>
        </Link>
        
        {/* Clickable Profile Card */}
        <Link href="/settings" title="Profil Saya">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden bg-surface-container-high border-2 border-primary-fixed cursor-pointer ml-1 md:ml-2 flex items-center justify-center shrink-0 hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-primary text-[20px]">person</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
