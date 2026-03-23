import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-zinc-200/15 bg-zinc-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-8 py-12 md:flex-row">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-headline text-lg italic text-zinc-800">The Curator</span>
          <p className="mt-2 text-sm tracking-wide text-zinc-600">
            © 2026 The Curator Editorial. 个人研究与写作档案。
          </p>
        </div>

        <div className="flex items-center gap-8">
          <Link
            href="/about"
            className="text-sm tracking-wide text-zinc-500 transition-all hover:underline hover:underline-offset-4"
          >
            关于
          </Link>
          <Link
            href="/archive"
            className="text-sm tracking-wide text-zinc-500 transition-all hover:underline hover:underline-offset-4"
          >
            归档
          </Link>
          <Link
            href="/editor"
            className="text-sm tracking-wide text-zinc-500 transition-all hover:underline hover:underline-offset-4"
          >
            编辑后台
          </Link>
        </div>
      </div>
    </footer>
  );
}
