"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PostImage } from "@/components/post-image";

type FeaturedPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  coverAlt: string | null;
  category: { name: string };
};

export function FeaturedCarousel({ posts }: { posts: FeaturedPost[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = posts.length;

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((i) => (i - 1 + total) % total);
  }, [total]);

  // Auto-play every 5s
  useEffect(() => {
    if (paused || total <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, total, next]);

  const post = posts[current];

  return (
    <section
      className="relative mb-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Link
        href={`/posts/${post.slug}`}
        className="group grid grid-cols-1 items-center gap-8 lg:grid-cols-2"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100">
          {post.coverImage ? (
            <PostImage
              src={post.coverImage}
              alt={post.coverAlt || post.title}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-5xl font-semibold text-zinc-300">
                {post.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Text */}
        <div>
          <span className="mb-3 inline-block text-xs font-medium text-accent">
            {post.category.name}
          </span>
          <h1 className="balanced-text mb-4 text-3xl font-bold leading-tight text-primary md:text-4xl">
            {post.title}
          </h1>
          <p className="mb-6 text-base leading-relaxed text-muted">
            {post.excerpt}
          </p>
          <span className="text-sm font-medium text-accent">
            阅读全文 &rarr;
          </span>
        </div>
      </Link>

      {/* Controls — only show when more than 1 */}
      {total > 1 && (
        <div className="mt-6 flex items-center justify-between">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {posts.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`切换到第 ${i + 1} 篇`}
                className={`h-1.5 rounded-full transition-all ${
                  i === current
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-zinc-300 hover:bg-zinc-400"
                }`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prev}
              aria-label="上一篇"
              className="cursor-pointer rounded-md p-1.5 text-muted transition-colors hover:bg-zinc-100 hover:text-primary"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="min-w-[3rem] text-center text-xs tabular-nums text-muted">
              {current + 1} / {total}
            </span>
            <button
              type="button"
              onClick={next}
              aria-label="下一篇"
              className="cursor-pointer rounded-md p-1.5 text-muted transition-colors hover:bg-zinc-100 hover:text-primary"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
