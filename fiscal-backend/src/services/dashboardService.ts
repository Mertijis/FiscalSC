import { fetchCityData } from './cityApiService';
import { getCityAdapter } from '../adapters';
import { aggregateReceitasTrimestre, ReceitaTrimestreResultado } from './aggregationService';

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
  valorPago: number;
  valorLiquidado: number;
  valorEmpenhado: number;
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
  tipo: string; // 'Provento' | 'Desconto'
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

export type AreaDistribItem = {
  label: string;
  value: string;
  rawVal: number;
  percent: number;
  color: string;
};

export interface DashboardPackage {
  status: 'success';
  source: 'cache' | 'worker' | 'live';
  cityId: string;
  cityName: string;
  periodo: string;
  cacheKey: string;
  resumo: {
    totalReceitasArrecadadas: number;
    totalReceitasPrevistas: number;
    totalRegistrosReceitas: number;
    totalDespesasReais: number;
    totalDespesasFormatado: string;
    totalRegistrosDespesas: number;
    totalLicitacoes: number;
    totalContratos: number;
    totalPessoal: number;
    totalFolhaBruta: number;
    totalOrcamentoRegistros: number;
    totalEmpenhadoOrcamento: number;
    totalLiquidadoOrcamento: number;
    totalPagoOrcamento: number;
    areas: string[];
    distribuicaoAreas: AreaDistribItem[];
  };
  trimestre: ReceitaTrimestreResultado | null;
  receitas: ReceitaItem[];
  despesas: DespesaItem[];
  licitacoes: LicitacaoItem[];
  contratos: ContratoItem[];
  pessoal: PessoalItem[];
  despesaOrcamentaria: DespesaOrcamentariaItem[];
  tempoExecucaoMs?: number;
  timestamp: string;
}

