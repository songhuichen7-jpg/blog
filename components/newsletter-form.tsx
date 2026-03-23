"use client";

import { FormEvent, useState, useTransition } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/newsletter", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const payload = (await response.json()) as { message?: string };

        if (!response.ok) {
          throw new Error(payload.message || "订阅失败，请稍后再试。");
        }

        setIsSuccess(true);
        setMessage(payload.message || "订阅成功。");
        setEmail("");
      } catch (error) {
        setIsSuccess(false);
        setMessage(error instanceof Error ? error.message : "订阅失败，请稍后再试。");
      }
    });
  }

  return (
    <form className="mx-auto flex max-w-md flex-col gap-4 md:flex-row" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="newsletter-email">
        您的邮箱
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="flex-grow rounded-md border border-outline-variant/15 bg-surface-container-low px-6 py-4 text-sm focus:border-outline focus:ring-0"
        placeholder="您的学术 / 工作邮箱"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-8 py-4 text-sm font-bold uppercase tracking-widest text-on-primary hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "提交中" : "订阅"}
      </button>
      {message ? (
        <p
          className={`md:basis-full md:pl-1 ${isSuccess ? "text-secondary" : "text-error"}`}
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
