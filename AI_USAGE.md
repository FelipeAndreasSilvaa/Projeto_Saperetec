# AI_USAGE.md

## Ferramentas utilizadas

Durante o desenvolvimento deste projeto, utilizei as seguintes ferramentas de apoio:

* ChatGPT (discussão de arquitetura, revisão de código e geração de boilerplate)
* Codex(Para me auxiliar nos erros que davam no terminal)
* VS Code (IDE principal)
* Prisma Studio e DBeaver (inspeção e validação dos dados)

As ferramentas de IA foram utilizadas como apoio ao desenvolvimento, não como substituição do entendimento técnico ou da validação manual.

---

## O que foi gerado automaticamente e revisado manualmente

As seguintes partes tiveram apoio de ferramentas de IA:

* Configuração inicial do Prisma e definição de relacionamentos
* Criação do filtro global de exceções com `flxTraceId`
* Estrutura inicial dos testes E2E com Jest e Supertest
* Geração inicial do serviço de webhook e assinatura HMAC
* Sugestões de mensagens de commit e nomes de branches

Todos os trechos gerados foram revisados, adaptados e testados manualmente.

Em vários casos, o código sugerido precisou ser ajustado para atender às regras específicas do desafio, principalmente relacionadas a:

* escopo por papel (`technician`, `supervisor`, `admin`);
* transições de status;
* concorrência otimista;
* auditoria de eventos;
* validações de negócio.

---

## Decisão técnica em que discordei da sugestão automática

Uma das sugestões recebidas foi utilizar UUIDs fixos nos testes E2E para identificar usuários técnicos.

Optei por não seguir essa abordagem porque ela cria dependência entre os testes e dados específicos do banco.

Em vez disso, os testes consultam o banco de teste para obter dinamicamente o usuário adequado, utilizando critérios como `role` e `teamId`.

Essa decisão tornou os testes menos frágeis e mais fáceis de manter caso os dados do seed sejam alterados.

Outra sugestão descartada foi utilizar um único banco de dados para desenvolvimento e testes. Preferi criar um banco dedicado (`Projeto_Sapere_test`) para garantir isolamento, previsibilidade e evitar perda acidental de dados.

---

## Partes desenvolvidas sem assistência

As seguintes atividades foram realizadas sem geração automática de código:

* Modelagem inicial das entidades a partir do enunciado
* Definição do fluxo de trabalho das ordens de serviço
* Configuração do ambiente local
* Criação e gerenciamento das branches `feature/*`
* Execução manual de testes no Postman
* Validação dos cenários de negócio
* Organização dos commits e merges
* Configuração e execução das migrations e seeds
* Revisão final do código e correção de bugs encontrados durante os testes
* Desenvolvimento do endpoint users e auth

---

## Limitações conhecidas da entrega

No momento da entrega, permanecem as seguintes limitações:

* O frontend React ainda não foi implementado.
* O endpoint `DELETE /work-orders/:id` é opcional e não foi implementado.
* O webhook não possui mecanismo de reenvio automático.
* O webhook ainda não evita o processamento duplicado de um mesmo evento.

- O parâmetro `sort` possui suporte limitado.
- Docker Compose e GitHub Actions ainda não foram configurados.
- A documentação OpenAPI/Swagger não foi adicionada.

Essas limitações foram priorizadas em função do prazo e da ênfase nas regras de negócio do backend.