export function formatCurrencyBRL(val?: number): string {
  if (typeof val !== 'number' || isNaN(val)) return 'R$ 0,00';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function normalizeReceitas(registros: any[], cityName = 'Florianópolis'): ReceitaItem[] {
  if (!Array.isArray(registros)) return [];

  const items = registros.map((item, index) => {
    const reg = item.registro || item;
    const rec = reg.receita || {};
    const nat = reg.naturezaReceita || {};
    const fonte = Array.isArray(reg.listFonteRecursos) ? reg.listFonteRecursos[0] : {};
    const rawMovs = Array.isArray(reg.listMovimentos) ? reg.listMovimentos : [];

    const movimentos: MovimentoDespesa[] = rawMovs.map((m: any) => ({
      dataMovimento: m.dataMovimento || '—',
      tipoMovimento: m.tipoMovimento || 'Lançamento de Receita',
      valorMovimento: Number(m.valorMovimento) || 0,
    }));

    let valorArrecadado = 0;
    let valorPrevisto = 0;
    let valorDeducoes = 0;

    for (const m of movimentos) {
      const tipo = (m.tipoMovimento || '').toLowerCase();
      const val = m.valorMovimento;

      if (tipo.includes('arrecadação') || tipo.includes('arrecadacao')) {
        if (tipo.includes('estorno') || tipo.includes('anula') || tipo.includes('cancela')) {
          valorArrecadado -= Math.abs(val);
          valorDeducoes += Math.abs(val);
        } else {
          valorArrecadado += val;
        }
      } else if (
        tipo.includes('restituição') ||
        tipo.includes('restituicao') ||
        tipo.includes('dedução') ||
        tipo.includes('deducao')
      ) {
        valorArrecadado -= Math.abs(val);
        valorDeducoes += Math.abs(val);
      } else if (tipo.includes('previsão') || tipo.includes('previsao')) {
        if (tipo.includes('anula') || tipo.includes('redu') || tipo.includes('estorno')) {
          valorPrevisto -= Math.abs(val);
        } else {
          valorPrevisto += val;
        }
      }
    }

    valorArrecadado = Math.round(valorArrecadado * 100) / 100;
    valorPrevisto = Math.max(0, Math.round(valorPrevisto * 100) / 100);
    valorDeducoes = Math.round(valorDeducoes * 100) / 100;

    const detalhamento =
      nat.subdetalhamento2?.denominacao?.trim() ||
      nat.subdetalhamento1?.denominacao?.trim() ||
      nat.subalinea?.denominacao?.trim() ||
      nat.alinea?.denominacao?.trim() ||
      nat.rubrica?.denominacao?.trim() ||
      nat.especie?.denominacao?.trim() ||
      'Receita Municipal';

    const codigoNatureza =
      nat.subdetalhamento2?.codigo ||
      nat.subalinea?.codigo ||
      nat.rubrica?.codigo ||
      nat.origem?.codigo ||
      '—';

    return {
      id: `receita-${rec.codigo || index}-${index}`,
      codigo: rec.codigo || index + 1,
      tipoReceita: rec.tipoReceita || 'Bruta',
      orgao: reg.unidadeGestora?.denominacao || `Prefeitura Municipal de ${cityName}`,
      categoriaEconomica: nat.categoriaEconomica?.denominacao || 'Receitas Correntes',
      origem: nat.origem?.denominacao || 'Outras Receitas',
      especie: nat.especie?.denominacao || 'Geral',
      rubrica: nat.rubrica?.denominacao || 'Rubrica Municipal',
      alinea: nat.alinea?.denominacao || '—',
      subalinea: nat.subalinea?.denominacao?.trim() || '—',
      detalhamento,
      codigoNatureza: String(codigoNatureza),
      fonteRecurso: fonte?.denominacao || 'Recursos Ordinários',
      valorArrecadado,
      valorPrevisto,
      valorDeducoes,
      movimentos,
    };
  });

  // Prioriza receitas com arrecadação efetiva no mês (maior valor arrecadado primeiro)
  return items.sort((a, b) => {
    if (a.valorArrecadado > 0 && b.valorArrecadado <= 0) return -1;
    if (a.valorArrecadado <= 0 && b.valorArrecadado > 0) return 1;
    if (b.valorArrecadado !== a.valorArrecadado) return b.valorArrecadado - a.valorArrecadado;
    return b.valorPrevisto - a.valorPrevisto;
  });
}

export function normalizeDespesas(registros: any[]): DespesaItem[] {
  if (!Array.isArray(registros)) return [];

  const items = registros.map((item, index) => {
    const reg = item.registro || item;
    const rawMovs = Array.isArray(reg.listMovimentos) ? reg.listMovimentos : [];
    const movimentos: MovimentoDespesa[] = rawMovs.map((m: any) => ({
      dataMovimento: m.dataMovimento || '—',
      tipoMovimento: m.tipoMovimento || 'Execução',
      valorMovimento: Number(m.valorMovimento) || 0,
    }));

    let valorPago = 0;
    let valorLiquidado = 0;
    let valorEmpenhado = 0;
    let tipoPagamentoEncontrado: string | null = null;

    for (const m of movimentos) {
      const tipo = (m.tipoMovimento || '').toLowerCase();
      const val = m.valorMovimento;

      if (tipo.includes('pagamento')) {
        if (tipo.includes('estorno') || tipo.includes('anula') || tipo.includes('cancela')) {
          valorPago -= val;
        } else {
          valorPago += val;
          tipoPagamentoEncontrado = m.tipoMovimento || 'Pagamento de empenho';
        }
      } else if (tipo.includes('liquidação') || tipo.includes('liquidacao')) {
        if (tipo.includes('estorno') || tipo.includes('anula') || tipo.includes('cancela')) {
          valorLiquidado -= val;
        } else if (!tipo.includes('empenho em liquidação')) {
          valorLiquidado += val;
        } else {
          valorEmpenhado += val;
        }
      } else if (
        tipo.includes('emissão de empenho') ||
        tipo.includes('inscrição de restos a pagar') ||
        tipo === 'empenho'
      ) {
        valorEmpenhado += val;
      } else if (tipo.includes('anulação de empenho') || tipo.includes('cancelamento')) {
        valorEmpenhado -= val;
      }
    }

    valorPago = Math.max(0, Math.round(valorPago * 100) / 100);
    valorLiquidado = Math.max(0, Math.round(valorLiquidado * 100) / 100);
    valorEmpenhado = Math.max(0, Math.round(valorEmpenhado * 100) / 100);

    const ultimoMov = movimentos[movimentos.length - 1];
    const primeiroMov = movimentos[0];
    const tipoMovimentoPrincipal =
      tipoPagamentoEncontrado ||
      ultimoMov?.tipoMovimento ||
      primeiroMov?.tipoMovimento ||
      'Execução';

    return {
      id: `despesa-${reg.empenho?.numero || index}-${index}`,
      numeroEmpenho: reg.empenho?.numero || 'S/N',
      emissao: reg.empenho?.emissao || '—',
      objeto: reg.empenho?.objetoResumido || 'Sem descrição informada.',
      fornecedorNome: reg.fornecedor?.pessoa?.nome || 'Fornecedor não identificado',
      fornecedorCpfCnpj: reg.fornecedor?.pessoa?.cpfCnpj || '—',
      funcao: reg.despesa?.funcao?.denominacao || 'Administração Geral',
      elemento: reg.naturezaDespesa?.elemento?.denominacao || 'Outras Despesas',
      orgao:
        reg.unidadeOrcamentaria?.denominacao ||
        reg.unidadeOrcamentaria?.unidadeGestora?.denominacao ||
        'Prefeitura Municipal',
      valor: valorPago,
      valorPago,
      valorLiquidado,
      valorEmpenhado,
      tipoMovimento: tipoMovimentoPrincipal,
      movimentos,
    };
  });

  // Prioriza na listagem os empenhos que possuem pagamento efetivo no período (maior valor pago primeiro)
  return items.sort((a, b) => {
    if (a.valorPago > 0 && b.valorPago === 0) return -1;
    if (a.valorPago === 0 && b.valorPago > 0) return 1;
    return b.valorPago - a.valorPago;
  });
}

export function normalizeLicitacoes(registros: any[], cityName = 'Florianópolis'): LicitacaoItem[] {
  if (!Array.isArray(registros)) return [];

  return registros.map((item, index) => {
    const reg = item.registro || item;
    const lic = reg.licitacao || {};
    const ug = reg.listUnidadesGestoras?.[0];
    const rawItens = Array.isArray(reg.listItens) ? reg.listItens : [];

    const itens: LicitacaoSubItem[] = rawItens.map((it: any, idx: number) => ({
      numero: it.numero ?? idx + 1,
      denominacao: it.denominacao || 'Item licitado',
      quantidade: Number(it.quantidade) || 1,
      unidadeMedida: it.unidadeMedida || 'UN',
      valorUnitarioEstimado: Number(it.valorUnitarioEstimado) || 0,
      situacao: it.situacao || 'Em análise',
      vencedor: it.listVencedores?.[0]?.fornecedor,
    }));

    const situacaoPrincipal = itens[0]?.situacao || 'Publicada';
    const vencedorPrincipal = itens.find((i) => i.vencedor)?.vencedor;

    return {
      id: `licitacao-${lic.numero || index}-${index}`,
      numero: lic.numero || 'Processo S/N',
      modalidade: lic.modalidade || 'Não informada',
      valorEstimado: Number(lic.valorEstimado) || 0,
      objeto: lic.objetoResumido || 'Sem objeto informado.',
      dataEmissao: lic.dataEmissao || '—',
      aberturaData: lic.aberturaData || 'Dispensa / Direta',
      orgao: ug?.denominacao?.trim() || `Prefeitura Municipal de ${cityName}`,
      finalidade: lic.finalidade || 'Contratação Pública',
      formaJulgamento: lic.formaJulgamento || 'Menor Preço',
      situacao: situacaoPrincipal,
      vencedorPrincipal,
      itens,
      links: Array.isArray(reg.listTextos)
        ? reg.listTextos.map((doc: any) => ({
            denominacao: doc.denominacao || 'Documento',
            link: doc.link || '#',
          }))
        : [],
    };
  });
}

export function normalizeContratos(registros: any[], cityName = 'Florianópolis'): ContratoItem[] {
  if (!Array.isArray(registros)) return [];

  return registros.map((item, index) => {
    const reg = item.registro || item;
    const cont = reg.contrato || {};
    const rawItens = Array.isArray(reg.listItens) ? reg.listItens : [];

    const itens: ContratoSubItem[] = rawItens.map((it: any, idx: number) => ({
      numero: it.numero ?? idx + 1,
      denominacao: it.denominacao || 'Item contratado',
      quantidade: Number(it.quantidade) || 1,
      unidadeMedida: it.unidadeMedida || 'Unidade',
      valorUnitario: Number(it.valorUnitario) || 0,
      valorTotal: Number(it.valorTotal) || 0,
    }));

    return {
      id: `contrato-${cont.numero || index}-${index}`,
      numero: cont.numero || 'Contrato S/N',
      assinatura: cont.assinatura || '—',
      inicioVigencia: cont.inicioVigencia || '—',
      vencimento: cont.vencimento || '—',
      valorTotal: Number(cont.valorTotal) || 0,
      objeto: cont.objetoResumido || 'Sem descrição de objeto.',
      fornecedorNome: reg.fornecedor?.pessoa?.nome || 'Fornecedor não informado',
      fornecedorCpfCnpj: reg.fornecedor?.pessoa?.cpfCnpj || '—',
      orgao: reg.unidadeGestora?.denominacao || `Prefeitura Municipal de ${cityName}`,
      itens,
    };
  });
}

export function normalizePessoal(registros: any[], periodo = '01/2024', cityName = 'Florianópolis'): PessoalItem[] {
  if (!Array.isArray(registros)) return [];

  return registros.map((item, index) => {
    const reg = item.registro || item;
    const mat = reg.matricula || {};
    const ug = reg.unidadeGestora || {};
    const folha = Array.isArray(reg.listFolha) && reg.listFolha.length > 0 ? reg.listFolha[0] : {};
    const hist = folha.historico || {};
    const rawEventos = Array.isArray(folha.listEventos) ? folha.listEventos : [];

    const eventos: EventoFolhaItem[] = rawEventos.map((ev: any) => ({
      denominacao: ev.denominacao || 'Rubrica',
      tipo: ev.tipoEventoDenominacao || 'Provento',
      valor: Number(ev.valorEvento) || 0,
      referencia: typeof ev.valorReferencia === 'number' ? ev.valorReferencia : undefined,
      unidade: ev.unidadeMedida || undefined,
    }));

    let remuneracaoBruta = 0;
    let totalDescontos = 0;
    for (const ev of eventos) {
      if (ev.tipo.toLowerCase().includes('desconto')) {
        totalDescontos += ev.valor;
      } else {
        remuneracaoBruta += ev.valor;
      }
    }

    remuneracaoBruta = Math.round(remuneracaoBruta * 100) / 100;
    totalDescontos = Math.round(totalDescontos * 100) / 100;
    const remuneracaoLiquida = Math.max(0, Math.round((remuneracaoBruta - totalDescontos) * 100) / 100);

    return {
      id: `pessoal-${mat.numero || index}-${index}`,
      matricula: String(mat.numero || 'S/M'),
      nome: mat.nome || 'Servidor não identificado',
      cpf: mat.cpf || '***.***.***-**',
      dataAdmissao: mat.dataAdmissao || '—',
      orgao: ug.denominacao || `Prefeitura Municipal de ${cityName}`,
      cargo: hist.cargo?.denominacao || hist.funcao?.denominacao || 'Cargo Efetivo / Comissionado',
      vinculo: hist.vinculo || 'Estatutário',
      lotacao: hist.local?.denominacao || ug.denominacao || 'Administração Municipal',
      cargaHorariaSemanais: Number(hist.nrHorasSemanais) || 40,
      remuneracaoBruta,
      totalDescontos,
      remuneracaoLiquida,
      competencia: periodo,
      eventos,
    };
  });
}

export function normalizeDespesaOrcamentaria(registros: any[], cityName = 'Florianópolis'): DespesaOrcamentariaItem[] {
  if (!Array.isArray(registros)) return [];

  return registros.map((item, index) => {
    const reg = item.registro || item;
    const rawMovs = Array.isArray(reg.listMovimentos) ? reg.listMovimentos : [];
    const movimentos: MovimentoDespesa[] = rawMovs.map((m: any) => ({
      dataMovimento: m.dataMovimento || '—',
      tipoMovimento: m.tipoMovimento || 'Movimento Orçamentário',
      valorMovimento: Number(m.valorMovimento) || 0,
    }));

    let valorEmpenhado = 0;
    let valorLiquidado = 0;
    let valorPago = 0;

    for (const m of movimentos) {
      const tipo = (m.tipoMovimento || '').toLowerCase();
      if (tipo.includes('emissão de empenho') || tipo === 'empenho') {
        valorEmpenhado += m.valorMovimento;
      } else if (tipo.includes('liquidação')) {
        valorLiquidado += m.valorMovimento;
      } else if (tipo.includes('pagamento')) {
        valorPago += m.valorMovimento;
      }
    }

    if (valorEmpenhado === 0 && movimentos.length > 0) {
      valorEmpenhado = movimentos[0].valorMovimento;
    }

    return {
      id: `orcamento-${index}-${reg.classificacaoCompleta?.classificacaoCompleta || index}`,
      classificacao: reg.classificacaoCompleta?.classificacaoCompleta || '—',
      orgao: reg.unidadeOrcamentaria?.denominacao || 'Prefeitura Municipal',
      unidadeGestora:
        reg.unidadeOrcamentaria?.unidadeGestora?.denominacao ||
        reg.unidadeOrcamentaria?.denominacao ||
        `Prefeitura Municipal de ${cityName}`,
      funcao: reg.despesa?.funcao?.denominacao || 'Administração',
      subfuncao: reg.despesa?.subfuncao?.denominacao || 'Geral',
      programa: reg.despesa?.programa?.denominacao || 'Programa Municipal',
      acao: reg.despesa?.acao?.denominacao || 'Ação Governamental',
      categoriaEconomica: reg.naturezaDespesa?.categoriaEconomica?.denominacao || 'Despesas Correntes',
      elemento: reg.naturezaDespesa?.elemento?.denominacao || 'Outras Despesas',
      fonteRecurso: reg.fonteRecurso?.denominacao || 'Recursos Ordinários',
      valorEmpenhado: Math.round(valorEmpenhado * 100) / 100,
      valorLiquidado: Math.round(valorLiquidado * 100) / 100,
      valorPago: Math.round(valorPago * 100) / 100,
      movimentos,
    };
  });
}

function calculateAreasDistrib(despesas: DespesaItem[]): {
  total: number;
  areas: string[];
  distribuicao: AreaDistribItem[];
} {
  const total = despesas.reduce((acc, d) => acc + Math.max(0, d.valor), 0);
  const map = new Map<string, number>();

  for (const d of despesas) {
    const val = Math.max(0, d.valor);
    map.set(d.funcao, (map.get(d.funcao) || 0) + val);
  }

  const colors = ['#4aa833', '#287bb6', '#e8790c', '#6e36c6', '#249b96', '#53648d', '#d9485f'];
  const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);

  const areas = ['Todas as áreas', ...sorted.map(([name]) => name)];

  const distribuicao = sorted.map(([label, val], idx) => ({
    label,
    value: formatCurrencyBRL(val),
    rawVal: val,
    percent: total > 0 ? Math.round((val / total) * 100) : 0,
    color: colors[idx % colors.length],
  }));

  return { total, areas, distribuicao };
}

