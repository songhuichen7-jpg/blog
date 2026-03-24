import Image from "next/image";

import { prisma } from "@/lib/db";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [postCount, categoryCount] = await Promise.all([
    prisma.post.count({
      where: {
        status: "PUBLISHED",
      },
    }),
    prisma.category.count(),
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
            记录技术、项目与生活的个人博客。
          </p>
        </div>

        <div className="space-y-8 text-lg leading-loose tracking-tight text-on-surface/80 md:col-span-8">
          <p>
            你好，我是 <span className="font-semibold text-zinc-900">{siteConfig.authorName}</span>。这是我的个人博客，主要用来记录平时的学习笔记、项目经历和一些生活随想。
          </p>
          <p>
            平时对技术和量化方向比较感兴趣，也会写一些关于个人成长和日常生活的内容。这里没有固定的更新频率，写到什么就发什么。
          </p>
          <p>
            如果你对这里的内容感兴趣，欢迎留言交流。
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
      </section>

    </main>
  );
}
