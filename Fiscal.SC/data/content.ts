export type Mission = {
  id: string;
  titulo: string;
  descricao: string;
  duracao: string;
  duracaoMinutos: number;
  pontos: number;
  categoria:
    | "Receitas e Tributos"
    | "Orçamento e Gastos"
    | "Contratos e Licitações"
    | "Transparência"
    | "Participação";
  abaExecutivo:
    | "overview"
    | "receitas"
    | "despesas"
    | "orcamento"
    | "licitacoes"
    | "contratos"
    | "pessoal";
  acaoTexto: string;
  dicaContexto: string;
  pergunta: string;
  opcoes: string[];
  correta: number;
};

export type AchievementDef = {
  id: string;
  symbol: string;
  title: string;
  description: string;
  color: string;
  missionId?: string;
  actionId?: string;
  minCompletedMissions?: number;
};

export const missions: Mission[] = [
  {
    id: "missao-receitas",
    titulo: "Rastreie a Arrecadação Municipal",
    descricao:
      "Acesse a aba de Receitas de Florianópolis e compreenda a diferença entre o valor previsto na LOA e o valor efetivamente arrecadado.",
    duracao: "4 min",
    duracaoMinutos: 4,
    pontos: 100,
    categoria: "Receitas e Tributos",
    abaExecutivo: "receitas",
    acaoTexto: "Abrir Receitas de Florianópolis",
    dicaContexto:
      "Na contabilidade pública (Lei nº 4.320/64), o card de previsão mostra os movimentos de previsão de receita lançados no mês consultado, e não o saldo anual da LOA, enquanto a Arrecadação Líquida representa os recursos que efetivamente ingressaram nos cofres municipais no mês, já descontadas restituições e deduções como o FUNDEB.",
    pergunta:
      "Qual indicador da aba de Receitas mostra o dinheiro que realmente entrou nos cofres da Prefeitura no mês selecionado?",
    opcoes: [
      "Valor Arrecadado (Receita Arrecadada Líquida)",
      "Movimentos de previsão no mês",
      "Reconhecimento contábil sem ingresso bancário",
    ],
    correta: 0,
  },
  {
    id: "missao-despesas",
    titulo: "Auditor de Pagamentos Públicos",
    descricao:
      "Inspecione os empenhos de Florianópolis, expanda o histórico de movimentos e identifique os 3 estágios da despesa pública.",
    duracao: "5 min",
    duracaoMinutos: 5,
    pontos: 120,
    categoria: "Orçamento e Gastos",
    abaExecutivo: "despesas",
    acaoTexto: "Inspecionar Despesas e Empenhos",
    dicaContexto:
      "Toda despesa pública percorre 3 estágios obrigatórios: 1) Empenho (reserva do orçamento para um credor), 2) Liquidação (conferência de que o bem foi entregue ou o serviço prestado) e 3) Pagamento (transferência efetiva do valor ao fornecedor). Somar os três estágios triplicaria o valor real do gasto!",
    pergunta:
      "Por que o painel destaca o estágio de 'Pagamento' sem somá-lo diretamente com a 'Emissão de Empenho' e a 'Liquidação'?",
    opcoes: [
      "Porque Empenho, Liquidação e Pagamento são estágios sucessivos da mesma despesa, e o Pagamento representa o desembolso efetivo",
      "Porque o Empenho não tem validade jurídica na administração pública",
      "Porque a Liquidação ocorre sempre antes da emissão do empenho",
    ],
    correta: 0,
  },
  {
    id: "missao-orcamento",
    titulo: "Guardião do Orçamento (LOA)",
    descricao:
      "Explore a aba Orçamento (LOA) de Florianópolis, filtre por função governamental e identifique programas, ações e fontes de recurso.",
    duracao: "5 min",
    duracaoMinutos: 5,
    pontos: 100,
    categoria: "Orçamento e Gastos",
    abaExecutivo: "orcamento",
    acaoTexto: "Explorar Orçamento (LOA)",
    dicaContexto:
      "Na execução orçamentária da LOA, cada dotação detalha a Função (ex: Saúde, Educação, Urbanismo), o Programa governamental, a Ação específica e a Fonte de Recurso (que indica a origem do dinheiro vinculado àquela despesa).",
    pergunta:
      "O que a 'Fonte de Recurso' de uma dotação orçamentária permite ao cidadão fiscalizar?",
    opcoes: [
      "Qual a origem do dinheiro (impostos próprios, transferências do SUS, FNDE, convênios) que financia aquela ação",
      "O nome do servidor responsável pela assinatura do contrato",
      "Apenas a quantidade de habitantes atendidos pelo município",
    ],
    correta: 0,
  },
  {
    id: "missao-licitacoes",
    titulo: "Fiscal de Editais e Licitações",
    descricao:
      "Consulte os processos licitatórios de Florianópolis, verifique a modalidade, os itens disputados e os documentos oficiais em PDF.",
    duracao: "6 min",
    duracaoMinutos: 6,
    pontos: 110,
    categoria: "Contratos e Licitações",
    abaExecutivo: "licitacoes",
    acaoTexto: "Ver Licitações e Editais",
    dicaContexto:
      "As licitações garantem a seleção da proposta mais vantajosa e isonômica para a Administração Pública. No portal e-Pública, cada processo informa modalidade (Pregão Eletrônico, Concorrência, Dispensa), objeto, valor estimado, itens licitados e links para os editais oficiais.",
    pergunta:
      "Qual é a importância de disponibilizar os itens licitados e o edital em PDF na consulta de licitações?",
    opcoes: [
      "Permitir que qualquer cidadão confira as regras do certame, quantidades e preços unitários estimados",
      "Substituir a necessidade de assinatura de contrato após a licitação",
      "Restringir o acesso apenas às empresas cadastradas na prefeitura",
    ],
    correta: 0,
  },
  {
    id: "missao-contratos",
    titulo: "Caçador de Contratos Vigentes",
    descricao:
      "Analise os contratos administrativos de Florianópolis, conferindo CNPJ contratado, prazo de vigência e itens pactuados.",
    duracao: "5 min",
    duracaoMinutos: 5,
    pontos: 100,
    categoria: "Contratos e Licitações",
    abaExecutivo: "contratos",
    acaoTexto: "Auditar Contratos da PMF",
    dicaContexto:
      "Todo contrato público deve publicar de forma transparente o número do ajuste, nome e CNPJ da empresa contratada, órgão gestor, datas de assinatura e vencimento, objeto resumido e a tabela detalhada de itens e valores unitários.",
    pergunta:
      "Ao auditar um contrato administrativo na aba Contratos, quais informações são essenciais para verificar sua regularidade básica?",
    opcoes: [
      "Fornecedor (CNPJ), período de vigência, objeto contratado, valor total e itens detalhados",
      "Somente o valor global arredondado, sem identificação da empresa",
      "Apenas a data de inauguração da prefeitura",
    ],
    correta: 0,
  },
  {
    id: "missao-pessoal",
    titulo: "Transparência na Folha de Pessoal",
    descricao:
      "Consulte os servidores públicos de Florianópolis, filtre por vínculo e inspecione as rubricas de proventos e descontos.",
    duracao: "4 min",
    duracaoMinutos: 4,
    pontos: 90,
    categoria: "Transparência",
    abaExecutivo: "pessoal",
    acaoTexto: "Consultar Servidores e Folha",
    dicaContexto:
      "A divulgação da remuneração dos agentes públicos é obrigatória (Lei de Acesso à Informação — Lei nº 12.527/2011). Na folha de pagamento, a Remuneração Bruta soma os proventos (vencimento básico e vantagens), enquanto a Remuneração Líquida resulta após o abatimento dos descontos legais (Previdência e IRRF).",
    pergunta:
      "Como é calculada a Remuneração Líquida exibida na aba de Servidores & Folha?",
    opcoes: [
      "Soma dos Proventos Brutos menos os Descontos Legais (como previdência e imposto de renda retido na fonte)",
      "Soma dos Proventos Brutos mais os descontos obrigatórios",
      "Multiplicando a carga horária semanal pelo número da matrícula",
    ],
    correta: 0,
  },
  {
    id: "missao-competencia",
    titulo: "Comparador de Competências Mensais",
    descricao:
      "Utilize o seletor de Competência (Mês/Ano) no Executivo de Florianópolis para comparar a execução financeira entre períodos.",
    duracao: "3 min",
    duracaoMinutos: 3,
    pontos: 80,
    categoria: "Transparência",
    abaExecutivo: "overview",
    acaoTexto: "Testar Seletor de Competência",
    dicaContexto:
      "A receita e a despesa pública variam conforme a sazonalidade do exercício financeiro (por exemplo, maior arrecadação de IPTU no início do ano ou liquidações concentradas em determinados meses). Conferir o período de competência evita interpretações distorcidas.",
    pergunta:
      "Por que é indispensável observar o mês e o ano de competência ao analisar um painel de gastos públicos?",
    opcoes: [
      "Porque receitas e pagamentos variam mês a mês e cada registro pertence a um período contábil específico",
      "Porque todos os meses do ano possuem exatamente os mesmos valores de arrecadação",
      "Porque a competência altera apenas a cor do painel visual",
    ],
    correta: 0,
  },
  {
    id: "missao-compartilhar",
    titulo: "Multiplicador da Cidadania",
    descricao:
      "Compartilhe o link do painel executivo e saiba boas práticas para divulgar dados públicos sem desinformação.",
    duracao: "2 min",
    duracaoMinutos: 2,
    pontos: 70,
    categoria: "Participação",
    abaExecutivo: "overview",
    acaoTexto: "Acessar Painel Executivo",
    dicaContexto:
      "Compartilhar dados públicos fortalece o controle social, mas exige responsabilidade: sempre informe o órgão público, o mês/ano de competência, o estágio contábil (ex: valor pago vs. valor empenhado) e a fonte oficial (Portal e-Pública).",
    pergunta:
      "Qual é a prática correta ao compartilhar um dado público encontrado no Fiscal SC?",
    opcoes: [
      "Informar sempre o município/órgão, o período de competência e a fonte oficial do dado",
      "Divulgar apenas um número isolado sem mencionar a qual mês ou cidade ele pertence",
      "Somar previsões orçamentárias com pagamentos para parecer um valor maior",
    ],
    correta: 0,
  },
  {
    id: "missao-lai",
    titulo: "Direitos da Transparência Ativa (LAI)",
    descricao:
      "Compreenda como a Lei de Acesso à Informação (Lei nº 12.527/2011) e a Lei da Transparência protegem o controle social.",
    duracao: "3 min",
    duracaoMinutos: 3,
    pontos: 80,
    categoria: "Transparência",
    abaExecutivo: "overview",
    acaoTexto: "Ver Portal Executivo",
    dicaContexto:
      "A Transparência Ativa obriga os órgãos públicos a divulgarem espontaneamente na internet, em tempo real, dados sobre execução orçamentária e financeira (LC nº 131/2009 e Lei nº 12.527/2011), sem que o cidadão precise protocolar requerimento prévio.",
    pergunta:
      "O que caracteriza a 'Transparência Ativa' praticada nos dados abertos integrados ao Fiscal SC?",
    opcoes: [
      "A publicação espontânea e contínua de dados oficiais na internet pelos órgãos públicos, acessível a qualquer cidadão",
      "A exigência de autorização judicial para consultar gastos públicos",
      "O sigilo padrão sobre todas as receitas e contratos municipais",
    ],
    correta: 0,
  },
];

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "medal-receita",
    symbol: "💰",
    title: "Detetive da Receita",
    description: "Conclua a missão 'Rastreie a Arrecadação Municipal' ou explore a aba de Receitas.",
    color: "#1168b7",
    missionId: "missao-receitas",
    actionId: "explore_tab_receitas",
  },
  {
    id: "medal-despesa",
    symbol: "🔎",
    title: "Auditor de Pagamentos",
    description: "Conclua 'Auditor de Pagamentos Públicos' ou inspecione os movimentos de um empenho.",
    color: "#16844a",
    missionId: "missao-despesas",
    actionId: "expand_movimentos_despesa",
  },
  {
    id: "medal-orcamento",
    symbol: "🏛️",
    title: "Guardião do Orçamento",
    description: "Conclua a missão 'Guardião do Orçamento (LOA)'.",
    color: "#d97706",
    missionId: "missao-orcamento",
  },
  {
    id: "medal-contratos",
    symbol: "📑",
    title: "Caçador de Contratos & Editais",
    description: "Conclua a missão de Contratos ou a missão de Licitações.",
    color: "#7c3aed",
    missionId: "missao-contratos",
  },
  {
    id: "medal-pessoal",
    symbol: "👥",
    title: "Fiscal da Folha",
    description: "Conclua a missão 'Transparência na Folha de Pessoal'.",
    color: "#0d9488",
    missionId: "missao-pessoal",
  },
  {
    id: "medal-mestre",
    symbol: "🏆",
    title: "Cidadão Exemplar SC",
    description: "Conclua pelo menos 5 missões de fiscalização no Fiscal SC.",
    color: "#eab308",
    minCompletedMissions: 5,
  },
];

export type Expense = {
  id: string;
  orgao: string;
  categoria: string;
  descricao: string;
  favorecido: string;
  valor: number;
  data: string;
  fonte: string;
  fonteUrl: string;
  atualizadoEm: string;
};

export const expenses: Expense[] = [
  {
    id: "pmf-despesa-01",
    orgao: "Fundo Municipal de Saúde de Florianópolis",
    categoria: "Saúde",
    descricao: "Fornecimento de insumos e medicamentos para a rede de atenção básica.",
    favorecido: "Fundo Municipal de Saúde",
    valor: 3842900,
    data: "2024-01-15",
    fonte: "Portal da Transparência — Prefeitura de Florianópolis (e-Pública)",
    fonteUrl: "https://transparencia.e-publica.net/epublica-portal/#/florianopolis/portal",
    atualizadoEm: "2024",
  },
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
