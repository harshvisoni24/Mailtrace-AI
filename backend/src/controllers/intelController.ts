import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../middleware/errorHandler";

export async function listDomains(_req: Request, res: Response, next: NextFunction) {
  try {
    const domains = await prisma.domain.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return res.json(domains);
  } catch (err) {
    return next(err);
  }
}

export async function getDomain(req: Request, res: Response, next: NextFunction) {
  try {
    const domain = await prisma.domain.findUnique({
      where: { id: req.params.id },
      include: { threatIntel: true, urls: true },
    });
    if (!domain) throw new AppError("Domain not found.", 404);
    return res.json(domain);
  } catch (err) {
    return next(err);
  }
}

export async function listIps(_req: Request, res: Response, next: NextFunction) {
  try {
    const ips = await prisma.iP.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return res.json(ips);
  } catch (err) {
    return next(err);
  }
}

export async function getIp(req: Request, res: Response, next: NextFunction) {
  try {
    const ip = await prisma.iP.findUnique({ where: { id: req.params.id }, include: { threatIntel: true } });
    if (!ip) throw new AppError("IP not found.", 404);
    return res.json(ip);
  } catch (err) {
    return next(err);
  }
}

export async function listUrls(_req: Request, res: Response, next: NextFunction) {
  try {
    const urls = await prisma.url.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { domain: true } });
    return res.json(urls);
  } catch (err) {
    return next(err);
  }
}

/**
 * Threat intel lookup that fans out to configured providers if API keys are
 * present, otherwise returns a clearly-labeled simulated result so the demo
 * still functions without external accounts.
 */
export async function lookupThreatIntel(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, value } = req.query as { type?: string; value?: string };
    if (!type || !value) throw new AppError("type and value query parameters are required.", 400);

    const hasVirusTotal = Boolean(process.env.VIRUSTOTAL_API_KEY);
    const hasAbuseIpDb = Boolean(process.env.ABUSEIPDB_API_KEY);

    if (!hasVirusTotal && !hasAbuseIpDb) {
      return res.json({
        source: "DEMO THREAT INTELLIGENCE",
        status: "SIMULATED",
        type,
        value,
        verdict: "Unable to determine — no live threat intelligence provider configured.",
        note: "Configure VIRUSTOTAL_API_KEY / ABUSEIPDB_API_KEY in ai-service or backend .env to enable live lookups.",
      });
    }

    // Provider adapters would be called here (not implemented without a live
    // key in this environment). Architecture is integration-ready.
    return res.json({
      source: hasVirusTotal ? "VIRUSTOTAL" : "ABUSEIPDB",
      status: "LIVE_LOOKUP_NOT_EXECUTED_IN_THIS_ENVIRONMENT",
      type,
      value,
      note: "API key detected. Wire the provider adapter in backend/src/services/threatIntelProviders/ to complete the live call.",
    });
  } catch (err) {
    return next(err);
  }
}

export async function globalSearch(req: Request, res: Response, next: NextFunction) {
  try {
    const q = String(req.query.q ?? "").trim();
    if (q.length < 2) return res.json({ emails: [], domains: [], ips: [], cases: [], iocs: [] });

    const [emails, domains, ips, cases, iocs] = await Promise.all([
      prisma.email.findMany({
        where: { OR: [{ subject: { contains: q, mode: "insensitive" } }, { fromAddress: { contains: q, mode: "insensitive" } }] },
        take: 10,
        select: { id: true, subject: true, fromAddress: true, threatClassification: true },
      }),
      prisma.domain.findMany({ where: { name: { contains: q, mode: "insensitive" } }, take: 10 }),
      prisma.iP.findMany({ where: { address: { contains: q } }, take: 10 }),
      prisma.case.findMany({ where: { OR: [{ title: { contains: q, mode: "insensitive" } }, { caseNumber: { contains: q, mode: "insensitive" } }] }, take: 10 }),
      prisma.iOC.findMany({ where: { value: { contains: q, mode: "insensitive" } }, take: 10 }),
    ]);

    return res.json({ emails, domains, ips, cases, iocs });
  } catch (err) {
    return next(err);
  }
}
