# Contexto e Histórico da Integração Backend — Fiscal SC

Este documento registra o contexto técnico, as discussões e todas as decisões tomadas durante a concepção e implementação da camada inicial de backend e integração com banco de dados MongoDB no projeto **Fiscal SC**.

---

## 1. Diagnóstico Inicial do Projeto

* **Framework**: Next.js 15.5.19 (App Router), React 19, TypeScript, Tailwind CSS 4.
* **Estado original**:
  * A aplicação funcionava como um **MVP experimental puramente client-side**.
  * **Dados de domínio**: Estáticos e mockados em arrays TypeScript (`data/content.ts` e `data/municipalities.ts`).
  * **Persistência de estudo/pesquisa**: Centralizada no `StudyProvider` (`components/providers/study-provider.tsx`), salvando dados (condição experimental, perfil do participante, eventos de telemetria) no `localStorage` do navegador.
  * **Exportação**: Geração de arquivo JSON via `Blob` diretamente no navegador.

---

## 2. Decisão de Migração para MongoDB

O usuário optou por utilizar o **MongoDB Atlas** como base de dados e forneceu o snippet padrão da documentação com `require('mongodb')`, `uri` em texto puro e comando `client.close()`.

### Riscos identificados no snippet bruto:
1. **Vazamento de credenciais**: Senhas expostas diretamente no código de versão.
2. **Esgotamento de conexões**: No Next.js em desenvolvimento (Hot Reloading / Fast Refresh), criar novas instâncias de `MongoClient` sem singleton esgota o limite de conexões do cluster.
3. **Fechamento prematuro**: Chamar `client.close()` fecha o pool que deveria ser reaproveitado por requisições subsequentes.

---

## 3. Arquitetura Implementada

Optou-se por uma arquitetura permanente e escalável composta por 4 pilares:

### Pilar 1: Segurança e Variáveis de Ambiente
* Arquivo: `.env.local` (ignorado pelo Git).
* Variáveis configuradas:
  * `MONGODB_URI`: String de conexão ao cluster MongoDB Atlas.
  * `MONGODB_DB`: Nome padrão do banco (ex: `fiscal_sc`).
* **Regra de segurança**: Variáveis sem o prefixo `NEXT_PUBLIC_` são estritamente isoladas no servidor Node.js e nunca chegam ao navegador do cliente.

### Pilar 2: Singleton de Conexão
* Arquivo: `lib/mongodb.ts`
* Padrão oficial recomendado para Next.js:
  * Em **desenvolvimento**, armazena o `clientPromise` no objeto `global` do Node.js, reaproveitando a mesma conexão durante reloads de código.
  * Em **produção**, instancia uma conexão gerenciada com pool padrão.

### Pilar 3: Camada de Acesso a Dados (Data Access Layer - DAL)
* Arquivo: `lib/db.ts`
* Funções e constantes disponibilizadas:
  * `getDatabase(dbName?)`: Retorna a instância do banco a partir da promessa do cliente.
  * `checkDatabaseHealth(dbName?)`: Executa comando `{ ping: 1 }` medindo a latência real em milissegundos.
  * `COLLECTIONS`: Dicionário tipado das coleções do sistema:
    * `EXPENSES`: `"expenses"` (gastos públicos)
    * `BILLS`: `"bills"` (projetos de lei)
    * `MISSIONS`: `"missions"` (missões educativas)
    * `PARTICIPANTS`: `"participants"` (usuários/pesquisa)
    * `EVENTS`: `"events"` (telemetria e logs)

### Pilar 4: Endpoint de Diagnóstico Permanente (Health Check)
* Arquivo: `app/api/health/route.ts`
* Configuração: `export const dynamic = "force-dynamic"` (impede cache estático, executa em tempo real).
* Rota: `GET /api/health`
* Resposta HTTP `200` (OK) ou `503` (Service Unavailable), fornecendo payload estruturado:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-09-14T...",
    "database": {
      "status": "connected",
      "latencyMs": 547,
      "databaseName": "fiscal_sc"
    },
    "environment": "development"
  }
  ```

---

## 4. Validação e Resultados Obtidos

1. **TypeScript Typecheck**:
   * Comando: `npm run typecheck`
   * Resultado: 0 erros de tipos.
2. **Ping Direto ao MongoDB Atlas**:
   * Comunicação e autenticação bem-sucedidas com `{ ok: 1 }` e latência de ~540ms.
3. **Build de Produção**:
   * Comando: `npm run build`
   * Resultado: Rota `ƒ /api/health` compilada como rota dinâmica do servidor.
4. **Execução Local**:
   * Comando: `npm run dev`
   * Chamada HTTP: `GET http://localhost:3000/api/health` retornou status `200 OK`.

---

## 5. Como Funciona o Backend no Next.js (Guia Rápido)

O Next.js é uma aplicação Fullstack que executa código no servidor Node.js. Existem duas formas principais de interagir com o backend:

1. **Route Handlers (`app/api/**/route.ts`)**:
   * Para criar APIs REST tradicionais consumidas por clientes externos ou formulários.
   * Exportam funções com o verbo HTTP correspondente (`GET`, `POST`, `PUT`, `DELETE`).
2. **Server Components (`page.tsx` sem `"use client"`)**:
   * Componentes React que rodam no servidor.
   * Podem importar `getDatabase()` de `lib/db.ts` e buscar dados no MongoDB diretamente antes de gerar o HTML da tela, eliminando a necessidade de `fetch` ou `useEffect`.

---

## 6. Próximos Passos Sugeridos

1. **Script de Seed (Povoamento Inicial)**:
   * Criar um script para ler `data/content.ts` e inserir os dados de despesas, projetos e missões nas respectivas coleções do MongoDB Atlas.
2. **Migração de Páginas**:
   * Conectar páginas como `app/gastos/page.tsx` para consultar a coleção `expenses` do MongoDB via Server Component ou API.
3. **Persistência da Telemetria**:
   * Substituir o `localStorage` do `StudyProvider` por chamadas a uma rota como `app/api/events/route.ts` para persistir dados da pesquisa diretamente no banco.
