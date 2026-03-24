import Image from "next/image";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Image>, "unoptimized">;

export function PostImage({ src, ...props }: Props) {
  const s = String(src);
  const unoptimized = s.startsWith("/uploads/") || s.startsWith("/api/images/");
  return <Image src={src} unoptimized={unoptimized} {...props} />;
}
