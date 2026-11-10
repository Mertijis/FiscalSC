"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  RefreshCw,
  ArrowRight,
  SearchCheck,
  FileSearch,
  BarChart3,
  FolderOpen,
  CheckCircle2,
  Gavel,
  FileText,
  Calculator,
  Globe2,
  Server,
  ChevronDown,
  ChevronUp,
  Landmark,
  Users,
} from "lucide-react";
import type { AreaDistribItem } from "@/hooks/use-florianopolis-transparencia";
import type {
  ReceitaItem,
  DespesaItem,
  ContratoItem,
  LicitacaoItem,
  PessoalItem,
  DespesaOrcamentariaItem,
} from "@/lib/transparencia-service";
import type { ExecutiveTabType } from "./executive-tabs-nav";

const mockSpending = [
  { label: "Saúde", value: "R$ 3,89 bilhões", percent: 35, color: "#4aa833" },
  { label: "Educação", value: "R$ 3,11 bilhões", percent: 28, color: "#287bb6" },
  { label: "Infraestrutura", value: "R$ 2,00 bilhões", percent: 18, color: "#e8790c" },
  { label: "Segurança Pública", value: "R$ 1,33 bilhões", percent: 12, color: "#6e36c6" },
];

export type OverviewTabProps = {
  isFlorianopolis: boolean;
  name?: string;
  loadingData: boolean;
  periodo: string;
  totalReceitasArrecadadas?: number;
  totalReceitasPrevistas?: number;
  totalDespesasReais: number;
  expenses: string;
  contracts: string;
  areasDistrib: AreaDistribItem[];
  dynamicConic: string;
  liveReceitas?: ReceitaItem[];
  liveDespesas: DespesaItem[];
  liveLicitacoes: LicitacaoItem[];
  liveContratos: ContratoItem[];
  livePessoal?: PessoalItem[];
  liveOrcamento?: DespesaOrcamentariaItem[];
  tempoAgregacaoMs?: number;
  dashboardSource?: "cache" | "worker" | "live" | null;
  onNavigateTab: (tab: ExecutiveTabType) => void;
  formatCurrency: (val: number) => string;
};

