const { loadEnv } = require("./load-env");

loadEnv();

const REQUIRED = ["DATABASE_URL", "DIRECT_URL", "SESSION_SECRET", "APP_URL"];

const PLACEHOLDER_PATTERNS = [
  /\[PROJECT_REF\]/i,
  /\[SUA_SENHA_DO_BANCO\]/i,
  /\[REGIAO\]/i,
  /troque-por/i,
  /localhost/i
];

let hasError = false;

for (const name of REQUIRED) {
  const value = process.env[name];

  if (!value) {
    fail(`${name} nao definido.`);
    continue;
  }

  if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value))) {
    fail(`${name} ainda parece conter placeholder ou valor local.`);
  }
}

if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
  fail("SESSION_SECRET precisa ter pelo menos 32 caracteres.");
}

if (process.env.APP_URL && !/^https:\/\//i.test(process.env.APP_URL)) {
  fail("APP_URL deve usar https em producao.");
}

if (process.env.DATABASE_URL && process.env.DIRECT_URL && process.env.DATABASE_URL === process.env.DIRECT_URL) {
  fail("DATABASE_URL e DIRECT_URL devem ser diferentes em producao quando usar pooler.");
}

if (hasError) {
  process.exit(1);
}

console.log("Ambiente de producao validado.");

function fail(message) {
  hasError = true;
  console.error(`ERRO: ${message}`);
}
