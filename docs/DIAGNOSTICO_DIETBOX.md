# ClinOSTec: diagnóstico para competir com o Dietbox

Revisão técnica em 17/10/2026. Empresa informada pelo responsável: **Egert Sistemas e Consultoria em Alimentos LTDA**, CNPJ **69.642.291/0001-18**.

## Conclusão

O projeto já possui uma base funcional extensa em Next.js, TypeScript, Prisma e PostgreSQL, com APIs, sessões assinadas, armazenamento e integração de assinaturas. O diagnóstico antigo em `SAAS_ROADMAP.md`, que descreve um protótipo exclusivamente estático, não representa mais o código atual.

Há módulos para pacientes, prontuário/anamnese, recordatório, antropometria, gasto energético, alimentos, receitas, planos alimentares, suplementos, exames, agenda, financeiro, indicadores, chat e portal. Existe também um projeto móvel Expo. A presença desses módulos no código não comprova estabilidade operacional, precisão clínica ou publicação nas lojas.

Para disputar clientes com o Dietbox, a prioridade agora é tornar a jornada completa confiável e reduzir o esforço de começar a usar o produto. Acrescentar telas sem validar os fluxos existentes não resolve os principais riscos identificados.

## Referência de mercado

O [site oficial do Dietbox](https://dietbox.me/pt-BR) apresenta planejamento alimentar, aplicativo do paciente e integração com Google Agenda. Os [termos do produto](https://dietbox.me/pt-BR/register/terms) descrevem recursos de acompanhamento, agenda, comunicação, documentos e gestão. A [central de ajuda](https://ajuda.dietbox.me/como-utilizar-o-assistente-dietbox-no-plano-alimentar) também documenta assistência por IA para elaborar planos.

Essa referência orienta as prioridades; não é uma comparação de desempenho medido. Não foram verificadas contas comerciais, preços contratados, qualidade do aplicativo ou disponibilidade por plano do concorrente.

| Frente | Evidência no ClinOSTec | Próximo critério de qualidade |
| --- | --- | --- |
| Atendimento | Pacientes, anamnese, avaliações e planos com APIs e modelos Prisma | Testar consulta completa, edição, impressão e histórico com dados sintéticos |
| Paciente | Portal web e telas móveis para planos, diário, hidratação e chat | Validar acesso, publicação, notificações e desempenho em celulares reais |
| Gestão | Agenda, financeiro, indicadores e equipe | Validar limites dos planos e permissões em todos os endpoints |
| Aquisição | Landing, páginas de recursos, cadastro e teste de 7 dias | Medir cadastro → primeiro paciente → primeiro plano publicado |
| Cobrança | Checkout e webhook do Mercado Pago | Ensaiar assinatura, troca, cancelamento, expiração e eventos duplicados em sandbox |
| Integrações | WhatsApp com abertura de mensagem e impressão pelo navegador | Automatizações oficiais e calendário devem ser tratados como evolução específica |

## Correções realizadas nesta revisão

- Identificação da Egert no rodapé principal, rodapés das páginas de soluções, termos e privacidade, com configuração pública centralizada no componente `company-identity.tsx`.
- Validação dos dígitos de CPF e CNPJ no cadastro da clínica, incluindo CNPJ alfanumérico. A implementação segue o [manual de cálculo da Receita Federal](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj/manual-dv-cnpj.pdf). Isso valida formato e dígitos, não situação cadastral nem titularidade.
- Cartões comerciais alimentados pelo catálogo usado no backend: códigos `essential`, `professional` e `clinic`, valores e limites consistentes. Retirada da oferta anual, pois o checkout implementa cobrança mensal.
- Retirada de afirmações sobre preço, lentidão e avaliações do concorrente sem evidência. A apresentação agora descreve os fluxos do próprio produto.
- Editor público identificado como demonstração com paciente fictícia. As ações deixam de anunciar salvamento, envio ou PDF que não aconteceram.
- API de planos do portal passa a filtrar planos publicados e manter o isolamento por paciente e organização.
- Middleware movido para `src/middleware.ts`, onde o Next.js o inclui no build junto de `src/app`. Ele verifica a assinatura e expiração da sessão e aplica suas restrições também a solicitações Bearer do aplicativo. Sessões profissionais e de pacientes exigem expiração numérica futura.
- Alteração da identidade da clínica e gerenciamento de equipe restritos a titular/administrador. Profissionais comuns deixam de poder se promover pela API; administradores não podem conceder ou alterar titularidade.
- Tratamento de falhas de rede e opção de recarregar as configurações da clínica.
- Testes automatizados locais de documentos, sessões, restrições de acesso, permissões e publicação de planos, sem escrita no banco remoto.

## Prioridades ainda abertas

### Antes de ampliar vendas

1. **Autorização no servidor em toda operação clínica.** Hoje parte importante das restrições está no middleware. As permissões atuais do banco precisam ser conferidas em cada operação, inclusive após troca de papel e com sessões antigas. Cobrir também exportações, anexos e acesso da recepção a informações sensíveis.
2. **Revisão dos cálculos e documentos clínicos.** O editor autenticado e a impressão ainda usam `68 kg` quando o peso não está preenchido (`meal-plans-client.tsx` e `meal-plans/[mealPlanId]/page.tsx`). A impressão também pode exibir “CRN Ativo” sem registro cadastrado e calcula orientação hídrica automaticamente. Remover suposições e validar fórmulas, bases alimentares, arredondamentos e unidades com profissional habilitado antes de prescrição real.
3. **Limites comerciais efetivos.** O catálogo define 50 pacientes no Essencial, mas a criação em `/api/patients` ainda não conta a base para impor esse limite. Implementar a regra com proteção contra cadastros concorrentes e verificar as demais funcionalidades por plano.
4. **Privacidade dos anexos e recuperação.** Revisar o uso de URLs públicas de uploads, permissões de arquivos e parâmetros de bucket/pasta. A recuperação de senha atual encaminha ao suporte por e-mail; falta fluxo de recuperação com token de uso único e expiração.
5. **Continuidade e observabilidade.** Comprovar backup e restauração, logs de falha, monitoramento, execução de migrations e rotina de testes em integração contínua. Não basta haver arquivos de configuração.

### Para melhorar a competitividade

- Jornada inicial guiada: criar paciente, registrar avaliação, montar plano e publicar no portal sem depender da demonstração.
- Migração de pacientes e históricos com prévia, validação e relatório de erros. A importação de medidas corporais existente não equivale a migração completa de pacientes.
- Revisar o aplicativo em aparelhos reais e medir entrega de notificações antes de anunciar disponibilidade comercial nas lojas.
- Evoluir lembretes de consulta com integração oficial e sincronização com calendário; hoje o módulo WhatsApp abre mensagens para envio manual.
- Rever consentimento e carregamento de analytics: o layout inclui Google Analytics quando configurado, enquanto o aviso de cookies oferece apenas ciência.
- Avaliar assistência por IA somente com revisão profissional, rastreabilidade das sugestões e proteção dos dados de saúde.

## Escopo regulatório

O repositório analisado está orientado ao atendimento nutricional clínico. Não foi identificado um módulo completo de rotulagem de alimentos embalados para produtores. Se esse continuar sendo o objetivo comercial, será necessário um fluxo separado para formulação, rendimento, porções, declaração nutricional, advertências, alergênicos e exportação de rótulos, com consulta atualizada às normas aplicáveis da ANVISA. Os módulos clínicos existentes não comprovam essa conformidade.

## Como conferir as alterações

1. Executar `npm test`, `npx tsc --noEmit` e `npm run build`.
2. Abrir `/`, `/recursos`, `/termos-de-uso` e `/politica-de-privacidade` e conferir a identificação institucional.
3. Selecionar cada plano na landing e conferir o código selecionado no cadastro.
4. Abrir `/editor-cardapio` e confirmar a identificação de demonstração.
5. Em staging isolado, testar com titular, administrador, nutricionista, profissional e secretária; publicar um plano e confirmar que rascunhos permanecem fora do portal e do aplicativo.

As variáveis opcionais `NEXT_PUBLIC_COMPANY_LEGAL_NAME` e `NEXT_PUBLIC_COMPANY_CNPJ` permitem substituir os dados institucionais no build. Os dados das clínicas assinantes continuam próprios de cada organização; o CNPJ da Egert não foi gravado nesses cadastros.

Os testes automatizados usam serviços externos simulados. Esta revisão não executou cobranças, migrations, cadastro de pacientes reais, publicação em produção ou certificação regulatória.

## Resultado da validação desta revisão

- `npm test`: 10 testes aprovados.
- `npm run build`: concluído, com checagem de tipos e middleware incluído. Permanecem avisos de lint já existentes sobre dependências de hooks, fontes e imagem.
- Servidor local em modo de produção: identificação da Egert confirmada com HTTP 200 em `/`, `/recursos`, `/termos-de-uso` e `/politica-de-privacidade`.
- Teste HTTP com sessão sintética assinada de secretária: `/api/meal-plans` retornou 403 tanto por cookie como por Bearer. Portal sem autenticação retornou 401. Nenhum registro remoto foi criado.
- Conferência no navegador: botão do Essencial abriu cadastro com “Plano Essencial por 7 dias”; razão social e CNPJ apareceram na política de privacidade.
