"use client";

import { useState } from "react";
import ExecutiveHeader from "../header/executive-header";
import ExecutiveMetricCards from "../metrics/executive-metric-cards";
import ExecutiveTabsNav, { type ExecutiveTabType } from "../tabs/executive-tabs-nav";
import OverviewTab from "../tabs/overview-tab";
import ReceitasTab from "../tabs/receitas-tab";
import DespesasTab from "../tabs/despesas-tab";
import OrcamentoTab from "../tabs/orcamento-tab";
import LicitacoesTab from "../tabs/licitacoes-tab";
import ContratosTab from "../tabs/contratos-tab";
import PessoalTab from "../tabs/pessoal-tab";
import ExecutiveFooter from "../footer/executive-footer";
import { formatCurrencyBRL } from "@/lib/transparencia-service";

export type StateExecutiveViewProps = {
  name?: string;
  revenue?: string;
  expenses?: string;
  contracts?: string;
  bids?: string;
};

export default function StateExecutiveView({
  name = "Santa Catarina",
  revenue = "R$ 12,48 bi",
  expenses = "R$ 11,11 bi",
  contracts = "1.248",
  bids = "87",
}: StateExecutiveViewProps) {
  const [activeTab, setActiveTab] = useState<ExecutiveTabType>("overview");

  return (
    <div className="mx-auto w-full max-w-[1540px] min-w-0 space-y-5">
      {/* Header */}
      <ExecutiveHeader
        label="Santa Catarina"
        isFlorianopolis={false}
        kind="estado"
      />

      {/* Tabs Navigation */}
      <ExecutiveTabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isFlorianopolis={false}
      />

      {/* TAB 1: VISÃO GERAL */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <ExecutiveMetricCards
            isFlorianopolis={false}
            revenue={revenue}
            expenses={expenses}
            contracts={contracts}
            bids={bids}
          />

          <div className="w-full min-w-0 space-y-4">
            <OverviewTab
              isFlorianopolis={false}
              loadingData={false}
              periodo="2025"
              totalDespesasReais={0}
              expenses={expenses}
              contracts={contracts}
              areasDistrib={[]}
              dynamicConic="none"
              liveDespesas={[]}
              liveLicitacoes={[]}
              liveContratos={[]}
              onNavigateTab={setActiveTab}
              formatCurrency={formatCurrencyBRL}
            />
          </div>
        </div>
      )}

      {/* TAB 2: RECEITAS */}
      {activeTab === "receitas" && (
        <ReceitasTab
          isFlorianopolis={false}
          name={name}
          periodo="2025"
          loadingData={false}
          liveReceitas={[]}
          totalReceitasArrecadadas={0}
          totalReceitasPrevistas={0}
          formatCurrency={formatCurrencyBRL}
        />
      )}

      {/* TAB 2: DESPESAS */}
      {activeTab === "despesas" && (
        <DespesasTab
          isFlorianopolis={false}
          name={name}
          periodo="2025"
          loadingData={false}
          searchFilter=""
          onSearchChange={() => {}}
          areaFilter="Todas as áreas"
          onAreaChange={() => {}}
          uniqueAreas={[]}
          filteredDespesas={[]}
          formatCurrency={formatCurrencyBRL}
        />
      )}

      {/* TAB 3: ORÇAMENTO */}
      {activeTab === "orcamento" && (
        <OrcamentoTab
          isFlorianopolis={false}
          name={name}
          periodo="2025"
          loadingData={false}
          liveOrcamento={[]}
          totalEmpenhadoOrcamento={0}
          totalLiquidadoOrcamento={0}
          totalPagoOrcamento={0}
          formatCurrency={formatCurrencyBRL}
        />
      )}

      {/* TAB 4: LICITAÇÕES */}
      {activeTab === "licitacoes" && (
        <LicitacoesTab
          isFlorianopolis={false}
          name={name}
          loadingData={false}
          liveLicitacoes={[]}
          formatCurrency={formatCurrencyBRL}
        />
      )}

      {/* TAB 5: CONTRATOS */}
      {activeTab === "contratos" && (
        <ContratosTab
          isFlorianopolis={false}
          name={name}
          loadingData={false}
          liveContratos={[]}
          formatCurrency={formatCurrencyBRL}
        />
      )}

      {/* TAB 6: PESSOAL */}
      {activeTab === "pessoal" && (
        <PessoalTab
          isFlorianopolis={false}
          name={name}
          periodo="2025"
          loadingData={false}
          livePessoal={[]}
          totalFolhaBruta={0}
          formatCurrency={formatCurrencyBRL}
        />
      )}

      {/* Footer Banner */}
      <ExecutiveFooter isFlorianopolis={false} />
    </div>
  );
}
