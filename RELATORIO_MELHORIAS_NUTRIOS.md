# 📊 Relatório de Melhorias - NutriOS
**Data:** 13/06/2026  
**Versão:** 0.1.0  
**Status:** MVP em desenvolvimento

---

## 📌 Resumo Executivo

O NutriOS é uma plataforma SaaS promissora para nutricionistas, com **arquitetura moderna** (Next.js + PostgreSQL + Prisma), mas ainda apresenta **oportunidades críticas** em segurança, validações, performance e conformidade legal.

**Saúde do Projeto:**
- ✅ Backend robusto com multi-tenant
- ✅ Autenticação com sessões seguras
- ✅ Modelo de dados bem estruturado
- ⚠️ Faltam validações em APIs
- ⚠️ Sem rate limiting em endpoints críticos
- ⚠️ Faltam testes automatizados

---

## 🏗️ ARQUITETURA ATUAL

### Stack Tecnológico
```
Frontend:     Next.js 14 + React 18 + TypeScript
Backend:      Next.js API Routes
Banco:        PostgreSQL (Prisma ORM)
Auth:         Sessões JWT com HMAC-SHA256
Storage:      Supabase (S3)
Pagamentos:   Mercado Pago
Email:        Resend
Deploy:       (não configurado)
```

### Principais Entidades
- ✅ Organization (multi-tenant)
- ✅ User (Owner, Nutritionist, Secretary, Admin)
- ✅ Patient + Appointments
- ✅ MealPlan + Foods + Recipes
- ✅ Subscription (com Mercado Pago)
- ✅ AuditLog (basic)
- ✅ FinancialTransaction
- ✅ HealthRecords (anamnesis, body records, labs, supplements)

---

## ✅ O que Funciona Bem

### 1. **Multi-Tenant Implementado** 
- Todas as tabelas incluem `organizationId`
- Isolamento por organização funcional
- Middleware de autorização básico

### 2. **Autenticação Segura**
- Senhas com hash (bcrypt ou similar)
- Sessões com HMAC-SHA256
- Cookies HTTP-only com SameSite=lax
- Rate limiting em login (10 tentativas/10min)
- Recuperação de senha e confirmação de email

### 3. **Modelo de Permissões por Role**
- Owner, Nutritionist, Secretary, Admin
- Secretária tem acesso restrito (middleware)
- Controle de acesso por página/API

### 4. **Funcionalidades Clínicas Completas**
- Prontuário básico (anamnesis, body records)
- Planos alimentares com cálculo de macros
- Banco de alimentos (TACO/IBGE)
- Diário alimentar com feedback
- Exames laboratoriais
- Prescrição de suplementos
- Chat profissional-paciente
- Hidratação e metas

### 5. **Assinatura Recorrente**
- Integração Mercado Pago
- Trial period
- Status de assinatura (TRIALING, ACTIVE, PAST_DUE, CANCELED)
- Webhook para sincronização

### 6. **Auditoria Implementada**
- AuditLog registra todas as ações críticas
- Rastreamento de user + entity + action + timestamp
- Exibição no dashboard

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### CRÍTICO 🔴

#### 1. **Validações Insuficientes em APIs**
- Muitos endpoints sem Zod schema
- Não validam `organizationId` do usuário vs request
- Risco de **data leak entre organizações**

**Impacto:** Usuário de uma clínica pode acessar dados de outra  
**Exemplo:**
```typescript
// ❌ RISCO: Sem validação de organizationId
const patient = await prisma.patient.findUnique({
  where: { id: patientId }
  // Falta: where: { id: patientId, organizationId: currentUser.organizationId }
});
```

#### 2. **Rate Limiting Limitado**
- Apenas no login
- APIs clínicas (criar paciente, meal plan) sem proteção
- Risco de **DoS ou brute force em endpoints críticos**

#### 3. **Faltam Testes Automatizados**
- Sem testes unitários
- Sem testes de integração
- Sem testes de segurança (CORS, injection, etc.)

**Risco:** Deploy sem confiança; regressões passam desapercebidas

#### 4. **Conformidade LGPD Incompleta**
- ✅ Termos + Política de Privacidade (UI exists)
- ❌ Consentimento não está sendo registrado no banco
- ❌ Função de exportação de dados não implementada
- ❌ Função de exclusão de conta incompleta
- ❌ Dados sensíveis não criptografados em repouso

