const { loadEnv } = require("./load-env");

loadEnv();

const baseUrl = process.env.APP_URL || "http://localhost:3000";
const timestamp = Date.now();
const email = process.env.SMOKE_EMAIL || `smoke-${timestamp}@nutrisys.test`;
const password = process.env.SMOKE_PASSWORD || `Smoke${timestamp}!`;

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const session = await register();
  await getMe(session.cookie);
  const patient = await createPatient(session.cookie);
  await createRecall(session.cookie, patient.id);
  const recalls = await listRecalls(session.cookie, patient.id);

  if (!recalls.some((recall) => recall.patientId === patient.id)) {
    throw new Error("Recordatorio criado nao apareceu na listagem.");
  }

  console.log(
    JSON.stringify(
      {
        status: "ok",
        baseUrl,
        email,
        patientId: patient.id,
        recalls: recalls.length
      },
      null,
      2
    )
  );
}

async function register() {
  const response = await request("/api/auth/register", {
    method: "POST",
    body: {
      name: "Smoke Test",
      email,
      password,
      organizationName: `Smoke Test ${timestamp}`,
      planCode: "professional"
    }
  });
  const data = await response.json();
  assertOk(response, data, "cadastro");

  const cookie = response.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) {
    throw new Error("Cadastro nao retornou cookie de sessao.");
  }

  return { cookie, user: data.user };
}

async function getMe(cookie) {
  const response = await request("/api/auth/me", { cookie });
  const data = await response.json();
  assertOk(response, data, "auth/me");
  return data.user;
}

async function createPatient(cookie) {
  const response = await request("/api/patients", {
    method: "POST",
    cookie,
    body: {
      name: "Paciente Smoke",
      email: `paciente-${timestamp}@nutrisys.test`,
      phone: "11999990000",
      lgpdConsent: true
    }
  });
  const data = await response.json();
  assertOk(response, data, "criacao de paciente");
  return data.patient;
}

async function createRecall(cookie, patientId) {
  const today = new Date().toISOString().slice(0, 10);
  const response = await request("/api/recalls", {
    method: "POST",
    cookie,
    body: {
      patientId,
      referenceDate: today,
      generalNotes: "Registro criado pelo smoke test.",
      meals: [
        {
          type: "breakfast",
          label: "Cafe da manha",
          time: "07:30",
          position: 0,
          notes: "",
          items: [
            {
              foodName: "Banana",
              portion: "1 unidade",
              quantity: 1,
              calories: 90,
              protein: 1.1,
              carbs: 23,
              fat: 0.3,
              fiber: 2.6
            }
          ]
        }
      ]
    }
  });
  const data = await response.json();
  assertOk(response, data, "criacao de recordatorio");
  return data.recall;
}

async function listRecalls(cookie, patientId) {
  const response = await request(`/api/recalls?patientId=${encodeURIComponent(patientId)}`, { cookie });
  const data = await response.json();
  assertOk(response, data, "listagem de recordatorios");
  return data.recalls;
}

async function request(path, options = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.cookie ? { Cookie: options.cookie } : {})
  };

  return fetch(new URL(path, baseUrl), {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
}

function assertOk(response, data, label) {
  if (!response.ok) {
    throw new Error(`${label} falhou com HTTP ${response.status}: ${JSON.stringify(data)}`);
  }
}
