import Image from "next/image";
import Link from "next/link";

import { getHomePageData } from "@/lib/blog";
import { formatChineseDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{ category?: string }>;
};

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
              className="group relative overflow-hidden lg:col-span-7"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container">
                <Image
                  src={featured.coverImage}
                  alt={featured.coverAlt || featured.title}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
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
            <div className="grid grid-cols-1 gap-x-8 gap-y-20 md:grid-cols-2 lg:grid-cols-3">
              {leadPosts.map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/posts/${post.slug}`} className="block">
                    <div className="relative mb-8 aspect-[3/4] overflow-hidden bg-surface-container-low transition-colors duration-300 group-hover:bg-surface-container-high">
                      <Image
                        src={post.coverImage}
                        alt={post.coverAlt || post.title}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover opacity-90 transition-all duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
                      />
                    </div>
                    <div className="px-2">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                          {post.category.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                          {post.readTimeMinutes ?? 5} 分钟阅读
                        </span>
                      </div>
                      <h3 className="balanced-text mb-4 font-headline text-2xl leading-snug text-zinc-900">
                        {post.title}
                      </h3>
                      <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
                        {post.excerpt}
                      </p>
                      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                        {post.publishedAt ? formatChineseDate(post.publishedAt) : "草稿"}
                      </div>
                    </div>
                  </Link>
                </article>
              ))}

              {widePost && (
                <article className="group md:col-span-2" key={widePost.id}>
                  <Link
                    href={`/posts/${widePost.slug}`}
                    className="grid grid-cols-1 items-center gap-8 md:grid-cols-12"
                  >
                    <div className="relative aspect-video overflow-hidden bg-surface-container-low transition-colors duration-300 group-hover:bg-surface-container-high md:col-span-8">
                      <Image
                        src={widePost.coverImage}
                        alt={widePost.coverAlt || widePost.title}
                        fill
                        sizes="(min-width: 768px) 60vw, 100vw"
                        className="object-cover opacity-90 transition-all duration-500 group-hover:scale-[1.01] group-hover:opacity-100"
                      />
                    </div>
                    <div className="px-2 md:col-span-4">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                          {widePost.category.name}
                        </span>
                      </div>
                      <h3 className="balanced-text mb-4 font-headline text-2xl leading-snug text-zinc-900">
                        {widePost.title}
                      </h3>
                      <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
                        {widePost.excerpt}
                      </p>
                      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                        {widePost.publishedAt ? formatChineseDate(widePost.publishedAt) : "草稿"}
                      </div>
                    </div>
                  </Link>
                </article>
              )}

              {finalPost && (
                <article key={finalPost.id} className="group">
                  <Link href={`/posts/${finalPost.slug}`} className="block">
                    <div className="relative mb-8 aspect-[3/4] overflow-hidden bg-surface-container-low transition-colors duration-300 group-hover:bg-surface-container-high">
                      <Image
                        src={finalPost.coverImage}
                        alt={finalPost.coverAlt || finalPost.title}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover opacity-90 transition-all duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
                      />
                    </div>
                    <div className="px-2">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                          {finalPost.category.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                          {finalPost.readTimeMinutes ?? 5} 分钟阅读
                        </span>
                      </div>
                      <h3 className="balanced-text mb-4 font-headline text-2xl leading-snug text-zinc-900">
                        {finalPost.title}
                      </h3>
                      <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
                        {finalPost.excerpt}
                      </p>
                      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                        {finalPost.publishedAt ? formatChineseDate(finalPost.publishedAt) : "草稿"}
                      </div>
                    </div>
                  </Link>
                </article>
              )}

              {/* 分类过滤时多出来的文章继续用普通卡片展示 */}
              {extraPosts.map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/posts/${post.slug}`} className="block">
                    <div className="relative mb-8 aspect-[3/4] overflow-hidden bg-surface-container-low transition-colors duration-300 group-hover:bg-surface-container-high">
                      <Image
                        src={post.coverImage}
                        alt={post.coverAlt || post.title}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover opacity-90 transition-all duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
                      />
                    </div>
                    <div className="px-2">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                          {post.category.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                          {post.readTimeMinutes ?? 5} 分钟阅读
                        </span>
                      </div>
                      <h3 className="balanced-text mb-4 font-headline text-2xl leading-snug text-zinc-900">
                        {post.title}
                      </h3>
                      <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
                        {post.excerpt}
                      </p>
                      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                        {post.publishedAt ? formatChineseDate(post.publishedAt) : "草稿"}
                      </div>
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
