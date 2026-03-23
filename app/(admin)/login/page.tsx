import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/editor");
  }

  const configured = Boolean(process.env.ADMIN_PASSWORD_HASH);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-ambient lg:grid-cols-2">
        <section className="bg-surface-container px-10 py-16 md:px-16">
          <span className="text-xs uppercase tracking-[0.3em] text-on-surface-variant">Editorial Access</span>
          <h1 className="mt-6 font-headline text-5xl italic leading-tight text-on-surface">
            进入写作后台
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-on-surface-variant">
            后台支持草稿保存、文章发布、标签管理与首页内容更新。登录后即可开始写作。
          </p>

          <div className="mt-16 rounded-2xl bg-background/70 p-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Setup Status</p>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              {configured
                ? "已检测到管理员密码配置，可以直接登录。"
                : "还没有配置 ADMIN_PASSWORD_HASH。先按 README 生成密码哈希并写入 .env。"}
            </p>
          </div>
        </section>

        <section className="px-10 py-16 md:px-16">
          <p className="text-xs uppercase tracking-[0.3em] text-outline">Sign In</p>
          <div className="mt-8 max-w-md">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
