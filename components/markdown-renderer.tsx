import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

type MarkdownRendererProps = {
  content: string;
  dropcap?: boolean;
};

const ALLOWED_IFRAME_HOSTS = [
  "youtube.com",
  "www.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
  "player.bilibili.com",
];

function isAllowedIframe(src: string): boolean {
  try {
    const url = new URL(src);
    return ALLOWED_IFRAME_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith("." + host));
  } catch {
    return false;
  }
}

const components = {
  iframe: (props: React.ComponentProps<"iframe">) => {
    const src = String(props.src || "");
    if (!isAllowedIframe(src)) return null;
    return (
      <div className="my-6 aspect-video overflow-hidden rounded-lg">
        <iframe
          src={src}
          className="h-full w-full"
          loading="lazy"
          allowFullScreen
          allow="autoplay; picture-in-picture"
          frameBorder="0"
        />
      </div>
    );
  },
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeHighlight]}
      className="prose prose-zinc max-w-none"
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}
