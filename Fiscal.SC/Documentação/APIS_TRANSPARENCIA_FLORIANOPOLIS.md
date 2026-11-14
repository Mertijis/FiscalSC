# Especificação e Transcrição das APIs de Transparência — Florianópolis (e-Pública)

Este documento registra a análise técnica de engenharia reversa e a transcrição completa das chamadas de API do **Portal da Transparência de Florianópolis** (plataforma **e-Pública**), com foco nos módulos de **Dados Abertos** úteis para ingestão e integração com o projeto **Fiscal SC**.

---

## 1. Arquitetura da Plataforma e-Pública

O portal da transparência (`https://transparencia.e-publica.net/epublica-portal/`) é uma SPA (*Single Page Application*) desenvolvida em AngularJS com `ui-router`. 

Ao acessar as páginas sob a rota `#/florianopolis/portal/dadosAbertos/*View`, ocorrem **dois níveis de chamadas de API**:

1. **Chamadas Internas da Interface (Frontend SPA $\to$ Backend):**
   * Realizadas pelo controlador interno (`FormCtrl`).
   * Finalidade: buscar a estrutura de tela, campos do formulário e metadados de documentação interativa.
   * Método: `POST` enviando payload `{"mode": "INFO"}` e recebendo os metadados da view.

2. **API Pública de Dados Abertos (REST v1):**
   * As URLs e contratos documentados pela própria plataforma para acesso programático a **dados puros** em formato JSON.
   * Método: `GET` com paginação e filtros por período e unidade gestora.
   * Não requer autenticação prévia (aberto ao público).

---

## 2. Mapeamento Geral dos Endpoints

| Módulo / Recurso | URL no Navegador (SPA) | Chamada Interna da Interface (Form) | Endpoint da API Pública de Dados (v1) |
| :--- | :--- | :--- | :--- |
| **Receita** | `.../dadosAbertos/receitaView` | `POST /rest/florianopolis/dadosAbertos/receita/form` | `GET /rest/florianopolis/api/v1/receita` |
| **Despesa (Execução)** | `.../dadosAbertos/despesaView` | `POST /rest/florianopolis/dadosAbertos/despesa/form` | `GET /rest/florianopolis/api/v1/despesa` |
| **Despesa Orçamentária** | `.../dadosAbertos/despesaOrcamentariaView` | `POST /rest/florianopolis/dadosAbertos/despesaOrcamentaria/form` | `GET /rest/florianopolis/api/v1/despesaOrcamentaria` |
| **Licitação** | `.../dadosAbertos/licitacaoView` | `POST /rest/florianopolis/dadosAbertos/licitacao/form` | `GET /rest/florianopolis/api/v1/licitacao` |
| **Contrato** | `.../dadosAbertos/contratoView` | `POST /rest/florianopolis/dadosAbertos/contrato/form` | `GET /rest/florianopolis/api/v1/contrato` |
| **Gestão de Pessoal** | `.../dadosAbertos/gestaoPessoalView` | `POST /rest/florianopolis/dadosAbertos/gestaoPessoal/form` | `GET /rest/florianopolis/api/v1/pessoal` |

> **Base URL padrão:** `https://transparencia.e-publica.net/epublica-portal`

---

## 3. Chamadas Internas da Interface (Frontend SPA)

Para renderizar cada página de visualização informada pelo usuário, o portal executa a chamada abaixo:

### 3.1. Especificação do Request da Interface
* **Método HTTP:** `POST`
* **Query Params:** `?entidade=2002` *(código da entidade padrão de Florianópolis)*
* **Headers:**
  ```http
  Content-Type: application/json;charset=UTF-8
  Accept: application/json, text/plain, */*
  ```
* **Body:**
  ```json
  {
    "mode": "INFO"
  }
  ```

### 3.2. URLs de cada Módulo
1. **Receita View:**
   `https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/dadosAbertos/receita/form?entidade=2002`
2. **Despesa View:**
   `https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/dadosAbertos/despesa/form?entidade=2002`
3. **Despesa Orçamentária View:**
   `https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/dadosAbertos/despesaOrcamentaria/form?entidade=2002`
4. **Licitação View:**
   `https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/dadosAbertos/licitacao/form?entidade=2002`
5. **Contrato View:**
   `https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/dadosAbertos/contrato/form?entidade=2002`
