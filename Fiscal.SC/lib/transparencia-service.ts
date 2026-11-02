export type MovimentoDespesa = {
  dataMovimento?: string;
  tipoMovimento?: string;
  valorMovimento: number;
};

export type DespesaItem = {
  id: string;
  numeroEmpenho: string | number;
  emissao: string;
  objeto: string;
  fornecedorNome: string;
  fornecedorCpfCnpj: string;
  funcao: string;
  elemento: string;
  orgao: string;
  valor: number; // Valor enquadrado como Pagamento (destaque)
  valorPago?: number;
  valorLiquidado?: number;
  valorEmpenhado?: number;
  tipoMovimento: string;
  movimentos?: MovimentoDespesa[];
};

export type LicitacaoSubItem = {
  numero: number | string;
  denominacao: string;
  quantidade: number;
  unidadeMedida: string;
  valorUnitarioEstimado: number;
  situacao: string;
  vencedor?: string;
};

export type LicitacaoItem = {
  id: string;
  numero: string;
  modalidade: string;
  valorEstimado: number;
  objeto: string;
  dataEmissao: string;
  aberturaData: string;
  orgao: string;
  finalidade?: string;
  formaJulgamento?: string;
  situacao?: string;
  vencedorPrincipal?: string;
  itens?: LicitacaoSubItem[];
  links: Array<{ denominacao: string; link: string }>;
};

export type ContratoSubItem = {
  numero: number | string;
  denominacao: string;
  quantidade: number;
  unidadeMedida: string;
  valorUnitario: number;
  valorTotal: number;
};

export type ContratoItem = {
  id: string;
  numero: string;
  assinatura?: string;
  inicioVigencia: string;
  vencimento: string;
  valorTotal: number;
  objeto: string;
  fornecedorNome?: string;
  fornecedorCpfCnpj?: string;
  orgao?: string;
  itens?: ContratoSubItem[];
};

export type EventoFolhaItem = {
  denominacao: string;
  tipo: string;
  valor: number;
  referencia?: number;
  unidade?: string;
};

export type PessoalItem = {
  id: string;
  matricula: string;
  nome: string;
  cpf: string;
  dataAdmissao: string;
  orgao: string;
  cargo: string;
  vinculo: string;
  lotacao: string;
  cargaHorariaSemanais: number;
  remuneracaoBruta: number;
  totalDescontos: number;
  remuneracaoLiquida: number;
  competencia: string;
  eventos: EventoFolhaItem[];
};

export type DespesaOrcamentariaItem = {
  id: string;
  classificacao: string;
  orgao: string;
  unidadeGestora: string;
  funcao: string;
  subfuncao: string;
  programa: string;
  acao: string;
  categoriaEconomica: string;
  elemento: string;
  fonteRecurso: string;
  valorEmpenhado: number;
  valorLiquidado: number;
  valorPago: number;
  movimentos: MovimentoDespesa[];
};

export type ReceitaItem = {
  id: string;
  codigo: string | number;
  tipoReceita: string;
  orgao: string;
  categoriaEconomica: string;
  origem: string;
  especie: string;
  rubrica: string;
  alinea: string;
  subalinea: string;
  detalhamento: string;
  codigoNatureza: string;
  fonteRecurso: string;
  valorArrecadado: number; // Valor em destaque (Receita Realizada Líquida)
  valorPrevisto: number;
  valorDeducoes: number;
  movimentos: MovimentoDespesa[];
};

export type ReceitaMesDetalhe = {
  mes: string;
  subtotal: number;
  quantidadeRegistros: number;
  totalRegistrosBase: number;
  status: number;
  error?: string;
};

export type ReceitaTrimestreResultado = {
  success: boolean;
  trimestreReferencia: string;
  mesesConsultados: string[];
  somaTotalTrimestre: number;
  mediaMensal: number;
  detalhesPorMes: ReceitaMesDetalhe[];
  tempoExecucaoMs: number;
  source?: "cache" | "worker";
  cacheKey?: string;
  timestamp?: string;
  error?: string;
};

export type AreaDistribItem = {
  label: string;
  value: string;
  rawVal?: number;
  percent: number;
  color: string;
};

export interface DashboardPackage {
  status: "success";
  source: "cache" | "worker" | "live";
  cityId: string;
  cityName: string;
  periodo: string;
  cacheKey: string;
  resumo: {
    totalReceitasArrecadadas?: number;
    totalReceitasPrevistas?: number;
    totalRegistrosReceitas?: number;
    totalDespesasReais: number;
    totalDespesasFormatado: string;
    totalRegistrosDespesas: number;
    totalLicitacoes: number;
    totalContratos: number;
    totalPessoal?: number;
    totalFolhaBruta?: number;
    totalOrcamentoRegistros?: number;
    totalEmpenhadoOrcamento?: number;
    totalLiquidadoOrcamento?: number;
    totalPagoOrcamento?: number;
    areas: string[];
    distribuicaoAreas: AreaDistribItem[];
  };
  trimestre: ReceitaTrimestreResultado | null;
  receitas?: ReceitaItem[];
  despesas: DespesaItem[];
  licitacoes: LicitacaoItem[];
  contratos: ContratoItem[];
  pessoal?: PessoalItem[];
  despesaOrcamentaria?: DespesaOrcamentariaItem[];
  tempoExecucaoMs?: number;
  timestamp?: string;
}

export type DashboardResponse =
  | { status: 200; data: DashboardPackage; source: "cache" | "worker" | "live" }
  | { status: 202; cacheKey: string; message: string }
  | { status: 500; error: string };

export function getWorkerUrl(): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "127.0.0.1") {
      return "http://127.0.0.1:3001";
    }
  }
  return process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:3001";
}

export function formatCurrencyBRL(val?: number): string {
  if (typeof val !== "number" || isNaN(val)) return "R$ 0,00";
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export async function fetchExecutiveDashboard(
  cityId = "florianopolis",
  periodo = "01/2024",
  socketId?: string
): Promise<DashboardResponse> {
  try {
    const workerUrl = getWorkerUrl();
    const headers: Record<string, string> = {};
    if (socketId) {
      headers["x-socket-id"] = socketId;
    }

    const res = await fetch(`${workerUrl}/api/dashboard/${cityId}?periodo=${periodo}`, {
      method: "GET",
      headers,
    });

    if (res.status === 200) {
      const json = await res.json();
      const pkg: DashboardPackage = json.data || json;
      const resolvedSource = json.source || pkg.source || "live";
      return {
        status: 200,
        data: { ...pkg, source: resolvedSource },
        source: resolvedSource,
      };
    }

    if (res.status === 202) {
      const json = await res.json();
      return {
        status: 202,
        cacheKey: json.cacheKey || "",
        message: json.message || "Job enfileirado no Worker",
      };
    }

    const errJson = await res.json().catch(() => ({}));
    return {
      status: 500,
      error: errJson.error || `Worker respondeu com status ${res.status}`,
    };
  } catch (err: unknown) {
    return {
      status: 500,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
