import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AppError } from "../middleware/errorHandler";
import { askCopilot, checkAiServiceHealth } from "../services/aiServiceClient";

const askSchema = z.object({
  question: z.string().min(3),
  emailId: z.string().uuid().optional(),
  caseId: z.string().uuid().optional(),
});

export async function ask(req: Request, res: Response, next: NextFunction) {
  try {
    const { question, emailId, caseId } = askSchema.parse(req.body);

    const context: Record<string, unknown> = {};
    if (emailId) {
      const email = await prisma.email.findUnique({
        where: { id: emailId },
        include: { auth: true, iocs: true, urls: true },
      });
      if (!email) throw new AppError("Email not found.", 404);
      context.email = email;
    }
    if (caseId) {
      const caseData = await prisma.case.findUnique({
        where: { id: caseId },
        include: { emails: true, evidence: true },
      });
      if (!caseData) throw new AppError("Case not found.", 404);
      context.case = caseData;
    }

    const aiHealthy = await checkAiServiceHealth();
    if (!aiHealthy) {
      return res.json({
        answer:
          "The AI copilot service is currently unavailable. Core investigation data is unaffected — please retry once the AI service is reachable.",
        groundedIn: [],
        source: "RULE_ENGINE_ONLY",
      });
    }

    const result = await askCopilot(question, context);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}
