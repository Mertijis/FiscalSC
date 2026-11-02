"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  RefreshCw,
  Search,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Briefcase,
} from "lucide-react";
import type { PessoalItem } from "@/lib/transparencia-service";

export type PessoalTabProps = {
  isFlorianopolis: boolean;
  name: string;
  periodo: string;
  loadingData: boolean;
  livePessoal: PessoalItem[];
  totalFolhaBruta: number;
  formatCurrency: (val: number) => string;
};

export default function PessoalTab({
  isFlorianopolis,
  name,
  periodo,
  loadingData,
  livePessoal,
  totalFolhaBruta,
  formatCurrency,
}: PessoalTabProps) {
  const [search, setSearch] = useState("");
  const [vinculoFilter, setVinculoFilter] = useState("Todos os vínculos");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(25);

  const vinculos = useMemo(() => {
    const set = new Set<string>();
    for (const p of livePessoal) {
      if (p.vinculo) set.add(p.vinculo);
    }
    return ["Todos os vínculos", ...Array.from(set)];
  }, [livePessoal]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return livePessoal.filter((p) => {
      const matchesVinculo =
        vinculoFilter === "Todos os vínculos" || p.vinculo === vinculoFilter;
      const matchesSearch =
        !q ||
        p.nome.toLowerCase().includes(q) ||
        p.cargo.toLowerCase().includes(q) ||
        p.lotacao.toLowerCase().includes(q) ||
        p.orgao.toLowerCase().includes(q) ||
        p.matricula.toLowerCase().includes(q);
      return matchesVinculo && matchesSearch;
    });
  }, [livePessoal, search, vinculoFilter]);

  const totalLiquidoAmostra = useMemo(
    () => livePessoal.reduce((acc, p) => acc + p.remuneracaoLiquida, 0),
    [livePessoal]
  );

  if (!isFlorianopolis) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <Users size={36} className="mx-auto text-gray-400 mb-3" />
        <h3 className="text-base font-extrabold text-gray-900">
          Quadro de Pessoal e Remunerações de {name}
        </h3>
        <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
          A consulta de servidores públicos, cargos, lotações e eventos de folha de pagamento está ativa em tempo real para Florianópolis.
        </p>
        <Link
          href="/gastos/municipio/florianopolis"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#16844a] px-4 py-2 text-xs font-bold text-white hover:bg-[#126b3c]"
        >
          Ver Folha de Florianópolis <ArrowRight size={14} />
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
            <Users className="text-teal-600 shrink-0" size={20} />
            Gestão de Pessoal &amp; Folha de Pagamento — {name}
          </h3>
          <p className="text-xs text-gray-500">
            Servidores ativos, cargos, vínculos e detalhamento de proventos e descontos na competência {periodo}.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <label className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar servidor, cargo, matrícula ou lotação..."
              className="h-9 w-full sm:w-64 rounded-lg border border-[#dce4e1] bg-white pl-8 pr-3 text-xs focus:border-[#16844a] focus:outline-none"
            />
          </label>

          <select
            value={vinculoFilter}
            onChange={(e) => setVinculoFilter(e.target.value)}
            className="h-9 rounded-lg border border-[#dce4e1] bg-white px-3 text-xs focus:border-[#16844a] focus:outline-none"
          >
            {vinculos.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
            Servidores na Amostra ({periodo})
          </span>
          <strong className="mt-1 block text-lg font-black text-teal-950">
            {livePessoal.length} matrículas
          </strong>
          <span className="text-[10px] text-teal-700">
            Dados oficiais do e-Pública PMF
          </span>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
            Soma de Proventos Brutos (Amostra)
          </span>
          <strong className="mt-1 block text-lg font-black text-blue-950">
            {formatCurrency(totalFolhaBruta)}
          </strong>
          <span className="text-[10px] text-blue-700">
            Vencimentos + gratificações
          </span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            Soma Líquida Calculada (Amostra)
          </span>
          <strong className="mt-1 block text-lg font-black text-emerald-950">
            {formatCurrency(totalLiquidoAmostra)}
          </strong>
          <span className="text-[10px] text-emerald-700">
            Após retenções legais (INSS/IRRF)
          </span>
        </div>
      </div>

      {loadingData ? (
        <div className="py-16 text-center text-xs text-gray-400">
          <RefreshCw size={24} className="mx-auto animate-spin text-teal-600 mb-2" />
          Carregando folha de pagamento oficial da prefeitura...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400">
          Nenhum servidor encontrado com os filtros aplicados.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#f4f7f5] px-3.5 py-2 text-xs text-gray-600">
            <span>
              Exibindo <strong>{Math.min(visibleCount, filtered.length)}</strong> de{" "}
              <strong>{filtered.length}</strong> servidores filtrados
            </span>
            {visibleCount < filtered.length && (
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 50)}
                className="font-bold text-teal-700 hover:underline cursor-pointer"
              >
                Carregar +50 servidores
              </button>
            )}
          </div>

          <div className="grid gap-3">
            {filtered.slice(0, visibleCount).map((servidor) => {
            const isExpanded = !!expandedIds[servidor.id];
            return (
              <div
                key={servidor.id}
                className="rounded-xl border border-[#e1e8e5] bg-[#fafcfb] p-4 transition hover:border-teal-500 hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <span className="flex h-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 px-3 text-xs font-extrabold text-teal-800">
                      Mat. {servidor.matricula}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm font-extrabold text-gray-900">
                          {servidor.nome}
                        </strong>
                        <span className="rounded-full bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                          {servidor.vinculo}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500 block mt-0.5">
                        CPF: {servidor.cpf} &bull; Admissão: {servidor.dataAdmissao} &bull;{" "}
                        {servidor.cargaHorariaSemanais}h/sem
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:flex sm:items-center gap-4 text-left sm:text-right shrink-0">
                    <div>
                      <small className="block text-[9px] uppercase font-bold text-gray-400">
                        Bruto
                      </small>
                      <span className="text-xs font-extrabold text-gray-800">
                        {formatCurrency(servidor.remuneracaoBruta)}
                      </span>
                    </div>
                    <div>
                      <small className="block text-[9px] uppercase font-bold text-gray-400">
                        Descontos
                      </small>
                      <span className="text-xs font-bold text-red-600">
                        - {formatCurrency(servidor.totalDescontos)}
                      </span>
                    </div>
                    <div>
                      <small className="block text-[9px] uppercase font-bold text-gray-400">
                        Líquido
                      </small>
                      <span className="text-sm font-black text-teal-700">
                        {formatCurrency(servidor.remuneracaoLiquida)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-[10px]">
                  <div className="flex flex-wrap items-center gap-2 text-gray-600">
                    <span className="inline-flex items-center gap-1 rounded bg-white border border-gray-200 px-2 py-0.5 font-semibold text-gray-800">
                      <Briefcase size={11} className="text-teal-600" />
                      {servidor.cargo}
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-0.5">
                      Lotação: {servidor.lotacao}
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-0.5">
                      Órgão: {servidor.orgao}
                    </span>
                  </div>

                  {servidor.eventos.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedIds((prev) => ({
                          ...prev,
                          [servidor.id]: !prev[servidor.id],
                        }))
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 hover:bg-teal-100 transition"
                    >
                      <span>
                        {isExpanded
                          ? "Ocultar folha detalhada"
                          : `Ver rubricas da folha (${servidor.eventos.length})`}
                      </span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </div>

                {isExpanded && servidor.eventos.length > 0 && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-[#e1e8e5] bg-white">
                    <div className="bg-[#f4f7f5] px-3 py-2 border-b border-[#e1e8e5] flex items-center justify-between text-[11px]">
                      <strong className="text-gray-700">
                        Detalhamento de Rubricas — Competência {servidor.competencia}
                      </strong>
                      <span className="text-gray-500">
                        Líquido:{" "}
                        <strong className="text-teal-700">
                          {formatCurrency(servidor.remuneracaoLiquida)}
                        </strong>
                      </span>
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[#e1e8e5] bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                        <tr>
                          <th className="px-3 py-2">Rubrica / Evento</th>
                          <th className="px-3 py-2">Natureza</th>
                          <th className="px-3 py-2 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eef2f0] text-[11px]">
                        {servidor.eventos.map((ev, idx) => {
                          const isDesconto = ev.tipo.toLowerCase().includes("desconto");
                          return (
                            <tr key={idx} className="hover:bg-slate-50/70">
                              <td className="px-3 py-1.5 font-medium text-gray-800">
                                {ev.denominacao}
                              </td>
                              <td className="px-3 py-1.5">
                                <span
                                  className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                                    isDesconto
                                      ? "bg-red-50 text-red-700"
                                      : "bg-emerald-50 text-emerald-700"
                                  }`}
                                >
                                  {ev.tipo}
                                </span>
                              </td>
                              <td
                                className={`px-3 py-1.5 text-right font-bold ${
                                  isDesconto ? "text-red-600" : "text-gray-900"
                                }`}
                              >
                                {isDesconto ? "- " : ""}
                                {formatCurrency(ev.valor)}
                              </td>
                            </tr>
                          );
                        })}
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
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-teal-600 bg-teal-50/70 px-5 py-2.5 text-xs font-extrabold text-teal-800 transition hover:bg-teal-600 hover:text-white"
              >
                Carregar mais 50 servidores ({filtered.length - visibleCount} restantes)
              </button>
              <button
                type="button"
                onClick={() => setVisibleCount(filtered.length)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
              >
                Exibir todos ({filtered.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

