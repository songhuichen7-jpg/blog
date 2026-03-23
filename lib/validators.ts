import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址。"),
});

export const loginSchema = z.object({
  email: z.string().email("请输入有效邮箱。"),
  password: z.string().min(8, "密码至少 8 位。"),
});

export const postInputSchema = z.object({
  title: z.string().min(4, "标题至少 4 个字符。").max(120, "标题不能超过 120 个字符。"),
  excerpt: z.string().min(12, "摘要至少 12 个字符。").max(220, "摘要不能超过 220 个字符。"),
  content: z.string().min(80, "正文至少 80 个字符。"),
  coverImage: z.string().refine(
    (val) => val.startsWith("http://") || val.startsWith("https://") || val.startsWith("/"),
    "请填写有效的封面图 URL 或上传图片。",
  ),
  coverAlt: z.string().max(180, "图片描述不能超过 180 个字符。").optional().default(""),
  categoryId: z.string().min(1, "请选择分类。"),
  tags: z.array(z.string().min(1).max(30)).max(8, "标签最多 8 个。").default([]),
  pullQuote: z.string().max(180, "引语不能超过 180 个字符。").optional().default(""),
  relatedLinks: z
    .array(z.object({ label: z.string().max(80), url: z.string().min(1).max(500) }))
    .max(10)
    .default([]),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  metaTitle: z.string().max(120, "SEO 标题不能超过 120 个字符。").optional().default(""),
  metaDescription: z.string().max(180, "SEO 描述不能超过 180 个字符。").optional().default(""),
});

export type PostInput = z.infer<typeof postInputSchema>;
