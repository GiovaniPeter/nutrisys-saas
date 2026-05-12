# NutriSys - Roadmap para SaaS de assinatura

Data do diagnóstico: 2026-05-09

## Objetivo

Transformar o protótipo atual do NutriSys em uma plataforma SaaS vendável para nutricionistas, com recursos comparáveis aos principais softwares do mercado, sem copiar marca, identidade visual ou implementação de concorrentes.

Referências públicas consultadas:

- Dietbox: https://dietbox.me/pt-BR
- Blog Dietbox sobre gestão de consultório: https://blog.dietbox.me/como-o-dietbox-te-ajuda-no-consultorio/
- App Dietbox no Google Play: https://play.google.com/store/apps/details?hl=pt&id=com.craftbox.dietbox

## Diagnóstico do projeto atual

O projeto atual é um protótipo front-end estático com `index.html`, `landing.html`, CSS e módulos JavaScript separados. Ele já demonstra muitos fluxos importantes, mas ainda não é seguro nem operacional para vender assinaturas.

Pontos fortes já existentes:

- Landing page com planos, preços, trial, login e formulário de cadastro.
- Login local com perfis de nutricionista e secretária.
- Cadastro de pacientes, consultas, agenda, financeiro e KPIs.
- Planos alimentares com metas, cálculo de macros, substituições e lista de compras.
- Banco de alimentos inicial com dados TACO/IBGE.
- Anamnese, recordatório 24h, exames, suplementos e evolução corporal.
- Portal do paciente simulado, diário alimentar, metas, hidratação, chat e videochamada via Jitsi.
- Relatórios imprimíveis com aparência de PDF.
- Personalização de clínica: logo, cores, nome, telefone e endereço.

Principais limitações para venda:

- Persistência em `localStorage`; os dados ficam apenas no navegador do usuário.
- Senhas em texto puro e autenticação apenas simulada.
- Sem backend, banco de dados, isolamento por clínica/tenant ou controle real de sessão.
- Sem assinatura, cobrança recorrente, trial real, bloqueio por plano ou emissão de notas.
- Sem LGPD operacional: consentimento, auditoria, exportação, exclusão e criptografia em repouso.
- Sem aplicativo real do paciente/profissional; há apenas uma prévia web.
- Integrações reais ainda ausentes ou simuladas: WhatsApp oficial, Google Agenda OAuth, Canva, pagamentos, e-mail transacional.
- Relatórios dependem de `window.print`, não geração robusta de PDF no servidor.
- Sem testes automatizados, CI/CD, observabilidade, backups ou ambiente de produção.

## Benchmark funcional

Com base nas páginas públicas do Dietbox, a categoria de produto precisa cobrir quatro blocos.

Atendimento nutricional:

- Prontuário eletrônico completo.
- Planos alimentares calculados e livres.
- Biblioteca de refeições, alimentos, receitas e substituições.
- Protocolos de antropometria e gasto energético.
- Anamnese, questionário pré-consulta e recordatório.
- Solicitação/interpretação de exames laboratoriais.
- Prescrição de suplementos e fitoterápicos.

Fidelização e aplicativo do paciente:

- Plano alimentar no celular.
- Lista de compras.
- Diário alimentar com fotos.
- Metas e acompanhamento de evolução.
- Alertas de refeições e hidratação.
- Chat e videochamada.
- Agendamento de consultas pelo paciente.
- Receitas e materiais educativos.

Gestão do consultório:

- Agenda online.
- Confirmação e lembretes para reduzir faltas.
- Acesso para secretária com permissões.
- Controle financeiro.
- Relatórios estratégicos.
- Site/perfil público para captação.
- Integrações com WhatsApp e Google Agenda.

Crescimento profissional:

- Templates e materiais educativos.
- Integração/fluxo com Canva ou editor próprio.
- Conteúdos, aulas, lives ou área Academy.
- Comunidade/discussão de casos, se fizer sentido para o posicionamento.

## Arquitetura recomendada

Para virar SaaS, a base precisa sair de arquivos estáticos e `localStorage` para uma aplicação web com backend.

Stack sugerida para acelerar:

- Frontend: Next.js ou React + Vite com TypeScript.
- Backend: NestJS, Fastify ou Next.js API routes.
- Banco: PostgreSQL.
- ORM: Prisma.
- Auth: sessão segura com cookies HTTP-only, MFA opcional e OAuth Google.
- Storage: S3 compatível para fotos, anexos, PDFs e logos.
- Pagamentos: Stripe ou Mercado Pago para recorrência no Brasil.
- E-mail: Resend, SendGrid ou Amazon SES.
- WhatsApp: Meta WhatsApp Cloud API ou provedor oficial.
- Infra: Vercel/Render/Fly.io para app e Supabase/Railway/Neon para Postgres no início.
- Observabilidade: Sentry para erros e logs estruturados.

Modelo multi-tenant obrigatório:

