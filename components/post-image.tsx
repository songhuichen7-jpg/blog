import Image from "next/image";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Image>, "unoptimized">;

export function PostImage({ src, style, ...props }: Props) {
  const s = String(src);
  const unoptimized = s.startsWith("/uploads/") || s.startsWith("/api/images/");
  // color: transparent hides alt text when image fails to load
  return (
    <Image
      src={src}
      unoptimized={unoptimized}
      style={{ color: "transparent", ...style }}
      {...props}
    />
  );
}