6. **Gestão de Pessoal View:**
   `https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/dadosAbertos/gestaoPessoal/form?entidade=2002`

---

## 4. Transcrição Completa da API Pública de Dados Abertos (v1 REST)

Esta é a API recomendada para ser consumida pelos scripts de ingestão e tarefas de ETL do **Fiscal SC**.

---

### 4.1. Receita

Consulta aos dados de arrecadação e receitas públicas municipais.

* **Endpoint:** `GET https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/api/v1/receita`
* **Parâmetros:**

| Parâmetro | Tipo | Formato | Obrigatório | Descrição |
| :--- | :--- | :--- | :---: | :--- |
| `periodo_inicial` | String | `mm/aaaa` | **Sim** | Mês e ano inicial para a consulta (ex: `01/2024`) |
| `periodo_final` | String | `mm/aaaa` | **Sim** | Mês e ano final para a consulta (ex: `01/2024`) |
| `codigo_unidade` | Inteiro | Numérico | Não | Código da unidade gestora (`0` para todas) |
| `inicio_registro` | Inteiro | Numérico | Não | Índice inicial do registro para paginação (base 0) |
| `quantidade_registro` | Inteiro | Numérico | Não | Quantidade de registros a retornar |

* **Exemplo cURL:**
  ```bash
  curl -X GET "https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/api/v1/receita?periodo_inicial=01/2024&periodo_final=01/2024&quantidade_registro=10" \
       -H "Accept: application/json"
  ```

* **Estrutura dos Dados de Retorno (`registros[].registro`):**
  * `unidadeGestora`: Código e denominação.
  * `exercicio`: Ano orçamentário.
  * `contaReceita`: Código estruturado e descrição da classificação da receita.
  * `recurso`: Código e denominação da fonte de recurso.
  * `valorPrevisto`: Valor orçado.
  * `valorArrecadado`: Valor total recolhido.
  * `listArrecadacoes`: Detalhamento de cada lançamento com data e valor arrecadado.

---

### 4.2. Despesa (Execução da Despesa)

Consulta aos dados puros de execução da despesa (empenhos, liquidações, pagamentos e credores).

* **Endpoint:** `GET https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/api/v1/despesa`
* **Parâmetros:**

| Parâmetro | Tipo | Formato | Obrigatório | Descrição |
| :--- | :--- | :--- | :---: | :--- |
| `periodo_inicial` | String | `mm/aaaa` | **Sim** | Mês e ano inicial para a consulta (ex: `01/2024`) |
| `periodo_final` | String | `mm/aaaa` | **Sim** | Mês e ano final para a consulta (ex: `01/2024`) |
| `codigo_unidade` | Inteiro | Numérico | Não | Código da unidade gestora |
| `inicio_registro` | Inteiro | Numérico | Não | Índice de início para paginação |
| `quantidade_registro` | Inteiro | Numérico | Não | Quantidade de registros por requisição |

* **Exemplo cURL:**
  ```bash
  curl -X GET "https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/api/v1/despesa?periodo_inicial=01/2024&periodo_final=01/2024&quantidade_registro=10" \
       -H "Accept: application/json"
  ```

* **Estrutura dos Dados de Retorno (`registros[].registro`):**
  * `numeroEmpenho`, `dataEmpenho`, `anoEmpenho`.
  * `tipoEmpenho`: Ordinário, Estimativo, Global.
  * `favorecido`: Nome/Razão social e CPF/CNPJ mascarado.
  * `historico`: Descrição da despesa.
  * `valorEmpenhado`, `valorLiquidado`, `valorPago`, `valorAnulado`.
  * `listLiquidacoes`: Lotes de liquidação.
  * `listPagamentos`: Registros de ordens bancárias e pagamentos efetuados.

---

### 4.3. Despesa Orçamentária

Consulta à previsão e dotação orçamentária das despesas públicas.

* **Endpoint:** `GET https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/api/v1/despesaOrcamentaria`
* **Parâmetros:**

| Parâmetro | Tipo | Formato | Obrigatório | Descrição |
| :--- | :--- | :--- | :---: | :--- |
| `periodo_inicial` | String | `mm/aaaa` | **Sim** | Mês e ano inicial para consulta |
| `periodo_final` | String | `mm/aaaa` | **Sim** | Mês e ano final para consulta |
| `codigo_unidade` | Inteiro | Numérico | Não | Código da unidade gestora |
| `inicio_registro` | Inteiro | Numérico | Não | Índice de início para paginação |
| `quantidade_registro` | Inteiro | Numérico | Não | Quantidade de registros por requisição |

