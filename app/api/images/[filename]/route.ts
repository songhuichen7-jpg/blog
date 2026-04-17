import { NextResponse } from "next/server";
import { getPublicUrl } from "@/lib/supabase";

// Redirect old /api/images/xxx URLs to Supabase Storage
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  if (filename.includes("..") || filename.includes("/")) {
    return NextResponse.json({ message: "无效文件名。" }, { status: 400 });
  }

  const url = getPublicUrl(filename);
  return NextResponse.redirect(url, 301);
}
