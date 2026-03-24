import Image from "next/image";

import { prisma } from "@/lib/db";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [postCount, categoryCount, subscriberCount] = await Promise.all([
    prisma.post.count({
      where: {
        status: "PUBLISHED",
      },
    }),
    prisma.category.count(),
    prisma.newsletterSubscriber.count(),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-32 md:px-12">
      <section className="mb-24 flex flex-col items-center text-center">
        <div className="relative mb-12 h-48 w-48 md:h-64 md:w-64">
          <div className="absolute inset-0 -z-10 scale-[1.05] rounded-full bg-surface-container" />
          <Image
            src="/logo.png"
            alt={siteConfig.authorName}
            fill
            sizes="256px"
            className="rounded-full object-cover shadow-sm"
          />
        </div>
        <span className="mb-4 text-xs uppercase tracking-widest text-on-surface-variant">
          策展人 / 作者
        </span>
        <h1 className="mb-8 font-headline text-5xl italic leading-tight text-zinc-900 md:text-7xl">
          About
        </h1>
        <div className="mb-8 h-px w-12 bg-outline-variant/30" />
      </section>

      <section className="mb-32 grid grid-cols-1 items-start gap-12 md:grid-cols-12">
        <div className="md:col-span-4 md:sticky md:top-32">
          <p className="font-headline text-xl italic leading-relaxed text-on-surface-variant md:text-2xl">
            致力于为技术、美学与日常生活保留一块安静、可长期书写的数字空间。
          </p>
        </div>

        <div className="space-y-8 text-lg leading-loose tracking-tight text-on-surface/80 md:col-span-8">
          <p>
            我创建 <span className="font-semibold text-zinc-900">{siteConfig.name}</span>，是想给自己留下一块不被平台节奏牵引的写作场域。这里记录技术观察、设计笔记、生活感受，也保留一些还未完全定型的想法。
          </p>
          <p>
            我相信内容不必永远追逐更快的分发速度。很多真正重要的东西需要时间沉淀，需要反复重写、重新命名、重新理解。博客对我来说，更像一个可被持续整理的长期档案，而不是一次性消费的流量载体。
          </p>
          <p>
            通过这份个人站点，我希望把研究与感受、分析与审美、技术与生活重新放回同一张桌面上，慢慢地、稳定地写下去。
          </p>
        </div>
      </section>

      <section className="mb-32 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-surface-container-low p-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Published</p>
          <p className="mt-4 font-headline text-4xl italic text-on-surface">{postCount}</p>
          <p className="mt-2 text-sm text-on-surface-variant">已公开发布的文章</p>
        </div>
        <div className="rounded-xl bg-surface-container-low p-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Sections</p>
          <p className="mt-4 font-headline text-4xl italic text-on-surface">{categoryCount}</p>
          <p className="mt-2 text-sm text-on-surface-variant">正在维护的内容栏目</p>
        </div>
        <div className="rounded-xl bg-surface-container-low p-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Readers</p>
          <p className="mt-4 font-headline text-4xl italic text-on-surface">{subscriberCount}</p>
          <p className="mt-2 text-sm text-on-surface-variant">已订阅通讯的读者</p>
        </div>
      </section>

    </main>
  );
}
