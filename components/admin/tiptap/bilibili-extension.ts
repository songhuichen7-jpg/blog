import { Node, mergeAttributes } from "@tiptap/core";

export interface BilibiliOptions {
  HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    bilibili: {
      setBilibiliVideo: (options: { src: string }) => ReturnType;
    };
  }
}

function getBilibiliEmbedUrl(url: string): string | null {
  // https://www.bilibili.com/video/BVxxxxxxxx
  const bvMatch = url.match(/bilibili\.com\/video\/(BV[\w]+)/);
  if (bvMatch) {
    return `https://player.bilibili.com/player.html?bvid=${bvMatch[1]}&autoplay=0`;
  }

  // https://player.bilibili.com/player.html?bvid=BVxxxxxxxx
  const embedMatch = url.match(/player\.bilibili\.com\/player\.html\?.*bvid=(BV[\w]+)/);
  if (embedMatch) {
    return `https://player.bilibili.com/player.html?bvid=${embedMatch[1]}&autoplay=0`;
  }

  // https://www.bilibili.com/video/avxxxxxxxx
  const avMatch = url.match(/bilibili\.com\/video\/av(\d+)/);
  if (avMatch) {
    return `https://player.bilibili.com/player.html?aid=${avMatch[1]}&autoplay=0`;
  }

  return null;
}

export const BilibiliExtension = Node.create<BilibiliOptions>({
  name: "bilibili",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: { default: null },
      width: { default: "100%" },
      height: { default: 400 },
    };
  },

  parseHTML() {
    return [
      {
        tag: "iframe",
        getAttrs: (node) => {
          const src = (node as HTMLElement).getAttribute("src") || "";
          if (!src.includes("player.bilibili.com")) return false;
          return { src };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { "data-bilibili-video": "", class: "bilibili-video-wrapper" },
      [
        "iframe",
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          frameborder: "0",
          allowfullscreen: "true",
          allow: "autoplay; picture-in-picture",
          loading: "lazy",
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setBilibiliVideo:
        ({ src }) =>
        ({ commands }) => {
          const embedUrl = getBilibiliEmbedUrl(src);
          if (!embedUrl) return false;
          return commands.insertContent({
            type: this.name,
            attrs: { src: embedUrl },
          });
        },
    };
  },
});

export { getBilibiliEmbedUrl };
