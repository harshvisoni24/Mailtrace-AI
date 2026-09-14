import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const roleNames = ["ADMIN", "SECURITY_ANALYST", "INVESTIGATOR", "VIEWER"] as const;
  const roles: Record<string, string> = {};
  for (const name of roleNames) {
    const role = await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
    roles[name] = role.id;
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@mailtrace.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        fullName: "Platform Administrator",
        roleId: roles.ADMIN,
      },
    });
    console.log(`Seeded admin user: ${adminEmail} / ${adminPassword} (CHANGE THIS PASSWORD IMMEDIATELY)`);
  } else {
    console.log("Admin user already exists, skipping.");
  }

  const analystEmail = "analyst04@mailtrace.local";
  const existingAnalyst = await prisma.user.findUnique({ where: { email: analystEmail } });
  if (!existingAnalyst) {
    const passwordHash = await bcrypt.hash("Analyst123!", 12);
    await prisma.user.create({
      data: {
        email: analystEmail,
        passwordHash,
        fullName: "Analyst 04",
        roleId: roles.SECURITY_ANALYST,
      },
    });
    console.log(`Seeded demo analyst: ${analystEmail} / Analyst123!`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
