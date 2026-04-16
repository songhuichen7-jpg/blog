import Link from "next/link";
import { redirect } from "next/navigation";

import { DeletePostButton } from "@/components/admin/delete-post-button";
import { getSession } from "@/lib/auth";
import { getAllPostsForAdmin } from "@/lib/blog";

export default async function PostsManagePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?next=/editor/posts");
  }

  const posts = await getAllPostsForAdmin();
  const published = posts.filter((p) => p.status === "PUBLISHED");
  const drafts = posts.filter((p) => p.status === "DRAFT");

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="fixed top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Link href="/editor" className="text-sm text-muted hover:text-foreground">
              &larr; 写作后台
            </Link>
            <span className="text-base font-semibold text-foreground">文章管理</span>
          </div>
          <Link
            href="/editor"
            className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
          >
            新建文章
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20 pt-20">
        {posts.length === 0 ? (
          <div className="py-20 text-center text-muted">
            <p className="text-base">暂无文章</p>
            <Link href="/editor" className="mt-3 inline-block text-sm text-accent hover:underline">
              去写第一篇
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {drafts.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  草稿 ({drafts.length})
                </h2>
                <PostTable posts={drafts} />
              </section>
            )}

            {published.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
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
    <div className="divide-y divide-border rounded-lg border border-border bg-white">
      {posts.map((post) => (
        <div key={post.id} className="flex items-center gap-4 px-5 py-3.5">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-medium text-accent">
                {post.category.name}
              </span>
              {post.status === "DRAFT" && (
                <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-muted">
                  草稿
                </span>
              )}
            </div>
            <p className="truncate text-sm font-medium text-foreground">{post.title}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/posts/${post.slug}`}
              target="_blank"
              className="rounded border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground"
            >
              预览
            </Link>
            <Link
              href={`/editor/posts/${post.id}`}
              className="rounded bg-zinc-100 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-zinc-200"
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