export default function OverviewTab({
  isFlorianopolis,
  name = "Florianópolis",
  loadingData,
  periodo,
  totalReceitasArrecadadas = 0,
  totalReceitasPrevistas = 0,
  totalDespesasReais,
  expenses,
  contracts,
  areasDistrib,
  dynamicConic,
  liveReceitas = [],
  liveDespesas,
  liveLicitacoes,
  liveContratos,
  livePessoal = [],
  liveOrcamento = [],
  tempoAgregacaoMs,
  dashboardSource,
  onNavigateTab,
  formatCurrency,
}: OverviewTabProps) {
  const [expandedOverview, setExpandedOverview] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-4">
      {/* Banner de Dados Conectados para Florianópolis */}
      {isFlorianopolis && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-[linear-gradient(90deg,#f0fbf5,#ffffff)] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
              <Globe2 size={22} />
            </div>
            <div>
              <strong className="text-sm text-gray-900 block">
                Integração Total com Dados Abertos de {name} Ativa (6 Módulos)
              </strong>
              <p className="text-xs text-gray-600">
                Explore receitas arrecadadas, despesas pagas, orçamento (LOA), licitações com editais em PDF, contratos e folha de servidores na competência {periodo}.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onNavigateTab("receitas")}
              className="rounded-lg border border-sky-300 bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-900 hover:bg-sky-100 transition"
            >
              Ver Receitas
            </button>
            <button
              onClick={() => onNavigateTab("despesas")}
              className="rounded-lg bg-[#16844a] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#126b3c] transition"
            >
              Ver Empenhos
            </button>
            <button
              onClick={() => onNavigateTab("orcamento")}
              className="rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
            >
              Orçamento (LOA)
            </button>
            <button
              onClick={() => onNavigateTab("pessoal")}
              className="rounded-lg border border-teal-300 bg-teal-50 px-3.5 py-2 text-xs font-bold text-teal-900 hover:bg-teal-100 transition"
            >
              Servidores &amp; Folha
            </button>
          </div>
        </div>
      )}

      {/* Row 1: Area Distribution (Expanded) & Featured Expenses */}
      <section className="grid gap-4 grid-cols-1 lg:grid-cols-12">
        {/* Distribuição por Área (Mais amplo e legível) */}
        <article className="lg:col-span-7 rounded-xl border border-[#e0e7e4] bg-white p-6 shadow-sm flex flex-col justify-between min-w-0">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-gray-900">
                  Distribuição das Despesas Pagas por Área ({periodo})
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Proporção dos pagamentos realizados por função governamental no período selecionado
                </p>
              </div>
              <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-extrabold text-emerald-800">
                {isFlorianopolis ? `${areasDistrib.length} áreas com pagamento` : "Consolidado"}
              </span>
            </div>

            {isFlorianopolis && loadingData ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <RefreshCw size={28} className="animate-spin text-[#16844a] mb-2" />
                <p className="text-xs font-bold text-gray-700">
                  Carregando dados oficiais da prefeitura...
                </p>
                <span className="text-[10px] text-gray-400">
                  Consultando e-Pública em tempo real
                </span>
              </div>
            ) : (
              <div className="mt-6 flex flex-col md:flex-row items-center gap-7 min-w-0">
                {/* Gráfico de Rosca Ampliado */}
                <div
                  className="relative grid size-[210px] shrink-0 place-items-center rounded-full shadow-inner"
                  style={{
                    background: isFlorianopolis
                      ? dynamicConic
                      : "conic-gradient(#4aa833 0 35%, #249b96 35% 63%, #4aa2d4 63% 81%, #53648d 81% 93%, #a2aac0 93% 100%)",
                  }}
                >
                  <div className="grid size-[142px] place-items-center rounded-full bg-white text-center p-3 shadow-xs">
                    <div>
                      <small className="block text-[10px] uppercase tracking-wider font-bold text-gray-400">
                        {isFlorianopolis ? "Total Pago" : "Total"}
                      </small>
                      <span className="mt-0.5 text-sm font-black text-gray-900 block break-words leading-tight">
                        {isFlorianopolis ? formatCurrency(totalDespesasReais) : expenses}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legenda Detalhada com Valores e Barras */}
                <div className="grid gap-2.5 max-h-[380px] overflow-y-auto pr-1.5 flex-1 min-w-0 w-full">
                  {(isFlorianopolis ? areasDistrib : mockSpending).map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-gray-100 bg-[#fafcfb] px-3 py-2 transition hover:border-gray-200"
                    >
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <i
                            className="size-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <strong className="truncate font-bold text-gray-900" title={item.label}>
                            {item.label}
                          </strong>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="text-xs font-extrabold text-gray-800">
                            {item.value}
                          </span>
                          <span className="rounded bg-white border border-gray-200 px-1.5 py-0.5 text-[11px] font-black text-gray-700 min-w-[40px] text-center">
                            {item.percent}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200/70">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.max(item.percent, 2)}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {isFlorianopolis && areasDistrib.length === 0 && (
                    <p className="text-xs text-gray-400 py-8 text-center">
                      Nenhum pagamento registrado nas áreas para este período.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => onNavigateTab("despesas")}
            className="mt-6 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#dce4e1] text-xs font-semibold hover:bg-gray-50 transition"
          >
            Ver detalhes das despesas <ArrowRight size={14} />
          </button>
        </article>

        {/* Despesas em Destaque */}
        <article className="lg:col-span-5 rounded-xl border border-[#e0e7e4] bg-white p-6 shadow-sm flex flex-col justify-between min-w-0">
          <div>
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-extrabold text-gray-900">Despesas em Destaque</h2>
              <button
                onClick={() => onNavigateTab("despesas")}
                className="text-[10px] font-bold text-blue-600 hover:underline"
              >
                Ver todas ({liveDespesas.length})
              </button>
            </div>

            {isFlorianopolis && loadingData ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <RefreshCw size={26} className="animate-spin text-blue-600 mb-2" />
                <p className="text-xs font-bold text-gray-700">
                  Carregando empenhos em tempo real...
                </p>
                <span className="text-[10px] text-gray-400">Consultando e-Pública</span>
              </div>
            ) : isFlorianopolis ? (
              <div className="mt-4 grid gap-2.5 max-h-[380px] overflow-y-auto pr-1.5">
                {liveDespesas.slice(0, 15).map((d, idx) => {
                  const itemKey = d.id || `overview-despesa-${d.numeroEmpenho}-${idx}`;
                  const isExpanded = !!expandedOverview[itemKey];
                  const movs =
                    d.movimentos && d.movimentos.length > 0
                      ? d.movimentos
                      : [
                          {
                            dataMovimento: d.emissao || "—",
                            tipoMovimento: d.tipoMovimento || "Execução",
                            valorMovimento: d.valor || 0,
                          },
                        ];

                  return (
                    <div
                      key={itemKey}
                      className="rounded-lg border border-[#e5ebe8] bg-white p-2.5 transition hover:border-blue-400 min-w-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full text-white bg-blue-600 shadow-2xs">
                          <TrendingUp size={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-start gap-1">
                            <strong
                              className="truncate block text-gray-900 text-[11px] min-w-0 flex-1"
                              title={d.fornecedorNome}
                            >
                              {d.fornecedorNome}
                              <span className="block text-xs font-extrabold text-blue-700">
                                {formatCurrency(d.valor)}
                              </span>
                            </strong>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 block truncate max-w-[80px]">
                                {d.funcao}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setExpandedOverview((prev) => ({
                                    ...prev,
                                    [itemKey]: !prev[itemKey],
                                  }));
                                }}
                                className="inline-flex cursor-pointer items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 hover:bg-blue-100 transition"
                              >
                                {isExpanded ? "Ocultar" : `Movimentos (${movs.length})`}
                                {isExpanded ? (
                                  <ChevronUp size={10} />
                                ) : (
                                  <ChevronDown size={10} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && movs.length > 0 && (
                        <div className="mt-2.5 overflow-hidden rounded border border-gray-200 bg-gray-50/60 p-2 text-xs">
                          <div className="flex items-center justify-between pb-1.5 border-b border-gray-200 text-[10px] text-gray-500 font-medium">
                            <span>Histórico do Empenho Nº {d.numeroEmpenho}</span>
                            <span className="font-bold text-emerald-700">
                              Pago: {formatCurrency(d.valorPago ?? d.valor)}
                            </span>
                          </div>
                          <div className="mt-1 divide-y divide-gray-200">
                            {movs.map((mov, mIdx) => (
                              <div
                                key={mIdx}
                                className="flex items-center justify-between py-1 text-[10px]"
                              >
                                <span className="font-mono text-gray-500">
                                  {mov.dataMovimento || "—"}
                                </span>
                                <span className="truncate max-w-[140px] text-gray-700">
                                  {mov.tipoMovimento}
                                </span>
                                <span className="font-bold text-gray-900">
                                  {formatCurrency(mov.valorMovimento)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {liveDespesas.length === 0 && (
                  <p className="text-xs text-gray-400 py-8 text-center">
                    Nenhum empenho encontrado no período.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                {mockSpending.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-lg border border-[#e5ebe8] p-3"
                  >
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-full text-white"
                      style={{ backgroundColor: item.color }}
                    >
                      <BarChart3 size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2 text-[10px]">
                        <strong>
                          {item.label}
                          <span className="block text-xs">{item.value}</span>
                        </strong>
                        <span className="text-right">
                          <strong>{item.percent}%</strong> do total
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-[#e9edef]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.percent * 2}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => onNavigateTab("despesas")}
            className="mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#dce4e1] text-xs font-semibold hover:bg-gray-50 transition"
          >
            Inspecionar todos os empenhos <ArrowRight size={14} />
          </button>
        </article>
      </section>

      {/* Row 2: Revenue Evolution and Contracts Summary */}
      <section className="grid gap-4 grid-cols-1 lg:grid-cols-2 min-w-0">
        {/* Arrecadação Mensal de Receitas */}
        <article className="rounded-xl border border-[#e0e7e4] bg-white p-5 shadow-sm min-w-0 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-extrabold text-gray-900">
              {isFlorianopolis
                ? `Receitas Arrecadadas na Competência (${periodo})`
                : "Evolução das Receitas e Despesas (2025)"}
            </h2>
            {isFlorianopolis && (
              <button
                onClick={() => onNavigateTab("receitas")}
                className="text-[10px] font-bold text-blue-600 hover:underline"
              >
                Ver todas ({liveReceitas.length})
              </button>
            )}
          </div>
          {isFlorianopolis ? (
            loadingData ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <RefreshCw size={26} className="animate-spin text-[#16844a] mb-2" />
                <p className="text-xs font-bold text-gray-700">
                  Carregando arrecadação mensal...
                </p>
                <span className="text-[10px] text-gray-400">
                  Consultando e-Pública em tempo real
                </span>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 min-w-0">
                    <span className="text-[10px] font-bold text-emerald-800 block uppercase">
                      Arrecadação Líquida ({periodo})
                    </span>
                    <p className="text-base font-black text-emerald-950 mt-1">
                      {formatCurrency(totalReceitasArrecadadas)}
                    </p>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">
                      Ingresso efetivo nos cofres municipais
                    </span>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-[#f7faff] p-3 min-w-0">
                    <span className="text-[10px] font-bold text-blue-700 block uppercase">
                      Previsão Orçamentária (LOA)
                    </span>
                    <p className="text-base font-black text-gray-900 mt-1">
                      {formatCurrency(totalReceitasPrevistas)}
                    </p>
                    <span className="text-[10px] text-gray-500 block mt-0.5">
                      {liveReceitas.length} rubricas registradas no mês
                    </span>
                  </div>
                </div>

                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1.5">
                  {liveReceitas.slice(0, 15).map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 p-2.5 text-[11px] bg-gray-50/70"
                    >
                      <div className="min-w-0 flex-1">
                        <strong className="block text-gray-900 truncate">
                          {rec.detalhamento}
                        </strong>
                        <span className="text-[10px] text-gray-500 block truncate">
                          {rec.origem} &bull; {rec.fonteRecurso}
                        </span>
                      </div>
                      <span className="font-extrabold text-[#16844a] shrink-0">
                        {formatCurrency(rec.valorArrecadado)}
                      </span>
                    </div>
                  ))}
                  {liveReceitas.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">
                      Nenhuma receita encontrada no período.
                    </p>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="mt-4 grid gap-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                  Receita Prevista Consolidada
                </span>
                <strong className="mt-1 block text-lg font-black text-emerald-950">
                  {expenses}
                </strong>
                <span className="text-[11px] text-emerald-700">
                  Consulte a aba de Receitas para detalhamento por origem.
                </span>
              </div>
            </div>
          )}
        </article>

        {/* Resumo de Contratos */}
        <article className="rounded-xl border border-[#e0e7e4] bg-white p-5 shadow-sm min-w-0 flex flex-col justify-between">
          <div className="flex justify-between">
            <h2 className="text-sm font-extrabold text-gray-900">
              {isFlorianopolis ? `Contratos Administrativos (${periodo})` : "Contratos por Situação"}
            </h2>
            <button
              onClick={() => onNavigateTab("contratos")}
              className="text-[10px] font-bold text-blue-600"
            >
              Ver todos
            </button>
          </div>
          {isFlorianopolis && loadingData ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <RefreshCw size={26} className="animate-spin text-blue-600 mb-2" />
              <p className="text-xs font-bold text-gray-700">
                Carregando contratos em tempo real...
              </p>
              <span className="text-[10px] text-gray-400">Consultando e-Pública</span>
            </div>
          ) : isFlorianopolis ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-sky-50 border border-sky-200 p-4 text-center">
                <span className="text-2xl font-black text-sky-900 block">
                  {liveContratos.length}
                </span>
                <span className="text-xs font-semibold text-sky-700">
                  Contratos Extraídos da Base Oficial de {name}
                </span>
              </div>
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1.5">
                {liveContratos.map((cont) => (
                  <div
                    key={cont.id}
                    className="rounded-lg border border-gray-200 p-2.5 text-[11px] bg-gray-50/70"
                  >
                    <strong className="block text-gray-900 truncate">
                      {cont.numero}
                      {cont.fornecedorNome ? ` • ${cont.fornecedorNome}` : ""}
                    </strong>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {cont.objeto}
                    </span>
                    <span className="font-bold text-blue-700">
                      {formatCurrency(cont.valorTotal)}
                    </span>
                  </div>
                ))}
                {liveContratos.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    Nenhum contrato ativo encontrado no período.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-5 min-w-0">
              <div className="relative grid size-[165px] shrink-0 place-items-center rounded-full bg-[conic-gradient(#4cae32_0_62%,#4da4d2_62%_87%,#f1a000_87%_95%,#aeb4bd_95%_100%)]">
                <div className="grid size-[105px] place-items-center rounded-full bg-white text-center">
                  <span className="text-xl font-extrabold">
                    {contracts}
                    <small className="block text-xs font-medium">Contratos</small>
                  </span>
                </div>
              </div>
              <dl className="grid gap-4 text-[10px] flex-1 min-w-0 w-full">
                {[
                  ["Ativos", "62%", "772", "#4cae32"],
                  ["Em execução", "25%", "312", "#4da4d2"],
                  ["Aguardando início", "8%", "100", "#f1a000"],
                  ["Encerrados", "5%", "64", "#aeb4bd"],
                ].map((row) => (
                  <div key={row[0]} className="grid grid-cols-[10px_1fr_auto_auto] gap-2">
                    <i
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: row[3] }}
                    />
                    <dt>{row[0]}</dt>
                    <dd className="font-bold">{row[1]}</dd>
                    <dd className="font-bold">{row[2]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          <button
            onClick={() => onNavigateTab("contratos")}
            className="mt-6 flex h-9 w-full items-center justify-center gap-3 rounded-lg border border-[#dce4e1] text-xs font-semibold hover:bg-gray-50 transition"
          >
            Ver contratos <ArrowRight size={14} />
          </button>
        </article>
      </section>
    </div>
  );
}
