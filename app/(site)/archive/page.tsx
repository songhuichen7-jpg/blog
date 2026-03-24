import Link from "next/link";

import { getArchiveGroups } from "@/lib/blog";
import { PostImage } from "@/components/post-image";
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
        <h1 className="font-headline text-6xl italic tracking-[-0.06em] text-on-surface md:text-8xl">
          精选收藏
        </h1>
        <div className="mt-12 h-px w-24 bg-outline-variant/30" />
      </header>

      <section className="mb-20 flex flex-wrap gap-3">
        <a
          href="#all"
          className="rounded-full bg-primary px-6 py-2 text-xs uppercase tracking-widest text-on-primary"
        >
          全部作品
        </a>
        {groups.map((group) => (
          <a
            key={group.id}
            href={`#${group.slug}`}
            className="rounded-full bg-surface-container-high px-6 py-2 text-xs uppercase tracking-widest text-on-surface-variant transition-all hover:bg-secondary-container hover:text-on-secondary-fixed"
          >
            {group.name}
          </a>
        ))}
      </section>

      <div id="all" className="grid grid-cols-1 gap-y-16 md:grid-cols-12">
        {groups.map((group, index) => (
          <div key={group.id} id={group.slug} className="contents scroll-mt-32">
            <div className="md:col-span-3">
              <h2 className="sticky top-32 text-xs uppercase tracking-[0.3em] text-on-surface-variant">
                {String(index + 1).padStart(2, "0")} — {group.name}
              </h2>
            </div>
            <div className="space-y-12 md:col-span-9">
              {group.posts.map((post) => (
                <article key={post.id} className="group cursor-pointer">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="flex items-end justify-between border-b border-outline-variant/15 pb-6 transition-all duration-500 group-hover:border-outline"
                  >
                    <div>
                      <p className="mb-2 text-[10px] uppercase tracking-widest text-outline">
                        {post.publishedAt ? formatChineseDate(post.publishedAt) : "草稿"}
                      </p>
                      <h3 className="font-headline text-3xl italic transition-transform duration-500 group-hover:translate-x-2">
                        {post.title}
                      </h3>
                    </div>
                    <span className="text-outline-variant transition-colors group-hover:text-primary">
                      ↗
                    </span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="py-12">
        <div className="relative h-[400px] w-full overflow-hidden rounded-lg bg-surface-container">
          <PostImage
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrrD6g5lHQbTD_NJxjJf7rArqxKlHrG2m_KcW_kk_vrkTzB4ra8YNxFgzviPvXz20j19F-9ux_3JrRiu3eq8y_-YNlhhTfPDWfa4ZXinYUApQbur_naqH9KcYuBz-7KLGjv4aM8oJdaGxTyE4aVD1YWTxZ_WosSvuAatkceNXabg03aI9zG6pikbmAgf85hGBQJrir6rfb0Hwia-EDwjcQWloLtXrt1rvzx92ZHHURibUJ3Wcahlw40hE3f3YiHnuzkkOopzY9ERM"
            alt="代码与终端界面"
            fill
            sizes="100vw"
            className="object-cover opacity-60 grayscale transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute bottom-8 left-8 text-white mix-blend-difference">
            <p className="font-headline text-4xl italic">代码是思考的外化。</p>
          </div>
        </div>
      </div>

      <footer className="mt-20 flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-outline">Archive Summary</p>
        <p className="font-headline text-3xl italic text-on-surface">{totalPublished} 篇已发布文章</p>
        <p className="max-w-xl text-sm leading-relaxed text-on-surface-variant">
          这一页持续记录技术探索、项目复盘和工程思考，作为个人成长的长期索引。
        </p>
      </footer>
    </main>
  );
}
