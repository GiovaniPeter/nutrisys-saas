const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

function loadEnvFile() {
  const env = {};
  const lines = fs.readFileSync(".env", "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index);
    let value = trimmed.slice(index + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[key] = value;
  }

  return env;
}

async function test(name, url) {
  const prisma = new PrismaClient({
    datasources: {
      db: { url },
    },
  });

  try {
    await prisma.$executeRawUnsafe("SELECT 1");
    console.log(`${name}: OK`);
  } catch (error) {
    console.log(`${name}: ERROR`);
    console.log(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const env = loadEnvFile();
  await test("DATABASE_URL", env.DATABASE_URL);
  await test("DIRECT_URL", env.DIRECT_URL);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
