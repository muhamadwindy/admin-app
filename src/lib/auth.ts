import "server-only";
import { cookies, headers } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, PENDING_COOKIE } from "@/lib/constants";
import type { User } from "@prisma/client";

export { SESSION_COOKIE, PENDING_COOKIE };
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours, typical bank office session
const PENDING_TTL_MS = 10 * 60 * 1000; // 10 minutes to complete OTP
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

function randomToken() {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function requestMeta() {
  const h = headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "127.0.0.1";
  const userAgent = h.get("user-agent") || "unknown";
  return { ip, userAgent };
}

export function isLocked(user: Pick<User, "lockedUntil">) {
  return !!user.lockedUntil && user.lockedUntil.getTime() > Date.now();
}

export async function recordFailedLogin(userId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: { increment: 1 } },
  });
  if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
    await prisma.user.update({
      where: { id: userId },
      data: { lockedUntil: new Date(Date.now() + LOCKOUT_MS), failedLoginAttempts: 0 },
    });
    return { locked: true, lockedUntil: new Date(Date.now() + LOCKOUT_MS) };
  }
  return { locked: false, attemptsLeft: MAX_FAILED_ATTEMPTS - user.failedLoginAttempts };
}

export async function recordSuccessfulLogin(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
}

// --- Pending (post-password, pre-OTP) state ---

export async function createPendingChallenge(userId: string) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = hashToken(code);
  const { ip, userAgent } = requestMeta();
  const challenge = await prisma.otpChallenge.create({
    data: {
      userId,
      codeHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });
  cookies().set(PENDING_COOKIE, challenge.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_TTL_MS / 1000,
  });
  return { challengeId: challenge.id, code, ip, userAgent };
}

export async function getPendingChallenge() {
  const challengeId = cookies().get(PENDING_COOKIE)?.value;
  if (!challengeId) return null;
  const challenge = await prisma.otpChallenge.findUnique({
    where: { id: challengeId },
    include: { user: true },
  });
  if (!challenge || challenge.consumedAt || challenge.expiresAt.getTime() < Date.now()) return null;
  return challenge;
}

export function clearPendingCookie() {
  cookies().delete(PENDING_COOKIE);
}

// --- Real sessions (post-OTP) ---

export async function createSession(userId: string) {
  const token = randomToken();
  const { ip, userAgent } = requestMeta();
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      ipAddress: ip,
      userAgent,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return token;
}

export async function getCurrentSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) return null;
  if (session.user.accountStatus !== "ACTIVE") return null;
  return session;
}

export async function requireSession() {
  const session = await getCurrentSession();
  return session;
}

export async function destroyCurrentSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.updateMany({
      where: { tokenHash: hashToken(token) },
      data: { revokedAt: new Date() },
    });
  }
  cookies().delete(SESSION_COOKIE);
}

export async function revokeSession(sessionId: string) {
  await prisma.session.update({ where: { id: sessionId }, data: { revokedAt: new Date() } });
}

export async function revokeOtherSessions(userId: string, keepSessionId: string) {
  await prisma.session.updateMany({
    where: { userId, id: { not: keepSessionId }, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export function generateTempPassword() {
  const raw = randomBytes(9).toString("base64").replace(/[+/=]/g, "").slice(0, 10);
  return `Bcn${raw}!1`;
}

export function maskIdCard(idCardNumber: string) {
  if (idCardNumber.length < 8) return idCardNumber;
  return `${idCardNumber.slice(0, 6)}${"*".repeat(idCardNumber.length - 10)}${idCardNumber.slice(-4)}`;
}