* **Exemplo cURL:**
  ```bash
  curl -X GET "https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/api/v1/despesaOrcamentaria?periodo_inicial=01/2024&periodo_final=01/2024&quantidade_registro=10" \
       -H "Accept: application/json"
  ```

* **Estrutura dos Dados de Retorno (`registros[].registro`):**
  * `orgao`, `unidadeOrcamentaria`.
  * `funcao`, `subfuncao`, `programa`, `acao` (classificação funcional-programática).
  * `naturezaDespesa`: Elemento de despesa estruturado.
  * `saldoInicial`, `suplementacao`, `reducao`, `saldoAtual`.

---

### 4.4. Licitação

Consulta aos dados puros das licitações e editais municipais.

* **Endpoint:** `GET https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/api/v1/licitacao`
* **Parâmetros:**

| Parâmetro | Tipo | Formato | Obrigatório | Descrição |
| :--- | :--- | :--- | :---: | :--- |
| `periodo_inicial` | String | `dd/mm/aaaa` | **Sim** | Data completa inicial (ex: `01/01/2024`) |
| `periodo_final` | String | `dd/mm/aaaa` | **Sim** | Data completa final (ex: `15/01/2024`) |
| `codigo_unidade` | Inteiro | Numérico | Não | Código da unidade gestora |
| `inicio_registro` | Inteiro | Numérico | Não | Posição inicial de paginação |
| `quantidade_registro` | Inteiro | Numérico | Não | Limite de registros |

> **Atenção:** Neste endpoint, a data utiliza formato diário (`dd/mm/aaaa`). Recomenda-se realizar requisições em intervalos curtos (ex: quinzenais ou mensais) para evitar *timeout* no banco de dados da prefeitura.

* **Exemplo cURL:**
  ```bash
  curl -X GET "https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/api/v1/licitacao?periodo_inicial=01/01/2024&periodo_final=15/01/2024&quantidade_registro=10" \
       -H "Accept: application/json"
  ```

* **Estrutura dos Dados de Retorno (`registros[].registro`):**
  * `numeroProcesso`, `numeroEdital`, `ano`.
  * `modalidade`: Pregão Eletrônico, Concorrência, Dispensa, etc.
  * `situacao`: Homologada, Em Andamento, Revogada, etc.
  * `objeto`: Resumo descritivo da licitação.
  * `valorEstimado`, `valorHomologado`.
  * `listLotes` e `listItens`: Itens licitados, quantidades e vencedores.

---

### 4.5. Contrato

Consulta aos contratos administrativos firmados e aditivos.

* **Endpoint:** `GET https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/api/v1/contrato`
* **Parâmetros:**

| Parâmetro | Tipo | Formato | Obrigatório | Descrição |
| :--- | :--- | :--- | :---: | :--- |
| `periodo_inicial` | String | `dd/mm/aaaa` | **Sim** | Data completa inicial (ex: `01/01/2024`) |
| `periodo_final` | String | `dd/mm/aaaa` | **Sim** | Data completa final (ex: `31/01/2024`) |
| `codigo_unidade` | Inteiro | Numérico | Não | Código da unidade gestora |
| `inicio_registro` | Inteiro | Numérico | Não | Posição inicial de paginação |
| `quantidade_registro` | Inteiro | Numérico | Não | Limite de registros |

* **Exemplo cURL:**
  ```bash
  curl -X GET "https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/api/v1/contrato?periodo_inicial=01/01/2024&periodo_final=31/01/2024&quantidade_registro=10" \
       -H "Accept: application/json"
  ```

* **Estrutura dos Dados de Retorno (`registros[].registro`):**
  * `numeroContrato`, `anoContrato`.
  * `dataAssinatura`, `dataVigenciaInicial`, `dataVigenciaFinal`.
  * `contratado`: Razão social e CNPJ/CPF da empresa.
  * `objeto`: Objeto da prestação ou fornecimento.
  * `valorContrato`: Montante total contratado.
  * `listTermosAditivos`: Alterações de prazo ou valor.

---

### 4.6. Gestão de Pessoal

