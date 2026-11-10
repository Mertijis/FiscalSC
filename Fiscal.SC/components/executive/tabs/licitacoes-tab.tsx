"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Gavel,
  RefreshCw,
  Download,
  ArrowRight,
  Search,
  ChevronDown,
  ChevronUp,
  Award,
} from "lucide-react";
import type { LicitacaoItem } from "@/lib/transparencia-service";

export type LicitacoesTabProps = {
  isFlorianopolis: boolean;
  cityId?: string;
  name: string;
  periodo?: string;
  loadingData: boolean;
  liveLicitacoes: LicitacaoItem[];
  formatCurrency: (val: number) => string;
};

export default function LicitacoesTab({
  isFlorianopolis,
  cityId = "florianopolis",
  name,
  periodo = "01/2024",
  loadingData,
  liveLicitacoes,
  formatCurrency,
}: LicitacoesTabProps) {
  const [search, setSearch] = useState("");
  const [modalidadeFilter, setModalidadeFilter] = useState("Todas as modalidades");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const modalidades = useMemo(() => {
    const set = new Set<string>();
    for (const lic of liveLicitacoes) {
      if (lic.modalidade) set.add(lic.modalidade);
    }
    return ["Todas as modalidades", ...Array.from(set)];
  }, [liveLicitacoes]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return liveLicitacoes.filter((lic) => {
      const matchesMod =
        modalidadeFilter === "Todas as modalidades" ||
        lic.modalidade === modalidadeFilter;
      const matchesSearch =
        !q ||
        lic.numero.toLowerCase().includes(q) ||
        lic.objeto.toLowerCase().includes(q) ||
        lic.orgao.toLowerCase().includes(q) ||
        (lic.vencedorPrincipal?.toLowerCase().includes(q) ?? false);
      return matchesMod && matchesSearch;
    });
  }, [liveLicitacoes, search, modalidadeFilter]);

  if (!isFlorianopolis) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <Gavel size={36} className="mx-auto text-gray-400 mb-3" />
        <h3 className="text-base font-extrabold text-gray-900">
          Licitações em Andamento para {name}
        </h3>
        <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
          A integração de download de editais e processos licitatórios via API está conectada ao vivo para Florianópolis.
        </p>
        <Link
          href="/gastos/municipio/florianopolis"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#16844a] px-4 py-2 text-xs font-bold text-white hover:bg-[#126b3c]"
        >
          Ver Licitações de Florianópolis <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#dce4e1] bg-white p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Gavel className="text-purple-600 shrink-0" size={20} />
            Licitações e Processos de Compras Oficiais — {name}
          </h3>
          <p className="text-xs text-gray-500">
            Consulte os processos licitatórios da competência {periodo}, itens homologados e baixe os editais oficiais.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <label className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar processo, objeto, órgão ou vencedor..."
              className="h-9 w-full sm:w-64 rounded-lg border border-[#dce4e1] bg-white pl-8 pr-3 text-xs focus:border-[#16844a] focus:outline-none"
            />
          </label>

          <select
            value={modalidadeFilter}
            onChange={(e) => setModalidadeFilter(e.target.value)}
            className="h-9 rounded-lg border border-[#dce4e1] bg-white px-3 text-xs focus:border-[#16844a] focus:outline-none"
          >
            {modalidades.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingData ? (
        <div className="py-16 text-center text-xs text-gray-400">
          <RefreshCw size={24} className="mx-auto animate-spin text-purple-600 mb-2" />
          Carregando licitações e editais do portal da transparência...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400">
          Nenhuma licitação encontrada para os filtros selecionados.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((lic) => {
            const isExpanded = !!expandedIds[lic.id];
            const itens = lic.itens || [];

            return (
              <div
                key={lic.id}
                className="rounded-xl border border-[#e1e8e5] bg-[#fafcfb] p-4 transition hover:border-purple-400 hover:shadow-sm min-w-0 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <span className="flex h-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 px-2.5 text-xs font-bold text-purple-700 whitespace-nowrap">
                      {lic.numero}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm text-gray-900 break-words">
                          {lic.modalidade} — {lic.orgao}
                        </strong>
                        {lic.situacao && (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                            {lic.situacao}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 block break-words">
                        Emissão: {lic.dataEmissao} &bull; Abertura: {lic.aberturaData}
                        {lic.finalidade ? ` • ${lic.finalidade}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-base font-extrabold text-purple-700 block">
                      {formatCurrency(lic.valorEstimado)}
                    </span>
                    <small className="block text-[10px] text-gray-400">Valor Estimado</small>
                  </div>
                </div>

                {lic.vencedorPrincipal && (
                  <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-emerald-50/80 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-900">
                    <Award size={14} className="text-emerald-600 shrink-0" />
                    <span>
                      <strong>Vencedor Homologado:</strong> {lic.vencedorPrincipal}
                    </span>
                  </div>
                )}

                <p className="mt-3 rounded-lg border border-[#e1e8e5] bg-white p-3 text-xs leading-relaxed text-gray-700 break-words [overflow-wrap:anywhere]">
                  <strong className="text-gray-900">Objeto da Licitação:</strong> {lic.objeto}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                  {lic.links.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                      <span className="text-[11px] font-semibold text-gray-500 shrink-0">
                        Documentos ({lic.links.length}):
                      </span>
                      {lic.links.map((doc, idx) => {
                        const safeFileName = `${lic.numero}_${doc.denominacao}`;
                        const downloadUrl = `/api/download?url=${encodeURIComponent(doc.link)}&filename=${encodeURIComponent(safeFileName)}&periodo=${encodeURIComponent(periodo)}&cityId=${encodeURIComponent(cityId)}`;

                        return (
                          <a
                            key={idx}
                            href={downloadUrl}
                            download={`${safeFileName}.pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 hover:bg-purple-100 hover:border-purple-300 transition shadow-2xs max-w-full"
                            title={`Baixar ${doc.denominacao} em PDF`}
                          >
                            <Download size={13} className="shrink-0" />
                            <span className="truncate max-w-[200px] sm:max-w-[260px]">
                              {doc.denominacao}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-400">
                      Sem anexos digitais vinculados.
                    </span>
                  )}

                  {itens.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedIds((prev) => ({ ...prev, [lic.id]: !prev[lic.id] }))
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-700 hover:bg-gray-50 transition shrink-0"
                    >
                      <span>
                        {isExpanded
                          ? "Ocultar itens"
                          : `Ver itens licitados (${itens.length})`}
                      </span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </div>

                {isExpanded && itens.length > 0 && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-[#e1e8e5] bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[#e1e8e5] bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                        <tr>
                          <th className="px-3 py-2">#</th>
                          <th className="px-3 py-2">Item / Especificação</th>
                          <th className="px-3 py-2">Qtd.</th>
                          <th className="px-3 py-2">Situação / Vencedor</th>
                          <th className="px-3 py-2 text-right">Valor Unit. Est.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eef2f0] text-[11px]">
                        {itens.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70">
                            <td className="px-3 py-1.5 font-mono text-gray-500">{it.numero}</td>
                            <td className="px-3 py-1.5 font-medium text-gray-900">
                              {it.denominacao}
                            </td>
                            <td className="px-3 py-1.5 text-gray-600">
                              {it.quantidade} {it.unidadeMedida}
                            </td>
                            <td className="px-3 py-1.5 text-gray-700">
                              <span className="font-semibold text-purple-800">{it.situacao}</span>
                              {it.vencedor ? ` • ${it.vencedor}` : ""}
                            </td>
                            <td className="px-3 py-1.5 text-right font-bold text-gray-900">
                              {formatCurrency(it.valorUnitarioEstimado)}
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
      )}
    </div>
  );
}
