import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export async function listAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const alerts = await prisma.alert.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return res.json(alerts);
  } catch (err) {
    return next(err);
  }
}

export async function markAlertRead(req: Request, res: Response, next: NextFunction) {
  try {
    const alert = await prisma.alert.update({ where: { id: req.params.id }, data: { isRead: true } });
    return res.json(alert);
  } catch (err) {
    return next(err);
  }
}
