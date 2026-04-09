import Link from "next/link";

import { getHomePageData } from "@/lib/blog";
import { PostImage } from "@/components/post-image";
import { formatChineseDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{ category?: string }>;
};

type PostCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  coverAlt: string | null;
  publishedAt: Date | null;
  readTimeMinutes: number | null;
  category: { name: string };
};

function PostCardImage({ post, sizes, aspectClass = "aspect-[3/2]" }: { post: PostCard; sizes: string; aspectClass?: string }) {
  return (
    <div className={`relative ${aspectClass} overflow-hidden rounded-lg bg-surface-container-low transition-colors duration-300 group-hover:bg-surface-container-high`}>
      {post.coverImage ? (
        <PostImage
          src={post.coverImage}
          alt={post.coverAlt || post.title}
          fill
          sizes={sizes}
          className="object-cover transition-all duration-500 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-surface-container">
          <span className="font-headline text-4xl text-outline-variant/30">{post.title.charAt(0)}</span>
        </div>
      )}
    </div>
  );
}

function PostCardMeta({ post, showReadTime = true }: { post: PostCard; showReadTime?: boolean }) {
  return (
    <>
      <div className="mb-3 flex items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
          {post.category.name}
        </span>
        {showReadTime && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
            {post.readTimeMinutes ?? 5} 分钟阅读
          </span>
        )}
      </div>
      <h3 className="balanced-text mb-3 font-headline text-xl leading-snug text-zinc-900 md:text-2xl">
        {post.title}
      </h3>
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
        {post.excerpt}
      </p>
      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">
        {post.publishedAt ? formatChineseDate(post.publishedAt) : "草稿"}
      </div>
    </>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { category } = await searchParams;
  const { featured, latestPosts, categoryCounts } = await getHomePageData(category);

  const leadPosts = latestPosts.slice(0, 3);
  const widePost = latestPosts[3];
  const finalPost = latestPosts[4];
  const extraPosts = latestPosts.slice(5);

  const activeCategory = categoryCounts.find((c) => c.slug === category);

  return (
    <main className="mx-auto max-w-7xl overflow-x-hidden px-6 pb-24 pt-32 md:px-8">
      {/* 精选文章（无分类过滤时显示） */}
      {!category && featured && (
        <section className="mb-32">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <Link
              href={`/posts/${featured.slug}`}
              className="group relative overflow-hidden rounded-lg lg:col-span-7"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container">
                {featured.coverImage ? (
                  <PostImage
                    src={featured.coverImage}
                    alt={featured.coverAlt || featured.title}
                    fill
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-headline text-6xl text-outline-variant/20">{featured.title.charAt(0)}</span>
                  </div>
                )}
              </div>
            </Link>

            <div className="flex flex-col justify-center lg:col-span-5">
              <span className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-on-surface-variant">
                <span className="h-px w-8 bg-outline-variant/30" /> 精选
              </span>
              <h1 className="mb-8 balanced-text font-headline text-4xl leading-tight tracking-editorial text-zinc-900 md:text-5xl lg:text-6xl">
                {featured.title}
              </h1>
              <p className="mb-8 max-w-md text-lg leading-relaxed text-on-surface-variant">
                {featured.excerpt}
              </p>
              <div className="mb-10 flex items-center gap-4">
                <span className="text-xs uppercase tracking-widest text-on-surface-variant">
                  {featured.publishedAt ? formatChineseDate(featured.publishedAt) : "草稿"}
                </span>
                <span className="text-zinc-300">|</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
                  {featured.category.name}
                </span>
              </div>
              <Link
                href={`/posts/${featured.slug}`}
                className="group inline-flex items-center gap-3 font-semibold text-primary"
              >
                阅读完整文章
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 无内容提示 */}
      {!category && !featured && latestPosts.length === 0 && (
        <section className="mb-32 rounded-2xl bg-surface-container px-8 py-16 text-center">
          <h1 className="font-headline text-4xl italic text-on-surface">暂无文章</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
            先在写作后台发布文章，内容就会出现在这里。
          </p>
        </section>
      )}

      <section>
        {/* 分类标签栏 */}
        <div className="mb-16 flex flex-col justify-between border-b border-outline-variant/10 pb-8 md:flex-row md:items-baseline">
          <div>
            <h2 className="font-headline text-3xl text-zinc-800">
              {activeCategory ? activeCategory.name : "全部文章"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
              {activeCategory
                ? `共 ${activeCategory._count.posts} 篇`
                : "记录技术探索、项目思考和个人成长。"}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 md:mt-0">
            <Link
              href="/"
              className={`rounded-full px-5 py-2 text-xs uppercase tracking-widest transition-all ${
                !category
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-fixed"
              }`}
            >
              全部
            </Link>
            {categoryCounts.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.slug}`}
                className={`rounded-full px-5 py-2 text-xs uppercase tracking-widest transition-all ${
                  category === cat.slug
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-fixed"
                }`}
              >
                {cat.name} ({cat._count.posts})
              </Link>
            ))}
          </div>
        </div>

        {latestPosts.length === 0 ? (
          <p className="py-16 text-center text-sm text-on-surface-variant">
            该分类下暂无文章。
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
              {leadPosts.map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/posts/${post.slug}`} className="block">
                    <PostCardImage post={post} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw" />
                    <div className="mt-4">
                      <PostCardMeta post={post} />
                    </div>
                  </Link>
                </article>
              ))}

              {widePost && (
                <article className="group md:col-span-2 lg:col-span-3" key={widePost.id}>
                  <Link
                    href={`/posts/${widePost.slug}`}
                    className="grid grid-cols-1 items-center gap-8 md:grid-cols-12"
                  >
                    <div className="md:col-span-7">
                      <PostCardImage post={widePost} sizes="(min-width: 768px) 60vw, 100vw" aspectClass="aspect-[16/9]" />
                    </div>
                    <div className="md:col-span-5">
                      <PostCardMeta post={widePost} showReadTime={false} />
                    </div>
                  </Link>
                </article>
              )}

              {finalPost && (
                <article key={finalPost.id} className="group">
                  <Link href={`/posts/${finalPost.slug}`} className="block">
                    <PostCardImage post={finalPost} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw" />
                    <div className="mt-4">
                      <PostCardMeta post={finalPost} />
                    </div>
                  </Link>
                </article>
              )}

              {extraPosts.map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/posts/${post.slug}`} className="block">
                    <PostCardImage post={post} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw" />
                    <div className="mt-4">
                      <PostCardMeta post={post} />
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            <div className="mt-24 flex justify-center">
              <Link
                href="/archive"
                className="rounded-md bg-primary px-12 py-4 text-sm font-semibold text-on-primary shadow-ambient transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                查看全部归档
              </Link>
            </div>
          </>
        )}
      </section>

    </main>
  );
}
