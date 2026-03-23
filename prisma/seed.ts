import bcrypt from "bcryptjs";
import { PrismaClient , Role} from "../src/generated/prisma/client"; 
const prisma = new PrismaClient();
import "dotenv/config";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL!;
  const password = process.env.ADMIN_PASSWORD!;
  const name = process.env.ADMIN_NAME!

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name,
      role: Role.ADMIN,
    },
  });

  console.log(`✅ Admin user ensured: ${email}`);
}

async function main() {
  try {
    await seedAdmin();
    console.log("🌱 Database seeding completed");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();