"use client";

import {
  BarChart3,
  CircleDollarSign,
  TrendingUp,
  Gavel,
  FileText,
  Landmark,
  Users,
  RefreshCw,
} from "lucide-react";
import { MESES_OPCOES, ANOS_OPCOES } from "@/hooks/use-florianopolis-transparencia";

export type ExecutiveTabType =
  | "overview"
  | "receitas"
  | "despesas"
  | "orcamento"
  | "licitacoes"
  | "contratos"
  | "pessoal";

export type ExecutiveTabsNavProps = {
  activeTab: ExecutiveTabType;
  onTabChange: (tab: ExecutiveTabType) => void;
  isFlorianopolis: boolean;
  liveReceitasCount?: number;
  liveDespesasCount?: number;
  liveOrcamentoCount?: number;
  liveLicitacoesCount?: number;
  liveContratosCount?: number;
  livePessoalCount?: number;
  mes?: string;
  onMesChange?: (mes: string) => void;
  ano?: string;
  onAnoChange?: (ano: string) => void;
  loadingData?: boolean;
};

export default function ExecutiveTabsNav({
  activeTab,
  onTabChange,
  isFlorianopolis,
  liveReceitasCount = 0,
  liveDespesasCount = 0,
  liveOrcamentoCount = 0,
  liveLicitacoesCount = 0,
  liveContratosCount = 0,
  livePessoalCount = 0,
  mes = "01",
  onMesChange,
  ano = "2024",
  onAnoChange,
  loadingData = false,
}: ExecutiveTabsNavProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
      <button
        onClick={() => onTabChange("overview")}
        className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
          activeTab === "overview"
            ? "bg-[#16844a] text-white shadow-md shadow-[#16844a]/20"
            : "bg-white text-gray-600 border border-[#dce4e1] hover:bg-gray-50"
        }`}
      >
        <BarChart3 size={15} />
        Visão Geral
      </button>

      <button
        onClick={() => onTabChange("receitas")}
        className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
          activeTab === "receitas"
            ? "bg-[#16844a] text-white shadow-md shadow-[#16844a]/20"
            : "bg-white text-gray-600 border border-[#dce4e1] hover:bg-gray-50"
        }`}
      >
        <CircleDollarSign size={15} />
        Receitas
        {isFlorianopolis && liveReceitasCount > 0 && (
          <span className="rounded-full bg-sky-200/70 px-1.5 py-0.2 text-[10px] text-sky-950 font-extrabold">
            {liveReceitasCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onTabChange("despesas")}
        className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
          activeTab === "despesas"
            ? "bg-[#16844a] text-white shadow-md shadow-[#16844a]/20"
            : "bg-white text-gray-600 border border-[#dce4e1] hover:bg-gray-50"
        }`}
      >
        <TrendingUp size={15} />
        Despesas &amp; Empenhos
        {isFlorianopolis && liveDespesasCount > 0 && (
          <span className="rounded-full bg-emerald-200/70 px-1.5 py-0.2 text-[10px] text-emerald-950 font-extrabold">
            {liveDespesasCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onTabChange("orcamento")}
        className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
          activeTab === "orcamento"
            ? "bg-[#16844a] text-white shadow-md shadow-[#16844a]/20"
            : "bg-white text-gray-600 border border-[#dce4e1] hover:bg-gray-50"
        }`}
      >
        <Landmark size={15} />
        Orçamento (LOA)
        {isFlorianopolis && liveOrcamentoCount > 0 && (
          <span className="rounded-full bg-amber-200/70 px-1.5 py-0.2 text-[10px] text-amber-950 font-extrabold">
            {liveOrcamentoCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onTabChange("licitacoes")}
        className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
          activeTab === "licitacoes"
            ? "bg-[#16844a] text-white shadow-md shadow-[#16844a]/20"
            : "bg-white text-gray-600 border border-[#dce4e1] hover:bg-gray-50"
        }`}
      >
        <Gavel size={15} />
        Licitações &amp; Editais
        {isFlorianopolis && liveLicitacoesCount > 0 && (
          <span className="rounded-full bg-purple-200/70 px-1.5 py-0.2 text-[10px] text-purple-950 font-extrabold">
            {liveLicitacoesCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onTabChange("contratos")}
        className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
          activeTab === "contratos"
            ? "bg-[#16844a] text-white shadow-md shadow-[#16844a]/20"
            : "bg-white text-gray-600 border border-[#dce4e1] hover:bg-gray-50"
        }`}
      >
        <FileText size={15} />
        Contratos
        {isFlorianopolis && liveContratosCount > 0 && (
          <span className="rounded-full bg-blue-200/70 px-1.5 py-0.2 text-[10px] text-blue-950 font-extrabold">
            {liveContratosCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onTabChange("pessoal")}
        className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
          activeTab === "pessoal"
            ? "bg-[#16844a] text-white shadow-md shadow-[#16844a]/20"
            : "bg-white text-gray-600 border border-[#dce4e1] hover:bg-gray-50"
        }`}
      >
        <Users size={15} />
        Servidores &amp; Folha
        {isFlorianopolis && livePessoalCount > 0 && (
          <span className="rounded-full bg-teal-200/70 px-1.5 py-0.2 text-[10px] text-teal-950 font-extrabold">
            {livePessoalCount}
          </span>
        )}
      </button>

      {isFlorianopolis && onMesChange && onAnoChange && (
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
          <span className="text-[11px] font-semibold text-gray-600">Competência:</span>

          {/* Mês Select */}
          <select
            value={mes}
            onChange={(e) => onMesChange(e.target.value)}
            disabled={loadingData}
            className="rounded-lg border border-[#dce4e1] bg-white px-2 py-1 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#16844a] disabled:opacity-50"
            aria-label="Selecionar mês"
          >
            {MESES_OPCOES.map((m) => (
              <option key={m.valor} value={m.valor}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Ano Select */}
          <select
            value={ano}
            onChange={(e) => onAnoChange(e.target.value)}
            disabled={loadingData}
            className="rounded-lg border border-[#dce4e1] bg-white px-2 py-1 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#16844a] disabled:opacity-50"
            aria-label="Selecionar ano"
          >
            {ANOS_OPCOES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {loadingData && <RefreshCw size={14} className="animate-spin text-[#16844a] shrink-0" />}
        </div>
      )}
    </div>
  );
}
