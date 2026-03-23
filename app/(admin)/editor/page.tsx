import { redirect } from "next/navigation";

import { EditorForm } from "@/components/admin/editor-form";
import { getSession } from "@/lib/auth";
import { getEditorData } from "@/lib/blog";

export default async function EditorPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?next=/editor");
  }

  const { categories, recentPosts, drafts } = await getEditorData();

  return <EditorForm categories={categories} recentPosts={recentPosts} drafts={drafts} />;
}