// In-Flight Promise Map para evitar compilações concorrentes duplicadas (Thundering Herd)
const inProgressCompilations = new Map<string, Promise<DashboardPackage>>();

export async function compileDashboardData(
  cityId: string,
  periodo = '01/2024',
  onPartial?: (partialPkg: DashboardPackage) => void
): Promise<DashboardPackage> {
  const cacheKey = `dashboard_v4_${cityId}_${periodo.replace('/', '_')}`;

  // Se já houver uma compilação em andamento para este mesmo cacheKey, reutiliza a Promise
  const existing = inProgressCompilations.get(cacheKey);
  if (existing) {
    console.log(`[Dashboard Single-Flight] Reutilizando compilação em andamento para ${cacheKey}`);
    return existing;
  }

  const compilationPromise = (async () => {
    const startTime = Date.now();
    const adapter = getCityAdapter(cityId);
    const cityName = adapter.cityName;

    const [mes, ano] = periodo.split('/');
    const anoNum = Number(ano) || 2024;
    const mesNum = Number(mes) || 1;

    const ultimoDia = new Date(anoNum, mesNum, 0).getDate();
    const dataInicio = `01/${mes}/${ano}`;
    const dataFim = `${String(ultimoDia).padStart(2, '0')}/${mes}/${ano}`;
    // Para licitações na prefeitura de Florianópolis, consultas com período muito amplo (31 dias)
    // causam travamento de 16s no servidor municipal. Já para Joinville, Itajaí e Chapecó,
    // o mês fechado (31 dias) retorna rápido (<2.5s) e evita quinzenas vazias.
    const maxLicDays = adapter.licitacaoMaxDays ? Math.min(ultimoDia, adapter.licitacaoMaxDays) : ultimoDia;
    const dataFimLicitacao = `${String(maxLicDays).padStart(2, '0')}/${mes}/${ano}`;

    // 1. FASE RÁPIDA (Mês Único): Receitas (1000), Despesas (1000), Contratos (200), Despesa Orçamentária (1000) e Pessoal (500)
    const fastPromise = Promise.allSettled([
      fetchCityData(cityId, { tipo: 'receita', periodo, limit: 1000 }),
      fetchCityData(cityId, { tipo: 'despesa', periodo, limit: 1000 }),
      fetchCityData(cityId, { tipo: 'contrato', dataInicio, dataFim, limit: 200 }),
      fetchCityData(cityId, { tipo: 'despesaOrcamentaria', periodo, limit: 1000 }),
      fetchCityData(cityId, { tipo: 'pessoal', periodo, limit: 500 }),
    ]);

    // 2. FASE SECUNDÁRIA (em paralelo): Licitações
    const licitacaoPromise = fetchCityData(cityId, {
      tipo: 'licitacao',
      dataInicio,
      dataFim: dataFimLicitacao,
      limit: 50,
    }).catch((err) => {
      console.warn(`[Dashboard Warning] Licitação (${cityName}) falhou ou demorou:`, err.message);
      return { registros: [] };
    });

    // Aguarda a Fase Rápida primeiro
    const [resReceitas, resDespesas, resContratos, resOrcamento, resPessoal] = await fastPromise;

    const rawReceitas = resReceitas.status === 'fulfilled' ? resReceitas.value?.registros || [] : [];
    const rawDespesas = resDespesas.status === 'fulfilled' ? resDespesas.value?.registros || [] : [];
    const rawContratos = resContratos.status === 'fulfilled' ? resContratos.value?.registros || [] : [];
    const rawOrcamento = resOrcamento.status === 'fulfilled' ? resOrcamento.value?.registros || [] : [];
    const rawPessoal = resPessoal.status === 'fulfilled' ? resPessoal.value?.registros || [] : [];

    const receitas = normalizeReceitas(rawReceitas, cityName);
    const despesas = normalizeDespesas(rawDespesas);
    const contratos = normalizeContratos(rawContratos, cityName);
    const despesaOrcamentaria = normalizeDespesaOrcamentaria(rawOrcamento, cityName);
    let pessoal = normalizePessoal(rawPessoal, periodo, cityName);
    const { total, areas, distribuicao } = calculateAreasDistrib(despesas);

    const totalReceitasArrecadadas =
      Math.round(receitas.reduce((acc, r) => acc + Math.max(0, r.valorArrecadado), 0) * 100) / 100;
    const totalReceitasPrevistas =
      Math.round(receitas.reduce((acc, r) => acc + r.valorPrevisto, 0) * 100) / 100;

    let totalFolhaBruta = Math.round(pessoal.reduce((acc, p) => acc + p.remuneracaoBruta, 0) * 100) / 100;

    // Fallback inteligente de Folha de Pessoal: se o mês recém-encerrado (ex: 10/2026) ainda não
    // teve os eventos financeiros liberados pela prefeitura (totalFolhaBruta === 0), consulta o mês anterior
    if (totalFolhaBruta === 0) {
      const prevMesNum = mesNum === 1 ? 12 : mesNum - 1;
      const prevAnoNum = mesNum === 1 ? anoNum - 1 : anoNum;
      const prevPeriodo = `${String(prevMesNum).padStart(2, '0')}/${prevAnoNum}`;
      try {
        const prevPessoalData = await fetchCityData(cityId, {
          tipo: 'pessoal',
          periodo: prevPeriodo,
          limit: 500,
        });
        const prevNormalized = normalizePessoal(prevPessoalData?.registros || [], prevPeriodo, cityName);
        const prevTotalFolha =
          Math.round(prevNormalized.reduce((acc, p) => acc + p.remuneracaoBruta, 0) * 100) / 100;
        if (prevTotalFolha > 0) {
          pessoal = prevNormalized;
          totalFolhaBruta = prevTotalFolha;
        }
      } catch {
        // Mantém a listagem original caso o mês anterior falhe
      }
    }
    const totalEmpenhadoOrcamento =
      Math.round(despesaOrcamentaria.reduce((acc, o) => acc + o.valorEmpenhado, 0) * 100) / 100;
    const totalLiquidadoOrcamento =
      Math.round(despesaOrcamentaria.reduce((acc, o) => acc + o.valorLiquidado, 0) * 100) / 100;
    const totalPagoOrcamento =
      Math.round(despesaOrcamentaria.reduce((acc, o) => acc + o.valorPago, 0) * 100) / 100;

    // Se fornecido callback de entrega progressiva, emite o pacote parcial imediatamente (<400ms)
    if (onPartial) {
      const partialPkg: DashboardPackage = {
        status: 'success',
        source: 'worker',
        cityId,
        cityName,
        periodo,
        cacheKey,
        resumo: {
          totalReceitasArrecadadas,
          totalReceitasPrevistas,
          totalRegistrosReceitas: receitas.length,
          totalDespesasReais: total,
          totalDespesasFormatado: formatCurrencyBRL(total),
          totalRegistrosDespesas: despesas.length,
          totalLicitacoes: 0,
          totalContratos: contratos.length,
          totalPessoal: pessoal.length,
          totalFolhaBruta,
          totalOrcamentoRegistros: despesaOrcamentaria.length,
          totalEmpenhadoOrcamento,
          totalLiquidadoOrcamento,
          totalPagoOrcamento,
          areas,
          distribuicaoAreas: distribuicao,
        },
        trimestre: null,
        receitas,
        despesas,
        licitacoes: [],
        contratos,
        pessoal,
        despesaOrcamentaria,
        tempoExecucaoMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
      onPartial(partialPkg);
    }

    // Aguarda a conclusão das Licitações
    const rawLicitacoesData = await licitacaoPromise;
    const rawLicitacoes = rawLicitacoesData?.registros || [];
    const licitacoes = normalizeLicitacoes(rawLicitacoes, cityName);

    const tempoExecucaoMs = Date.now() - startTime;

    const fullPackage: DashboardPackage = {
      status: 'success',
      source: 'worker',
      cityId,
      cityName,
      periodo,
      cacheKey,
      resumo: {
        totalReceitasArrecadadas,
        totalReceitasPrevistas,
        totalRegistrosReceitas: receitas.length,
        totalDespesasReais: total,
        totalDespesasFormatado: formatCurrencyBRL(total),
        totalRegistrosDespesas: despesas.length,
        totalLicitacoes: licitacoes.length,
        totalContratos: contratos.length,
        totalPessoal: pessoal.length,
        totalFolhaBruta,
        totalOrcamentoRegistros: despesaOrcamentaria.length,
        totalEmpenhadoOrcamento,
        totalLiquidadoOrcamento,
        totalPagoOrcamento,
        areas,
        distribuicaoAreas: distribuicao,
      },
      trimestre: null,
      receitas,
      despesas,
      licitacoes,
      contratos,
      pessoal,
      despesaOrcamentaria,
      tempoExecucaoMs,
      timestamp: new Date().toISOString(),
    };

    return fullPackage;
  })();

  inProgressCompilations.set(cacheKey, compilationPromise);

  try {
    const result = await compilationPromise;
    return result;
  } finally {
    inProgressCompilations.delete(cacheKey);
  }
}
