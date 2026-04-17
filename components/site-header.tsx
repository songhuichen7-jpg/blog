"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { MaterialIcon } from "@/components/material-icon";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/", label: "文章" },
  { href: "/about", label: "关于" },
  { href: "/archive", label: "归档" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-70">
          <Image
            src="/logo.png"
            alt="Logo"
            width={28}
            height={28}
            className="rounded-full object-cover"
          />
          <span className="text-base font-semibold text-primary">Veko&apos;s Blog</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  active
                    ? "font-medium text-primary"
                    : "text-muted hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/search"
            aria-label="搜索文章"
            className="rounded-md p-2 text-muted hover:text-primary"
          >
            <MaterialIcon icon="search" />
          </Link>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
            className="rounded-md p-2 text-muted hover:text-primary md:hidden"
          >
            <MaterialIcon icon={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-white md:hidden">
          <div className="mx-auto max-w-5xl px-6 py-3">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-2.5 text-sm ${
                    active ? "font-medium text-primary" : "text-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
