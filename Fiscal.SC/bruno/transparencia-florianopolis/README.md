# Coleção Bruno — Transparência Florianópolis (e-Pública)

Coleção de testes e inspeção técnica da API do **Portal da Transparência da Prefeitura Municipal de Florianópolis** (plataforma **e-Pública**), desenvolvida para o projeto **Fiscal SC** com base nas especificações de [APIS_TRANSPARENCIA_FLORIANOPOLIS.md](../../Documentação/APIS_TRANSPARENCIA_FLORIANOPOLIS.md).

---

## 📁 Estrutura da Coleção

A coleção está dividida em 4 pastas estratégicas cobrindo 18 requisições com asserções declarativas e testes automatizados em JavaScript (Chai):

```text
bruno/transparencia-florianopolis/
├── bruno.json                                      # Manifesto da coleção Bruno
├── environments/
│   └── Producao.bru                                # Variáveis de ambiente (Base URL, datas, filtros)
├── 01 - Dados Abertos (v1 REST)/                   # Endpoints públicos oficiais para ingestão ETL
│   ├── 01 - Receita (Geral).bru
│   ├── 02 - Despesa (Execucao).bru
│   ├── 03 - Despesa Orcamentaria.bru
│   ├── 04 - Licitacoes.bru
│   ├── 05 - Contratos.bru
│   └── 06 - Gestao de Pessoal.bru
├── 02 - Paginacao e Filtros/                       # Validação de deslocamento e filtragem por unidade
│   ├── 01 - Paginacao Deslocamento (inicio_registro).bru
│   ├── 02 - Limite de Registros (quantidade_registro).bru
│   └── 03 - Filtro por Unidade Gestora (codigo_unidade).bru
├── 03 - Validacao e Casos de Erro/                 # Testes de borda e contratos de erro HTTP 500
│   ├── 01 - Receita sem parametros obrigatorios.bru
│   ├── 02 - Pessoal sem referencia obrigatoria.bru
│   └── 03 - Licitacao com data invalida.bru
└── 04 - Interface SPA (Metadados FormCtrl)/        # Chamadas internas POST da interface SPA do portal
    ├── 01 - Form Receita.bru
    ├── 02 - Form Despesa.bru
    ├── 03 - Form Despesa Orcamentaria.bru
    ├── 04 - Form Licitacao.bru
    ├── 05 - Form Contrato.bru
    └── 06 - Form Gestao Pessoal.bru
```

---

## 🚀 Como Executar

### 1. No Bruno (Interface Gráfica)

1. Abra o aplicativo **Bruno** ([usebruno.com](https://www.usebruno.com/)).
2. Clique em **"Open Collection"** (Abrir Coleção).
3. Selecione a pasta:
   `/run/media/victor/Dados/Faculdade/ProjetoTic/Fiscal.SC/bruno/transparencia-florianopolis`
4. No canto superior direito, selecione o ambiente **`Producao`**.
5. Clique com o botão direito na coleção ou em qualquer pasta e selecione **"Run"** para executar a rodada completa de testes (*Test Runner*).

---

### 2. Pelo Terminal (CLI Automatizado)

Você pode rodar a suite completa diretamente via terminal sem instalar o Bruno globalmente:

```bash
npm run test:api
```

Ou diretamente com o executor do Bruno:

```bash
cd bruno/transparencia-florianopolis
npx @usebruno/cli run -r --env Producao
```

#### Gerar Relatório HTML ou JUnit (CI/CD)

```bash
cd bruno/transparencia-florianopolis
npx @usebruno/cli run -r --env Producao --reporter-html relatorio-testes.html
```

---

## ⚙️ Variáveis de Ambiente (`Producao.bru`)

| Variável | Valor Padrão | Descrição |
| :--- | :--- | :--- |
| `baseUrl` | `https://transparencia.e-publica.net/epublica-portal` | URL base do portal e-Pública |
| `entidade` | `2002` | Código da entidade municipal de Florianópolis |
| `periodo_mes_ano` | `01/2024` | Competência/Mês inicial (`mm/aaaa`) |
| `periodo_mes_ano_fim`| `01/2024` | Mês final (`mm/aaaa`) |
| `data_inicio` | `01/01/2024` | Data inicial diária (`dd/mm/aaaa`) para Licitações/Contratos |
| `data_fim_quinzena` | `15/01/2024` | Data limite quinzenal recomendada |
| `data_fim_mes` | `31/01/2024` | Data limite mensal |
| `quantidade_padrao` | `10` | Quantidade de registros por requisição de teste |
| `codigo_unidade_todas` | `0` | Todas as unidades gestoras |
| `codigo_unidade_saude` | `10` | Fundo Municipal de Saúde |
| `codigo_unidade_comcap`| `20` | COMCAP / Autarquia de Melhoramentos da Capital |

---

## 💡 Lições e Comportamentos Identificados nos Testes

1. **Status HTTP 202 (Accepted) é Sucesso:**
   A API da e-Pública responde com status `202 Accepted` acompanhado do envelope JSON padrão contendo `totalRegistros` e `registros`. Os testes aceitam `200` e `202`.
2. **`inicio_registro` é Obrigatório para Ativar o Limite:**
   Se `quantidade_registro` for enviado isoladamente sem `inicio_registro`, a API ignora o limite e realiza varredura completa da tabela (podendo demorar mais de 10 segundos e retornar milhares de itens). Enviando `inicio_registro: 0` junto a `quantidade_registro: 10`, a resposta é imediata (< 100ms).
3. **Formatos de Data Distintos:**
   * **Receita, Despesa e Pessoal:** Utilizam `mm/aaaa` (`periodo_inicial` e `periodo_final` ou `referencia`).
   * **Licitação e Contrato:** Exigem formato diário `dd/mm/aaaa`.
4. **Respostas de Erro:**
   Requisições com parâmetros obrigatórios ausentes retornam HTTP `500` com um array contendo `[{"erro": {"codigo": "100", "mensagem": "..."}}]`.
