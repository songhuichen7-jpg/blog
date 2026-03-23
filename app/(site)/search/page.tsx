import Link from "next/link";

import { searchPosts } from "@/lib/blog";
import { formatChineseDate } from "@/lib/utils";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const results = q.trim() ? await searchPosts(q.trim()) : [];

  return (
    <main className="mx-auto max-w-4xl px-8 pb-24 pt-32">
      <h1 className="mb-10 font-headline text-4xl text-zinc-900">搜索</h1>

      <form action="/search" method="GET" className="mb-12">
        <div className="flex items-center gap-3 border-b-2 border-zinc-900 pb-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="搜索文章标题、内容..."
            autoFocus
            className="flex-1 bg-transparent text-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            搜索
          </button>
        </div>
      </form>

      {q.trim() && (
        <p className="mb-8 text-sm text-zinc-500">
          {results.length > 0
            ? `找到 ${results.length} 篇相关文章`
            : `未找到与"${q}"相关的文章`}
        </p>
      )}

      <div className="space-y-8">
        {results.map((post) => (
          <article key={post.id} className="group border-b border-zinc-100 pb-8">
            <Link href={`/posts/${post.slug}`} className="block">
              <div className="mb-2 flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                  {post.category.name}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  {post.publishedAt ? formatChineseDate(post.publishedAt) : "草稿"}
                </span>
              </div>
              <h2 className="mb-2 font-headline text-2xl text-zinc-900 transition-colors group-hover:text-primary">
                {post.title}
              </h2>
              <p className="text-sm leading-relaxed text-zinc-500">{post.excerpt}</p>
            </Link>
          </article>
        ))}
      </div>

      {!q.trim() && (
        <p className="text-sm text-zinc-400">输入关键词开始搜索</p>
      )}
    </main>
  );
}
