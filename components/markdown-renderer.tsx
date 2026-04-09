import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

type MarkdownRendererProps = {
  content: string;
  dropcap?: boolean;
};

export function MarkdownRenderer({ content, dropcap = false }: MarkdownRendererProps) {
  return (
    <div className={dropcap ? "editorial-dropcap" : undefined}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        className="prose prose-lg prose-zinc max-w-none font-body text-on-surface-variant"
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
