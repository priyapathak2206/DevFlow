require("dotenv").config();

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("./src/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const db = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  const user = await db.user.findUnique({
    where: { email: "priya.test@example.com" },
  });

  console.log("User found:", Boolean(user));

  if (user) {
    const matches = await bcrypt.compare(
      "TestPass123!",
      user.passwordHash
    );
    console.log("Password matches:", matches);
  }
}

main()
  .catch((error) => console.error("Check failed:", error.message))
  .finally(async () => {
    await db.$disconnect();
  });