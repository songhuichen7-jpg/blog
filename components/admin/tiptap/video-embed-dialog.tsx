"use client";

import { useState, useRef, useEffect } from "react";
import type { Editor } from "@tiptap/react";
function detectPlatform(url: string): "youtube" | "bilibili" | null {
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (/bilibili\.com|player\.bilibili\.com/.test(url)) return "bilibili";
  return null;
}

export function VideoEmbedDialog({
  editor,
  open,
  onClose,
}: {
  editor: Editor;
  open: boolean;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const platform = url.trim() ? detectPlatform(url.trim()) : null;

  useEffect(() => {
    if (open) {
      setUrl("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  function handleInsert() {
    const trimmed = url.trim();
    if (!trimmed || !platform) return;

    if (platform === "youtube") {
      editor.commands.setYoutubeVideo({ src: trimmed });
    } else if (platform === "bilibili") {
      editor.commands.setBilibiliVideo({ src: trimmed });
    }

    onClose();
    editor.commands.focus();
  }

  if (!open) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-white p-4 shadow-lg">
      <p className="mb-2 text-xs font-medium text-foreground">插入视频</p>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleInsert();
            if (e.key === "Escape") onClose();
          }}
          placeholder="粘贴 YouTube 或 Bilibili 链接..."
          className="flex-1 rounded-md border border-border bg-white px-3 py-1.5 text-sm text-foreground placeholder:text-zinc-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
        />
        <button
          type="button"
          onClick={handleInsert}
          disabled={!platform}
          className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
        >
          插入
        </button>
      </div>
      {url.trim() && (
        <p className="mt-1.5 text-xs text-muted">
          {platform === "youtube" && "YouTube 视频"}
          {platform === "bilibili" && "Bilibili 视频"}
          {!platform && "不支持的链接，请使用 YouTube 或 Bilibili"}
        </p>
      )}
    </div>
  );
}
