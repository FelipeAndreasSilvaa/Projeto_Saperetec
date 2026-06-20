# FieldOps Lite API

API desenvolvida como parte do desafio técnico da FieldOps para gerenciamento de ordens de serviço.

O objetivo do projeto é simular um cenário real de manutenção em campo, com diferentes perfis de acesso, regras de negócio, auditoria de eventos, concorrência otimista e integração via webhook.

## Tecnologias utilizadas

* Node.js
* NestJS
* TypeScript
* PostgreSQL
* Prisma ORM
* JWT
* Jest
* Docker (opcional)

## Funcionalidades implementadas

### Autenticação

* Login com JWT
* Registro de usuários
* Claims do token: `sub`, `role` e `teamId`

### Controle de acesso

Cada perfil possui escopos específicos:

* **technician:** acessa apenas ordens atribuídas a ele dentro da sua equipe
* **supervisor:** acessa todas as ordens da sua equipe
* **admin:** acesso global

### Ordens de serviço

* Criação de ordens de serviço
* Listagem paginada com filtros
* Detalhamento por ID
* Atualização de status
* Histórico de auditoria

### Regras de negócio

* Fluxo de status:

```text
open → in_progress → done
in_progress → open
```

* `assigneeId` obrigatório para iniciar uma ordem
* Apenas técnicos podem ser responsáveis por ordens
* Técnico deve pertencer à mesma equipe da OS
* `resolutionNotes` obrigatório para concluir uma ordem
* Ordens com prioridade `high` só podem ser concluídas por `supervisor` ou `admin`
* Retorno para `open` permitido apenas quando houver itens pendentes no checklist

### Auditoria

Toda mudança de status gera um evento em `flx_work_order_events`.

### Concorrência otimista

Atualizações de status exigem o envio da propriedade `version`.

Caso a versão enviada esteja desatualizada, a API retorna:

```http
409 Conflict
```

com o código:

```text
FLX_CONCURRENT_UPDATE
```

### Webhooks

Após uma mudança de status bem-sucedida, a API envia um webhook contendo:

* `workOrderId`
* `fromStatus`
* `toStatus`
* `actorId`
* `occurredAt`

A assinatura é gerada utilizando HMAC-SHA256.

## Estrutura do projeto

```text
src/
├── auth/
├── users/
├── work-orders/
├── webhook/
├── prisma/
├── common/
└── health/
```

## Configuração do ambiente

### Pré-requisitos

* Node.js 20+
* PostgreSQL 15+
* pnpm

### Instalação

Clone o repositório:

```bash
git clone <url-do-repositorio>

cd api
```

Instale as dependências:

```bash
pnpm install
```

Crie o arquivo `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fieldops"

JWT_SECRET="super-secret-key"
JWT_EXPIRES_IN="1d"

WEBHOOK_URL=""
WEBHOOK_SECRET=""
```

Execute as migrations:

```bash
npx prisma migrate deploy
```

Execute o seed:

```bash
npx prisma db seed
```

Inicie a aplicação:

```bash
pnpm run start:dev
```

A API estará disponível em:

```text
http://localhost:3000
```

## Banco de testes

Os testes utilizam um banco dedicado.

Crie um arquivo `.env.test`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fieldops_test"

JWT_SECRET="super-secret-key"
JWT_EXPIRES_IN="1d"

WEBHOOK_URL=""
WEBHOOK_SECRET=""
```

Execute as migrations:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/fieldops_test" npx prisma migrate deploy
```

Execute o seed:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/fieldops_test" npx prisma db seed
```

## Usuários de seed

| Email                                                           | Senha       | Role       | Team       |
| --------------------------------------------------------------- | ----------- | ---------- | ---------- |
| [tech-a@fieldops.eval](mailto:tech-a@fieldops.eval)             | password123 | technician | team-alpha |
| [tech-b@fieldops.eval](mailto:tech-b@fieldops.eval)             | password123 | technician | team-beta  |
| [supervisor-a@fieldops.eval](mailto:supervisor-a@fieldops.eval) | password123 | supervisor | team-alpha |
| [admin@fieldops.eval](mailto:admin@fieldops.eval)               | password123 | admin      | —          |

## Executando os testes

```bash
pnpm run test:e2e
```

Atualmente o projeto possui testes cobrindo:

* autenticação
* criação de ordens
* transições de status
* validações de negócio
* concorrência otimista
* histórico de auditoria

## Endpoints principais

### Auth

```http
POST /auth/register
POST /auth/login
```

### Work Orders

```http
POST   /work-orders
GET    /work-orders
GET    /work-orders/:id
PATCH  /work-orders/:id
GET    /work-orders/:id/history
```

### Health Check

```http
GET /health
```

## Decisões arquiteturais (ADRs)

### ADR 001 — Concorrência otimista

Foi adotado controle de concorrência baseado em versionamento.

Essa abordagem evita bloqueios no banco de dados e simplifica o controle de conflitos entre usuários simultâneos.

### ADR 002 — Escopo por papel no backend

As regras de acesso são aplicadas no backend por meio do método `buildScope()`.

Essa decisão evita que restrições dependam exclusivamente do frontend.

### ADR 003 — Auditoria desacoplada

O histórico de mudanças é armazenado em uma tabela específica (`flx_work_order_events`).

Isso permite rastreabilidade sem alterar a estrutura principal da ordem de serviço.

## Limitações conhecidas

* O endpoint `DELETE /work-orders/:id` não foi implementado.
* O webhook ainda não possui mecanismo de reenvio automático.
* O parâmetro `sort` suporta apenas ordenação por data de criação.
* Não há interface frontend nesta entrega.

## Próximos passos

* Implementar frontend em React
* Adicionar documentação OpenAPI
* Configurar CI/CD com GitHub Actions
* Adicionar Docker Compose
* Implementar retentativas para webhooks
* Criar monitoramento e métricas

## Uso de IA

O projeto foi desenvolvido com apoio de ferramentas de assistência por IA para geração de boilerplate, revisão de código e discussão de decisões arquiteturais.

Todas as sugestões foram revisadas, adaptadas e validadas manualmente.
