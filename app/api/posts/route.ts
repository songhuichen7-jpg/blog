import { PostStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { createPost } from "@/lib/blog";
import { prisma } from "@/lib/db";
import { postInputSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedStatus = searchParams.get("status");
  const session = await getSession();

  if (requestedStatus === PostStatus.DRAFT && !session) {
    return NextResponse.json(
      {
        message: "需要登录后才能查看草稿。",
      },
      { status: 401 },
    );
  }

  const status =
    requestedStatus === PostStatus.DRAFT ? PostStatus.DRAFT : PostStatus.PUBLISHED;

  const posts = await prisma.post.findMany({
    where: {
      status,
    },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        message: "请先登录后台后再发布文章。",
      },
      { status: 401 },
    );
  }

  try {
    const json = await request.json();
    const parsed = postInputSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message || "文章数据格式不正确。",
        },
        { status: 400 },
      );
    }

    const post = await createPost(parsed.data);

    revalidatePath("/");
    revalidatePath("/archive");
    revalidatePath("/editor");

    if (post.status === PostStatus.PUBLISHED) {
      revalidatePath(`/posts/${post.slug}`);
    }

    return NextResponse.json({
      message: post.status === PostStatus.PUBLISHED ? "文章已发布。" : "草稿已保存。",
      slug: post.slug,
    });
  } catch {
    return NextResponse.json(
      {
        message: "保存文章时出现异常，请稍后再试。",
      },
      { status: 500 },
    );
  }
}
