import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join("/tmp", "uploads");

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

  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return NextResponse.json({ url: `/api/images/${filename}` });
}
