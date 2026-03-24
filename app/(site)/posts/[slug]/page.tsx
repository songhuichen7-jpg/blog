import Image from "next/image";
import { PostImage } from "@/components/post-image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkdownRenderer } from "@/components/markdown-renderer";
import { getPostBySlug } from "@/lib/blog";
import { getSession } from "@/lib/auth";
import { formatChineseDate } from "@/lib/utils";

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

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const [post, session] = await Promise.all([getPostBySlug(slug), getSession().catch(() => null)]);

  if (!post) notFound();
  if (post.status !== "PUBLISHED" && !session) notFound();

  const showStandaloneQuote = Boolean(post.pullQuote) && !post.content.includes(">");

  return (
    <>
      <header className="mx-auto max-w-5xl px-8 pb-16 pt-32 md:pt-48">
        <div className="flex flex-col items-center space-y-6 text-center">
          <span className="rounded-full bg-secondary-container px-3 py-1 text-xs uppercase tracking-[0.2em] text-on-surface-variant">
            {post.category.name}
          </span>
          <h1 className="balanced-text max-w-4xl font-headline text-4xl font-bold leading-tight text-on-surface md:text-6xl">
            {post.title}
          </h1>
          <p className="max-w-2xl text-lg font-light leading-relaxed text-on-surface-variant md:text-xl">
            {post.excerpt}
          </p>
          <div className="flex w-full items-center justify-center gap-4 border-t border-outline-variant/15 pt-8">
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-on-surface">
                {post.authorName}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                {post.publishedAt ? formatChineseDate(post.publishedAt) : "草稿"} · {post.readTimeMinutes ?? 5} 分钟阅读
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-8 pb-32">
        <div className="mb-24 w-full overflow-hidden rounded-xl bg-surface-container">
          <div className="relative aspect-[21/9]">
            <PostImage
              src={post.coverImage}
              alt={post.coverAlt || post.title}
              fill
              sizes="100vw"
              className="object-cover grayscale transition-all duration-700 hover:grayscale-0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          <aside className="hidden lg:col-span-2 lg:block">
            <div className="sticky top-32 space-y-12">
              <div className="space-y-4">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-outline">分享</span>
                <div className="flex flex-col gap-4">
                  <Link href="/archive" className="text-on-surface-variant hover:text-primary">
                    归档
                  </Link>
                  <Link href="/about" className="text-on-surface-variant hover:text-primary">
                    关于作者
                  </Link>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(post.title)}`}
                    className="text-on-surface-variant hover:text-primary"
                  >
                    邮件分享
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-outline">话题</span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(({ tag }) => (
                    <span
                      key={tag.id}
                      className="border border-outline-variant/30 px-2 py-1 text-[10px] uppercase tracking-widest"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <article className="space-y-12 lg:col-span-7">
            {showStandaloneQuote ? (
              <blockquote className="group border-y border-outline-variant/10 py-12">
                <p className="mx-auto max-w-2xl text-center font-headline text-3xl italic leading-tight text-primary transition-transform duration-500 group-hover:scale-[1.01] md:text-4xl">
                  “{post.pullQuote}”
                </p>
              </blockquote>
            ) : null}

            <MarkdownRenderer content={post.content} dropcap />

            <section className="mt-24 flex flex-col items-center gap-8 rounded-xl bg-surface-container-low p-12 text-center md:flex-row md:items-start md:text-left">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-surface-container-highest grayscale">
                {post.authorAvatar && (
                  <Image
                    src={post.authorAvatar}
                    alt={post.authorName}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="space-y-4">
                <h4 className="font-headline text-xl font-bold">{post.authorName}</h4>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {post.authorBio}
                </p>
                <Link
                  href="/about"
                  className="inline-block text-[10px] uppercase tracking-widest text-primary transition-all hover:underline hover:underline-offset-4"
                >
                  查看更多介绍
                </Link>
              </div>
            </section>
          </article>

          <aside className="space-y-16 lg:col-span-3">
            {(() => {
              let links: { label: string; url: string }[] = [];
              try { links = post.relatedLinks ? JSON.parse(post.relatedLinks) : []; } catch { links = []; }
              return links.length > 0 ? (
                <div className="space-y-4">
                  <h5 className="border-b border-outline-variant/10 pb-4 text-[10px] uppercase tracking-[0.2em] text-outline">
                    相关链接
                  </h5>
                  {links.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-2 text-sm text-on-surface-variant hover:text-primary"
                    >
                      <span className="mt-0.5 shrink-0 text-outline">→</span>
                      <span className="group-hover:underline group-hover:underline-offset-4">{link.label || link.url}</span>
                    </a>
                  ))}
                </div>
              ) : null;
            })()}
          </aside>
        </div>
      </main>
    </>
  );
}
