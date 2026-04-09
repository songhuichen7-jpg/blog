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
    <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-xl shadow-ambient">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 md:px-8">
        {/* Logo + 博客名 */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-70">
          <Image
            src="/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <span className="font-headline text-lg tracking-tight text-zinc-800">The Curator</span>
        </Link>

        {/* 桌面端导航 */}
        <div className="hidden items-center space-x-10 md:flex">
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

        {/* 右侧：搜索 + 移动端菜单按钮 */}
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="搜索文章"
            className="rounded-full p-2 text-on-surface-variant hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline"
          >
            <MaterialIcon icon="search" />
          </Link>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
            className="rounded-full p-2 text-on-surface-variant hover:text-primary md:hidden"
          >
            <MaterialIcon icon={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {menuOpen && (
        <div className="border-t border-outline-variant/10 bg-white/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-7xl px-6 py-4">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-3 text-sm ${
                    active ? "font-semibold text-zinc-900" : "text-zinc-600"
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
