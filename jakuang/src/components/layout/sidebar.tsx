"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/ledger", label: "Ledger", icon: "receipt_long" },
  { href: "/assets", label: "Assets", icon: "account_balance" },
  { href: "/liabilities", label: "Liabilities", icon: "credit_card" },
  { href: "/cash", label: "Cash & Savings", icon: "savings" },
];

const bottomNavItems = [
  { href: "/tax-export", label: "Tax Export", icon: "file_export" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-primary shadow-sm z-50 flex flex-col py-6">
      {/* Brand */}
      <div className="px-6 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center shadow-md overflow-hidden">
          <Image src="/logo.png" alt="JakUang" width={40} height={40} className="object-contain" priority />
        </div>
        <div>
          <h1 className="text-headline-sm font-bold text-on-primary tracking-tight">
            JakUang <span className="text-primary-fixed text-sm font-normal ml-1">v1.0</span>
          </h1>
          <p className="text-label-sm text-on-primary/70 uppercase tracking-widest mt-0.5">
            Financial OS
          </p>
        </div>
      </div>

      {/* Snap & Record CTA */}
      <div className="px-6 mb-4">
        <button className="w-full bg-secondary-container text-on-secondary-container text-label-md font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">camera_alt</span>
          Snap & Record
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-3.5 flex items-center gap-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-secondary-container text-on-secondary-container font-semibold shadow-sm"
                  : "text-on-primary/80 hover:text-on-primary hover:bg-primary-container/30"
              )}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-label-md">{item.label}</span>
            </Link>
          );
        })}

        {/* Tax Export separated */}
        <div className="pt-6">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-3.5 flex items-center gap-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-secondary-container text-on-secondary-container font-semibold shadow-sm"
                    : "text-on-primary/80 hover:text-on-primary hover:bg-primary-container/30"
                )}
              >
                <span
                  className="material-symbols-outlined"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="text-label-md">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="px-6 mt-auto flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border-2 border-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[20px]">person</span>
        </div>
        <div className="text-on-primary">
          <div className="text-label-md">Andi Pratama</div>
          <div className="text-label-sm text-on-primary/70">Admin</div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-2 mt-4 border-t border-on-primary/10 pt-4">
        <Link
          href="/login"
          className="text-on-primary/80 hover:text-on-primary px-4 py-3 flex items-center gap-3 transition-colors hover:bg-error/20 rounded-lg"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-label-md">Keluar</span>
        </Link>
      </div>
    </aside>
  );
}
