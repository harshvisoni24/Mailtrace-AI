import { prisma } from "../config/prisma";

export async function recordAudit(params: {
  userId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  status: "SUCCESS" | "FAILURE";
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({ data: params });
  } catch (err) {
    // Auditing must never crash the primary request path.
    // eslint-disable-next-line no-console
    console.error("[audit] failed to record audit log", err);
  }
}
