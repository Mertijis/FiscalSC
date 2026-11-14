"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, RefreshCw, Search, ArrowRight, Building, ChevronDown, ChevronUp } from "lucide-react";
import type { DespesaItem } from "@/lib/transparencia-service";
import { useStudy } from "@/components/providers/study-provider";

export type DespesasTabProps = {
  isFlorianopolis: boolean;
  name: string;
  periodo: string;
  loadingData: boolean;
  searchFilter: string;
  onSearchChange: (value: string) => void;
  areaFilter: string;
  onAreaChange: (value: string) => void;
  uniqueAreas: string[];
  filteredDespesas: DespesaItem[];
  formatCurrency: (val: number) => string;
};

export default function DespesasTab({
  isFlorianopolis,
  name,
  periodo,
  loadingData,
  searchFilter,
  onSearchChange,
  areaFilter,
  onAreaChange,
  uniqueAreas,
  filteredDespesas,
  formatCurrency,
}: DespesasTabProps) {
  const [expandedDespesas, setExpandedDespesas] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(25);
  const { awardAction } = useStudy();

  const visibleDespesas = filteredDespesas.slice(0, visibleCount);

  const toggleDespesa = (id: string) => {
    setExpandedDespesas((prev) => {
      const nextOpen = !prev[id];
      if (nextOpen && isFlorianopolis) {
        awardAction(
          "expand_movimentos_despesa",
          "Inspecionou os 3 estágios de movimento de um empenho",
          30,
        );
      }
      return {
        ...prev,
        [id]: nextOpen,
      };
    });
  };

  if (!isFlorianopolis) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <Building size={36} className="mx-auto text-gray-400 mb-3" />
        <h3 className="text-base font-extrabold text-gray-900">
          Integração de Despesas em Andamento para {name}
        </h3>
        <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
          Atualmente, a API de Dados Abertos (e-Pública) está conectada ao vivo para <strong>Florianópolis</strong>.
          Você pode visitar o executivo de Florianópolis para testar empenhos reais!
        </p>
        <Link
          href="/gastos/municipio/florianopolis"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#16844a] px-4 py-2 text-xs font-bold text-white hover:bg-[#126b3c]"
        >
          Ir para Florianópolis <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#dce4e1] bg-white p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2 break-words">
            <TrendingUp className="text-[#16844a] shrink-0" size={20} />
            Empenhos e Liquidações Oficiais — {name}
          </h3>
          <p className="text-xs text-gray-500 break-words">
            Dados oficiais extraídos do Portal da Transparência de {name} para a competência {periodo}.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 max-w-full">
          <label className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por credor, CNPJ ou empenho..."
              className="h-9 w-full sm:w-64 rounded-lg border border-[#dce4e1] bg-white pl-8 pr-3 text-xs focus:border-[#16844a] focus:outline-none"
            />
          </label>

          <select
            value={areaFilter}
            onChange={(e) => onAreaChange(e.target.value)}
            className="h-9 max-w-full rounded-lg border border-[#dce4e1] bg-white px-3 text-xs focus:border-[#16844a] focus:outline-none shrink-0"
          >
            {uniqueAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingData ? (
        <div className="py-16 text-center text-xs text-gray-400">
          <RefreshCw size={24} className="mx-auto animate-spin text-[#16844a] mb-2" />
          Carregando empenhos reais da Prefeitura de Florianópolis...
        </div>
      ) : filteredDespesas.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400">
          Nenhum empenho encontrado com os filtros atuais.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#f4f7f5] px-3.5 py-2 text-xs text-gray-600">
            <span>
              Exibindo <strong>{visibleDespesas.length}</strong> de{" "}
              <strong>{filteredDespesas.length}</strong> empenhos filtrados
            </span>
            {visibleCount < filteredDespesas.length && (
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 50)}
                className="font-bold text-[#16844a] hover:underline cursor-pointer"
              >
                Carregar +50 empenhos
              </button>
            )}
          </div>

          <div className="grid gap-3">
            {visibleDespesas.map((d, idx) => {
            const itemKey = d.id || `despesa-${d.numeroEmpenho}-${idx}`;
            const isExpanded = !!expandedDespesas[itemKey];
            const movs = d.movimentos && d.movimentos.length > 0
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
                className="rounded-xl border border-[#e1e8e5] bg-[#fafcfb] p-4 transition hover:border-[#16844a] hover:shadow-sm min-w-0 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <span className="flex h-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 px-2.5 text-xs font-bold text-blue-700 whitespace-nowrap">
                      Nº {d.numeroEmpenho}
                    </span>
                    <div className="min-w-0 flex-1">
                      <strong className="text-sm text-gray-900 block break-words">{d.fornecedorNome}</strong>
                      <span className="text-[11px] text-gray-400 block break-words">
                        CNPJ/CPF: {d.fornecedorCpfCnpj || "—"} • Emissão: {d.emissao || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <small className="block text-[9px] uppercase font-bold tracking-wider text-gray-400">
                      Valor Pago
                    </small>
                    <span
                      className={`text-base font-extrabold block ${
                        (d.valorPago ?? d.valor) > 0 ? "text-[#16844a]" : "text-gray-500"
                      }`}
                    >
                      {formatCurrency(d.valorPago ?? d.valor)}
                    </span>
                    <small className="block text-[10px] text-gray-400 break-words max-w-[240px] sm:max-w-none">
                      {(d.valorEmpenhado ?? 0) !== 0 && (
                        <span>Emp: {formatCurrency(d.valorEmpenhado || 0)} </span>
                      )}
                      {(d.valorLiquidado ?? 0) !== 0 && (
                        <span>• Liq: {formatCurrency(d.valorLiquidado || 0)}</span>
                      )}
                      {(d.valorEmpenhado ?? 0) === 0 && (d.valorLiquidado ?? 0) === 0 && (
                        <span>
                          {d.tipoMovimento || "Execução"}
                          {movs.length > 1 ? ` • ${movs.length} movimentos` : ""}
                        </span>
                      )}
                    </small>
                  </div>
                </div>

                <p className="mt-3 rounded-lg border border-[#e1e8e5] bg-white p-3 text-xs leading-relaxed text-gray-700 break-words [overflow-wrap:anywhere]">
                  <strong className="text-gray-900">Objeto da Despesa:</strong> {d.objeto}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] min-w-0 flex-1">
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800 break-words [overflow-wrap:anywhere] max-w-full">
                      Área: {d.funcao}
                    </span>
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-gray-600 break-words [overflow-wrap:anywhere] max-w-full">
                      Elemento: {d.elemento}
                    </span>
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-gray-600 break-words [overflow-wrap:anywhere] max-w-full">
                      Órgão: {d.orgao}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleDespesa(itemKey);
                    }}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 hover:border-blue-300 shadow-xs shrink-0"
                  >
                    <span>
                      {isExpanded ? "Ocultar movimentos" : `Ver todos os movimentos (${movs.length})`}
                    </span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {isExpanded && movs.length > 0 && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-[#e1e8e5] bg-white shadow-xs">
                    <div className="bg-[#f4f7f5] px-3 py-2 border-b border-[#e1e8e5] flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-gray-700">
                        Histórico de Movimentos ({movs.length})
                      </span>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 font-medium">
                        {(d.valorEmpenhado ?? 0) !== 0 && (
                          <span>
                            Empenhado: <strong className="text-gray-700">{formatCurrency(d.valorEmpenhado || 0)}</strong>
                          </span>
                        )}
                        {(d.valorLiquidado ?? 0) !== 0 && (
                          <span>
                            Liquidado: <strong className="text-blue-700">{formatCurrency(d.valorLiquidado || 0)}</strong>
                          </span>
                        )}
                        <span>
                          Pago em destaque:{" "}
                          <strong className="text-[#16844a] font-bold">
                            {formatCurrency(d.valorPago ?? d.valor)}
                          </strong>
                        </span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-[#e1e8e5] bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                          <tr>
                            <th className="px-3 py-2">Data</th>
                            <th className="px-3 py-2">Tipo do Movimento</th>
                            <th className="px-3 py-2 text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eef2f0] text-[11px]">
                          {movs.map((mov, mIdx) => {
                            const isPagamento = (mov.tipoMovimento || "").toLowerCase().includes("pagamento");
                            return (
                              <tr
                                key={mIdx}
                                className={
                                  isPagamento
                                    ? "bg-emerald-50/50 hover:bg-emerald-50 transition"
                                    : "hover:bg-slate-50/70 transition"
                                }
                              >
                                <td className="px-3 py-2 whitespace-nowrap text-gray-600 font-mono">
                                  {mov.dataMovimento || "—"}
                                </td>
                                <td className="px-3 py-2 text-gray-800 break-words">
                                  <span
                                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold break-words [overflow-wrap:anywhere] max-w-full ${
                                      isPagamento
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-gray-100 text-gray-700 font-medium"
                                    }`}
                                  >
                                    {mov.tipoMovimento || "Movimento"}
                                  </span>
                                </td>
                                <td
                                  className={`px-3 py-2 text-right whitespace-nowrap font-bold ${
                                    isPagamento ? "text-[#16844a]" : "text-gray-900"
                                  }`}
                                >
                                  {formatCurrency(mov.valorMovimento)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>

          {visibleCount < filteredDespesas.length && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 50)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#16844a] bg-emerald-50/70 px-5 py-2.5 text-xs font-extrabold text-[#16844a] transition hover:bg-[#16844a] hover:text-white"
              >
                Carregar mais 50 empenhos ({filteredDespesas.length - visibleCount} restantes)
              </button>
              <button
                type="button"
                onClick={() => setVisibleCount(filteredDespesas.length)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
              >
                Exibir todos ({filteredDespesas.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
