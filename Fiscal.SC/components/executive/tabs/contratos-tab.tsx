"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  RefreshCw,
  ArrowRight,
  Search,
  ChevronDown,
  ChevronUp,
  Building2,
} from "lucide-react";
import type { ContratoItem } from "@/lib/transparencia-service";

export type ContratosTabProps = {
  isFlorianopolis: boolean;
  name: string;
  periodo?: string;
  loadingData: boolean;
  liveContratos: ContratoItem[];
  formatCurrency: (val: number) => string;
};

export default function ContratosTab({
  isFlorianopolis,
  name,
  periodo = "01/2024",
  loadingData,
  liveContratos,
  formatCurrency,
}: ContratosTabProps) {
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return liveContratos;
    return liveContratos.filter(
      (c) =>
        c.numero.toLowerCase().includes(q) ||
        c.objeto.toLowerCase().includes(q) ||
        (c.fornecedorNome?.toLowerCase().includes(q) ?? false) ||
        (c.fornecedorCpfCnpj?.toLowerCase().includes(q) ?? false) ||
        (c.orgao?.toLowerCase().includes(q) ?? false)
    );
  }, [liveContratos, search]);

  if (!isFlorianopolis) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <FileText size={36} className="mx-auto text-gray-400 mb-3" />
        <h3 className="text-base font-extrabold text-gray-900">
          Contratos Administrativos de {name}
        </h3>
        <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
          A integração de contratos em tempo real está ativa para Florianópolis.
        </p>
        <Link
          href="/gastos/municipio/florianopolis"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#16844a] px-4 py-2 text-xs font-bold text-white hover:bg-[#126b3c]"
        >
          Ver Contratos de Florianópolis <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#dce4e1] bg-white p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600 shrink-0" size={20} />
            Contratos Administrativos — {name}
          </h3>
          <p className="text-xs text-gray-500">
            Contratos celebrados na competência {periodo}, fornecedores contratados, vigências e itens pactuados.
          </p>
        </div>

        <label className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar contrato, empresa, CNPJ ou objeto..."
            className="h-9 w-full rounded-lg border border-[#dce4e1] bg-white pl-8 pr-3 text-xs focus:border-[#16844a] focus:outline-none"
          />
        </label>
      </div>

      {loadingData ? (
        <div className="py-16 text-center text-xs text-gray-400">
          <RefreshCw size={24} className="mx-auto animate-spin text-blue-600 mb-2" />
          Carregando contratos da prefeitura...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400">
          Nenhum contrato encontrado para o filtro aplicado.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((cont) => {
            const isExpanded = !!expandedIds[cont.id];
            const itens = cont.itens || [];

            return (
              <div
                key={cont.id}
                className="rounded-xl border border-[#e1e8e5] bg-[#fafcfb] p-4 transition hover:border-blue-400 hover:shadow-sm min-w-0 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <span className="flex h-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 px-2.5 text-xs font-bold text-sky-700 whitespace-nowrap">
                      {cont.numero}
                    </span>
                    <div className="min-w-0 flex-1">
                      <strong className="text-sm text-gray-900 block break-words">
                        {cont.fornecedorNome || `Contrato Nº ${cont.numero}`}
                      </strong>
                      <span className="text-[11px] text-gray-500 block break-words">
                        CNPJ/CPF: {cont.fornecedorCpfCnpj || "—"} &bull; Vigência:{" "}
                        {cont.inicioVigencia} até {cont.vencimento}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-base font-extrabold text-blue-700 block">
                      {formatCurrency(cont.valorTotal)}
                    </span>
                    <small className="block text-[10px] text-gray-400">
                      Valor Total Contratado
                    </small>
                  </div>
                </div>

                <p className="mt-3 rounded-lg border border-[#e1e8e5] bg-white p-3 text-xs leading-relaxed text-gray-700 break-words [overflow-wrap:anywhere]">
                  <strong className="text-gray-900">Objeto do Contrato:</strong> {cont.objeto}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-[10px]">
                  <div className="flex flex-wrap items-center gap-2 text-gray-600">
                    {cont.orgao && (
                      <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 font-semibold text-gray-700">
                        <Building2 size={11} className="text-blue-600" />
                        {cont.orgao}
                      </span>
                    )}
                    {cont.assinatura && cont.assinatura !== "—" && (
                      <span className="rounded bg-gray-100 px-2 py-0.5">
                        Assinatura: {cont.assinatura}
                      </span>
                    )}
                  </div>

                  {itens.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedIds((prev) => ({ ...prev, [cont.id]: !prev[cont.id] }))
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                    >
                      <span>
                        {isExpanded
                          ? "Ocultar itens"
                          : `Ver itens contratados (${itens.length})`}
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
                          <th className="px-3 py-2">Descrição do Item</th>
                          <th className="px-3 py-2">Qtd.</th>
                          <th className="px-3 py-2 text-right">Valor Unit.</th>
                          <th className="px-3 py-2 text-right">Valor Total</th>
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
                            <td className="px-3 py-1.5 text-right text-gray-700">
                              {formatCurrency(it.valorUnitario)}
                            </td>
                            <td className="px-3 py-1.5 text-right font-bold text-blue-700">
                              {formatCurrency(it.valorTotal)}
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
