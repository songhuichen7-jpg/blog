import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "the_curator_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

type SessionPayload = {
  email: string;
  exp: number;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getAuthEnv(name: "SESSION_SECRET" | "ADMIN_EMAIL" | "ADMIN_PASSWORD_HASH", fallback = "") {
  const value = process.env[name];

  if (value) {
    return value;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} is required in production.`);
  }

  return fallback;
}

function getSessionSecret() {
  return getAuthEnv("SESSION_SECRET", "development-session-secret");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function getConfiguredAdminEmail() {
  return getAuthEnv("ADMIN_EMAIL", "admin@example.com");
}

function getConfiguredAdminPasswordHash() {
  return getAuthEnv("ADMIN_PASSWORD_HASH");
}

export function verifyPassword(password: string, encoded: string) {
  const [salt, storedHash] = encoded.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const computed = scryptSync(password, salt, 64);
  const stored = Buffer.from(storedHash, "hex");

  if (computed.length !== stored.length) {
    return false;
  }

  return timingSafeEqual(computed, stored);
}

export async function createSession(email: string) {
  const payload: SessionPayload = {
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const token = `${encodedPayload}.${sign(encodedPayload)}`;
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!raw) {
    return null;
  }

  const [encodedPayload, providedSignature] = raw.split(".");

  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);

  if (providedSignature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    if (payload.email !== getConfiguredAdminEmail()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function isAuthenticated() {
  const session = await getSession();
  return Boolean(session);
}

export function validateAdminCredentials(email: string, password: string) {
  const configuredHash = getConfiguredAdminPasswordHash();

  if (!configuredHash) {
    return false;
  }

  return email === getConfiguredAdminEmail() && verifyPassword(password, configuredHash);
}
