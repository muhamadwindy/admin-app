import "server-only";
import { prisma } from "@/lib/prisma";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";
import { diffObjects } from "@/lib/diff";
import { generateTempPassword, hashPassword } from "@/lib/auth";
import type { User } from "@prisma/client";
import type { RequestType } from "@/types/enums";

/** Field snapshot shape shared by request payloads, previousData, and the employee form. */
export function snapshotUser(user: User) {
  return {
    nip: user.nip,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth.toISOString().slice(0, 10),
    idCardNumber: user.idCardNumber,
    address: user.address,
    department: user.department,
    branch: user.branch,
    position: user.position,
    employmentType: user.employmentType,
    joinDate: user.joinDate.toISOString().slice(0, 10),
    portalRole: user.portalRole,
    accountStatus: user.accountStatus,
  };
}

class RequestError extends Error {}

export async function createChangeRequest(opts: {
  type: RequestType;
  targetId?: string | null;
  payload: Record<string, unknown>;
  reason: string;
  requesterId: string;
  requesterName: string;
}) {
  const target = opts.targetId
    ? await prisma.user.findUnique({ where: { id: opts.targetId } })
    : null;
  if (opts.targetId && !target) throw new RequestError("Pegawai target tidak ditemukan");

  const request = await prisma.changeRequest.create({
    data: {
      type: opts.type,
      targetId: opts.targetId ?? null,
      payload: JSON.stringify(opts.payload),
      previousData: target ? JSON.stringify(snapshotUser(target)) : null,
      reason: opts.reason,
      requesterId: opts.requesterId,
    },
  });

  await logAction({
    actorId: opts.requesterId,
    actorName: opts.requesterName,
    action: AUDIT_ACTIONS.REQUEST_SUBMITTED,
    entityType: "ChangeRequest",
    entityId: request.id,
    description: `${opts.requesterName} mengajukan permintaan ${requestTypeLabel(opts.type)} untuk ${
      target ? target.fullName : opts.payload.fullName ?? "pegawai baru"
    }`,
    metadata: { type: opts.type, targetId: opts.targetId ?? null, reason: opts.reason },
  });

  return request;
}

export async function cancelChangeRequest(requestId: string, requesterId: string, requesterName: string) {
  const request = await prisma.changeRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new RequestError("Permintaan tidak ditemukan");
  if (request.requesterId !== requesterId) throw new RequestError("Anda hanya dapat membatalkan permintaan Anda sendiri");
  if (request.status !== "PENDING") throw new RequestError("Permintaan ini sudah diputuskan");

  await prisma.changeRequest.update({ where: { id: requestId }, data: { status: "CANCELLED" } });
  await logAction({
    actorId: requesterId,
    actorName: requesterName,
    action: AUDIT_ACTIONS.REQUEST_CANCELLED,
    entityType: "ChangeRequest",
    entityId: requestId,
    description: `${requesterName} membatalkan pengajuan ${requestTypeLabel(request.type)}`,
  });
}

