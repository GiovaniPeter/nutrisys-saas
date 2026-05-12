# Setup da nova base SaaS

Esta base convive com o protótipo antigo (`index.html`, `landing.html`, `js/`, `css/`). O objetivo é migrar módulo por módulo para uma aplicação real com backend e banco.

## Requisitos

- Node.js instalado.
- PostgreSQL local ou hospedado.
- Uma cópia de `.env.example` para `.env`.

No PowerShell deste Windows, use `npm.cmd` em vez de `npm` se a execução de scripts estiver bloqueada.

## Passos

1. Instalar dependências:

```powershell
npm.cmd install
```

2. Configurar ambiente:

```powershell
Copy-Item .env.example .env
```

Edite `DATABASE_URL` e `SESSION_SECRET` no `.env`.

3. Criar as tabelas:

```powershell
npm.cmd run prisma:migrate -- --name init
```

4. Rodar em desenvolvimento:

```powershell
npm.cmd run dev
```

## Rotas já criadas

- `POST /api/auth/register`: cria clínica, usuário owner, assinatura trial e cookie de sessão.
- `POST /api/auth/login`: autentica com senha hash.
- `POST /api/auth/logout`: encerra sessão.
- `GET /api/auth/me`: retorna usuário autenticado.
- `GET /api/billing/plans`: lista planos comerciais internos.
- `GET /api/patients`: lista pacientes da clínica autenticada.
- `POST /api/patients`: cria paciente da clínica autenticada.
- `GET /api/patients/:patientId`: detalhe do paciente isolado por clínica.
- `PATCH /api/patients/:patientId`: atualiza paciente.
- `DELETE /api/patients/:patientId`: remove paciente.
- `GET /api/appointments`: lista consultas.
- `POST /api/appointments`: cria consulta.
- `GET /api/foods`: lista alimentos globais e personalizados da clínica.
- `POST /api/foods`: cria alimento personalizado da clínica.
- `GET /api/meal-plans`: lista planos alimentares.
- `POST /api/meal-plans`: cria plano alimentar com refeições e itens.
- `GET /api/meal-plans/:mealPlanId`: detalhe do plano alimentar.
- `DELETE /api/meal-plans/:mealPlanId`: remove plano alimentar.

## Próximas migrações

- Conectar a landing atual ao `POST /api/auth/register`.
- Migrar a tela de pacientes do `localStorage` para `GET/POST /api/patients`.
- Migrar a tela de cardápios para `GET/POST /api/meal-plans`.
- Criar seed/importação da TACO/IBGE no PostgreSQL.
- Integrar Mercado Pago ou Stripe para checkout e webhooks.
- Criar geração real de PDF no servidor.
