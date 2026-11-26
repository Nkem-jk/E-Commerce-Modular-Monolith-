// Run with: npx prisma db seed
// Creates the first super admin and sample products. Safe to run more than once.

require("dotenv").config(); // load .env before the Prisma client reads DATABASE_URL

const bcrypt = require("bcryptjs");
const prisma = require("../src/shared/config/db");

const SALT_ROUNDS = 10;

async function seedAdmin() {
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

async function seedProducts() {
  const productCount = await prisma.product.count();

  if (productCount > 0) {
    console.log("Products already exist. Nothing changed.");
    return;
  }

  const products = [
    {
      name: "Wireless Earbuds",
      description: "Bluetooth earbuds with 20 hours of battery.",
      price: 1500000,
      imageUrl: "https://placehold.co/600x400?text=Wireless+Earbuds",
      stock: 10,
    },
    {
      name: "Phone Charger",
      description: "Fast 20W USB-C charger for most phones.",
      price: 500000,
      imageUrl: "https://placehold.co/600x400?text=Phone+Charger",
      stock: 10,
    },
    {
      name: "Backpack",
      description: "Water-resistant backpack with a laptop sleeve.",
      price: 2500000,
      imageUrl: "https://placehold.co/600x400?text=Backpack",
      stock: 10,
    },
    {
      name: "Desk Lamp",
      description: "LED desk lamp with three brightness levels.",
      price: 1200000,
      imageUrl: "https://placehold.co/600x400?text=Desk+Lamp",
      stock: 10,
    },
    {
      name: "Water Bottle",
      description: "Stainless steel bottle that keeps drinks cold for 12 hours.",
      price: 450000,
      imageUrl: "https://placehold.co/600x400?text=Water+Bottle",
      stock: 10,
    },
    {
      name: "Smart Watch",
      description: "Fitness watch with heart-rate and sleep tracking.",
      price: 3500000,
      imageUrl: "https://placehold.co/600x400?text=Smart+Watch",
      stock: 10,
    },
    {
      name: "Power Bank",
      description: "10,000mAh power bank with two USB ports.",
      price: 1800000,
      imageUrl: "https://placehold.co/600x400?text=Power+Bank",
      stock: 10,
    },
    {
      name: "Vacuum Cleaner",
      description: "CyberVac 150W wireless stick vacuum cleaner.",
      price: 14400000,
      imageUrl: "https://placehold.co/600x400?text=Vacuum+Cleaner",
      stock: 10,
    },
    {
      name: "Rechargeable Fan",
      description: "Power turbo 3,500mAh portable folding fan.",
      price: 12000000,
      imageUrl: "https://placehold.co/600x400?text=Rechargeable+Fan",
      stock: 10,
    },
    {
      name: "Security Camera",
      description: "Vigicam 3MP ultra HD night vission IP camera.",
      price: 3300000,
      imageUrl: "https://placehold.co/600x400?text=Security+Camera",
      stock: 10,
    },
    {
      name: "Bluetooth Speaker",
      description: "Portable speaker with deep bass and 12 hours of play.",
      price: 2200000,
      imageUrl: "https://placehold.co/600x400?text=Bluetooth+Speaker",
      stock: 10,
    },
    {
      name: "Notebook Set",
      description: "Set of three A5 notebooks with lined pages.",
      price: 300000,
      imageUrl: "https://placehold.co/600x400?text=Notebook+Set",
      stock: 10,
    },
  ];

  await prisma.product.createMany({ data: products });
  console.log(`Seeded ${products.length} products`);
}

async function main() {
  await seedAdmin();
  await seedProducts();
}

main()
  .catch((error) => {
    console.error(`Seeding failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());