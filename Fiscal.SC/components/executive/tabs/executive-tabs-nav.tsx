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
  CalendarDays,
  type LucideIcon,
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
  const tabs: Array<{
    id: ExecutiveTabType;
    label: string;
    Icon: LucideIcon;
    count?: number;
    badgeClass?: string;
  }> = [
    { id: "overview", label: "Visão Geral", Icon: BarChart3 },
    { id: "receitas", label: "Receitas", Icon: CircleDollarSign, count: liveReceitasCount, badgeClass: "bg-sky-200/70 text-sky-950" },
    { id: "despesas", label: "Despesas & Empenhos", Icon: TrendingUp, count: liveDespesasCount, badgeClass: "bg-emerald-200/70 text-emerald-950" },
    { id: "orcamento", label: "Orçamento (LOA)", Icon: Landmark, count: liveOrcamentoCount, badgeClass: "bg-amber-200/70 text-amber-950" },
    { id: "licitacoes", label: "Licitações & Editais", Icon: Gavel, count: liveLicitacoesCount, badgeClass: "bg-purple-200/70 text-purple-950" },
    { id: "contratos", label: "Contratos", Icon: FileText, count: liveContratosCount, badgeClass: "bg-blue-200/70 text-blue-950" },
    { id: "pessoal", label: "Servidores & Folha", Icon: Users, count: livePessoalCount, badgeClass: "bg-teal-200/70 text-teal-950" },
  ];

  const selectClass =
    "min-w-0 flex-1 rounded-lg border border-[#dce4e1] bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#16844a] disabled:opacity-50 sm:flex-none";

  return (
    // Uma única linha com quebra: em telas largas abas + competência ficam lado a lado.
    // Quando não cabe, o espaçador elástico fica no fim da linha das abas e a competência
    // desce alinhada à esquerda (em vez de ficar "solta" à direita).
    <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-3 border-b border-gray-200 pb-3">
      {/* Abas: rolagem horizontal no celular; a partir de sm os botões viram itens da linha (contents) */}
      <div
        role="group"
        aria-label="Seções do painel"
        className="-mx-4 flex w-[calc(100%+2rem)] min-w-0 gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:contents"
      >
        {tabs.map(({ id, label, Icon, count = 0, badgeClass }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                active
                  ? "bg-[#16844a] text-white shadow-md shadow-[#16844a]/20"
                  : "bg-white text-gray-600 border border-[#dce4e1] hover:bg-gray-50"
              }`}
            >
              <Icon size={15} />
              {label}
              {isFlorianopolis && count > 0 && badgeClass && (
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${badgeClass}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isFlorianopolis && onMesChange && onAnoChange && (
        <>
          {/* Espaçador elástico: empurra a competência para a direita quando tudo cabe na mesma linha */}
          <span aria-hidden="true" className="-ml-1.5 hidden flex-1 sm:block" />

          <div
            className="flex w-full items-center gap-1.5 text-xs text-gray-500 sm:w-auto"
            title="Competência (mês/ano)"
          >
            {/* Ícone no lugar do texto "Competência:" (economiza espaço); vira spinner durante o carregamento */}
            <span className="sr-only">Competência</span>
            {loadingData ? (
              <RefreshCw size={15} aria-hidden="true" className="shrink-0 animate-spin text-[#16844a]" />
            ) : (
              <CalendarDays size={15} aria-hidden="true" className="shrink-0 text-gray-500" />
            )}
  
            <select
              value={mes}
              onChange={(e) => onMesChange(e.target.value)}
              disabled={loadingData}
              className={selectClass}
              aria-label="Selecionar mês"
            >
              {MESES_OPCOES.map((m) => (
                <option key={m.valor} value={m.valor}>
                  {m.label}
                </option>
              ))}
            </select>
  
            <select
              value={ano}
              onChange={(e) => onAnoChange(e.target.value)}
              disabled={loadingData}
              className={selectClass}
              aria-label="Selecionar ano"
            >
              {ANOS_OPCOES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}
