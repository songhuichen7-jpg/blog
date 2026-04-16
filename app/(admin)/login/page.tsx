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
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-6 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-white p-8 shadow-soft">
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            写作后台
          </h1>
          <p className="mb-8 text-sm text-muted">
            登录后即可开始写作和管理文章。
          </p>

          <LoginForm />

          {!configured && (
            <div className="mt-6 rounded-lg bg-zinc-50 p-4">
              <p className="text-xs text-muted">
                还没有配置 ADMIN_PASSWORD_HASH。先按 README 生成密码哈希并写入 .env。
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
