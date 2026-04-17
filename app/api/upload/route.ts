import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { supabase, STORAGE_BUCKET, getPublicUrl } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ message: "未收到文件。" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ message: "仅支持 JPG、PNG、WebP、GIF 格式。" }, { status: 400 });
  }

  const maxSizeInBytes = 5 * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    return NextResponse.json({ message: "图片不能超过 5MB。" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filename, buffer, {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    });

  if (error) {
    console.error("Supabase upload error:", error);
    return NextResponse.json({ message: "上传失败，请稍后再试。" }, { status: 500 });
  }

  const url = getPublicUrl(filename);

  return NextResponse.json({ url });
}
