# Migração de assinaturas para InfinitePay

Análise em 17/10/2026. Status: **integração de produção ainda não migrada**. Considerada a InfinitePay brasileira, da CloudWalk.

## O que foi verificado

A [central oficial de ajuda](https://ajuda.infinitepay.io/pt-BR/articles/9232324-como-automatizar-cobrancas-com-o-planos-e-recorrencias) documenta criação de planos recorrentes no aplicativo ou painel e compartilhamento de links de inscrição. A cobrança automática no cartão depende da opção disponibilizada e autorizada pelo cliente. A geração periódica de cobrança não deve ser confundida com débito automático.

A [documentação pública do checkout](https://www.infinitepay.io/checkout-documentacao) descreve geração de links para pedidos, consulta de pagamento e notificações de pagamento aprovado. Não foi encontrado nela um contrato de API para criação, consulta, cancelamento e renovação de assinaturas dos planos do painel.

Por isso, substituir a API de assinaturas do Mercado Pago por esse checkout avulso alteraria o funcionamento do produto. Também não é correto utilizar notificações de pedidos como se fossem eventos de uma assinatura recorrente.

## Informações necessárias para definir a implementação

1. Links de inscrição dos três planos mensais criados na conta da Egert: **recebidos e conferidos**. Os vínculos estão registrados em `src/lib/plans.ts`, no campo `infinitePayEnrollment` de cada plano.

   | Código no sistema | Plano | Valor mensal atual |
   | --- | --- | --- |
   | `essential` | Essencial | R$ 39,50 |
   | `professional` | Profissional | R$ 74,50 |
   | `clinic` | Clínica | R$ 124,50 |

2. Requisito confirmado pelo responsável: **ativação e renovação automáticas**. A conciliação manual não é o fluxo solicitado.
3. Se houver acesso de parceiro a uma API de assinaturas, sua documentação oficial: autenticação, identificadores, eventos, assinatura de notificações, repetição de eventos, consulta de estado e cancelamento. Não enviar credenciais pelo chat.

Os links dos três planos permitem encaminhar o cliente para uma assinatura real, mas, sozinhos, não confirmam ao ClinOS quem pagou nem quando o próximo ciclo foi liquidado.

## Integração do RótuloConforme localizada

O projeto foi encontrado em `C:\projetos\meu-site-nutri`. Apenas leitura e testes foram realizados nesse repositório; seus arquivos não foram alterados.

- A implementação fica em `backend/pagamentos-mp/infinitepay.js`, com rotas em `index.js` e instruções em `INFINITEPAY.md`.
- A conta recebedora configurada no código usa a InfiniteTag `rotuloconforme`.
- O serviço cria pedidos próprios em `infinitepay_orders`, utiliza o checkout público e consulta `payment_check` antes de conceder acesso.
- A concessão usa transações do Firestore e controle por identificador de pagamento para impedir liberação duplicada. A duração é adicionada à validade do acesso.
- As rotas dos passes mensais identificam expressamente o produto como não recorrente (`non_recurring` / `monthlyPassNonRecurring`). Não foi encontrado processamento dos ciclos do plano hospedado enviado pelo responsável.
- Os 36 testes de `backend/pagamentos-mp/infinitepay.test.js` passaram com banco e provedor simulados. Eles não comprovam o estado da conta na InfinitePay nem o funcionamento de renovações daquele plano hospedado.

O [link do Essencial](https://invoice.infinitepay.io/plans/rotuloconforme/XazNjh24Wn) foi aberto novamente após o responsável informar a atualização na InfinitePay. Em 17/10/2026, a página passou a exibir **Plano Essencial**, **R$ 39,50 mensais**, cobrança no dia 17 e duração sem fim definido, correspondendo ao valor de `essential` no catálogo do ClinOS. A divergência anterior de R$ 35,50 foi resolvida na InfinitePay; não foi necessário alterar o preço no código. A InfiniteTag `rotuloconforme` identifica a conta recebedora e não implica compartilhar acessos entre os dois softwares.

### Links conferidos para o ClinOS

| Código local | Nome na InfinitePay | Mensalidade | Link de inscrição |
| --- | --- | --- | --- |
| `essential` | Plano Essencial | R$ 39,50 | https://invoice.infinitepay.io/plans/rotuloconforme/XazNjh24Wn |
| `professional` | Plano Pro | R$ 74,50 | https://invoice.infinitepay.io/plans/rotuloconforme/Alkv2ysZ62 |
| `clinic` | Clínica Total | R$ 124,50 | https://invoice.infinitepay.io/plans/rotuloconforme/hWKqLMlZnp |

Os links do Profissional e da Clínica foram conferidos no navegador em 17/10/2026: mensais, sem fim definido e com próxima cobrança apresentada para 17/11/2026. Os três valores correspondem ao catálogo local. Os identificadores e links estão vinculados aos respectivos códigos do ClinOS em `src/lib/plans.ts`. Esse cadastro não altera o provedor do checkout nem habilita confirmação automática das assinaturas.

### Informação necessária da InfinitePay para concluir a automação

Pergunta técnica para encaminhar ao suporte da conta, caso a opção não esteja disponível no painel:

> Os planos hospedados em `invoice.infinitepay.io/plans` permitem notificar meu backend em cada pagamento, renovação, atraso e cancelamento? Preciso da documentação oficial da API ou webhook de assinaturas, da validação de autenticidade dos eventos e de uma forma de identificar o assinante e correlacioná-lo à organização do meu SaaS. A documentação do checkout avulso também se aplica a esses planos? Se sim, como vincular um pedido do meu servidor ao link de inscrição e a cada ciclo?

Não configurar um webhook de compras avulsas como se ele garantisse eventos dos planos hospedados sem esse contrato confirmado. Não há necessidade de enviar credenciais para obter essa documentação.

É possível reaproveitar a abordagem de confirmação, idempotência e auditoria da integração existente. Isso não transforma seu checkout de pedidos em uma API de recorrência. Para o requisito de automação definido, ainda falta uma interface oficial que notifique ou permita consultar os pagamentos dos ciclos desse plano e correlacioná-los à organização do ClinOS.

## Caminhos de implementação

### Integração automática

Depende de uma interface oficial que permita correlacionar a assinatura ou cobrança com a organização do ClinOS e confirmar os eventos no servidor.

- Adaptar o checkout ao contrato oficial de assinaturas disponibilizado para a conta.
- Vincular os identificadores externos à organização e ao plano local.
- Confirmar pagamento no servidor; a volta do navegador ou a abertura de um link não libera acesso.
- Registrar eventos de forma idempotente e reconciliar falhas e entregas fora de ordem.
- Atualizar vigência, inadimplência, cancelamento e reativação segundo o estado confirmado do provedor.
- Validar a primeira cobrança em relação aos 7 dias de teste. Não prometer cobrança adiada sem configuração comprovada no novo provedor.

### Links de planos com conciliação manual

Se esse modelo operacional for aceito, será necessário implementar redirecionamento por plano e uma ferramenta de conciliação restrita ao operador da plataforma. O titular de uma clínica assinante não poderá liberar o próprio acesso como se fosse o operador da Egert.

Essa ferramenta deverá registrar referência do pagamento, período pago, organização beneficiada, operador e histórico. Não existe atualmente um painel de operador com essa finalidade no projeto. Não apresentar esse caminho como renovação automática integrada.

## Pontos do código a adaptar depois de definida a integração

| Local | Responsabilidade |
| --- | --- |
| `src/app/api/checkout/route.ts` | Hoje cria ou altera `PreApproval` do Mercado Pago |
| `src/app/api/billing/subscription/route.ts` | Consulta, sincroniza, cancela e reativa o provedor atual |
| `src/app/api/webhooks/mercadopago/route.ts` | Recebe eventos antigos; precisa continuar isolado por provedor |
| `src/components/billing/billing-client.tsx` | Retorno do checkout, textos, ações e situação da assinatura |
| `src/components/billing/trial-alert.tsx` | Mensagens sobre trial e momento da primeira cobrança |
| `src/lib/subscriptions.ts` | Regras de acesso e expiração |
| `prisma/schema.prisma` | Identificadores externos e eventual histórico de cobranças/eventos |

## Assinaturas existentes

- Inventariar as assinaturas do Mercado Pago antes de qualquer alteração de produção.
- Manter o gerenciamento e as notificações antigas enquanto houver contratos ou pagamentos pendentes naquele provedor.
- Não sobrescrever o identificador de uma assinatura antiga com o de uma nova. Um evento antigo não poderá transformar uma assinatura InfinitePay em Mercado Pago.
- Evitar duas assinaturas cobrando a mesma organização; coordenar a adesão ao novo plano e a interrupção da recorrência anterior.
- Preservar a vigência já paga segundo as condições comerciais definidas.
- Testar sucesso, falha, atraso, cancelamento, troca de plano e notificação duplicada antes da publicação.

Nesta análise não foram criados planos na conta financeira, emitidas cobranças, canceladas assinaturas, alteradas credenciais, executadas migrations ou modificados os fluxos de cobrança em produção.
