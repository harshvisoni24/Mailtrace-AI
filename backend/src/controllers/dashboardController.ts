import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { checkDatabaseConnection } from "../config/prisma";
import { checkAiServiceHealth } from "../services/aiServiceClient";

export async function getDashboardSummary(_req: Request, res: Response, next: NextFunction) {
  try {
    const [emailsAnalyzed, criticalThreats, threatsDetected, activeCases, activeCampaigns, evidenceItems, byClassification] =
      await Promise.all([
        prisma.email.count(),
        prisma.email.count({ where: { threatScore: { gte: 90 } } }),
        prisma.email.count({ where: { threatClassification: { notIn: ["LEGITIMATE", "LOW_RISK"] } } }),
        prisma.case.count({ where: { status: { in: ["OPEN", "ACTIVE"] } } }),
        prisma.campaign.count(),
        prisma.evidence.count(),
        prisma.email.groupBy({ by: ["threatClassification"], _count: { _all: true } }),
      ]);

    const recentInvestigations = await prisma.email.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, subject: true, threatClassification: true, threatScore: true, createdAt: true },
    });

    const recentAlerts = await prisma.alert.findMany({ orderBy: { createdAt: "desc" }, take: 5 });

    const dbOk = await checkDatabaseConnection();
    const aiOk = await checkAiServiceHealth();

    return res.json({
      metrics: { emailsAnalyzed, threatsDetected, criticalThreats, activeCases, activeCampaigns, evidenceItems },
      threatCategories: byClassification.map((b: any) => ({ classification: b.threatClassification, count: b._count._all })),
      recentInvestigations,
      recentAlerts,
      systemHealth: { database: dbOk, aiService: aiOk },
    });
  } catch (err) {
    return next(err);
  }
}
