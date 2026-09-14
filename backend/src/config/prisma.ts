import { PrismaClient } from "@prisma/client";

// Single shared Prisma client. PostgreSQL connection details come entirely
// from DATABASE_URL (env). Never assume localhost - the DB may be on
// another machine on the network or in the cloud.
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    return false;
  }
}
