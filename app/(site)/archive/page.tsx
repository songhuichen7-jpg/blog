import Link from "next/link";

import { getArchiveGroups } from "@/lib/blog";
import { formatChineseDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const groups = await getArchiveGroups();
  const totalPublished = groups.reduce((sum, group) => sum + group.posts.length, 0);

  return (
    <main className="mx-auto max-w-7xl px-8 pb-24 pt-32">
      <header className="mb-24">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-on-surface-variant">
          The Archive / 档案
        </p>
        <h1 className="font-headline text-6xl tracking-[-0.06em] text-on-surface md:text-8xl">
          归档
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-on-surface-variant">
          共 {totalPublished} 篇文章，按分类整理。
        </p>
        <div className="mt-8 h-px w-24 bg-outline-variant/30" />
      </header>

      <div className="grid grid-cols-1 gap-y-16 md:grid-cols-12">
        {groups.map((group, index) => (
          <div key={group.id} id={group.slug} className="contents scroll-mt-32">
            <div className="md:col-span-3">
              <h2 className="sticky top-32 text-xs uppercase tracking-[0.3em] text-on-surface-variant">
                {String(index + 1).padStart(2, "0")} — {group.name}
                <span className="ml-2 text-outline">({group.posts.length})</span>
              </h2>
            </div>
            <div className="space-y-8 md:col-span-9">
              {group.posts.map((post) => (
                <article key={post.id} className="group">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="flex items-end justify-between border-b border-outline-variant/15 pb-6 transition-all duration-500 group-hover:border-outline"
                  >
                    <div>
                      <p className="mb-2 text-[10px] uppercase tracking-widest text-outline">
                        {post.publishedAt ? formatChineseDate(post.publishedAt) : "草稿"}
                      </p>
                      <h3 className="font-headline text-2xl transition-transform duration-500 group-hover:translate-x-2 md:text-3xl">
                        {post.title}
                      </h3>
                    </div>
                    <span className="shrink-0 text-outline-variant transition-colors group-hover:text-primary">
                      →
                    </span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
