"use client";

import type { Category, Post } from "@prisma/client";
import { FormEvent, useRef, useState, useMemo, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";

import type { PostCard } from "@/lib/blog";
import { TiptapEditor } from "./tiptap/tiptap-editor";

type PostItem = Pick<Post, "id" | "slug" | "title" | "status" | "updatedAt" | "publishedAt"> & {
  category: Pick<Category, "name">;
};

type EditorFormProps = {
  categories: Category[];
  recentPosts: PostItem[];
  drafts: PostItem[];
  editPost?: PostCard;
};

const defaultCover =
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1400&q=80";

export function EditorForm({ categories, recentPosts, drafts, editPost }: EditorFormProps) {
  const isEditMode = Boolean(editPost);

  const [title, setTitle] = useState(editPost?.title ?? "");
  const [excerpt, setExcerpt] = useState(editPost?.excerpt ?? "");
  const [content, setContent] = useState(editPost?.content ?? "");
  const [coverImage, setCoverImage] = useState(editPost?.coverImage ?? defaultCover);
  const [coverAlt, setCoverAlt] = useState(editPost?.coverAlt ?? "");
  const [categoryId, setCategoryId] = useState(editPost?.categoryId ?? categories[0]?.id ?? "");
  const [tags, setTags] = useState(editPost?.tags.map((pt) => pt.tag.name).join(", ") ?? "");
  const [pullQuote, setPullQuote] = useState(editPost?.pullQuote ?? "");
  const [relatedLinks, setRelatedLinks] = useState<{ label: string; url: string }[]>(
    () => {
      if (!editPost?.relatedLinks) return [];
      try { return JSON.parse(editPost.relatedLinks) as { label: string; url: string }[]; }
      catch { return []; }
    }
  );
  const [featured, setFeatured] = useState(editPost?.featured ?? false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [savedSlug, setSavedSlug] = useState(editPost?.slug ?? "");
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [draftList, setDraftList] = useState<PostItem[]>(drafts);

  const coverFileRef = useRef<HTMLInputElement>(null);

  const parsedTags = useMemo(
    () => tags.split(",").map((t) => t.trim()).filter(Boolean),
    [tags],
  );

  const previewImage =
    coverImage.startsWith("http://") ||
    coverImage.startsWith("https://") ||
    coverImage.startsWith("/")
      ? coverImage
      : defaultCover;

  async function handleCoverUpload(file: File) {
    setIsUploading(true);
    setMessage("");
    setIsError(false);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = (await res.json()) as { url?: string; message?: string };
      if (!res.ok) throw new Error(data.message || "上传失败");
      setCoverImage(data.url!);
    } catch (e) {
      setIsError(true);
      setMessage(e instanceof Error ? e.message : "上传失败");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleEditorImageUpload(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = (await res.json()) as { url?: string; message?: string };
    if (!res.ok) throw new Error(data.message || "上传失败");
    return data.url!;
  }

  function validate(): string | null {
    if (!title.trim() || title.trim().length < 4) return "标题至少 4 个字符。";
    if (!excerpt.trim() || excerpt.trim().length < 12) return "摘要至少 12 个字符。";
    if (!content.trim() || content.trim().length < 80) return "正文至少 80 个字符。";
    if (!categoryId) return "请选择分类。";
    return null;
  }

  function submit(intent: "DRAFT" | "PUBLISHED") {
    const error = validate();
    if (error) {
      setIsError(true);
      setMessage(error);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setMessage("");
    setIsError(false);

    startTransition(async () => {
      try {
        const url = isEditMode ? `/api/posts/${editPost!.id}` : "/api/posts";
        const method = isEditMode ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            excerpt: excerpt.trim(),
            content: content.trim(),
            coverImage,
            coverAlt,
            categoryId,
            tags: parsedTags,
            pullQuote,
            relatedLinks,
            metaTitle: "",
            metaDescription: "",
            featured,
            status: intent,
          }),
        });

        const data = (await res.json()) as { message?: string; slug?: string };

        if (!res.ok) {
          setIsError(true);
          setMessage(data.message || "保存失败，请稍后再试。");
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        setSavedSlug(data.slug || "");
        setIsError(false);

        if (isEditMode) {
          setMessage(intent === "PUBLISHED" ? "文章已更新。" : "草稿已保存。");
        } else {
          setMessage(intent === "PUBLISHED" ? "文章已发布。" : "草稿已保存。");
          setTitle("");
          setExcerpt("");
          setContent("");
          setTags("");
          setPullQuote("");
          setRelatedLinks([]);
          setFeatured(false);
          setCoverImage(defaultCover);
        }
      } catch {
        setIsError(true);
        setMessage("网络异常，请检查连接后重试。");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  async function publishDraft(id: string) {
    const res = await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PUBLISHED" }),
    });
    if (res.ok) {
      setDraftList((prev) => prev.filter((d) => d.id !== id));
    }
  }

  async function deleteDraft(id: string) {
    if (!confirm("确定删除这篇草稿？")) return;
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDraftList((prev) => prev.filter((d) => d.id !== id));
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit("PUBLISHED");
  }

  function handleLogout() {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    });
  }

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-[#FAFAFA] text-foreground">
      {/* Hidden file input for cover */}
      <input
        ref={coverFileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleCoverUpload(file);
          e.target.value = "";
        }}
      />

      {/* Top bar */}
      <header className="fixed top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <span className="text-base font-semibold text-foreground">写作后台</span>
            <nav className="hidden items-center gap-4 text-sm text-muted md:flex">
              <Link href="/" className="hover:text-foreground">首页</Link>
              <Link href="/archive" className="hover:text-foreground">归档</Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {savedSlug && (
              <Link
                href={`/posts/${savedSlug}`}
                target="_blank"
                className="hidden rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground md:inline-flex"
              >
                查看文章
              </Link>
            )}
            {isEditMode && (
              <Link
                href="/editor/posts"
                className="hidden rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground md:inline-flex"
              >
                文章管理
              </Link>
            )}
            <button
              type="button"
              onClick={() => submit("DRAFT")}
              disabled={isPending}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground disabled:opacity-50"
            >
              存草稿
            </button>
            <button
              type="submit"
              disabled={isPending || isUploading}
              className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? "保存中…" : isEditMode ? "更新文章" : "发布文章"}
            </button>
          </div>
        </div>
      </header>

      {/* Left sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-56 border-r border-border bg-white md:block">
        <div className="flex h-screen flex-col pb-6 pt-20">
          <div className="mb-4 px-5">
            <p className="text-xs font-semibold text-accent">编辑器</p>
          </div>

          <nav className="flex-1 space-y-0.5 px-3">
            {isEditMode ? (
              <Link href="/editor" className="block rounded-md px-3 py-2 text-sm text-muted hover:bg-zinc-50 hover:text-foreground">
                新建文章
              </Link>
            ) : (
              <div className="rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-foreground">
                新建文章
              </div>
            )}
            <Link href="/editor/posts" className="block rounded-md px-3 py-2 text-sm text-muted hover:bg-zinc-50 hover:text-foreground">
              文章管理
            </Link>
            <Link href="/" className="block rounded-md px-3 py-2 text-sm text-muted hover:bg-zinc-50 hover:text-foreground">
              前台首页
            </Link>
          </nav>

          <div className="px-4">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-md border border-border py-2 text-sm text-muted hover:text-foreground"
            >
              退出登录
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex min-h-screen flex-col pt-16 md:ml-56 lg:flex-row lg:items-start">
        <section className="min-w-0 flex-1 px-6 py-8 lg:px-10 lg:max-w-3xl">
          {/* Message */}
          {message && (
            <div
              className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium ${
                isError ? "bg-red-50 text-red-600" : "bg-accent/10 text-accent"
              }`}
              aria-live="polite"
            >
              {message}
            </div>
          )}

          {/* Title */}
          <textarea
            rows={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4 w-full resize-none border-none bg-transparent text-3xl font-bold leading-tight text-foreground placeholder:text-zinc-300 focus:ring-0"
            placeholder="文章标题..."
          />

          {/* Excerpt */}
          <div className="mb-6">
            <label htmlFor="post-excerpt" className="mb-1.5 block text-xs font-medium text-muted">
              摘要
            </label>
            <textarea
              id="post-excerpt"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-zinc-400 focus:border-accent focus:ring-1 focus:ring-accent/20"
              placeholder="一两句话概括核心观点..."
            />
          </div>

          {/* Rich text editor */}
          <TiptapEditor
            content={content}
            onChange={setContent}
            onImageUpload={handleEditorImageUpload}
          />
        </section>

        {/* Right panel */}
        <aside className="w-full shrink-0 overflow-y-auto border-l border-border bg-white px-6 py-8 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-80">
          <div className="space-y-8">
            {/* Category & Tags */}
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                基本信息
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="category" className="mb-1 block text-xs font-medium text-muted">
                    分类
                  </label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-md border border-border bg-white py-2 text-sm focus:border-accent focus:ring-1 focus:ring-accent/20"
                  >
                    {categories.length === 0 && (
                      <option value="">暂无分类</option>
                    )}
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tags" className="mb-1 block text-xs font-medium text-muted">
                    标签（逗号分隔）
                  </label>
                  <input
                    id="tags"
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-accent focus:ring-1 focus:ring-accent/20"
                    placeholder="如：学习笔记, 复盘, AI"
                  />
                  {parsedTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {parsedTags.map((tag) => (
                        <span key={tag} className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-3">
                  <span className="text-xs font-medium text-muted">置顶推荐</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={featured}
                    onClick={() => setFeatured((v) => !v)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${featured ? "bg-accent" : "bg-zinc-300"}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${featured ? "translate-x-4.5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>
            </section>

            {/* Cover image */}
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                封面图
              </h3>
              <div className="overflow-hidden rounded-lg bg-zinc-100">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={previewImage}
                    alt={coverAlt || title || "封面预览"}
                    fill
                    sizes="320px"
                    className="object-cover"
                    unoptimized={previewImage.startsWith("/")}
                  />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => coverFileRef.current?.click()}
                  disabled={isUploading}
                  className="w-full rounded-md border border-border py-2 text-xs font-medium text-muted hover:text-foreground disabled:opacity-50"
                >
                  {isUploading ? "上传中…" : "上传图片"}
                </button>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-xs focus:border-accent focus:ring-1 focus:ring-accent/20"
                  placeholder="或粘贴图片链接..."
                />
                <input
                  type="text"
                  value={coverAlt}
                  onChange={(e) => setCoverAlt(e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-xs focus:border-accent focus:ring-1 focus:ring-accent/20"
                  placeholder="图片描述（alt）"
                />
              </div>
            </section>

            {/* Pull quote */}
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                引用语（可选）
              </h3>
              <textarea
                rows={2}
                value={pullQuote}
                onChange={(e) => setPullQuote(e.target.value)}
                className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-accent focus:ring-1 focus:ring-accent/20"
                placeholder="文章引用句..."
              />
            </section>

            {/* Related links */}
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                相关链接（可选）
              </h3>
              <div className="space-y-2">
                {relatedLinks.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="flex flex-1 flex-col gap-1">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => {
                          const next = [...relatedLinks];
                          next[i] = { ...next[i], label: e.target.value };
                          setRelatedLinks(next);
                        }}
                        className="w-full rounded border border-border bg-white px-2 py-1.5 text-xs focus:border-accent focus:ring-1 focus:ring-accent/20"
                        placeholder="链接标题"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => {
                          const next = [...relatedLinks];
                          next[i] = { ...next[i], url: e.target.value };
                          setRelatedLinks(next);
                        }}
                        className="w-full rounded border border-border bg-white px-2 py-1.5 text-xs focus:border-accent focus:ring-1 focus:ring-accent/20"
                        placeholder="https://..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setRelatedLinks((prev) => prev.filter((_, j) => j !== i))}
                      className="self-start rounded border border-red-200 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50"
                    >
                      删除
                    </button>
                  </div>
                ))}
                {relatedLinks.length < 10 && (
                  <button
                    type="button"
                    onClick={() => setRelatedLinks((prev) => [...prev, { label: "", url: "" }])}
                    className="w-full rounded border border-dashed border-border py-2 text-xs font-medium text-muted hover:bg-zinc-50"
                  >
                    + 添加链接
                  </button>
                )}
              </div>
            </section>

            {/* Drafts */}
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                草稿箱 {draftList.length > 0 && <span className="ml-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">{draftList.length}</span>}
              </h3>
              {draftList.length === 0 ? (
                <p className="text-xs text-muted-foreground">暂无草稿</p>
              ) : (
                <div className="space-y-2">
                  {draftList.map((draft) => (
                    <div key={draft.id} className="rounded-lg border border-border bg-white p-3">
                      <p className="text-xs text-muted">{draft.category.name}</p>
                      <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground">{draft.title}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => publishDraft(draft.id)}
                          className="rounded bg-primary px-2.5 py-1 text-xs font-medium text-white hover:bg-primary/90"
                        >
                          发布
                        </button>
                        <Link
                          href={`/posts/${draft.slug}`}
                          target="_blank"
                          className="rounded border border-border px-2.5 py-1 text-xs text-muted hover:text-foreground"
                        >
                          预览
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteDraft(draft.id)}
                          className="rounded border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent published */}
            {recentPosts.length > 0 && (
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  最近发布
                </h3>
                <div className="space-y-2">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="rounded-lg border border-border bg-white p-3">
                      <p className="text-xs text-muted">{post.category.name}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-foreground">{post.title}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>
      </main>
    </form>
  );
}
