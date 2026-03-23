import { PostStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { updatePost } from "@/lib/blog";
import { prisma } from "@/lib/db";
import { postInputSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const json = await request.json();

    // 仅更新状态的简化调用（草稿箱快速发布）
    if (Object.keys(json).length === 1 && "status" in json) {
      if (json.status !== PostStatus.PUBLISHED && json.status !== PostStatus.DRAFT) {
        return NextResponse.json({ message: "无效的状态值。" }, { status: 400 });
      }

      const post = await prisma.post.update({
        where: { id },
        data: {
          status: json.status,
          publishedAt: json.status === PostStatus.PUBLISHED ? new Date() : undefined,
        },
      });

      revalidatePath("/");
      revalidatePath("/archive");
      revalidatePath("/editor");
      revalidatePath(`/posts/${post.slug}`);

      return NextResponse.json({ message: "状态已更新。", slug: post.slug });
    }

    // 完整字段更新
    const parsed = postInputSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "数据格式不正确。" },
        { status: 400 },
      );
    }

    const post = await updatePost(id, parsed.data);

    revalidatePath("/");
    revalidatePath("/archive");
    revalidatePath("/editor");
    revalidatePath(`/posts/${post.slug}`);

    return NextResponse.json({
      message: post.status === PostStatus.PUBLISHED ? "文章已更新并发布。" : "草稿已保存。",
      slug: post.slug,
    });
  } catch {
    return NextResponse.json({ message: "操作失败，请稍后重试。" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.post.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/editor");

  return NextResponse.json({ message: "文章已删除。" });
}
