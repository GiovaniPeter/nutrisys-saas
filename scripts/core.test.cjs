const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createHmac, webcrypto } = require("node:crypto");
const ts = require("typescript");
const { NextRequest } = require("next/server");

const root = path.resolve(__dirname, "..");
const secret = "test-only-session-secret-with-at-least-32-characters";

// Executa os módulos reais com serviços externos substituídos: nenhum dado remoto é criado.
function load(file, stubs = {}, cache = new Map()) {
  const absolute = path.resolve(root, file);
  if (cache.has(absolute)) return cache.get(absolute);
  const result = { exports: {} };
  cache.set(absolute, result.exports);
  const output = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  const localRequire = (name) => {
    if (Object.hasOwn(stubs, name)) return stubs[name];
    if (name.startsWith("@/") || name.startsWith(".")) {
      const candidate = name.startsWith("@/") ? path.join(root, "src", name.slice(2)) : path.resolve(path.dirname(absolute), name);
      return load(path.relative(root, `${candidate}.ts`), stubs, cache);
    }
    return require(name);
  };
  vm.runInNewContext(output, {
    exports: result.exports, module: result, require: localRequire,
    process: { env: { SESSION_SECRET: secret } }, console,
    crypto: webcrypto, TextEncoder, TextDecoder, Uint8Array, atob, Buffer,
    Request, Response, Headers, URL, Date
  }, { filename: absolute });
  return result.exports;
}

function token(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${createHmac("sha256", secret).update(encoded).digest("base64url")}`;
}

const document = load("src/lib/brazilian-document.ts");

test("CNPJ da empresa, numéricos e alfanuméricos são validados e formatados", () => {
  for (const value of ["69.642.291/0001-18", "69642291000118", "12.ABC.345/01DE-35", "12.abc.345/01de-35"]) {
    assert.equal(document.isValidCnpj(value), true, value);
  }
  assert.equal(document.formatDocument("69642291000118"), "69.642.291/0001-18");
  assert.equal(document.formatDocument("12abc34501de35"), "12.ABC.345/01DE-35");
  for (const value of ["69.642.291/0001-19", "00000000000000", "11111111111111", "12ABC34501DEXX", "!69642291000118", ""]) {
    assert.equal(document.isValidCnpj(value), false, value);
  }
});

test("CPF preserva suporte a profissionais autônomos sem aceitar documentos inválidos", () => {
  assert.equal(document.isValidCpf("529.982.247-25"), true);
  for (const value of ["529.982.247-26", "111.111.111-11", "00000000000", "ABC98224725"]) {
    assert.equal(document.isValidDocument(value), false);
  }
});

test("sessões exigem identidade e expiração numérica futura", () => {
  const { hasValidSessionIdentity } = load("src/lib/session-payload.ts");
  const base = { userId: "user", organizationId: "org", exp: 101 };
  assert.equal(hasValidSessionIdentity(base, "userId", 100), true);
  for (const exp of [undefined, null, "101", 100, 99, NaN, Infinity]) {
    assert.equal(hasValidSessionIdentity({ ...base, exp }, "userId", 100), false);
  }
  assert.equal(hasValidSessionIdentity(base, "patientId", 100), false);
  assert.equal(hasValidSessionIdentity({ ...base, organizationId: 42 }, "userId", 100), false);
});

test("middleware verifica assinatura, expiração e formato do token", async () => {
  const { readVerifiedSession } = load("src/lib/middleware-session.ts");
  const payload = { userId: "user", organizationId: "org", role: "SECRETARY", exp: Math.floor(Date.now() / 1000) + 60 };
  const signed = token(payload);
  assert.equal((await readVerifiedSession(signed)).role, "SECRETARY");
  const tampered = `${Buffer.from(JSON.stringify({ ...payload, role: "OWNER" })).toString("base64url")}.${signed.split(".")[1]}`;
  for (const value of [tampered, `${signed}.extra`, token({ ...payload, exp: 1 }), token({ ...payload, exp: undefined }), "broken", undefined]) {
    assert.equal((await readVerifiedSession(value)).role, null);
  }
});

test("restrição de secretária e profissional também funciona no aplicativo via Bearer", async () => {
  const { middleware } = load("src/middleware.ts");
  for (const role of ["SECRETARY", "PROFESSIONAL"]) {
    const signed = token({ userId: "user", organizationId: "org", role, specialty: "medico", exp: Math.floor(Date.now() / 1000) + 60 });
    for (const headers of [{ authorization: `Bearer ${signed}` }, { cookie: `nutrisys_session=${signed}` }]) {
      const response = await middleware(new NextRequest("http://localhost/api/meal-plans", { headers }));
      assert.equal(response.status, 403);
    }
  }
});

test("páginas institucionais continuam acessíveis com sessão de secretária", async () => {
  const { middleware } = load("src/middleware.ts");
  const signed = token({ userId: "user", organizationId: "org", role: "SECRETARY", exp: Math.floor(Date.now() / 1000) + 60 });
  for (const route of ["/", "/termos-de-uso", "/politica-de-privacidade", "/recursos", "/portal/login"]) {
    const response = await middleware(new NextRequest(`http://localhost${route}`, { headers: { cookie: `nutrisys_session=${signed}` } }));
    assert.equal(response.headers.get("x-middleware-next"), "1");
  }
});

