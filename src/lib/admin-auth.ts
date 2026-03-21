import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_SECRET or ADMIN_PASSWORD env is required");
  return secret;
}

function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL ?? "";
}

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

/** Create a signed token: email|timestamp|signature */
export function createAdminToken(email: string): string {
  const timestamp = Date.now().toString();
  const payload = `${email}|${timestamp}`;
  const signature = createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
  return `${payload}|${signature}`;
}

/** Verify token and return email or null */
export function verifyAdminToken(token: string): string | null {
  const parts = token.split("|");
  if (parts.length !== 3) return null;

  const [email, timestamp, signature] = parts;

  // Check expiration
  const age = (Date.now() - parseInt(timestamp, 10)) / 1000;
  if (age > TOKEN_MAX_AGE || age < 0) return null;

  // Verify signature
  const expectedPayload = `${email}|${timestamp}`;
  const expectedSignature = createHmac("sha256", getSecret())
    .update(expectedPayload)
    .digest("hex");

  try {
    const sigBuf = Buffer.from(signature, "hex");
    const expectedBuf = Buffer.from(expectedSignature, "hex");
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null;
  } catch {
    return null;
  }

  return email;
}

/** Check admin credentials */
export function validateCredentials(email: string, password: string): boolean {
  const adminEmail = getAdminEmail();
  const adminPassword = getAdminPassword();
  if (!adminEmail || !adminPassword) return false;
  return email === adminEmail && password === adminPassword;
}

/** Check if the current request is from an authenticated admin. Use in API routes. */
export async function requireAdmin(): Promise<string> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(COOKIE_NAME);
  if (!tokenCookie) {
    throw new AdminAuthError("Не авторизовано");
  }
  const email = verifyAdminToken(tokenCookie.value);
  if (!email) {
    throw new AdminAuthError("Сесія закінчилась");
  }
  return email;
}

/** Check admin auth without throwing */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAuthError";
  }
}

export { COOKIE_NAME, TOKEN_MAX_AGE };
