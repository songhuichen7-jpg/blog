export function formatChineseDate(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);
}

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{Letter}\p{Number}\p{Script=Han}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function calculateReadingTime(content: string) {
  const text = content.replace(/[#_*`>\-\n\r]/g, " ").trim();
  const wordCount = text ? text.split(/\s+/).length : 0;

  return Math.max(3, Math.round(wordCount / 180));
}

export function unique<T>(items: T[]) {
  return [...new Set(items)];
}
