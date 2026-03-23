"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { MaterialIcon } from "@/components/material-icon";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/", label: "文章" },
  { href: "/about", label: "关于" },
  { href: "/archive", label: "归档" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-xl shadow-ambient">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-8">
        <Link
          href="/"
          aria-label="首页"
          className="transition-opacity hover:opacity-60"
        >
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="5" width="30" height="30" rx="2" stroke="#1A1A1A" strokeWidth="2.5"/>
            <path d="M15 12H12V15" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M25 12H28V15" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 28H12V25" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M25 28H28V25" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="20" cy="20" r="3" fill="#1A1A1A"/>
          </svg>
        </Link>

        <div className="hidden items-center space-x-12 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "border-b-2 pb-1 font-label text-sm tracking-tight transition-colors duration-300",
                  active
                    ? "border-zinc-800 font-semibold text-zinc-900"
                    : "border-transparent font-medium text-zinc-500 hover:text-zinc-900",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-5">
          <Link
            href="/search"
            aria-label="搜索文章"
            className="rounded-full p-2 text-on-surface-variant hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline"
          >
            <MaterialIcon icon="search" />
          </Link>
          <Link
            href="/editor"
            aria-label="写作后台"
            title="写作后台"
            className="rounded-full p-2 text-outline/40 hover:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline"
          >
            <MaterialIcon icon="edit" className="text-[18px]" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
