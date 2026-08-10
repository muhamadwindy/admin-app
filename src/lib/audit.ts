import "server-only";
import { prisma } from "@/lib/prisma";
import { requestMeta } from "@/lib/auth";

type LogActionInput = {
  actorId: string | null;
  actorName: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  description: string;
  metadata?: unknown;
  ip?: string;
  userAgent?: string;
};

export async function logAction(input: LogActionInput) {
  let ip = input.ip;
  let userAgent = input.userAgent;
  if (!ip || !userAgent) {
    try {
      const meta = requestMeta();
      ip = ip ?? meta.ip;
      userAgent = userAgent ?? meta.userAgent;
    } catch {
      // headers() unavailable outside a request scope (e.g. seed script)
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      actorName: input.actorName,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      description: input.description,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      ipAddress: ip ?? null,
      userAgent: userAgent ?? null,
    },
  });
}

export function buildAuditWhere(params: { action?: string; entityType?: string; q?: string; days?: string }) {
  const where: Record<string, unknown> = {};
  if (params.action) where.action = params.action;
  if (params.entityType) where.entityType = params.entityType;
  if (params.q) {
    where.OR = [
      { actorName: { contains: params.q } },
      { description: { contains: params.q } },
    ];
  }
  if (params.days && params.days !== "all") {
    const days = Number(params.days);
    if (!Number.isNaN(days)) {
      where.createdAt = { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
    }
  }
  return where;
}

export const AUDIT_ACTIONS = {
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGIN_LOCKED: "LOGIN_LOCKED",
  OTP_SENT: "OTP_SENT",
  OTP_VERIFIED: "OTP_VERIFIED",
  OTP_FAILED: "OTP_FAILED",
  LOGOUT: "LOGOUT",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  SESSION_REVOKED: "SESSION_REVOKED",
  REQUEST_SUBMITTED: "REQUEST_SUBMITTED",
  REQUEST_APPROVED: "REQUEST_APPROVED",
  REQUEST_REJECTED: "REQUEST_REJECTED",
  REQUEST_CANCELLED: "REQUEST_CANCELLED",
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  USER_DEACTIVATED: "USER_DEACTIVATED",
  USER_DELETED: "USER_DELETED",
  ROLE_CHANGED: "ROLE_CHANGED",
  AUDIT_EXPORTED: "AUDIT_EXPORTED",
} as const;