Consulta às folhas de pagamento, servidores, cargos e remunerações.

* **Endpoint:** `GET https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/api/v1/pessoal`
* **Parâmetros:**

| Parâmetro | Tipo | Formato | Obrigatório | Descrição |
| :--- | :--- | :--- | :---: | :--- |
| `referencia` | String | `mm/aaaa` | **Sim** | Mês e ano de referência da competência (ex: `01/2024`) |
| `codigo_unidade` | Inteiro | Numérico | Não | Código da unidade gestora |
| `inicio_registro` | Inteiro | Numérico | Não | Posição inicial de paginação |
| `quantidade_registro` | Inteiro | Numérico | Não | Limite de registros por página |

* **Exemplo cURL:**
  ```bash
  curl -X GET "https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/api/v1/pessoal?referencia=01/2024&inicio_registro=0&quantidade_registro=10" \
       -H "Accept: application/json"
  ```

* **Estrutura dos Dados de Retorno (`registros[].registro`):**
  * `matricula`: Número de matrícula, nome do servidor, CPF descaracterizado e data de admissão.
  * `listFolha[].historico`: Vínculo (Efetivo, Comissionado), carga horária semanal/mensal, cargo, lotação.
  * `listFolha[].listEventos`: Itens detalhados de proventos (salário base, gratificações) e descontos (INSS, IRRF, previdência própria).

---

## 5. Padrão de Envelope das Respostas

### 5.1. Resposta de Sucesso (HTTP 200 / 202)
As requisições retornam status HTTP `200` ou `202 Accepted` acompanhado de um envelope padronizado:

```json
{
  "informacao": "Receita",
  "ultimaAtualizacao": "03/10/2023",
  "totalRegistros": 430,
  "registros": [
    {
      "registro": {
        "unidadeGestora": {
          "codigo": 1,
          "denominacao": "Prefeitura Municipal de Florianópolis"
        }
        /* campos do recurso */
      }
    }
  ]
}
```

### 5.2. Resposta de Erro
Caso algum parâmetro esteja incorreto ou ausente:

```json
{
  "erro": {
    "codigo": 123,
    "mensagem": "Parâmetro 'periodo_inicial' obrigatório não informado."
  }
}
```

---

## 6. Tabela de Unidades Gestoras (`codigo_unidade`)

Para filtrar por órgãos específicos em Florianópolis, utilize os seguintes códigos no parâmetro `codigo_unidade`:

| Código | Unidade Gestora / Órgão |
| :---: | :--- |
| `0` | **Todas as Unidades** *(Geral)* |
| `1` | Prefeitura Municipal de Florianópolis |
| `2` | Câmara Municipal de Florianópolis |
| `4` | Fundação Cultural de Florianópolis Franklin Cascaes |
| `5` | Fundação Municipal de Esportes |
| `6` | Fundação Municipal do Meio Ambiente (FLORAM) |
| `7` | Instituto de Geração de Oportunidades de Florianópolis (IGOF) |
| `8` | Instituto de Planejamento Urbano de Florianópolis (IPUF) |
| `10` | Fundo Municipal de Saúde |
| `11` | Fundo Municipal para Reconstituição de Bens Lesados |
| `12` | Fundo Municipal de Assistência Social |
| `13` | Fundo Municipal de Habitação de Interesse Social |
| `14` | Fundo Municipal dos Direitos da Criança e do Adolescente |
| `15` | Fundo Municipal do Idoso de Florianópolis |
| `16` | Fundo Municipal de Trânsito (FUMTRAN) |
| `17` | Fundo Municipal de Segurança Pública |
| `19` | Instituto de Previdência Social dos Servidores Públicos (IPREV) |
| `20` | Autarquia de Melhoramentos da Capital (COMCAP) |
| `21` | Fundo Municipal de Saneamento Básico |
| `22` | Fundo de Apoio a Projetos Culturais de Florianópolis |
| `23` | Fundo Municipal de Defesa do Consumidor |
| `24` | Fundo Especial de Honorários da PGM |
| `25` | Fundo da Defesa Civil Municipal de Florianópolis |

---

## 7. Recomendações para Ingestão no Fiscal SC

1. **Paginação com `inicio_registro` e `quantidade_registro`:**
   * Utilizar lotes de `100` a `500` registros. A API suporta paginação transparente baseada em deslocamento (*offset*).
