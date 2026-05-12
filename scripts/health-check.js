const { loadEnv } = require("./load-env");

loadEnv();

const baseUrl = process.env.APP_URL || "http://localhost:3000";

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const response = await fetch(new URL("/api/health", baseUrl));
  const body = await response.json().catch(() => ({}));

  if (!response.ok || body.status !== "ok") {
    console.error(JSON.stringify(body, null, 2));
    throw new Error(`Health check falhou com HTTP ${response.status}.`);
  }

  console.log(JSON.stringify(body, null, 2));
}
