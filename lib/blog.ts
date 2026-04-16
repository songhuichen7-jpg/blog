import { Prisma, PostStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { siteConfig } from "@/lib/site";
import { calculateReadingTime, slugify, unique } from "@/lib/utils";
import type { PostInput } from "@/lib/validators";

const postCardInclude = Prisma.validator<Prisma.PostInclude>()({
  category: true,
  tags: {
    include: {
      tag: true,
    },
  },
});

export type PostCard = Prisma.PostGetPayload<{
  include: typeof postCardInclude;
}>;

export async function getHomePageData(categorySlug?: string) {
  const baseWhere = {
    status: PostStatus.PUBLISHED,
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  };

  const [featuredPosts, latestPosts, categoryCounts] = await Promise.all([
    !categorySlug
      ? prisma.post.findMany({
          where: { status: PostStatus.PUBLISHED, featured: true },
          include: postCardInclude,
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 5,
        })
      : Promise.resolve([]),
    prisma.post.findMany({
      where: baseWhere,
      include: postCardInclude,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: categorySlug ? 12 : 6,
    }),
    prisma.category.findMany({
      include: {
        _count: {
          select: { posts: { where: { status: PostStatus.PUBLISHED } } },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const featuredIds = new Set(featuredPosts.map((p) => p.id));

  return {
    featuredPosts: !categorySlug && featuredPosts.length > 0 ? featuredPosts : [],
    latestPosts:
      !categorySlug && featuredPosts.length > 0
        ? latestPosts.filter((post) => !featuredIds.has(post.id))
        : latestPosts,
    categoryCounts,
  };
}

export async function getPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: postCardInclude,
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: postCardInclude,
  });
}

export async function getRelatedPosts(post: { id: string; categoryId: string }) {
  return prisma.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      categoryId: post.categoryId,
      id: {
        not: post.id,
      },
    },
    include: postCardInclude,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 3,
  });
}

export async function getArchiveGroups() {
  const categories = await prisma.category.findMany({
    include: {
      posts: {
        where: {
          status: PostStatus.PUBLISHED,
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories.filter((category) => category.posts.length > 0);
}

export async function getEditorData() {
  const [categories, recentPosts, drafts] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.post.findMany({
      include: { category: true },
      where: { status: PostStatus.PUBLISHED },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.post.findMany({
      include: { category: true },
      where: { status: PostStatus.DRAFT },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return { categories, recentPosts, drafts };
}

export async function searchPosts(query: string) {
  return prisma.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ],
    },
    include: postCardInclude,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function listPublishedPostSlugs() {
  return prisma.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
    },
    select: {
      slug: true,
    },
  });
}

function toAsciiSlug(title: string): string {
  return slugify(title)
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function resolveUniqueSlug(baseTitle: string) {
  const baseSlug = toAsciiSlug(baseTitle) || `post-${Date.now()}`;
  let currentSlug = baseSlug;
  let suffix = 1;

  for (;;) {
    const existing = await prisma.post.findUnique({
      where: {
        slug: currentSlug,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return currentSlug;
    }

    suffix += 1;
    currentSlug = `${baseSlug}-${suffix}`;
  }
}

export async function getAllPostsForAdmin() {
  return prisma.post.findMany({
    include: postCardInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function updatePost(id: string, input: PostInput) {
  const tagNames = unique(
    input.tags.map((tag) => tag.trim()).filter(Boolean),
  );

  const existing = await prisma.post.findUnique({ where: { id }, select: { publishedAt: true, status: true, slug: true } });
  const becomingPublished = input.status === PostStatus.PUBLISHED && existing?.status !== PostStatus.PUBLISHED;

  // Fix non-ASCII slugs (e.g. Chinese) that break URL routing in production
  const hasNonAsciiSlug = existing?.slug && /[^\x00-\x7F]/.test(existing.slug);
  const newSlug = hasNonAsciiSlug ? await resolveUniqueSlug(input.title) : undefined;

  return prisma.post.update({
    where: { id },
    data: {
      title: input.title.trim(),
      ...(newSlug ? { slug: newSlug } : {}),
      excerpt: input.excerpt.trim(),
      content: input.content.trim(),
      coverImage: input.coverImage.trim(),
      coverAlt: input.coverAlt?.trim() || input.title.trim(),
      categoryId: input.categoryId,
      status: input.status,
      featured: input.featured,
      publishedAt: input.publishedAt
        ? new Date(input.publishedAt)
        : becomingPublished
          ? new Date()
          : existing?.publishedAt,
      readTimeMinutes: calculateReadingTime(input.content),
      pullQuote: input.pullQuote?.trim() || null,
      relatedLinks: input.relatedLinks.length > 0 ? JSON.stringify(input.relatedLinks) : null,
      metaTitle: input.metaTitle?.trim() || input.title.trim(),
      metaDescription: input.metaDescription?.trim() || input.excerpt.trim(),
      tags: {
        deleteMany: {},
        create: tagNames.map((tagName) => ({
          tag: {
            connectOrCreate: {
              where: { name: tagName },
              create: {
                name: tagName,
                slug: slugify(tagName) || `tag-${Date.now()}`,
              },
            },
          },
        })),
      },
    },
    include: postCardInclude,
  });
}

export async function createPost(input: PostInput) {
  const slug = await resolveUniqueSlug(input.title);
  const tagNames = unique(
    input.tags
      .map((tag) => tag.trim())
      .filter(Boolean),
  );

  return prisma.post.create({
    data: {
      title: input.title.trim(),
      slug,
      excerpt: input.excerpt.trim(),
      content: input.content.trim(),
      coverImage: input.coverImage.trim(),
      coverAlt: input.coverAlt?.trim() || input.title.trim(),
      categoryId: input.categoryId,
      status: input.status,
      featured: input.featured,
      publishedAt: input.publishedAt
        ? new Date(input.publishedAt)
        : input.status === PostStatus.PUBLISHED
          ? new Date()
          : null,
      readTimeMinutes: calculateReadingTime(input.content),
      authorName: siteConfig.authorName,
      authorRole: siteConfig.authorRole,
      authorBio: siteConfig.authorBio,
      authorAvatar: siteConfig.authorAvatar,
      pullQuote: input.pullQuote?.trim() || null,
      relatedLinks: input.relatedLinks.length > 0 ? JSON.stringify(input.relatedLinks) : null,
      metaTitle: input.metaTitle?.trim() || input.title.trim(),
      metaDescription: input.metaDescription?.trim() || input.excerpt.trim(),
      tags: {
        create: tagNames.map((tagName) => ({
          tag: {
            connectOrCreate: {
              where: {
                name: tagName,
              },
              create: {
                name: tagName,
                slug: slugify(tagName) || `tag-${Date.now()}`,
              },
            },
          },
        })),
      },
    },
    include: postCardInclude,
  });
}
