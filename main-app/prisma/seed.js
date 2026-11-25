// main-app/prisma/seed.js
// Creates the first super admin. Run it with: npx prisma db seed
// Reads SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD from .env

require("dotenv").config(); // load .env before the Prisma client reads DATABASE_URL

const bcrypt = require("bcryptjs");
const prisma = require("../src/shared/config/db");

const SALT_ROUNDS = 10;

async function main() {
  const name = process.env.SUPER_ADMIN_NAME || "Super Admin";
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env first.");
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { roleName: "super_admin" },
  });

  if (existingAdmin) {
    console.log(`Super admin already exists (${existingAdmin.email}). Nothing changed.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const admin = await prisma.user.create({
    data: { name, email, password: hashedPassword, roleName: "super_admin" },
  });

  console.log(`Super admin created: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(`Seeding failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());