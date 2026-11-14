# Relatório de Auditoria Técnica, Arquitetura e Evolução — ProjetoTic (Fiscal.SC)

> **Perfil da Análise:** Revisão Sênior de Engenharia de Software, Arquitetura de Dados Públicos, Performance e Gamificação Cívica.  
> **Última Atualização:** 01 de Novembro de 2026  
> **Escopo:** Monorepo `ProjetoTic` (`Fiscal.SC` — Frontend Next.js 15 + `fiscal-backend` — Worker Node.js/Express/BullMQ/Redis/Socket.IO).

---

## 1. Visão Geral da Arquitetura Atualizada

O **Fiscal.SC** consolidou sua transição de um protótipo estático para uma **plataforma de transparência municipal em tempo real integrada a um motor dinâmico de gamificação cívica**, focada no Poder Executivo de Santa Catarina e com integração ao vivo completa (6 módulos) para a **Prefeitura Municipal de Florianópolis** (Portal e-Pública).

O ecossistema opera em três camadas orquestradas via Docker ([`docker-compose.yml`](file:///f:/Faculdade/ProjetoTic/docker-compose.yml)):

1. **Frontend ([`Fiscal.SC`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC)):** Aplicação Next.js 15 (App Router + React 19 + Tailwind CSS v4) estruturada em:
   - **Painel Executivo Municipal e Estadual (`/gastos`):** Visualização em **7 abas** (`Visão Geral`, `Receitas`, `Despesas & Empenhos`, `Orçamento (LOA)`, `Licitações`, `Contratos` e `Servidores & Folha`), com seletor dinâmico de competência mensal (`Mês/Ano`), paginação progressiva no cliente e gráficos proporcionais.
   - **Motor de Gamificação Cívica ([`StudyProvider`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/components/providers/study-provider.tsx)):** Progressão real iniciando no **Nível 1 (0 XP)**, missões práticas conectadas aos dados reais de Florianópolis, bônus automático de XP por exploração de abas/empenhos, notificações visuais flutuantes (*XP Toast*) e 6 medalhas dinâmicas.
   - **Proxy Seguro de Documentos Oficiais ([`app/api/download/route.ts`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/app/api/download/route.ts)):** Rota server-side com *whitelist* anti-SSRF e renovação dinâmica de links temporários OCI PAR para download de editais em PDF.
2. **Backend Worker & BFF ([`fiscal-backend`](file:///f:/Faculdade/ProjetoTic/fiscal-backend)):** Serviço em Express 5 + TypeScript que atua como *Backend-for-Frontend* (BFF) e processador assíncrono:
   - Padrão **Adapter** ([`CityAdapter`](file:///f:/Faculdade/ProjetoTic/fiscal-backend/src/adapters/cityAdapter.interface.ts) / [`FlorianopolisAdapter`](file:///f:/Faculdade/ProjetoTic/fiscal-backend/src/adapters/florianopolisAdapter.ts)) para integração com a API pública municipal.
   - Proteção contra *rate-limiting* via **BullMQ** (400 req/min) e **Single-Flight Pattern** (`inProgressCompilations` em [`dashboardService.ts`](file:///f:/Faculdade/ProjetoTic/fiscal-backend/src/services/dashboardService.ts)).
   - Entrega progressiva em duas fases via **Socket.IO** (`dashboard_partial` em ~2s a 3s com os 5 módulos rápidos, seguido de `dashboard_result` quando o enriquecimento de licitações conclui), suportando *payloads* de até **20 MB**.
3. **Camada de Cache e Mensageria (`Redis`):** Armazena pacotes consolidados (`dashboard_v4_*`) com chaves determinísticas ordenadas (`stableStringify`), garantindo *Cache Hit* em **< 50ms** nas consultas subsequentes.

---

## 2. Histórico Completo do Que Foi Trabalhado Hoje (01/11/2026)

Durante a sessão de engenharia de hoje, todas as frentes críticas da auditoria original foram resolvidas e novas funcionalidades estruturais foram implementadas:

### 2.1. Saneamento Arquitetural, Remoção de Código Morto e Telas Fora de Escopo
- **Remoção de Telas Descontinuadas:** Foram excluídas do projeto as rotas e diretórios:
  - `Fiscal.SC/app/projetos` (antiga tela estática do Legislativo)
  - `Fiscal.SC/app/teste-db` (laboratório de teste de banco de dados)
  - `Fiscal.SC/app/teste-api` (tela de diagnóstico bruto da API)
  - Todos os links e referências a essas páginas foram removidos de [`app-shell.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/components/layout/app-shell.tsx), [`executive-header.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/components/executive/header/executive-header.tsx) e [`executive-footer.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/components/executive/footer/executive-footer.tsx).
- **Exclusão de Componentes e Configurações Órfãs:**
  - Removidos `Fiscal.SC/next.config.mjs` (arquivo vazio que conflitava com `next.config.ts`), `Fiscal.SC/components/executive/executive-dashboard.tsx` e `Fiscal.SC/components/executive/aside/executive-aside.tsx`.
  - Removidas funções mortas e normalizadores duplicados em [`Fiscal.SC/lib/transparencia-service.ts`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/lib/transparencia-service.ts), mantendo apenas a tipagem forte e o consumo via `fetchExecutiveDashboard`.
  - Limpeza de ~30 classes CSS legadas em [`Fiscal.SC/app/globals.css`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/app/globals.css).
- **Correções de Infraestrutura e Segurança:**
  - Padronizada a variável `NEXT_PUBLIC_WORKER_URL=http://localhost:3001` no [`docker-compose.yml`](file:///f:/Faculdade/ProjetoTic/docker-compose.yml).
  - Adicionada proteção contra **SSRF** (validação estrita de *hostnames* permitidos) e renovação de links com período dinâmico em [`app/api/download/route.ts`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/app/api/download/route.ts).
  - Implementado `stableStringify` em [`cityApiService.ts`](file:///f:/Faculdade/ProjetoTic/fiscal-backend/src/services/cityApiService.ts) e [`queryController.ts`](file:///f:/Faculdade/ProjetoTic/fiscal-backend/src/controllers/queryController.ts) para geração determinística de hashes MD5 no Redis.

### 2.2. Expansão Completa do Painel Executivo (6 Módulos Oficiais + Seletor de Competência)
- **Integração dos 6 Endpoints no Pacote Consolidado ([`dashboardService.ts`](file:///f:/Faculdade/ProjetoTic/fiscal-backend/src/services/dashboardService.ts)):**
  - Além de `despesa`, `contrato`, `licitacao` e `receita`, o backend passou a consultar e normalizar simultaneamente **`pessoal`** (`PessoalItem` com proventos brutos, descontos, líquido e rubricas) e **`despesaOrcamentaria`** (`OrcamentoItem` com função, subfunção, programa, ação, fonte de recurso e valores empenhado/liquidado/pago).
- **Seletor de Competência Mensal (`Mês` + `Ano`):**
  - Adicionado na barra de navegação [`executive-tabs-nav.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/components/executive/tabs/executive-tabs-nav.tsx), permitindo consultar qualquer mês/ano (ex: `01/2024` a `12/2025`) com cálculo automático do último dia do mês e limpeza correta de estado em [`use-florianopolis-transparencia.ts`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/hooks/use-florianopolis-transparencia.ts).

### 2.3. Escalonamento de Volume de Dados (Opção A — Alta Velocidade)
- Realizado estudo de capacidade da API e-Pública e implementada a **Opção A (Escalonamento equilibrado com entrega rápida)**:
  - `despesa` (Empenhos): aumentado de 50 para **1.000 registros** por consulta.
  - `despesaOrcamentaria` (Orçamento LOA): aumentado de 100 para **1.000 dotações**.
  - `receita` (Rubricas de Receita): **1.000 registros** do mês selecionado.
  - `pessoal` (Folha de Pagamento): aumentado de 100 para **500 folhas de servidores**.
  - `contrato` (Contratos Vigentes): aumentado de 50 para **200 contratos**.
  - `licitacao` (Licitações com itens/editais): mantido em **50 processos** (devido ao *fan-out* de sub-requisições por processo).
- **Ajustes de Transporte e Renderização:**
  - Aumentado `maxHttpBufferSize` do Socket.IO ([`io.ts`](file:///f:/Faculdade/ProjetoTic/fiscal-backend/src/socket/io.ts)) e `express.json` ([`index.ts`](file:///f:/Faculdade/ProjetoTic/fiscal-backend/src/index.ts)) para **20 MB**.
  - Adicionada paginação progressiva no cliente (`visibleCount = 25` + botões *"Carregar +50"* e *"Exibir todos"*) em [`despesas-tab.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/components/executive/tabs/despesas-tab.tsx), [`orcamento-tab.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/components/executive/tabs/orcamento-tab.tsx) e [`pessoal-tab.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/components/executive/tabs/pessoal-tab.tsx) para manter a rolagem fluida mesmo com 1.000 itens em memória.

### 2.4. Rigor Contábil nas Despesas e Receitas Públicas (Lei nº 4.320/64) e Escopo Mensal Único
- **Separação dos 3 Estágios da Despesa Pública ([`dashboardService.ts`](file:///f:/Faculdade/ProjetoTic/fiscal-backend/src/services/dashboardService.ts) & [`despesas-tab.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/components/executive/tabs/despesas-tab.tsx)):**
  - Corrigido o cálculo anterior que somava todos os movimentos indistintamente.
  - Agora cada empenho separa rigorosamente: **`valorPago`** (Pagamento — estágio principal em destaque nos cards e KPIs do dashboard), **`valorLiquidado`** (Liquidação) e **`valorEmpenhado`** (Emissão de empenho).
  - Empenhos com pagamento efetivo (`valorPago > 0`) são priorizados no topo das listagens, e os demais valores (`Liquidado` e `Empenhado`) aparecem em badges secundárias informativas.
- **Nova Aba de Receitas e Cálculo Líquido de Arrecadação ([`receitas-tab.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/components/executive/tabs/receitas-tab.tsx)):**
  - Removido o cálculo trimestral de 3 meses para que todo o dashboard reflita **exatamente o mês único selecionado** na competência.
  - Criado o normalizador `normalizeReceitas` em [`dashboardService.ts`](file:///f:/Faculdade/ProjetoTic/fiscal-backend/src/services/dashboardService.ts), que separa o **Valor Arrecadado Líquido** (`Arrecadação de receita` menos estornos, restituições e deduções como FUNDEB) da **Previsão Orçamentária (LOA)** (`Previsão de receita` / `Previsão atualizada`), evitando que metas anuais previstas inflacionem a arrecadação real do mês.
  - Criada a nova aba dedicada **[`receitas-tab.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/components/executive/tabs/receitas-tab.tsx)** com KPIs de Arrecadação Líquida, Previsão LOA, Deduções/FUNDEB, filtro de busca/categoria, paginação e histórico expansível de lançamentos por rubrica.

### 2.5. Refinamento Visual e de Usabilidade do Dashboard Executivo
- **Remoção de Gráficos de Linha Decorativos:** Removidos os `Sparkline` estáticos dos cards de métricas ([`metric-card.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/components/executive/metrics/metric-card.tsx), [`executive-metric-cards.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/components/executive/metrics/executive-metric-cards.tsx) e [`overview-tab.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/components/executive/tabs/overview-tab.tsx)).
- **Destaque para o Gráfico de Rosca e Listas Expandidas ([`overview-tab.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/components/executive/tabs/overview-tab.tsx)):**
  - Removido o card lateral de *"Telemetria & 6 Módulos"* e expandido o card de **Despesas Pagas por Órgão/Área** (`lg:col-span-7`), aumentando o anel do gráfico de rosca para `210px` com legenda detalhada (valores em R$, barra proporcional e percentual).
  - Aumentado o comprimento de scroll (`max-h-[340px]` / `max-h-[380px]`) e a quantidade de itens visíveis (15 itens por card) em todos os resumos da Visão Geral (*Arrecadação vs Pagamentos*, *Empenhos*, *Licitações*, *Contratos*, *LOA* e *Folha*).

### 2.6. Implementação Completa da Gamificação Cívica Conectada ao Executivo
- **9 Novas Missões Práticas do Executivo de Florianópolis ([`data/content.ts`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/data/content.ts)):**
  - Substituídas todas as missões antigas por 9 desafios reais baseados nos módulos do portal e-Pública (`missao-receitas`, `missao-despesas`, `missao-orcamento`, `missao-licitacoes`, `missao-contratos`, `missao-pessoal`, `missao-competencia`, `missao-compartilhar`, `missao-lai`), cada uma com explicação técnica no Passo 1, link direto para a aba correspondente (`?tab=...`) e quiz de verificação no Passo 2.
- **Progressão Real a partir do Nível 1 (0 XP) + XP Toast ([`study-provider.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/components/providers/study-provider.tsx)):**
  - O usuário inicia no **Nível 1 (0 XP — *Cidadão Iniciante*)** e sobe de nível a cada **250 XP** (*Observador Municipal* → *Fiscal de Dados* → *Auditor Cívico* → *Guardião da Transparência SC*).
  - **Recompensas Automáticas por Exploração:** Visitar pela primeira vez cada uma das 6 abas de Florianópolis concede **+25 XP**, expandir os movimentos de um empenho concede **+30 XP**, e alterar a competência ou compartilhar o painel concede **+20 XP**, exibindo uma notificação flutuante (*XP Toast*) no canto inferior direito.
- **6 Medalhas Dinâmicas (`ACHIEVEMENTS`) e Central de Missões 100% Funcional:**
  - Filtros por categoria, abas de status (`Disponíveis`, `Em andamento`, `Concluídas`), ordenação (`Relevância`, `Mais pontos`, `Mais rápidas`) e o desafio **Missão Especial da Semana** (*concluir 5 missões para ganhar +250 XP*) estão 100% funcionais em [`app/missoes/page.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/app/missoes/page.tsx), [`app/progresso/page.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/app/progresso/page.tsx) e [`app/page.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/app/page.tsx) (sem ranking competitivo, conforme definido no escopo).
  - Adicionados botões em **Meu Perfil ([`app/pesquisa/page.tsx`](file:///f:/Faculdade/ProjetoTic/Fiscal.SC/app/pesquisa/page.tsx))** para *"Zerar Progresso (Nível 1 / 0 XP)"* ou *"Simular Progresso Demo"* durante apresentações e bancas avaliadoras.

---

## 3. Estado Atual de Qualidade e Próximos Passos Opcionais

- **Verificação Estática (`tsc --noEmit`):** Tanto o frontend (`Fiscal.SC`) quanto o backend (`fiscal-backend`) compilam com **0 erros de TypeScript**.
- **Evoluções Futuras (Backlog Pós-MVP):**
  1. **Persistência Remota da Gamificação:** Caso o estudo acadêmico exija centralizar os logs de todos os participantes sem depender da exportação JSON local (`observa-sc-eventos.json`), conectar os eventos do `StudyProvider` a uma rota de gravação no backend/banco.
  2. **Novos Adapters Municipais:** Utilizar a interface [`CityAdapter`](file:///f:/Faculdade/ProjetoTic/fiscal-backend/src/adapters/cityAdapter.interface.ts) já pronta no `fiscal-backend` para plugar outras prefeituras catarinenses que utilizam o sistema Pública/e-Pública ou Betha.