- `organizations`: clínica/conta assinante.
- `users`: nutricionistas, secretárias, administradores.
- `patients`: pacientes vinculados à organização.
- `subscriptions`: plano, status, trial, limite e provider externo.
- Todas as tabelas clínicas devem carregar `organizationId`.
- Permissões devem ser aplicadas no backend, não apenas escondidas no menu.

## Modelo de dados inicial

Entidades essenciais:

- Organização/clínica.
- Usuário e papel: owner, nutricionista, secretária, admin.
- Assinatura, plano, trial e cobrança.
- Paciente, consentimentos LGPD e contatos.
- Consulta/agendamento.
- Prontuário/evolução clínica.
- Anamnese e questionários.
- Plano alimentar, refeições, itens e substituições.
- Alimento, receita, ingrediente e tabela nutricional.
- Medidas corporais, fotos e protocolos.
- Exames laboratoriais e referências.
- Prescrição de suplemento/fitoterápico.
- Diário alimentar, fotos e feedback.
- Hidratação, metas e notificações.
- Chat/mensagens/anexos.
- Transações financeiras.
- Materiais educativos.
- Logs de auditoria.

## Roadmap por fases

### Fase 1 - MVP vendável e seguro

Meta: vender para primeiros nutricionistas sem risco grave de perda de dados.

- Migrar para app com backend e banco PostgreSQL.
- Implementar autenticação real, recuperação de senha e convite de usuários.
- Implementar multi-tenant com isolamento por organização.
- Migrar módulos centrais: pacientes, consultas, prontuário, planos alimentares, alimentos e financeiro.
- Implementar assinatura recorrente com trial e bloqueio por plano.
- Criar área do assinante: plano atual, trocar plano, cancelar e histórico de pagamentos.
- Gerar PDFs reais para plano alimentar e relatório de evolução.
- Criar políticas LGPD: termos, privacidade, consentimento, exportação e exclusão de dados.
- Criar backup automático e ambiente de produção.
- Criar testes mínimos para autenticação, permissão, assinatura e CRUD clínico.

Critério de pronto:

- Um nutricionista cadastra conta, assina, atende pacientes, gera plano/PDF e não perde dados ao trocar de navegador.
- Secretária acessa apenas agenda, pacientes básicos e comunicação permitida.
- Trial expira e a plataforma bloqueia recursos pagos corretamente.

### Fase 2 - Paridade competitiva

Meta: ficar funcionalmente próximo aos grandes players.

- Portal real do paciente com login próprio.
- Diário alimentar com foto, feedback e histórico.
- Metas, hidratação e lembretes.
- Agendamento online público com disponibilidade real.
- Integração Google Agenda via OAuth.
- WhatsApp oficial para confirmação e lembretes.
- Chat com notificações.
- Biblioteca de receitas, refeições favoritas e templates de plano.
- Exames laboratoriais com evolução e parâmetros de referência.
- Relatórios administrativos e clínicos.
- Importação CSV/Excel de pacientes e alimentos.

Critério de pronto:

- O paciente acessa plano, agenda retorno, registra diário e conversa com o nutricionista.
- O nutricionista acompanha engajamento, evolução e financeiro em dashboards confiáveis.

### Fase 3 - Diferenciais para vender melhor

Meta: não ser só "mais um Dietbox", mas uma alternativa com proposta própria.

- Assistente de montagem de plano alimentar com revisão do nutricionista.
- Gerador de substituições por equivalência nutricional e preferências do paciente.
- Editor de materiais educativos com templates próprios.
- Site profissional público do nutricionista.
- Marketplace de materiais, receitas e protocolos.
- Área Academy com conteúdos próprios.
- CRM leve: funil de leads, retorno, reativação e campanhas.
- Score de risco de abandono/no-show.
- App mobile ou PWA instalável para paciente e profissional.

## Cuidados jurídicos e de saúde

O sistema lida com dados sensíveis de saúde, então a fundação precisa ser mais cuidadosa do que um SaaS comum.

- Ter termos de uso, política de privacidade e contrato de operador/controlador.
- Registrar consentimento do paciente e finalidade do tratamento.
- Permitir exportação e exclusão quando aplicável.
- Criptografar dados sensíveis em repouso quando possível.
- Criar log de acesso a prontuário e dados clínicos.
- Incluir aviso de que a ferramenta apoia profissionais habilitados e não substitui decisão clínica.
- Validar textos e fluxos com nutricionista/consultoria jurídica antes de vender em escala.

## Próxima sprint recomendada

Prioridade técnica:

1. Criar novo app com backend, Postgres e autenticação real.
2. Migrar `patients`, `appointments`, `mealplans`, `foods` e `settings`.
3. Implementar planos de assinatura e trial.
4. Colocar o app em produção com domínio, HTTPS, backup e monitoramento.

Prioridade de produto:

1. Ajustar proposta comercial para não prometer recursos que ainda são simulação.
2. Definir três planos simples: Essencial, Profissional e Clínica.
3. Criar uma lista de 5 a 10 nutricionistas beta para testar fluxo real.
4. Validar se o maior diferencial será preço, experiência do paciente, automação ou IA.

