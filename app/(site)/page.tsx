import Link from "next/link";

import { getHomePageData } from "@/lib/blog";
import { PostImage } from "@/components/post-image";
import { FeaturedCarousel } from "@/components/featured-carousel";

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

function PostCardImage({ post, sizes }: { post: PostCard; sizes: string }) {
  return (
    <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-zinc-100">
      {post.coverImage ? (
        <PostImage
          src={post.coverImage}
          alt={post.coverAlt || post.title}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-zinc-100">
          <span className="text-3xl font-semibold text-zinc-300">{post.title.charAt(0)}</span>
        </div>
      )}
    </div>
  );
}

function PostCardContent({ post }: { post: PostCard }) {
  return (
    <>
      <span className="mb-2 inline-block text-xs font-medium text-accent">
        {post.category.name}
      </span>
      <h3 className="balanced-text mb-2 text-lg font-semibold leading-snug text-primary">
        {post.title}
      </h3>
      <p className="line-clamp-2 text-sm leading-relaxed text-muted">
        {post.excerpt}
      </p>
    </>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { category } = await searchParams;
  const { featuredPosts, latestPosts, categoryCounts } = await getHomePageData(category);

  const activeCategory = categoryCounts.find((c) => c.slug === category);

  return (
    <main className="mx-auto max-w-5xl px-6 pb-20 pt-28">
      {/* Featured carousel */}
      {!category && featuredPosts.length > 0 && (
        <FeaturedCarousel posts={featuredPosts} />
      )}

      {/* Empty state */}
      {!category && featuredPosts.length === 0 && latestPosts.length === 0 && (
        <section className="mb-16 rounded-lg border border-border px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-primary">暂无文章</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            先在写作后台发布文章，内容就会出现在这里。
          </p>
        </section>
      )}

      <section>
        {/* Category tabs */}
        <div className="mb-10 flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-primary">
              {activeCategory ? activeCategory.name : "全部文章"}
            </h2>
            {activeCategory && (
              <p className="mt-1 text-sm text-muted">
                共 {activeCategory._count.posts} 篇
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                !category
                  ? "bg-primary text-primary-foreground"
                  : "bg-zinc-100 text-muted hover:bg-zinc-200 hover:text-primary"
              }`}
            >
              全部
            </Link>
            {categoryCounts.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.slug}`}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  category === cat.slug
                    ? "bg-primary text-primary-foreground"
                    : "bg-zinc-100 text-muted hover:bg-zinc-200 hover:text-primary"
                }`}
              >
                {cat.name} ({cat._count.posts})
              </Link>
            ))}
          </div>
        </div>

        {latestPosts.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">
            该分类下暂无文章。
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/posts/${post.slug}`} className="block">
                    <PostCardImage post={post} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw" />
                    <div className="mt-4">
                      <PostCardContent post={post} />
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            <div className="mt-16 flex justify-center">
              <Link
                href="/archive"
                className="cursor-pointer rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
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
