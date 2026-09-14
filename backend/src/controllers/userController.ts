import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AppError } from "../middleware/errorHandler";

export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(users.map((u: any) => ({ id: u.id, email: u.email, fullName: u.fullName, role: u.role.name, isActive: u.isActive })));
  } catch (err) {
    return next(err);
  }
}

const updateSchema = z.object({
  roleName: z.enum(["ADMIN", "SECURITY_ANALYST", "INVESTIGATOR", "VIEWER"]).optional(),
  isActive: z.boolean().optional(),
});

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateSchema.parse(req.body);
    let roleId: string | undefined;
    if (data.roleName) {
      const role = await prisma.role.upsert({
        where: { name: data.roleName },
        update: {},
        create: { name: data.roleName },
      });
      roleId = role.id;
    }
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { roleId, isActive: data.isActive },
      include: { role: true },
    });
    return res.json({ id: updated.id, email: updated.email, role: updated.role.name, isActive: updated.isActive });
  } catch (err) {
    return next(err);
  }
}