test("API do portal não entrega rascunhos nem planos de outros pacientes ou clínicas", async () => {
  const fixtures = [
    { id: "published", patientId: "patient", organizationId: "org", publishedAt: "2026-10-01" },
    { id: "draft", patientId: "patient", organizationId: "org", publishedAt: null },
    { id: "other-patient", patientId: "other", organizationId: "org", publishedAt: "2026-10-01" },
    { id: "other-clinic", patientId: "patient", organizationId: "other", publishedAt: "2026-10-01" }
  ];
  const { GET } = load("src/app/api/portal/meal-plans/route.ts", {
    "@/lib/patient-session": { getCurrentPortalPatient: async () => ({ id: "patient", organizationId: "org" }) },
    "@/lib/prisma": { prisma: { mealPlan: { findMany: async ({ where }) => fixtures.filter((plan) =>
      (!where.patientId || plan.patientId === where.patientId) &&
      (!where.organizationId || plan.organizationId === where.organizationId) &&
      (!where.publishedAt || plan.publishedAt !== where.publishedAt.not)
    ) } } }
  });
  const response = await GET();
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).map((plan) => plan.id), ["published"]);
});

test("API de identidade impede alterações sem permissão e rejeita CPF/CNPJ inválido", async () => {
  let role = "NUTRITIONIST";
  let changes;
  const { PATCH } = load("src/app/api/settings/organization/route.ts", {
    "@/lib/session": { getCurrentUser: async () => ({ id: "user", organizationId: "org", role }) },
    "@/lib/audit": { audit: async () => {} },
    "@/lib/prisma": { prisma: { organization: { update: async (input) => { changes = input; return { id: "org" }; } } } }
  });
  const request = (value) => new NextRequest("http://localhost/api/settings/organization", {
    method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ document: value })
  });
  assert.equal((await PATCH(request("69.642.291/0001-18"))).status, 403);
  assert.equal(changes, undefined);
  role = "OWNER";
  assert.equal((await PATCH(request("69.642.291/0001-19"))).status, 422);
  assert.equal(changes, undefined);
  assert.equal((await PATCH(request("69.642.291/0001-18"))).status, 200);
  assert.equal(changes.where.id, "org");
  assert.equal(changes.data.document, "69642291000118");
  assert.equal((await PATCH(request(""))).status, 200);
  assert.equal(changes.data.document, null);
});

test("nutricionistas, profissionais e recepção não podem promover usuários pela API", async () => {
  for (const role of ["NUTRITIONIST", "PROFESSIONAL", "SECRETARY"]) {
    const stubs = { "@/lib/session": { getCurrentUser: async () => ({ id: "user", organizationId: "org", role }) },
      "@/lib/prisma": { prisma: {} }, "@/lib/audit": {}, "@/lib/password": {}, "@/lib/subscriptions": {} };
    const request = () => new NextRequest("http://localhost/api/users", { method: "POST",
      body: JSON.stringify({ role: "ADMIN" }) });
    assert.equal((await load("src/app/api/users/route.ts", stubs).POST(request())).status, 403);
    assert.equal((await load("src/app/api/users/[userId]/route.ts", stubs).PATCH(request(), { params: { userId: "user" } })).status, 403);
  }
});

test("administrador não pode criar titular nem alterar a conta do titular", async () => {
  const stubs = { "@/lib/session": { getCurrentUser: async () => ({ id: "admin", organizationId: "org", role: "ADMIN" }) },
    "@/lib/prisma": { prisma: { user: { findFirst: async () => ({ id: "owner", role: "OWNER" }) } } },
    "@/lib/audit": {}, "@/lib/password": {}, "@/lib/subscriptions": {} };
  const request = (body) => new NextRequest("http://localhost/api/users", { method: "POST", body: JSON.stringify(body) });
  const creation = await load("src/app/api/users/route.ts", stubs).POST(request({ name: "Teste", email: "test@example.com", password: "test-password", role: "OWNER" }));
  assert.equal(creation.status, 403);
  const update = await load("src/app/api/users/[userId]/route.ts", stubs).PATCH(request({ active: false }), { params: { userId: "owner" } });
  assert.equal(update.status, 403);
});
