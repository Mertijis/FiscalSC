"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Landmark,
  RefreshCw,
  Search,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";
import type { DespesaOrcamentariaItem } from "@/lib/transparencia-service";

export type OrcamentoTabProps = {
  isFlorianopolis: boolean;
  name: string;
  periodo: string;
  loadingData: boolean;
  liveOrcamento: DespesaOrcamentariaItem[];
  totalEmpenhadoOrcamento: number;
  totalLiquidadoOrcamento: number;
  totalPagoOrcamento: number;
  formatCurrency: (val: number) => string;
};

export default function OrcamentoTab({
  isFlorianopolis,
  name,
  periodo,
  loadingData,
  liveOrcamento,
  totalEmpenhadoOrcamento,
  totalLiquidadoOrcamento,
  totalPagoOrcamento,
  formatCurrency,
}: OrcamentoTabProps) {
  const [search, setSearch] = useState("");
  const [funcaoFilter, setFuncaoFilter] = useState("Todas as funções");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(25);

  const funcoes = useMemo(() => {
    const set = new Set<string>();
    for (const item of liveOrcamento) {
      if (item.funcao) set.add(item.funcao);
    }
    return ["Todas as funções", ...Array.from(set)];
  }, [liveOrcamento]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return liveOrcamento.filter((item) => {
      const matchesFuncao =
        funcaoFilter === "Todas as funções" || item.funcao === funcaoFilter;
      const matchesSearch =
        !q ||
        item.programa.toLowerCase().includes(q) ||
        item.acao.toLowerCase().includes(q) ||
        item.orgao.toLowerCase().includes(q) ||
        item.elemento.toLowerCase().includes(q) ||
        item.fonteRecurso.toLowerCase().includes(q) ||
        item.classificacao.toLowerCase().includes(q);
      return matchesFuncao && matchesSearch;
    });
  }, [liveOrcamento, search, funcaoFilter]);

  if (!isFlorianopolis) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <Landmark size={36} className="mx-auto text-gray-400 mb-3" />
        <h3 className="text-base font-extrabold text-gray-900">
          Execução Orçamentária (LOA) de {name}
        </h3>
        <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
          A integração da Despesa Orçamentária (dotações, programas, ações e fontes de recurso) está ativa em tempo real para Florianópolis.
        </p>
        <Link
          href="/gastos/municipio/florianopolis"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#16844a] px-4 py-2 text-xs font-bold text-white hover:bg-[#126b3c]"
        >
          Ver Orçamento de Florianópolis <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#dce4e1] bg-white p-6 shadow-sm space-y-5">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Landmark className="text-amber-600 shrink-0" size={20} />
            Despesa Orçamentária &amp; Programas — {name}
          </h3>
          <p className="text-xs text-gray-500">
            Classificação funcional-programática, ações governamentais e execução das dotações na competência {periodo}.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <label className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar programa, ação, órgão ou fonte..."
              className="h-9 w-full sm:w-64 rounded-lg border border-[#dce4e1] bg-white pl-8 pr-3 text-xs focus:border-[#16844a] focus:outline-none"
            />
          </label>

          <select
            value={funcaoFilter}
            onChange={(e) => setFuncaoFilter(e.target.value)}
            className="h-9 rounded-lg border border-[#dce4e1] bg-white px-3 text-xs focus:border-[#16844a] focus:outline-none"
          >
            {funcoes.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs Summary Strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
            Total Empenhado no Período
          </span>
          <strong className="mt-1 block text-lg font-black text-amber-950">
            {formatCurrency(totalEmpenhadoOrcamento)}
          </strong>
          <span className="text-[10px] text-amber-700">
            {liveOrcamento.length} dotações consultadas
          </span>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
            Total Liquidado no Período
          </span>
          <strong className="mt-1 block text-lg font-black text-blue-950">
            {formatCurrency(totalLiquidadoOrcamento)}
          </strong>
          <span className="text-[10px] text-blue-700">
            Serviços e entregas verificadas
          </span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            Total Pago no Período
          </span>
          <strong className="mt-1 block text-lg font-black text-emerald-950">
            {formatCurrency(totalPagoOrcamento)}
          </strong>
          <span className="text-[10px] text-emerald-700">
            Ordens bancárias quitadas
          </span>
        </div>
      </div>

      {loadingData ? (
        <div className="py-16 text-center text-xs text-gray-400">
          <RefreshCw size={24} className="mx-auto animate-spin text-amber-600 mb-2" />
          Carregando dotações e execução orçamentária da prefeitura...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400">
          Nenhum registro orçamentário encontrado para os filtros aplicados.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#f4f7f5] px-3.5 py-2 text-xs text-gray-600">
            <span>
              Exibindo <strong>{Math.min(visibleCount, filtered.length)}</strong> de{" "}
              <strong>{filtered.length}</strong> dotações filtradas
            </span>
            {visibleCount < filtered.length && (
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 50)}
                className="font-bold text-amber-700 hover:underline cursor-pointer"
              >
                Carregar +50 dotações
              </button>
            )}
          </div>

          <div className="grid gap-3">
            {filtered.slice(0, visibleCount).map((item) => {
            const isExpanded = !!expandedIds[item.id];
            return (
              <div
                key={item.id}
                className="rounded-xl border border-[#e1e8e5] bg-[#fafcfb] p-4 transition hover:border-amber-500 hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                        {item.funcao} &bull; {item.subfuncao}
                      </span>
                      <span className="font-mono text-[10px] text-gray-500">
                        Dotação: {item.classificacao}
                      </span>
                    </div>
                    <strong className="mt-1.5 block text-sm font-extrabold text-gray-900">
                      {item.programa} — {item.acao}
                    </strong>
                    <span className="text-[11px] text-gray-500 block">
                      {item.unidadeGestora} ({item.orgao})
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:flex sm:items-center gap-3 text-left sm:text-right shrink-0">
                    <div>
                      <small className="block text-[9px] uppercase font-bold text-gray-400">
                        Empenhado no mês
                      </small>
                      <span className="text-xs font-extrabold text-amber-700">
                        {formatCurrency(item.valorEmpenhado)}
                      </span>
                    </div>
                    <div>
                      <small className="block text-[9px] uppercase font-bold text-gray-400">
                        Liquidado no mês
                      </small>
                      <span className="text-xs font-extrabold text-blue-700">
                        {formatCurrency(item.valorLiquidado)}
                      </span>
                    </div>
                    <div>
                      <small className="block text-[9px] uppercase font-bold text-gray-400">
                        Pago no mês
                      </small>
                      <span className="text-xs font-extrabold text-emerald-700">
                        {formatCurrency(item.valorPago)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-[10px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 font-semibold">
                      Natureza: {item.categoriaEconomica} &bull; {item.elemento}
                    </span>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-800 font-semibold">
                      Fonte: {item.fonteRecurso}
                    </span>
                  </div>

                  {item.movimentos.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 transition"
                    >
                      <Layers size={12} />
                      <span>
                        {isExpanded
                          ? "Ocultar lançamentos"
                          : `Ver lançamentos (${item.movimentos.length})`}
                      </span>
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  )}
                </div>

                {isExpanded && item.movimentos.length > 0 && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-[#e1e8e5] bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[#e1e8e5] bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                        <tr>
                          <th className="px-3 py-2">Data</th>
                          <th className="px-3 py-2">Estágio Orçamentário</th>
                          <th className="px-3 py-2 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eef2f0] text-[11px]">
                        {item.movimentos.map((mov, mIdx) => (
                          <tr key={mIdx} className="hover:bg-slate-50/70">
                            <td className="px-3 py-1.5 font-mono text-gray-600">
                              {mov.dataMovimento}
                            </td>
                            <td className="px-3 py-1.5 text-gray-800 font-medium">
                              {mov.tipoMovimento}
                            </td>
                            <td className="px-3 py-1.5 text-right font-bold text-gray-900">
                              {formatCurrency(mov.valorMovimento)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
          </div>

          {visibleCount < filtered.length && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 50)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-600 bg-amber-50/70 px-5 py-2.5 text-xs font-extrabold text-amber-800 transition hover:bg-amber-600 hover:text-white"
              >
                Carregar mais 50 dotações ({filtered.length - visibleCount} restantes)
              </button>
              <button
                type="button"
                onClick={() => setVisibleCount(filtered.length)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
              >
                Exibir todas ({filtered.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

