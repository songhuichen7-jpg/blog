"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-xl shadow-ambient">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-8">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="菜单"
            className="block overflow-hidden rounded-full transition-opacity hover:opacity-70 focus:outline-none"
          >
            <Image
              src="/logo.png"
              alt="Logo"
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
          </button>

          {menuOpen && (
            <div className="absolute left-0 top-full mt-2 w-36 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                首页
              </Link>
              <Link
                href="/editor"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                写作后台
              </Link>
            </div>
          )}
        </div>

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
        </div>
      </div>
    </nav>
  );
}
