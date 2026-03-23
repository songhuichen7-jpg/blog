import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { siteConfig } from "@/lib/site";
import { newsletterSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = newsletterSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message || "邮箱格式不正确。",
        },
        { status: 400 },
      );
    }

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: {
        email: parsed.data.email,
      },
    });

    if (existing) {
      return NextResponse.json({
        message: "你已经订阅过了，欢迎继续阅读。",
      });
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email: parsed.data.email,
        source: siteConfig.newsletterSource,
      },
    });

    return NextResponse.json({
      message: "订阅成功，下一封通讯会准时送达。",
    });
  } catch {
    return NextResponse.json(
      {
        message: "订阅失败，请稍后再试。",
      },
      { status: 500 },
    );
  }
}