**Legal Risk:** Multa de até 2% do faturamento (LGPD)

#### 5. **Ambiente de Produção Não Configurado**
- Sem CI/CD
- Sem variáveis de ambiente produção
- Sem backup automático
- Sem logs estruturados (Sentry, etc.)
- Sem monitoramento

**Business Risk:** Perda de dados, downtime, sem observabilidade

---

### ALTO 🟠

#### 6. **Integrações Simulated / Incompletas**
- WhatsApp: sem integração Meta oficial
- Google Agenda: sem OAuth
- Canva: não integrado
- Email: sem testes

#### 7. **Sem Validação de Profissional**
- CRM nutricionista não validado
- Sem verificação contra CREFITO (Conselho Regional)
- Risco regulatório

#### 8. **Segurança de Uploads**
- Sem validação de tipo de arquivo
- Sem limite de tamanho
- Sem scanning de malware
- Sem criptografia de PDFs

#### 9. **Performance**
- Sem cache em endpoints lidos frequentemente
- Sem paginação em listagens grandes
- Sem índices otimizados em queries pesadas
- Sem CDN para assets

#### 10. **API Deprecation / Versioning**
- Sem versionamento de API (`/api/v1/...`)
- Mudanças quebram clientes antigos

---

### MÉDIO 🟡

#### 11. **Error Handling Genérico**
- Mensagens de erro expõem stack traces
- Sem erro logging centralizado
- Experiência de erro ruim para usuário

#### 12. **Documentação de API**
- Sem OpenAPI/Swagger
- Sem documentação de endpoints
- Dificulta integração de terceiros

#### 13. **Relacionamentos Órfãos**
- Deleter organização em cascata pode gerar conflitos
- Sem soft delete (deleted_at)

#### 14. **Transações Incompletas**
- Criar MealPlan + Meals sem transação = risco de inconsistência
- Webhook Mercado Pago pode falhar deixando dados inconsistentes

#### 15. **Escalabilidade**
- Sem fila de jobs (envio de email, PDF generation)
- Sem cache distribuído (Redis)
- Session storage em memória (não escalável)

---

## 🎯 RECOMENDAÇÕES POR PRIORIDADE

### FASE 1: SEGURANÇA CRÍTICA (1-2 semanas)

| # | Ação | Esforço | Impacto |
|----|------|--------|--------|
| 1.1 | Validar `organizationId` em TODOS endpoints | 3h | 🔴 CRÍTICO |
| 1.2 | Implementar rate limiting global | 2h | 🔴 CRÍTICO |
| 1.3 | Remover stack traces do erro response | 1h | 🔴 CRÍTICO |
| 1.4 | Validar tipos de arquivo em upload | 2h | 🔴 CRÍTICO |
| 1.5 | Implementar CORS restritivo | 1h | 🔴 CRÍTICO |

**Checklist:**
```typescript
// ✅ Exemplo: Validar organizationId
const validateOrgAccess = async (userId: string, organizationId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, organizationId, active: true }
  });
  if (!user) throw new Error("Unauthorized");
  return user;
};

// Em todos endpoints:
await validateOrgAccess(currentUser.id, requestOrgId);
```

---

### FASE 2: CONFORMIDADE LEGAL (1-2 semanas)

| # | Ação | Esforço | Impacto |
|----|------|--------|--------|
| 2.1 | Registrar consentimento LGPD no banco | 2h | 🟠 ALTO |
| 2.2 | Implementar exportação de dados (ZIP) | 4h | 🟠 ALTO |
| 2.3 | Implementar exclusão de conta (soft delete) | 3h | 🟠 ALTO |
| 2.4 | Criptografia de dados sensíveis em repouso | 6h | 🟠 ALTO |
| 2.5 | Validação de profissional (CRM/CREFITO) | 8h | 🟠 ALTO |

**Modelo de Dados:**
```prisma
model PatientConsent {
  id        String   @id @default(cuid())
  patientId String
  type      String   // "LGPD", "TREATMENT", "CONTACT"
  accepted  Boolean
  timestamp DateTime @default(now())
  ipAddress String?
  
  patient Patient @relation(fields: [patientId], references: [id])
}

model User {
  // ...
  deletedAt DateTime?  // soft delete
}
```

---

### FASE 3: TESTES & QUALIDADE (2-3 semanas)

