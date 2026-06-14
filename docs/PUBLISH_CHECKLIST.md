# Checklist de publicacao do NutreClin

Este checklist deixa a publicacao reproduzivel. Rode em staging antes de apontar o dominio de producao.

## 1. Variaveis obrigatorias

Configure no provedor de deploy:

- `DATABASE_URL`: URL pooler do PostgreSQL.
- `DIRECT_URL`: URL direta do PostgreSQL para migrations.
- `SESSION_SECRET`: chave aleatoria com 32+ caracteres.
- `APP_URL`: URL publica em HTTPS.
- `NODE_ENV=production`.

Valide:

```bash
npm run prod:env
```

## 2. Banco de dados

Gere o client Prisma e aplique migrations no banco remoto:

```bash
npm run prisma:generate
npm run prisma:deploy
```

## 3. Banco de alimentos

Importe a base global de alimentos:

```bash
npm run foods:import
```

Opcionalmente ajuste o volume:

```bash
FOOD_IMPORT_TARGET=1500 npm run foods:import
```

## 4. Build

```bash
npm run build
```

## 5. Health check

Com `APP_URL` apontando para o ambiente publicado:

```bash
npm run prod:health
```

## 6. Smoke test

Rode em staging ou em producao quando puder criar uma conta de teste:

```bash
npm run prod:smoke
```

O smoke test cobre:

- cadastro de organizacao;
- sessao autenticada;
- criacao de paciente;
- criacao e listagem de recordatorio 24h.

## 7. Conferencia manual minima

- Criar conta.
- Entrar e sair.
- Cadastrar paciente com consentimento LGPD.
- Registrar recordatorio 24h.
- Editar, duplicar, imprimir e excluir recordatorio.
- Conferir portal do paciente com codigo de acesso.
- Conferir que cookies estao `HttpOnly` e `Secure` em HTTPS.

## Status atual

O projeto compila localmente. Para liberar publicacao real ainda faltam credenciais reais de producao e execucao dos comandos acima contra o banco remoto.
