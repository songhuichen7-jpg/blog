import Link from "next/link";
import { redirect } from "next/navigation";

import { DeletePostButton } from "@/components/admin/delete-post-button";
import { getSession } from "@/lib/auth";
import { getAllPostsForAdmin } from "@/lib/blog";
import { formatChineseDate } from "@/lib/utils";

export default async function PostsManagePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?next=/editor/posts");
  }

  const posts = await getAllPostsForAdmin();
  const published = posts.filter((p) => p.status === "PUBLISHED");
  const drafts = posts.filter((p) => p.status === "DRAFT");

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 z-50 w-full bg-background/80 shadow-ambient backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-8 py-5">
          <div className="flex items-center gap-6">
            <Link href="/editor" className="text-sm text-on-surface-variant hover:text-on-surface">
              ← 写作后台
            </Link>
            <span className="font-headline text-xl text-on-surface">文章管理</span>
          </div>
          <Link
            href="/editor"
            className="rounded-md bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-primary hover:bg-primary-dim"
          >
            新建文章
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-8 pb-24 pt-28">
        {posts.length === 0 ? (
          <div className="py-24 text-center text-on-surface-variant">
            <p className="text-lg">暂无文章</p>
            <Link href="/editor" className="mt-4 inline-block text-sm text-primary hover:underline">
              去写第一篇
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {drafts.length > 0 && (
              <section>
                <h2 className="mb-4 text-[10px] font-extrabold uppercase tracking-widest text-outline">
                  草稿 ({drafts.length})
                </h2>
                <PostTable posts={drafts} />
              </section>
            )}

            {published.length > 0 && (
              <section>
                <h2 className="mb-4 text-[10px] font-extrabold uppercase tracking-widest text-outline">
                  已发布 ({published.length})
                </h2>
                <PostTable posts={published} />
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function PostTable({
  posts,
}: {
  posts: Awaited<ReturnType<typeof getAllPostsForAdmin>>;
}) {
  return (
    <div className="divide-y divide-outline-variant/15 rounded-xl border border-outline-variant/15 bg-surface-container-lowest">
      {posts.map((post) => (
        <div key={post.id} className="flex items-center gap-4 px-6 py-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                {post.category.name}
              </span>
              {post.status === "DRAFT" && (
                <span className="rounded bg-surface-container px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-outline">
                  草稿
                </span>
              )}
            </div>
            <p className="truncate text-sm font-medium text-on-surface">{post.title}</p>
            <p className="mt-0.5 text-[10px] text-outline">
              {post.publishedAt
                ? `发布于 ${formatChineseDate(post.publishedAt)}`
                : `修改于 ${formatChineseDate(post.updatedAt)}`}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/posts/${post.slug}`}
              target="_blank"
              className="rounded border border-outline-variant/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container-low"
            >
              预览
            </Link>
            <Link
              href={`/editor/posts/${post.id}`}
              className="rounded bg-surface-container px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface hover:bg-surface-container-high"
            >
              编辑
            </Link>
            <DeletePostButton postId={post.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
