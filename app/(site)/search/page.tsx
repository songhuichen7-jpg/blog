import Link from "next/link";

import { searchPosts } from "@/lib/blog";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const results = q.trim() ? await searchPosts(q.trim()) : [];

  return (
    <main className="mx-auto max-w-3xl px-6 pb-20 pt-28">
      <h1 className="mb-8 text-2xl font-bold text-primary">搜索</h1>

      <form action="/search" method="GET" className="mb-10">
        <div className="flex items-center gap-3 border-b-2 border-primary pb-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="搜索文章标题、内容..."
            autoFocus
            className="flex-1 bg-transparent text-base text-primary placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            搜索
          </button>
        </div>
      </form>

      {q.trim() && (
        <p className="mb-6 text-sm text-muted">
          {results.length > 0
            ? `找到 ${results.length} 篇相关文章`
            : `未找到与"${q}"相关的文章`}
        </p>
      )}

      <div className="space-y-6">
        {results.map((post) => (
          <article key={post.id} className="group border-b border-border pb-6">
            <Link href={`/posts/${post.slug}`} className="block">
              <span className="mb-1 inline-block text-xs font-medium text-accent">
                {post.category.name}
              </span>
              <h2 className="mb-1 text-lg font-semibold text-primary transition-colors group-hover:text-accent">
                {post.title}
              </h2>
              <p className="text-sm leading-relaxed text-muted">{post.excerpt}</p>
            </Link>
          </article>
        ))}
      </div>

      {!q.trim() && (
        <p className="text-sm text-muted-foreground">输入关键词开始搜索</p>
      )}
    </main>
  );
}
