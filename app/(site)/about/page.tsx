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
    <main className="mx-auto max-w-3xl px-6 pb-20 pt-28">
      <section className="mb-12 flex items-center gap-6">
        <div className="relative h-20 w-20 shrink-0">
          <Image
            src="/logo.png"
            alt={siteConfig.authorName}
            fill
            sizes="80px"
            className="rounded-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary">关于</h1>
          <p className="mt-1 text-sm text-muted">{siteConfig.authorRole}</p>
        </div>
      </section>

      <section className="mb-12 space-y-4 text-base leading-relaxed text-secondary">
        <p>
          你好，我是 <span className="font-medium text-primary">{siteConfig.authorName}</span>。这是我的个人博客，主要用来记录平时的学习笔记、项目经历和一些生活随想。
        </p>
        <p>
          平时对技术和量化方向比较感兴趣，也会写一些关于个人成长和日常生活的内容。这里没有固定的更新频率，写到什么就发什么。
        </p>
        <p>
          如果你对这里的内容感兴趣，欢迎留言交流。
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border p-6">
          <p className="text-2xl font-bold text-primary">{postCount}</p>
          <p className="mt-1 text-sm text-muted">已发布文章</p>
        </div>
        <div className="rounded-lg border border-border p-6">
          <p className="text-2xl font-bold text-primary">{categoryCount}</p>
          <p className="mt-1 text-sm text-muted">内容栏目</p>
        </div>
      </section>
    </main>
  );
}
