import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <p className="text-sm text-muted">
          &copy; {new Date().getFullYear()} Veko's Blog
        </p>

        <div className="flex items-center gap-6">
          <Link href="/about" className="text-sm text-muted hover:text-primary">
            关于
          </Link>
          <Link href="/archive" className="text-sm text-muted hover:text-primary">
            归档
          </Link>
          <Link href="/feed.xml" className="text-sm text-muted hover:text-primary">
            RSS
          </Link>
        </div>
      </div>
    </footer>
  );
}
