"use client";

import type { Category, Post } from "@prisma/client";
import { FormEvent, useRef, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";

import type { PostCard } from "@/lib/blog";

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

function parseFrontmatter(raw: string): {
  title: string;
  excerpt: string;
  content: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { title: "", excerpt: "", content: raw.trim() };

  const fm = match[1];
  const body = match[2].trim();
  const get = (key: string) => {
    const line = fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    return line ? line[1].trim().replace(/^["']|["']$/g, "") : "";
  };
  return { title: get("title"), excerpt: get("excerpt"), content: body };
}

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
  const [publishedAt, setPublishedAt] = useState<string>(() => {
    if (editPost?.publishedAt) {
      return new Date(editPost.publishedAt).toISOString().slice(0, 16);
    }
    return "";
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [savedSlug, setSavedSlug] = useState(editPost?.slug ?? "");
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [draftList, setDraftList] = useState<PostItem[]>(drafts);

  const coverFileRef = useRef<HTMLInputElement>(null);
  const mdFileRef = useRef<HTMLInputElement>(null);

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

  function handleMarkdownImport(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const raw = e.target?.result as string;
      const parsed = parseFrontmatter(raw);
      if (parsed.title) setTitle(parsed.title);
      if (parsed.excerpt) setExcerpt(parsed.excerpt);
      setContent(parsed.content);
    };
    reader.readAsText(file);
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
            publishedAt: publishedAt || undefined,
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
          setMessage(intent === "PUBLISHED" ? "✓ 文章已更新。" : "✓ 草稿已保存。");
        } else {
          setMessage(intent === "PUBLISHED" ? "✓ 文章已发布。" : "✓ 草稿已保存。");
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
    <form onSubmit={handleSubmit} className="min-h-screen bg-background text-on-surface">
      {/* 隐藏文件输入 */}
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
      <input
        ref={mdFileRef}
        type="file"
        accept=".md,.markdown,.txt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleMarkdownImport(file);
          e.target.value = "";
        }}
      />

      {/* 顶部导航 */}
      <header className="fixed top-0 z-50 w-full bg-background/80 shadow-ambient backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-8 py-5">
          <div className="flex items-center gap-8">
            <span className="font-headline text-xl italic text-on-surface">写作后台</span>
            <nav className="hidden items-center gap-6 text-sm text-on-surface-variant md:flex">
              <Link href="/" className="hover:text-on-surface">首页</Link>
              <Link href="/archive" className="hover:text-on-surface">归档</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => mdFileRef.current?.click()}
              disabled={isPending}
              className="hidden rounded-md border border-outline-variant/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50 md:inline-flex"
            >
              导入 .md
            </button>
            {savedSlug ? (
              <Link
                href={`/posts/${savedSlug}`}
                target="_blank"
                className="hidden rounded-md border border-outline-variant/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface md:inline-flex"
              >
                查看文章
              </Link>
            ) : null}
            {isEditMode && (
              <Link
                href="/editor/posts"
                className="hidden rounded-md border border-outline-variant/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface md:inline-flex"
              >
                文章管理
              </Link>
            )}
            <button
              type="button"
              onClick={() => submit("DRAFT")}
              disabled={isPending}
              className="rounded-md border border-outline-variant/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
            >
              存草稿
            </button>
            <button
              type="submit"
              disabled={isPending || isUploading}
              className="rounded-md bg-primary px-5 py-2 text-xs font-bold uppercase tracking-widest text-on-primary hover:bg-primary-dim disabled:opacity-50"
            >
              {isPending ? "保存中…" : isEditMode ? "更新文章" : "发布文章"}
            </button>
          </div>
        </div>
      </header>

      {/* 左侧边栏 */}
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-60 border-r border-outline-variant/15 bg-background md:block">
        <div className="flex h-screen flex-col pb-8 pt-24">
          <div className="mb-6 px-6">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">编辑器</p>
            <p className="mt-1 text-[10px] text-outline">写作模式</p>
          </div>

          <nav className="flex-1 space-y-1 px-4">
            {isEditMode ? (
              <Link href="/editor" className="block rounded-md px-4 py-2.5 text-sm text-outline hover:bg-surface-container-low">
                新建文章
              </Link>
            ) : (
              <div className="rounded-md bg-surface-container px-4 py-2.5 text-sm font-bold text-on-surface">
                新建文章
              </div>
            )}
            <Link href="/editor/posts" className="block rounded-md px-4 py-2.5 text-sm text-outline hover:bg-surface-container-low">
              文章管理
            </Link>
            <Link href="/archive" className="block rounded-md px-4 py-2.5 text-sm text-outline hover:bg-surface-container-low">
              归档页
            </Link>
            <Link href="/" className="block rounded-md px-4 py-2.5 text-sm text-outline hover:bg-surface-container-low">
              前台首页
            </Link>
          </nav>

          <div className="px-5">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-md border border-outline-variant/20 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low"
            >
              退出登录
            </button>
          </div>
        </div>
      </aside>

      {/* 主内容 */}
      <main className="flex min-h-screen flex-col pt-20 md:ml-60 lg:flex-row lg:items-start">
        <section className="min-w-0 flex-1 px-8 py-10 lg:px-12 lg:max-w-3xl">

          {/* 提示信息（固定顶部，最醒目） */}
          {message ? (
            <div
              className={`mb-6 rounded-lg px-5 py-4 text-sm font-medium ${
                isError
                  ? "bg-error/10 text-error"
                  : "bg-secondary-container text-on-secondary-fixed"
              }`}
              aria-live="polite"
            >
              {message}
            </div>
          ) : null}

          <div className="mb-3 flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-outline">新建文章</span>
            <button
              type="button"
              onClick={() => mdFileRef.current?.click()}
              className="rounded border border-outline-variant/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container-low md:hidden"
            >
              导入 .md
            </button>
          </div>

          <textarea
            rows={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-6 w-full resize-none border-none bg-transparent font-headline text-4xl font-bold leading-tight text-on-surface placeholder:text-surface-variant focus:ring-0 md:text-5xl"
            placeholder="文章标题..."
          />

          <div className="mb-6">
            <label htmlFor="post-excerpt" className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-outline">
              摘要
            </label>
            <textarea
              id="post-excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full resize-none rounded-lg border border-outline-variant/15 bg-surface-container-low px-4 py-3 text-base leading-relaxed text-on-surface-variant focus:border-outline focus:ring-0"
              placeholder="一两句话概括核心观点..."
            />
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[560px] w-full resize-none border-none bg-transparent text-lg leading-relaxed text-on-surface-variant placeholder:text-surface-variant focus:ring-0"
            placeholder="正文（支持 Markdown）..."
          />
        </section>

        {/* 右侧面板 */}
        <aside className="editorial-scrollbar w-full shrink-0 overflow-y-auto bg-surface-container px-7 py-10 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:w-96">
          <div className="space-y-8">

            {/* 分类与标签 */}
            <section>
              <h3 className="mb-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                基本信息
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="category" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-outline">
                    分类
                  </label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-md border-none bg-surface-container-lowest py-2.5 text-sm focus:ring-1 focus:ring-outline/20"
                  >
                    {categories.length === 0 && (
                      <option value="">— 暂无分类，请先执行 db seed —</option>
                    )}
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tags" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-outline">
                    标签（逗号分隔）
                  </label>
                  <input
                    id="tags"
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full border-x-0 border-b border-t-0 border-outline-variant/30 bg-transparent px-1 py-2 text-sm outline-none focus:border-outline"
                    placeholder="如：学习笔记, 复盘, AI"
                  />
                  {parsedTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {parsedTags.map((tag) => (
                        <span key={tag} className="rounded-full bg-secondary-fixed px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-secondary-fixed">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-4 py-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-outline">置顶推荐</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={featured}
                    onClick={() => setFeatured((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${featured ? "bg-primary" : "bg-outline-variant/40"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${featured ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                <div>
                  <label htmlFor="published-at" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-outline">
                    发布日期（可修改）
                  </label>
                  <input
                    id="published-at"
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="w-full rounded-md border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 text-sm focus:border-outline focus:ring-0"
                  />
                  {publishedAt && (
                    <button
                      type="button"
                      onClick={() => setPublishedAt("")}
                      className="mt-1 text-[10px] text-outline hover:text-on-surface"
                    >
                      清除（使用当前时间）
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* 封面图 */}
            <section>
              <h3 className="mb-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                封面图
              </h3>
              <div className="overflow-hidden rounded-lg bg-surface-container-high">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={previewImage}
                    alt={coverAlt || title || "封面预览"}
                    fill
                    sizes="352px"
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
                  className="w-full rounded-md border border-outline-variant/20 py-2.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
                >
                  {isUploading ? "上传中…" : "上传图片"}
                </button>
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-outline-variant/20" />
                  <span className="text-[10px] text-outline">或填写链接</span>
                  <div className="h-px flex-1 bg-outline-variant/20" />
                </div>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full rounded-md border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 text-sm focus:border-outline focus:ring-0"
                  placeholder="https://..."
                />
                <input
                  type="text"
                  value={coverAlt}
                  onChange={(e) => setCoverAlt(e.target.value)}
                  className="w-full rounded-md border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 text-sm focus:border-outline focus:ring-0"
                  placeholder="图片描述（alt 文本）"
                />
              </div>
            </section>

            {/* 引用语 */}
            <section>
              <h3 className="mb-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                文章引用语（可选）
              </h3>
              <textarea
                rows={3}
                value={pullQuote}
                onChange={(e) => setPullQuote(e.target.value)}
                className="w-full resize-none rounded-md border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 text-sm focus:border-outline focus:ring-0"
                placeholder="文章中部大号引用句..."
              />
            </section>

            {/* 相关链接 */}
            <section>
              <h3 className="mb-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
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
                        className="w-full rounded border border-outline-variant/20 bg-surface-container-lowest px-2 py-1.5 text-xs focus:border-outline focus:ring-0"
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
                        className="w-full rounded border border-outline-variant/20 bg-surface-container-lowest px-2 py-1.5 text-xs focus:border-outline focus:ring-0"
                        placeholder="https://..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setRelatedLinks((prev) => prev.filter((_, j) => j !== i))}
                      className="self-start rounded border border-error/30 px-2 py-1.5 text-[10px] text-error hover:bg-error/10"
                    >
                      删除
                    </button>
                  </div>
                ))}
                {relatedLinks.length < 10 && (
                  <button
                    type="button"
                    onClick={() => setRelatedLinks((prev) => [...prev, { label: "", url: "" }])}
                    className="w-full rounded border border-dashed border-outline-variant/30 py-2 text-[10px] font-bold uppercase tracking-widest text-outline hover:bg-surface-container-low"
                  >
                    + 添加链接
                  </button>
                )}
              </div>
            </section>

            {/* 草稿箱 */}
            <section>
              <h3 className="mb-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                草稿箱 {draftList.length > 0 && <span className="ml-1 rounded-full bg-secondary-fixed px-2 py-0.5 text-[10px] text-on-secondary-fixed">{draftList.length}</span>}
              </h3>
              {draftList.length === 0 ? (
                <p className="text-xs text-outline">暂无草稿</p>
              ) : (
                <div className="space-y-3">
                  {draftList.map((draft) => (
                    <div key={draft.id} className="rounded-lg bg-surface-container-lowest p-3">
                      <p className="text-[10px] uppercase tracking-wider text-outline">{draft.category.name}</p>
                      <p className="mt-1 line-clamp-2 text-sm font-medium text-on-surface">{draft.title}</p>
                      <p className="mt-1 text-[10px] text-outline">
                        {new Date(draft.updatedAt).toLocaleDateString("zh-CN")}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => publishDraft(draft.id)}
                          className="rounded bg-primary px-2.5 py-1 text-[10px] font-bold text-on-primary hover:bg-primary-dim"
                        >
                          发布
                        </button>
                        <Link
                          href={`/posts/${draft.slug}`}
                          target="_blank"
                          className="rounded border border-outline-variant/30 px-2.5 py-1 text-[10px] text-on-surface-variant hover:bg-surface-container-low"
                        >
                          预览
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteDraft(draft.id)}
                          className="rounded border border-error/30 px-2.5 py-1 text-[10px] text-error hover:bg-error/10"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 最近已发布 */}
            {recentPosts.length > 0 && (
              <section>
                <h3 className="mb-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                  最近发布
                </h3>
                <div className="space-y-3">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="rounded-lg bg-surface-container-lowest p-3">
                      <p className="text-[10px] uppercase tracking-wider text-outline">{post.category.name}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-on-surface">{post.title}</p>
                      <p className="mt-1 text-[10px] text-outline">
                        {new Date(post.updatedAt).toLocaleDateString("zh-CN")}
                      </p>
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