export async function decideChangeRequest(opts: {
  requestId: string;
  approverId: string;
  approverName: string;
  decision: "APPROVED" | "REJECTED";
  note?: string;
}) {
  const request = await prisma.changeRequest.findUnique({
    where: { id: opts.requestId },
    include: { requester: true, target: true },
  });
  if (!request) throw new RequestError("Permintaan tidak ditemukan");
  if (request.status !== "PENDING") throw new RequestError("Permintaan ini sudah diputuskan sebelumnya");
  if (request.requesterId === opts.approverId) {
    throw new RequestError("Anda tidak dapat memutuskan permintaan yang Anda ajukan sendiri (pemisahan tugas)");
  }

  const payload = JSON.parse(request.payload) as Record<string, unknown>;
  const previousData = request.previousData ? (JSON.parse(request.previousData) as Record<string, unknown>) : null;
  const changes = diffObjects(previousData, payload);

  if (opts.decision === "REJECTED") {
    await prisma.changeRequest.update({
      where: { id: opts.requestId },
      data: { status: "REJECTED", reviewerId: opts.approverId, reviewedAt: new Date(), reviewNote: opts.note },
    });
    await logAction({
      actorId: opts.approverId,
      actorName: opts.approverName,
      action: AUDIT_ACTIONS.REQUEST_REJECTED,
      entityType: "ChangeRequest",
      entityId: request.id,
      description: `${opts.approverName} menolak pengajuan ${requestTypeLabel(request.type)} dari ${request.requester.fullName}`,
      metadata: { note: opts.note },
    });
    return;
  }

  await prisma.$transaction(async (tx) => {
    let targetUser: User;

    if (request.type === "CREATE") {
      const tempPassword = generateTempPassword();
      targetUser = await tx.user.create({
        data: {
          nip: String(payload.nip),
          fullName: String(payload.fullName),
          email: String(payload.email),
          phone: String(payload.phone),
          gender: String(payload.gender),
          dateOfBirth: new Date(String(payload.dateOfBirth)),
          idCardNumber: String(payload.idCardNumber),
          address: String(payload.address),
          department: String(payload.department),
          branch: String(payload.branch),
          position: String(payload.position),
          employmentType: payload.employmentType as User["employmentType"],
          joinDate: new Date(String(payload.joinDate)),
          portalRole: payload.portalRole as User["portalRole"],
          accountStatus: "ACTIVE",
          passwordHash: await hashPassword(tempPassword),
          mustChangePassword: true,
          createdById: request.requesterId,
          updatedById: opts.approverId,
        },
      });
    } else if (!request.targetId) {
      throw new RequestError("Permintaan tidak memiliki target pegawai");
    } else if (request.type === "UPDATE") {
      targetUser = await tx.user.update({
        where: { id: request.targetId },
        data: {
          fullName: String(payload.fullName),
          email: String(payload.email),
          phone: String(payload.phone),
          gender: String(payload.gender),
          dateOfBirth: new Date(String(payload.dateOfBirth)),
          idCardNumber: String(payload.idCardNumber),
          address: String(payload.address),
          department: String(payload.department),
          branch: String(payload.branch),
          position: String(payload.position),
          employmentType: payload.employmentType as User["employmentType"],
          joinDate: new Date(String(payload.joinDate)),
          portalRole: payload.portalRole as User["portalRole"],
          updatedById: opts.approverId,
        },
      });
    } else if (request.type === "DEACTIVATE") {
      targetUser = await tx.user.update({
        where: { id: request.targetId },
        data: { accountStatus: "SUSPENDED", updatedById: opts.approverId },
      });
      await tx.session.updateMany({
        where: { userId: request.targetId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else {
      // DELETE = permanent off-boarding. Financial-industry retention rules mean employee
      // history must not be erased, so this marks the record RESIGNED and revokes access
      // rather than deleting the row (which would also break referential audit history).
      targetUser = await tx.user.update({
        where: { id: request.targetId },
        data: { accountStatus: "RESIGNED", updatedById: opts.approverId },
      });
      await tx.session.updateMany({
        where: { userId: request.targetId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    await tx.changeRequest.update({
      where: { id: opts.requestId },
      data: {
        status: "APPROVED",
        reviewerId: opts.approverId,
        reviewedAt: new Date(),
        reviewNote: opts.note,
        // CREATE requests have no targetId at submission time (the employee didn't exist
        // yet); backfill it now so the new employee's detail page shows its own origination request.
        targetId: targetUser.id,
      },
    });

    const actionMap: Record<RequestType, string> = {
      CREATE: AUDIT_ACTIONS.USER_CREATED,
      UPDATE: AUDIT_ACTIONS.USER_UPDATED,
      DEACTIVATE: AUDIT_ACTIONS.USER_DEACTIVATED,
      DELETE: AUDIT_ACTIONS.USER_DELETED,
    };

    await tx.auditLog.create({
      data: {
        actorId: opts.approverId,
        actorName: opts.approverName,
        action: AUDIT_ACTIONS.REQUEST_APPROVED,
        entityType: "ChangeRequest",
        entityId: request.id,
        description: `${opts.approverName} menyetujui pengajuan ${requestTypeLabel(request.type)} dari ${request.requester.fullName}`,
        metadata: JSON.stringify({ note: opts.note }),
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: opts.approverId,
        actorName: opts.approverName,
        action: actionMap[request.type as RequestType],
        entityType: "User",
        entityId: targetUser.id,
        description: `Data pegawai ${targetUser.fullName} (${targetUser.nip}) diperbarui sesuai pengajuan #${request.id.slice(-6)}`,
        metadata: JSON.stringify({ changes }),
      },
    });
  });
}

const REQUEST_TYPE_LABEL: Record<RequestType, string> = {
  CREATE: "Penambahan Pegawai",
  UPDATE: "Perubahan Data",
  DEACTIVATE: "Penonaktifan Sementara",
  DELETE: "Off-boarding Permanen",
};

export function requestTypeLabel(type: string) {
  return REQUEST_TYPE_LABEL[type as RequestType] ?? type;
}
