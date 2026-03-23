import { notFound, redirect } from "next/navigation";

import { EditorForm } from "@/components/admin/editor-form";
import { getSession } from "@/lib/auth";
import { getEditorData, getPostById } from "@/lib/blog";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const session = await getSession();

  if (!session) {
    redirect("/login?next=/editor");
  }

  const { id } = await params;
  const [post, { categories, recentPosts, drafts }] = await Promise.all([
    getPostById(id),
    getEditorData(),
  ]);

  if (!post) notFound();

  return (
    <EditorForm
      categories={categories}
      recentPosts={recentPosts}
      drafts={drafts}
      editPost={post}
    />
  );
}
