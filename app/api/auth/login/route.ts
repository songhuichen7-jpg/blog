import { NextResponse } from "next/server";

import { createSession, validateAdminCredentials } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = loginSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message || "登录信息格式不正确。",
        },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    if (!validateAdminCredentials(email, password)) {
      return NextResponse.json(
        {
          message: "邮箱或密码错误，或者管理员密码尚未配置。",
        },
        { status: 401 },
      );
    }

    await createSession(email);

    return NextResponse.json({
      message: "登录成功。",
    });
  } catch {
    return NextResponse.json(
      {
        message: "登录过程中出现异常，请稍后再试。",
      },
      { status: 500 },
    );
  }
}