2. **Intervalo Temporal Curto para Licitações e Contratos:**
   * Como utilizam o formato `dd/mm/aaaa`, evitar solicitar períodos de um ano inteiro em uma única requisição. Consultar mês a mês para garantir respostas rápidas e sem *timeout*.
3. **Cache no Redis via `fiscal-backend`:**
   * Os dados retornados no array `registros` possuem chaves normalizadas que são consolidadas pelo `fiscal-backend` em pacotes de dashboard armazenados no Redis, mantendo a rastreabilidade do órgão e ano de exercício.

---

## 8. Expansão Multi-Municipal: Joinville, Itajaí e Chapecó (e-Pública)

Os municípios de **Joinville**, **Itajaí** e **Chapecó** utilizam a mesma arquitetura de Dados Abertos **e-Pública REST v1**, compartilhando os 6 endpoints (`/receita`, `/despesa`, `/despesaOrcamentaria`, `/licitacao`, `/contrato`, `/pessoal`).

### 8.1. Mapeamento de Base URLs e Slugs

| Município | `cityId` / Slug | Base URL | Entidade Form | Armazenamento de Editais (PDF) |
| :--- | :--- | :--- | :---: | :--- |
| **Florianópolis** | `florianopolis` | `https://transparencia.e-publica.net/epublica-portal` | `2002` | Oracle Cloud (`*.customer-oci.com/p/.../o/florianopolis/*`) |
| **Joinville** | `joinville` | `https://transparencia.joinville.sc.gov.br/epublica-portal` | `650` | File Server Próprio (`epublica.joinville.sc.gov.br/epublica/app/file-server/file/public`) |
| **Itajaí** | `itajai` | `https://portaltransparencia.itajai.sc.gov.br/epublica-portal` | `411` | Oracle Cloud (`*.customer-oci.com/p/.../o/itajai/*`) |
| **Chapecó** | `chapeco` | `https://transparencia.e-publica.net/epublica-portal` | — | Oracle Cloud (`*.customer-oci.com/p/.../o/chapeco/*`) |

### 8.2. Unidades Gestoras — Joinville (`entidade=650`)

| Código | Unidade Gestora / Órgão |
| :---: | :--- |
| `0` | Prefeitura Municipal de Joinville - PMJ |
| `1` | Câmara de Vereadores de Joinville - CVJ |
| `2` | Fundo Municipal de Saúde - FMS |
| `3` | Hospital Municipal São José - HMSJ |
| `6` | Fundação IPPUJ |
| `8` | Fundação Cultural de Joinville - FCJ |
| `17` | Fundo Municipal de Assistência Social - FMAS |
| `22` | Instituto de Previdência Social dos Servidores Públicos de Joinville - IPREVILLE |
| `27` | Departamento de Trânsito de Joinville - DETRANS |

### 8.3. Unidades Gestoras — Itajaí (`entidade=411`)

| Código | Unidade Gestora / Órgão |
| :---: | :--- |
| `1` | Município de Itajaí |
| `3` | Fundação Cultural de Itajaí |
| `5` | Fundação Municipal de Esporte e Lazer - FMEL |
| `12` | Instituto de Previdência de Itajaí - IPI |
| `16` | Fundo Municipal de Saúde de Itajaí |
| `18` | Superintendência do Porto de Itajaí |
| `19` | SEMASA - Serviço Municipal de Água, Saneamento Básico e Infraestrutura |
| `66` | Instituto Itajaí Sustentável - INIS |
| `88` | Fundo Municipal de Assistência Social - FMAS |

### 8.4. Unidades Gestoras — Chapecó

| Código | Unidade Gestora / Órgão |
| :---: | :--- |
| `1` | Prefeitura Municipal de Chapecó |
| `2` | Fundo Municipal de Saúde de Chapecó |
| `3` | Instituto do Sistema Municipal de Previdência de Chapecó |
| `4` | Fundo Municipal de Assistência do Servidor Municipal de Chapecó |
| `6` | Fundo Municipal de Assistência Social de Chapecó |
| `8` | Fundo Municipal da Infância e Adolescência de Chapecó |
| `9` | Fundação Cultural de Chapecó |
| `10` | Fundação Municipal de Desporto de Chapecó |
| `18` | Câmara Municipal de Chapecó |
