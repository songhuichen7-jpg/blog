import Link from "next/link";

import { getArchiveGroups } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const groups = await getArchiveGroups();
  const totalPublished = groups.reduce((sum, group) => sum + group.posts.length, 0);

  return (
    <main className="mx-auto max-w-5xl px-6 pb-20 pt-28">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-primary">归档</h1>
        <p className="mt-2 text-sm text-muted">
          共 {totalPublished} 篇文章，按分类整理。
        </p>
      </header>

      <div className="space-y-12">
        {groups.map((group) => (
          <div key={group.id} id={group.slug}>
            <h2 className="mb-4 text-sm font-semibold text-primary">
              {group.name}
              <span className="ml-2 font-normal text-muted">({group.posts.length})</span>
            </h2>
            <div className="space-y-1">
              {group.posts.map((post) => (
                <article key={post.id} className="group">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-zinc-100"
                  >
                    <h3 className="text-sm text-secondary group-hover:text-primary">
                      {post.title}
                    </h3>
                    <span className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      &rarr;
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
