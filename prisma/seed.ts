import { PostStatus, PrismaClient } from "@prisma/client";

import { siteConfig } from "../lib/site";
import { slugify } from "../lib/utils";

const prisma = new PrismaClient();

const categories = [
  {
    name: "思考",
    slug: "thoughts",
    description: "关于技术、学习与成长的个人观察和思考。",
  },
  {
    name: "项目",
    slug: "projects",
    description: "个人项目的设计思路、决策过程与复盘总结。",
  },
  {
    name: "日常",
    slug: "life",
    description: "作为一个 CS 学生的日常、感受与随笔。",
  },
];

const posts = [
  {
    title: "大模型应用开发实践：从 Prompt 工程到 RAG 系统",
    slug: "llm-app-development",
    excerpt:
      "从零搭建一个 RAG 系统的完整过程：向量数据库选型、Embedding 策略、检索优化与工程落地中的坑。",
    content: `
构建一个真正可用的 RAG（检索增强生成）系统，远比跑通 Demo 复杂得多。这篇文章记录了我从零搭建这套系统的完整过程。

## 为什么 Prompt 工程只是起点

很多人以为大模型应用开发就是写好 Prompt。但在生产环境中，真正的挑战是：如何让模型稳定、可预期地返回结构化结果，以及如何处理上下文窗口限制。

## 向量数据库的选型

我对比了 Pinecone、Weaviate 和 pgvector：

- **Pinecone**：开箱即用，延迟稳定，但冷启动慢，免费额度有限
- **pgvector**：直接集成 PostgreSQL，适合已有 PG 的项目，查询性能在百万级向量内完全够用
- **Weaviate**：Schema 设计灵活，适合多模态场景

最终选择 pgvector，因为整个系统已经在 PostgreSQL 上，减少一个基础设施依赖。

## Chunking 策略对检索质量的影响

> 检索质量 80% 取决于分块策略，20% 取决于模型。

固定大小分块（Fixed-size chunking）最简单，但会破坏语义完整性。我最终采用了语义分块：先按段落切分，再合并过短的段落，控制每块在 300-500 token 之间。

## 工程落地中的几个坑

1. **Embedding 模型要与检索时保持一致**：存储时用 text-embedding-3-small，检索时也必须用同一个模型
2. **重排序（Reranking）显著提升精度**：用 cross-encoder 对 Top-20 结果重排，再取 Top-5 送给 LLM
3. **流式输出的错误处理**：SSE 中断后的重连逻辑容易被忽略`,
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDrrD6g5lHQbTD_NJxjJf7rArqxKlHrG2m_KcW_kk_vrkTzB4ra8YNxFgzviPvXz20j19F-9ux_3JrRiu3eq8y_-YNlhhTfPDWfa4ZXinYUApQbur_naqH9KcYuBz-7KLGjv4aM8oJdaGxTyE4aVD1YWTxZ_WosSvuAatkceNXabg03aI9zG6pikbmAgf85hGBQJrir6rfb0Hwia-EDwjcQWloLtXrt1rvzx92ZHHURibUJ3Wcahlw40hE3f3YiHnuzkkOopzY9ERM",
    coverAlt: "代码编辑器与终端界面",
    categorySlug: "projects",
    tags: ["AI", "踩坑记录", "学习笔记"],
    featured: true,
    status: PostStatus.PUBLISHED,
    publishedAt: new Date("2026-03-20T09:00:00.000Z"),
    readTimeMinutes: 12,
    pullQuote: "检索质量 80% 取决于分块策略，20% 取决于模型。",
  },
  {
    title: "从 O(n²) 到 O(n log n)：一次真实的性能优化记录",
    slug: "algorithm-optimization",
    excerpt: "在一个实际项目中发现并修复了一个隐藏的二次复杂度问题，记录完整的排查、分析与优化过程。",
    content: `
这是一次真实的线上性能问题排查记录。某个接口在数据量增长到 10 万条后，响应时间从 200ms 飙升到 8 秒。

## 定位问题

用 Node.js 的 --prof 工具生成火焰图，发现热点集中在一个"看起来无害"的数组去重函数上：

\`\`\`javascript
// 原来的实现
function deduplicate(arr) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}
\`\`\`

\`arr.indexOf\` 是 O(n)，外层 \`filter\` 又是 O(n)，总体 O(n²)。在 10 万条数据下，这意味着 100 亿次比较。

## 修复方案

\`\`\`javascript
// 修复后
function deduplicate(arr) {
  return [...new Set(arr)];
}
\`\`\`

Set 的查找复杂度是 O(1)（哈希表），整体降为 O(n)。

## 更大的教训

性能问题往往不在你以为的地方。建立性能基准、定期 profiling、在 Code Review 中关注循环嵌套——这些习惯比事后优化重要得多。`,
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAtfz6EdwlkWbSGfTwKjsqSLqFpooJRxHDacGZEfj5SjNfem_BvvrdyvwChulFCRF3SIp1o3A_nFZA_2F3O0iau5nyammgzyVGzB6e7ueG0Ie9qWcAduvS70-OFPIjKAiALpQ38wjhTUlpnEqUXIjRIxaZeY52vQWOxU1LVdbW0HXWjt1SJ_yNC2rbaiLOuyWcc2BVCmYSEaRFmAiRT8R4h0tHSTzcD8sS1txgNZcud2jka6x1-wUmhqWZ203y6pFjSqK7U7qP5pXk",
    coverAlt: "算法复杂度图表",
    categorySlug: "thoughts",
    tags: ["问题排查", "性能", "复盘"],
    featured: false,
    status: PostStatus.PUBLISHED,
    publishedAt: new Date("2026-03-15T09:00:00.000Z"),
    readTimeMinutes: 8,
    pullQuote: "性能问题往往不在你以为的地方。",
  },
  {
    title: "Next.js App Router 的心智模型：Server/Client 边界",
    slug: "nextjs-app-router-mental-model",
    excerpt: "理解 React Server Components 与 Client Components 的边界，是用好 App Router 的关键。",
    content: `
App Router 最让人困惑的地方不是 API，而是心智模型的转变：什么时候用 Server Component，什么时候用 Client Component？

## 默认服务端，按需客户端

App Router 中，组件默认是 Server Component，只有在需要以下能力时才加 "use client"：

- 交互事件（onClick、onChange 等）
- 浏览器 API（localStorage、window 等）
- React hooks（useState、useEffect 等）

## 数据流的方向

Server Component 可以直接 async/await 数据库或 API，结果作为 props 传给 Client Component。但反过来不行：Client Component 不能直接渲染 Server Component（除非作为 children 传入）。

## 一个实用判断标准

> 如果一个组件只负责展示，优先做成 Server Component。如果它需要响应用户行为，才加 "use client"。

这个原则让我在这个博客项目中，90% 的组件都是 Server Component，大幅减少了客户端 JS 体积。`,
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA6OtfGLotOIxGZ0Qv1CixQW162IiT536uptL9BabVV2oVr5npCXivmLRcuNoJS3Lq9oTxHjwOWKTgbH5VieKCPvRTbNlPoua6jhvzCqBb536b0o2DHBSMQg2QNDOIKZPGdqMrz6D8X8qNo4WHZ9nixkrcKj6X0wpyGZspVaVi_sm1YZlniS4lNq84-kjY-fxioT3bidIwXIW84Og1JJzpNbFuwu5-_nRLxJDhKGDwttc7WglSGJVd_yiaOPmo5F1U96fqhAE6pff0",
    coverAlt: "React 组件树示意图",
    categorySlug: "thoughts",
    tags: ["学习笔记", "前端", "心得"],
    featured: false,
    status: PostStatus.PUBLISHED,
    publishedAt: new Date("2026-03-10T09:00:00.000Z"),
    readTimeMinutes: 6,
    pullQuote: "如果一个组件只负责展示，优先做成 Server Component。",
  },
  {
    title: "用 AI 编程助手做了 3 个月项目后的真实感受",
    slug: "ai-coding-assistant-experience",
    excerpt: "Copilot、Cursor、Claude Code 三个工具交替用了三个月，说说它们真正改变了什么，以及什么没有变。",
    content: `
用 AI 编程助手做项目已经三个月了，从最初的新鲜感到现在形成稳定工作流，有一些想法想记录下来。

## 真正改变的事

**样板代码几乎不再手写。** 创建 CRUD 接口、写测试用例、处理类型定义——这些有规律的工作，AI 能生成八九不离十的初稿，我只需要审查和调整。

**搜索文档的频率下降了 60%。** 忘记某个 API 参数、不确定某个库的用法，直接问 AI 比去翻文档快得多。

## 没有改变的事

**架构决策仍然是人的工作。** 如何拆分模块、选择什么数据结构、怎么处理并发——这些判断 AI 给出的建议经常过于保守或不符合项目上下文。

**Code Review 的标准没有降低。** AI 生成的代码也会有逻辑错误、安全漏洞和不一致的命名。如果不认真 review，技术债积累得更快。`,
    coverImage:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1400&q=80",
    coverAlt: "笔记本与代码编辑器",
    categorySlug: "life",
    tags: ["AI", "工具", "真实感受"],
    featured: false,
    status: PostStatus.PUBLISHED,
    publishedAt: new Date("2026-03-01T09:00:00.000Z"),
    readTimeMinutes: 5,
    pullQuote: "架构决策仍然是人的工作，AI 给出的建议经常过于保守或不符合项目上下文。",
  },
  {
    title: "这个博客是怎么做的：技术选型与工程思考",
    slug: "blog-tech-stack",
    excerpt: "记录这个博客从技术选型到部署上线的完整决策过程，包括为什么选 Next.js、Prisma 和 PostgreSQL。",
    content: `
每次做新项目都是一次技术选型练习。这篇文章记录了这个博客的完整技术决策过程。

## 技术栈

- **框架**：Next.js 15 App Router
- **数据库**：PostgreSQL + Prisma ORM
- **部署**：Docker Compose

## 为什么不用静态站点生成器

Markdown 文件 + Git 是很多技术博客的选择，简单可靠。但我想要一个管理后台——能在任何设备上写文章、随时修改发布状态，不依赖本地环境。

这个需求决定了我需要一个数据库。

## Prisma 的使用体验

Type-safe 的数据库查询是 Prisma 最大的优势。写查询时有完整的类型推导，重构时能第一时间发现不一致，这在维护期节省了大量时间。

唯一的缺点是冷启动时间比直接用原生驱动略长，在 Serverless 环境下需要注意连接池管理。`,
    coverImage:
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1400&q=80",
    coverAlt: "技术架构示意图",
    categorySlug: "projects",
    tags: ["项目复盘", "决策过程", "开发"],
    featured: false,
    status: PostStatus.PUBLISHED,
    publishedAt: new Date("2026-02-25T09:00:00.000Z"),
    readTimeMinutes: 7,
    pullQuote: "每次做新项目都是一次技术选型练习。",
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: category,
      create: category,
    });
  }

  const categoryMap = new Map(
    (await prisma.category.findMany()).map((category) => [category.slug, category.id]),
  );

  for (const post of posts) {
    await prisma.post.upsert({
      where: {
        slug: post.slug,
      },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content.trim(),
        coverImage: post.coverImage,
        coverAlt: post.coverAlt,
        featured: post.featured,
        status: post.status,
        publishedAt: post.publishedAt,
        readTimeMinutes: post.readTimeMinutes,
        pullQuote: post.pullQuote,
        authorName: siteConfig.authorName,
        authorRole: siteConfig.authorRole,
        authorBio: siteConfig.authorBio,
        authorAvatar: siteConfig.authorAvatar,
        metaTitle: post.title,
        metaDescription: post.excerpt,
        categoryId: categoryMap.get(post.categorySlug)!,
        tags: {
          deleteMany: {},
          create: post.tags.map((tag) => ({
            tag: {
              connectOrCreate: {
                where: {
                  name: tag,
                },
                create: {
                  name: tag,
                  slug: slugify(tag),
                },
              },
            },
          })),
        },
      },
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content.trim(),
        coverImage: post.coverImage,
        coverAlt: post.coverAlt,
        featured: post.featured,
        status: post.status,
        publishedAt: post.publishedAt,
        readTimeMinutes: post.readTimeMinutes,
        pullQuote: post.pullQuote,
        authorName: siteConfig.authorName,
        authorRole: siteConfig.authorRole,
        authorBio: siteConfig.authorBio,
        authorAvatar: siteConfig.authorAvatar,
        metaTitle: post.title,
        metaDescription: post.excerpt,
        categoryId: categoryMap.get(post.categorySlug)!,
        tags: {
          create: post.tags.map((tag) => ({
            tag: {
              connectOrCreate: {
                where: {
                  name: tag,
                },
                create: {
                  name: tag,
                  slug: slugify(tag),
                },
              },
            },
          })),
        },
      },
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