| # | Ação | Esforço | Impacto |
|----|------|--------|--------|
| 3.1 | Setup Jest + Vitest para testes unitários | 2h | 🟡 MÉDIO |
| 3.2 | Testes de autenticação e autorização | 4h | 🟠 ALTO |
| 3.3 | Testes de APIs críticas (CRUD Patient, MealPlan) | 6h | 🟡 MÉDIO |
| 3.4 | Testes de segurança (injection, XSS, CORS) | 4h | 🔴 CRÍTICO |
| 3.5 | CI/CD pipeline (GitHub Actions) | 3h | 🟡 MÉDIO |

---

### FASE 4: PERFORMANCE & OBSERVABILIDADE (2 semanas)

| # | Ação | Esforço | Impacto |
|----|------|--------|--------|
| 4.1 | Setup Sentry para error tracking | 1h | 🟡 MÉDIO |
| 4.2 | Implementar logging estruturado | 3h | 🟡 MÉDIO |
| 4.3 | Adicionar paginação em endpoints (skip/take) | 4h | 🟡 MÉDIO |
| 4.4 | Cache de dados lidos frequentemente (Redis) | 6h | 🟡 MÉDIO |
| 4.5 | Índices de banco otimizados | 2h | 🟡 MÉDIO |

---

### FASE 5: INFRAESTRUTURA (1-2 semanas)

| # | Ação | Esforço | Impacto |
|----|------|--------|--------|
| 5.1 | Setup deploy (Vercel/Render + Railway) | 4h | 🟠 ALTO |
| 5.2 | Backup automático PostgreSQL | 2h | 🔴 CRÍTICO |
| 5.3 | Variáveis de ambiente produção | 1h | 🟠 ALTO |
| 5.4 | Setup S3/Supabase para storage | 2h | 🟡 MÉDIO |
| 5.5 | Monitoramento e alertas | 3h | 🟡 MÉDIO |

---

## 📋 QUICK WINS (Fazer HOJE)

Essas melhorias levam **< 1 hora** cada e têm **alto impacto**:

### 1. Melhorar Formatação de Auditoria ✅ (JÁ FEITO)
- Traduzir ações (`appointment.created` → "Consulta Agendada")
- Traduzir entidades (`Subscription` → "Assinatura")
- Status: **IMPLEMENTADO**

### 2. Adicionar Validação de Email
```typescript
const emailSchema = z.string().email().toLowerCase();
// Todos endpoints que recebem email
```

### 3. Adicionar Limite de Requisições Globais
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const ip = getClientIp(request);
  const allowed = checkRateLimit({ key: `global:${ip}`, limit: 100, windowMs: 60000 });
  if (!allowed) return new NextResponse("Rate limited", { status: 429 });
  return NextResponse.next();
}
```

### 4. Adicionar Helmet (Headers de Segurança)
```typescript
// next.config.mjs
headers: async () => [{
  source: '/:path*',
  headers: [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  ],
}],
```

### 5. Setup Environment Variables Produção
Criar `.env.production` com valores seguros

---

## 📊 ROADMAP SUGERIDO

```
SEMANA 1-2   → FASE 1 (Segurança Crítica)
SEMANA 3-4   → FASE 2 (Conformidade LGPD)
SEMANA 5-7   → FASE 3 (Testes & CI/CD)
SEMANA 8-9   → FASE 4 (Performance)
SEMANA 10-11 → FASE 5 (Infraestrutura)

META FINAL: MVP seguro e pronto para vender
```

---

## 🎯 MÉTRICAS DE SUCESSO

Após as melhorias:

- ✅ 100% de endpoints com validação de `organizationId`
- ✅ 0 vazamentos de dados entre clínicas
- ✅ Taxa de erro < 1% em produção
- ✅ Tempo de resposta P95 < 500ms
- ✅ Uptime > 99.5%
- ✅ LGPD 100% compliant
- ✅ Cobertura de testes > 80%
- ✅ Score de segurança (OWASP) A

---

## 📞 PRÓXIMOS PASSOS

Qual fase você quer começar?

1. **Implementar Fase 1** (Segurança) - ~4-5 horas
2. **Implementar Fase 2** (LGPD) - ~6-8 horas
3. **Criar testes** (Fase 3)
4. **Setup CI/CD + Deploy** (Fase 5)

Recomendo começar pela **FASE 1** (hoje, é crítico).

---

**Gerado em:** 13/06/2026  
**Versão do NutriOS:** 0.1.0  
**Status:** ⏳ Aguardando aprovação para implementação
