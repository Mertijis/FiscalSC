"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CircleDollarSign,
  RefreshCw,
  Search,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";
import type { ReceitaItem } from "@/lib/transparencia-service";

export type ReceitasTabProps = {
  isFlorianopolis: boolean;
  name: string;
  periodo: string;
  loadingData: boolean;
  liveReceitas: ReceitaItem[];
  totalReceitasArrecadadas: number;
  totalReceitasPrevistas: number;
  formatCurrency: (val: number) => string;
};

export default function ReceitasTab({
  isFlorianopolis,
  name,
  periodo,
  loadingData,
  liveReceitas,
  totalReceitasArrecadadas,
  totalReceitasPrevistas,
  formatCurrency,
}: ReceitasTabProps) {
  const [search, setSearch] = useState("");
  const [origemFilter, setOrigemFilter] = useState("Todas as origens");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(25);

  const origens = useMemo(() => {
    const set = new Set<string>();
    for (const r of liveReceitas) {
      if (r.origem) set.add(r.origem);
    }
    return ["Todas as origens", ...Array.from(set)];
  }, [liveReceitas]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return liveReceitas.filter((r) => {
      const matchesOrigem =
        origemFilter === "Todas as origens" || r.origem === origemFilter;
      const matchesSearch =
        !q ||
        r.detalhamento.toLowerCase().includes(q) ||
        r.rubrica.toLowerCase().includes(q) ||
        r.especie.toLowerCase().includes(q) ||
        r.fonteRecurso.toLowerCase().includes(q) ||
        r.orgao.toLowerCase().includes(q) ||
        r.codigoNatureza.toLowerCase().includes(q) ||
        String(r.codigo).includes(q);
      return matchesOrigem && matchesSearch;
    });
  }, [liveReceitas, search, origemFilter]);

  const comArrecadacaoCount = useMemo(
    () => liveReceitas.filter((r) => r.valorArrecadado > 0).length,
    [liveReceitas]
  );

  if (!isFlorianopolis) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <CircleDollarSign size={36} className="mx-auto text-gray-400 mb-3" />
        <h3 className="text-base font-extrabold text-gray-900">
          Arrecadação de Receitas em Andamento para {name}
        </h3>
        <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
          A consulta detalhada de receitas públicas (impostos, taxas, transferências constitucionais e convênios) está conectada ao vivo para <strong>Florianópolis</strong>.
        </p>
        <Link
          href="/gastos/municipio/florianopolis"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#16844a] px-4 py-2 text-xs font-bold text-white hover:bg-[#126b3c]"
        >
          Ver Receitas de Florianópolis <ArrowRight size={14} />
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
            <CircleDollarSign className="text-[#1168b7] shrink-0" size={20} />
            Receitas Públicas &amp; Arrecadação Mensal — {name}
          </h3>
          <p className="text-xs text-gray-500">
            Valores efetivamente arrecadados (líquidos de restituições e deduções) e previsão orçamentária na competência {periodo}.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <label className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar IPTU, ISS, FPM, SUS, fonte ou código..."
              className="h-9 w-full sm:w-64 rounded-lg border border-[#dce4e1] bg-white pl-8 pr-3 text-xs focus:border-[#16844a] focus:outline-none"
            />
          </label>

          <select
            value={origemFilter}
            onChange={(e) => setOrigemFilter(e.target.value)}
            className="h-9 rounded-lg border border-[#dce4e1] bg-white px-3 text-xs focus:border-[#16844a] focus:outline-none"
          >
            {origens.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs Strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            Receita Arrecadada Líquida ({periodo})
          </span>
          <strong className="mt-1 block text-lg font-black text-emerald-950">
            {formatCurrency(totalReceitasArrecadadas)}
          </strong>
          <span className="text-[10px] text-emerald-700">
            Arrecadação efetiva descontadas deduções/restituições
          </span>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
            Movimentos de previsão no mês
          </span>
          <strong className="mt-1 block text-lg font-black text-blue-950">
            {formatCurrency(totalReceitasPrevistas)}
          </strong>
          <span className="text-[10px] text-blue-700">
            Movimentos de previsão lançados no mês
          </span>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 block">
            Rubricas de Receita ({periodo})
          </span>
          <strong className="mt-1 block text-lg font-black text-gray-900">
            {liveReceitas.length} naturezas
          </strong>
          <span className="text-[10px] text-gray-500">
            {comArrecadacaoCount} com ingresso efetivo no mês
          </span>
        </div>
      </div>

      {loadingData ? (
        <div className="py-16 text-center text-xs text-gray-400">
          <RefreshCw size={24} className="mx-auto animate-spin text-[#1168b7] mb-2" />
          Carregando arrecadação oficial da Prefeitura de Florianópolis...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400">
          Nenhuma rubrica de receita encontrada com os filtros atuais.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#f4f7f5] px-3.5 py-2 text-xs text-gray-600">
            <span>
              Exibindo <strong>{Math.min(visibleCount, filtered.length)}</strong> de{" "}
              <strong>{filtered.length}</strong> receitas filtradas
            </span>
            {visibleCount < filtered.length && (
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 50)}
                className="font-bold text-[#1168b7] hover:underline cursor-pointer"
              >
                Carregar +50 receitas
              </button>
            )}
          </div>

          <div className="grid gap-3">
            {filtered.slice(0, visibleCount).map((r) => {
              const isExpanded = !!expandedIds[r.id];
              return (
                <div
                  key={r.id}
                  className="rounded-xl border border-[#e1e8e5] bg-[#fafcfb] p-4 transition hover:border-[#1168b7] hover:shadow-sm min-w-0 overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <span className="flex h-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 px-2.5 text-xs font-bold text-[#1168b7] whitespace-nowrap">
                        Cód. {r.codigo}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded bg-blue-100/80 px-2 py-0.5 text-[10px] font-bold text-blue-900">
                            {r.categoriaEconomica} &bull; {r.origem}
                          </span>
                          <span className="font-mono text-[10px] text-gray-400">
                            Natureza: {r.codigoNatureza}
                          </span>
                        </div>
                        <strong className="mt-1 text-sm text-gray-900 block break-words">
                          {r.detalhamento}
                        </strong>
                        <span className="text-[11px] text-gray-500 block break-words">
                          Rubrica: {r.rubrica} &bull; Espécie: {r.especie}
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <small className="block text-[9px] uppercase font-bold tracking-wider text-gray-400">
                        Valor Arrecadado
                      </small>
                      <span
                        className={`text-base font-extrabold block ${
                          r.valorArrecadado > 0
                            ? "text-[#16844a]"
                            : r.valorArrecadado < 0
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {formatCurrency(r.valorArrecadado)}
                      </span>
                      <small className="block text-[10px] text-gray-400">
                        {r.valorPrevisto > 0 && (
                          <span>Previsto LOA: {formatCurrency(r.valorPrevisto)} </span>
                        )}
                        {r.valorDeducoes > 0 && (
                          <span>• Deduções: -{formatCurrency(r.valorDeducoes)}</span>
                        )}
                        {r.valorPrevisto === 0 && r.valorDeducoes === 0 && (
                          <span>{r.movimentos.length} lançamento(s) no mês</span>
                        )}
                      </small>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-[10px]">
                    <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800 break-words max-w-full">
                        Fonte: {r.fonteRecurso}
                      </span>
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-gray-600 break-words max-w-full">
                        Unidade Gestora: {r.orgao}
                      </span>
                    </div>

                    {r.movimentos.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedIds((prev) => ({ ...prev, [r.id]: !prev[r.id] }))
                        }
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#1168b7] transition hover:bg-blue-100 shrink-0"
                      >
                        <Layers size={13} />
                        <span>
                          {isExpanded
                            ? "Ocultar lançamentos"
                            : `Ver lançamentos (${r.movimentos.length})`}
                        </span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                  </div>

                  {isExpanded && r.movimentos.length > 0 && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-[#e1e8e5] bg-white shadow-xs">
                      <div className="bg-[#f4f7f5] px-3 py-2 border-b border-[#e1e8e5] flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-gray-700">
                          Histórico de Movimentos da Receita ({r.movimentos.length})
                        </span>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 font-medium">
                          {r.valorPrevisto > 0 && (
                            <span>
                              Previsto: <strong className="text-blue-700">{formatCurrency(r.valorPrevisto)}</strong>
                            </span>
                          )}
                          {r.valorDeducoes > 0 && (
                            <span>
                              Deduções/Restituições: <strong className="text-red-600">-{formatCurrency(r.valorDeducoes)}</strong>
                            </span>
                          )}
                          <span>
                            Arrecadado em destaque:{" "}
                            <strong className="text-[#16844a] font-bold">
                              {formatCurrency(r.valorArrecadado)}
                            </strong>
                          </span>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-[#e1e8e5] bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                            <tr>
                              <th className="px-3 py-2">Data</th>
                              <th className="px-3 py-2">Estágio / Tipo do Movimento</th>
                              <th className="px-3 py-2 text-right">Valor</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#eef2f0] text-[11px]">
                            {r.movimentos.map((mov, mIdx) => {
                              const tipoLower = (mov.tipoMovimento || "").toLowerCase();
                              const isArrecadacao =
                                (tipoLower.includes("arrecadação") || tipoLower.includes("arrecadacao")) &&
                                !tipoLower.includes("estorno");
                              const isDeducao =
                                tipoLower.includes("estorno") ||
                                tipoLower.includes("restituição") ||
                                tipoLower.includes("dedução") ||
                                mov.valorMovimento < 0;

                              return (
                                <tr
                                  key={mIdx}
                                  className={
                                    isArrecadacao
                                      ? "bg-emerald-50/50 hover:bg-emerald-50 transition"
                                      : "hover:bg-slate-50/70 transition"
                                  }
                                >
                                  <td className="px-3 py-2 whitespace-nowrap text-gray-600 font-mono">
                                    {mov.dataMovimento || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-800">
                                    <span
                                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                                        isArrecadacao
                                          ? "bg-emerald-100 text-emerald-800"
                                          : isDeducao
                                          ? "bg-red-50 text-red-700"
                                          : "bg-gray-100 text-gray-700 font-medium"
                                      }`}
                                    >
                                      {mov.tipoMovimento || "Movimento"}
                                    </span>
                                  </td>
                                  <td
                                    className={`px-3 py-2 text-right whitespace-nowrap font-bold ${
                                      isArrecadacao
                                        ? "text-[#16844a]"
                                        : isDeducao
                                        ? "text-red-600"
                                        : "text-gray-900"
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

          {visibleCount < filtered.length && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 50)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#1168b7] bg-blue-50/70 px-5 py-2.5 text-xs font-extrabold text-[#1168b7] transition hover:bg-[#1168b7] hover:text-white"
              >
                Carregar mais 50 receitas ({filtered.length - visibleCount} restantes)
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

