import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD is missing");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {}, 
    create: {
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin user ensured: ${email}`);
}

async function main() {
  try {
    await seedAdmin();
    console.log("🌱 Database seeding completed");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  
  } 
}

main();
