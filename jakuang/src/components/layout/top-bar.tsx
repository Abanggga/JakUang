"use client";

import Link from "next/link";

export function TopBar() {
  return (
    <header className="bg-surface/80 backdrop-blur-md text-primary fixed top-0 right-0 left-72 z-40 border-b border-outline-variant/50 flex items-center justify-between px-8 h-20">
      {/* Search */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-surface-container-low text-on-surface rounded-full py-2.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all text-body-md border border-outline-variant/50"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors p-2 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors p-2 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
        <Link href="/settings">
          <span className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors p-2 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              settings
            </span>
          </span>
        </Link>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border-2 border-primary-fixed cursor-pointer ml-2 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[20px]">person</span>
        </div>
      </div>
    </header>
  );
}
