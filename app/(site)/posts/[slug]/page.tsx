import Image from "next/image";
import { PostImage } from "@/components/post-image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ShareButtons } from "@/components/share-buttons";
import { getPostBySlug } from "@/lib/blog";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "PUBLISHED") {
    return {};
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;

  return {
    title,
    description,
    openGraph: {
      title,
      description: description || undefined,
      type: "article",
      authors: [post.authorName],
      ...(post.coverImage ? { images: [{ url: post.coverImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description || undefined,
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const [post, session] = await Promise.all([getPostBySlug(slug), getSession().catch(() => null)]);

  if (!post) notFound();
  if (post.status !== "PUBLISHED" && !session) notFound();

  let relatedLinks: { label: string; url: string }[] = [];
  try { relatedLinks = post.relatedLinks ? JSON.parse(post.relatedLinks) : []; } catch { relatedLinks = []; }

  const hasRightSidebar = relatedLinks.length > 0;

  return (
    <article className="mx-auto max-w-3xl px-6 pb-20 pt-28">
      {/* Header */}
      <header className="mb-8">
        <span className="mb-3 inline-block rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-accent">
          {post.category.name}
        </span>
        <h1 className="balanced-text text-2xl font-bold leading-tight text-primary md:text-3xl">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-3 text-base leading-relaxed text-muted">
            {post.excerpt}
          </p>
        )}
        <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-zinc-100">
            <Image
              src="/logo.png"
              alt={post.authorName}
              fill
              sizes="32px"
              className="object-cover"
            />
          </div>
          <span className="text-sm font-medium text-primary">
            {post.authorName}
          </span>
        </div>
      </header>

      {/* Cover image — contained width, natural aspect ratio with max height */}
      {post.coverImage && (
        <div className="mb-10 overflow-hidden rounded-lg bg-zinc-100">
          <div className="relative aspect-[2/1]">
            <PostImage
              src={post.coverImage}
              alt={post.coverAlt || post.title}
              fill
              sizes="(min-width: 768px) 720px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className={hasRightSidebar ? "grid grid-cols-1 gap-12 lg:grid-cols-12" : ""}>
        <div className={hasRightSidebar ? "lg:col-span-8" : ""}>
          <MarkdownRenderer content={post.content} />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
              {post.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-muted"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Share buttons */}
          <div className="mt-6 flex items-center gap-4 border-t border-border pt-6">
            <span className="text-xs font-medium text-muted">分享</span>
            <ShareButtons title={post.title} slug={post.slug} />
          </div>

          {/* Author card */}
          <section className="mt-10 flex items-center gap-4 rounded-lg border border-border p-5">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-zinc-100">
              <Image
                src="/logo.png"
                alt={post.authorName}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-primary">{post.authorName}</h4>
              <p className="mt-0.5 text-sm text-muted">
                {post.authorBio}
              </p>
            </div>
          </section>
        </div>

        {hasRightSidebar && (
          <aside className="space-y-4 lg:col-span-4">
            <h5 className="border-b border-border pb-3 text-xs font-medium text-muted">
              相关链接
            </h5>
            {relatedLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-2 text-sm text-muted hover:text-accent"
              >
                <span className="mt-0.5 shrink-0">&rarr;</span>
                <span className="group-hover:underline">{link.label || link.url}</span>
              </a>
            ))}
          </aside>
        )}
      </div>
    </article>
  );
}
