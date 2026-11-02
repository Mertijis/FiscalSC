"use client";

import {
  CircleDollarSign,
  ArrowDown,
  FileText,
  Gavel,
} from "lucide-react";
import MetricCard from "./metric-card";

export type ExecutiveMetricCardsProps = {
  isFlorianopolis: boolean;
  revenue: string;
  expenses: string;
  contracts: string;
  bids: string;
  loadingData?: boolean;
  periodo?: string;
  totalReceitasArrecadadas?: number;
  totalReceitasCount?: number;
  totalDespesasReais?: number;
  totalContratosReais?: number;
  totalLicitacoesReais?: number;
  totalEmpenhosCount?: number;
  formatCurrency?: (val: number) => string;
};

export default function ExecutiveMetricCards({
  isFlorianopolis,
  revenue,
  expenses,
  contracts,
  bids,
  loadingData = false,
  periodo = "01/2024",
  totalReceitasArrecadadas = 0,
  totalReceitasCount = 0,
  totalDespesasReais = 0,
  totalContratosReais = 0,
  totalLicitacoesReais = 0,
  totalEmpenhosCount = 0,
  formatCurrency = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
}: ExecutiveMetricCardsProps) {
  return (
    <section className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Receitas */}
      <MetricCard
        icon={CircleDollarSign}
        title={
          isFlorianopolis
            ? `Receitas Arrecadadas (${periodo})`
            : "Receitas Totais (2025)"
        }
        value={
          isFlorianopolis
            ? loadingData
              ? "Carregando..."
              : formatCurrency(totalReceitasArrecadadas)
            : revenue
        }
        trend={
          isFlorianopolis
            ? `Arrecadação em ${totalReceitasCount} rubricas`
            : "+8,2% vs mês anterior"
        }
        color="#1168b7"
        loading={isFlorianopolis && loadingData}
      />

      {/* 2. Despesas */}
      <MetricCard
        icon={ArrowDown}
        title={isFlorianopolis ? `Despesas Pagas (${periodo})` : "Despesas Totais (2025)"}
        value={
          isFlorianopolis
            ? loadingData
              ? "Carregando..."
              : formatCurrency(totalDespesasReais)
            : expenses
        }
        trend={
          isFlorianopolis
            ? `Pagamentos em ${totalEmpenhosCount} empenhos`
            : "+4,7% vs mês anterior"
        }
        color="#45a33b"
        loading={isFlorianopolis && loadingData}
      />

      {/* 3. Contratos */}
      <MetricCard
        icon={FileText}
        title={isFlorianopolis ? `Contratos (${periodo})` : "Contratos Ativos"}
        value={
          isFlorianopolis
            ? loadingData
              ? "Carregando..."
              : `${totalContratosReais} contratos`
            : contracts
        }
        trend={
          isFlorianopolis
            ? "Base oficial da PMF"
            : "+3,1% vs mês anterior"
        }
        color="#1267b4"
        loading={isFlorianopolis && loadingData}
      />

      {/* 4. Licitações */}
      <MetricCard
        icon={Gavel}
        title={isFlorianopolis ? `Licitações (${periodo})` : "Licitações em Andamento"}
        value={
          isFlorianopolis
            ? loadingData
              ? "Carregando..."
              : `${totalLicitacoesReais} processos`
            : bids
        }
        trend={
          isFlorianopolis
            ? "Com editais para download"
            : "-2,3% vs mês anterior"
        }
        color="#7335d0"
        loading={isFlorianopolis && loadingData}
      />
    </section>
  );
}
