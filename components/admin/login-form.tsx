"use client";

import type { Route } from "next";
import { FormEvent, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const payload = (await response.json()) as { message?: string };

        if (!response.ok) {
          throw new Error(payload.message || "登录失败，请检查账号信息。");
        }

        const nextPath = searchParams.get("next");
        const target = nextPath && nextPath.startsWith("/") ? (nextPath as Route) : "/editor";

        router.push(target);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "登录失败，请稍后再试。");
      }
    });
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label
          htmlFor="login-email"
          className="block text-xs font-bold uppercase tracking-[0.2em] text-outline"
        >
          管理员邮箱
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-outline-variant/20 bg-surface-container-low px-4 py-4 text-sm focus:border-outline focus:ring-0"
          placeholder="admin@example.com"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="login-password"
          className="block text-xs font-bold uppercase tracking-[0.2em] text-outline"
        >
          密码
        </label>
        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-md border border-outline-variant/20 bg-surface-container-low px-4 py-4 text-sm focus:border-outline focus:ring-0"
          placeholder="请输入密码"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-primary px-8 py-4 text-sm font-bold uppercase tracking-[0.24em] text-on-primary hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "登录中" : "进入后台"}
      </button>

      {message ? (
        <p aria-live="polite" className="text-sm text-error">
          {message}
        </p>
      ) : null}
    </form>
  );
}
