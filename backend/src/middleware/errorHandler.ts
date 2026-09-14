import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: "Validation failed.",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Known infra failure modes should degrade gracefully, not 500 blindly.
  const message = err instanceof Error ? err.message : "Unknown error";
  if (message.includes("ECONNREFUSED") && message.includes("5432")) {
    return res.status(503).json({ error: "Database unavailable. Please check PostgreSQL connectivity." });
  }
  if (message.toLowerCase().includes("ai-service") || message.includes("ECONNREFUSED")) {
    return res.status(503).json({
      error: "AI analysis service unavailable. Core forensic parsing may still work; AI scoring/explanations are degraded.",
    });
  }

  // eslint-disable-next-line no-console
  console.error("[unhandled error]", err);
  return res.status(500).json({ error: "Internal server error." });
}
