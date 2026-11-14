"use client";

import { useEffect, useState } from "react";
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
import MunicipalityErrorAlert from "../alerts/municipality-error-alert";
import { useFlorianopolisTransparencia } from "@/hooks/use-florianopolis-transparencia";
import { useStudy } from "@/components/providers/study-provider";

const VALID_TABS: ExecutiveTabType[] = [
  "overview",
  "receitas",
  "despesas",
  "orcamento",
  "licitacoes",
  "contratos",
  "pessoal",
];

const LIVE_MUNICIPALITIES = ["florianopolis", "joinville", "itajai", "chapeco"];

const TAB_XP_LABELS: Partial<Record<ExecutiveTabType, { id: string; label: string }>> = {
  receitas: { id: "explore_tab_receitas", label: "Explorou a aba de Receitas de Florianópolis" },
  despesas: { id: "explore_tab_despesas", label: "Explorou a aba de Despesas e Empenhos" },
  orcamento: { id: "explore_tab_orcamento", label: "Explorou a aba de Orçamento (LOA)" },
  licitacoes: { id: "explore_tab_licitacoes", label: "Explorou a aba de Licitações e Editais" },
  contratos: { id: "explore_tab_contratos", label: "Explorou a aba de Contratos Vigentes" },
  pessoal: { id: "explore_tab_pessoal", label: "Explorou a Folha de Servidores" },
};

export type MunicipalityExecutiveViewProps = {
  name: string;
  slug: string;
  revenue: string;
  expenses: string;
  contracts: string;
  bids: string;
};

export default function MunicipalityExecutiveView({
  name,
  slug,
  revenue,
  expenses,
  contracts,
  bids,
}: MunicipalityExecutiveViewProps) {
  const isFlorianopolis = LIVE_MUNICIPALITIES.includes(slug);
  const label = `Prefeitura de ${name}`;
  const { awardAction } = useStudy();

  const [activeTab, setActiveTab] = useState<ExecutiveTabType>("overview");

  function handleTabChange(nextTab: ExecutiveTabType) {
    setActiveTab(nextTab);
    if (isFlorianopolis) {
      const actionInfo = TAB_XP_LABELS[nextTab];
      if (actionInfo) {
        awardAction(actionInfo.id, actionInfo.label, 25);
      }
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const requestedTab = params.get("tab") as ExecutiveTabType | null;
    if (requestedTab && VALID_TABS.includes(requestedTab)) {
      handleTabChange(requestedTab);
    }
  }, []);

  // Consume live API hook for connected e-Pública municipalities
  const {
    loadingData,
    mes,
    setMes,
    ano,
    setAno,
    periodo,
    liveReceitas,
    liveDespesas,
    liveLicitacoes,
    liveContratos,
    livePessoal,
    liveOrcamento,
    tempoExecucaoMs,
    searchFilter,
    setSearchFilter,
    areaFilter,
    setAreaFilter,
    filteredDespesas,
    uniqueAreas,
    totalReceitasArrecadadas,
    totalReceitasPrevistas,
    totalDespesasReais,
    totalFolhaBruta,
    totalEmpenhadoOrcamento,
    totalLiquidadoOrcamento,
    totalPagoOrcamento,
    areasDistrib,
    dynamicConic,
    formatCurrency,
    dashboardSource,
    dashboardError,
    retry,
  } = useFlorianopolisTransparencia(isFlorianopolis, slug);

  return (
    <div className="mx-auto w-full max-w-[1540px] min-w-0 space-y-5">
      {/* Header */}
      <ExecutiveHeader
        label={label}
        isFlorianopolis={isFlorianopolis}
        kind="municipio"
      />

      {/* Tabs Navigation */}
      <ExecutiveTabsNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isFlorianopolis={isFlorianopolis}
        liveReceitasCount={liveReceitas.length}
        liveDespesasCount={liveDespesas.length}
        liveOrcamentoCount={liveOrcamento.length}
        liveLicitacoesCount={liveLicitacoes.length}
        liveContratosCount={liveContratos.length}
        livePessoalCount={livePessoal.length}
        mes={mes}
        onMesChange={(nextMes) => {
          setMes(nextMes);
          if (isFlorianopolis) {
            awardAction("change_competencia", "Alterou a competência mensal no Executivo", 20);
          }
        }}
        ano={ano}
        onAnoChange={(nextAno) => {
          setAno(nextAno);
          if (isFlorianopolis) {
            awardAction("change_competencia", "Alterou o exercício financeiro no Executivo", 20);
          }
        }}
        loadingData={loadingData}
      />

      {/* Erro no servidor do município: substitui o conteúdo das abas para não exibir valores zerados */}
      {dashboardError && (
        <MunicipalityErrorAlert
          name={name}
          error={dashboardError}
          onRetry={retry}
          loading={loadingData}
        />
      )}

      {!dashboardError && (
      <>
      {/* TAB 1: VISÃO GERAL */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <ExecutiveMetricCards
            isFlorianopolis={isFlorianopolis}
            revenue={revenue}
            expenses={expenses}
            contracts={contracts}
            bids={bids}
            loadingData={loadingData}
            periodo={periodo}
            totalReceitasArrecadadas={totalReceitasArrecadadas}
            totalReceitasCount={liveReceitas.length}
            totalDespesasReais={totalDespesasReais}
            totalContratosReais={liveContratos.length}
            totalLicitacoesReais={liveLicitacoes.length}
            totalEmpenhosCount={liveDespesas.length}
            formatCurrency={formatCurrency}
          />

          <div className="w-full min-w-0 space-y-4">
            <OverviewTab
              isFlorianopolis={isFlorianopolis}
              name={name}
              loadingData={loadingData}
              periodo={periodo}
              totalReceitasArrecadadas={totalReceitasArrecadadas}
              totalReceitasPrevistas={totalReceitasPrevistas}
              totalDespesasReais={totalDespesasReais}
              expenses={expenses}
              contracts={contracts}
              areasDistrib={areasDistrib}
              dynamicConic={dynamicConic}
              liveReceitas={liveReceitas}
              liveDespesas={liveDespesas}
              liveLicitacoes={liveLicitacoes}
              liveContratos={liveContratos}
              livePessoal={livePessoal}
              liveOrcamento={liveOrcamento}
              tempoAgregacaoMs={tempoExecucaoMs}
              dashboardSource={dashboardSource}
              onNavigateTab={handleTabChange}
              formatCurrency={formatCurrency}
            />
          </div>
        </div>
      )}

      {/* TAB 2: RECEITAS */}
      {activeTab === "receitas" && (
        <ReceitasTab
          isFlorianopolis={isFlorianopolis}
          name={name}
          periodo={periodo}
          loadingData={loadingData}
          liveReceitas={liveReceitas}
          totalReceitasArrecadadas={totalReceitasArrecadadas}
          totalReceitasPrevistas={totalReceitasPrevistas}
          formatCurrency={formatCurrency}
        />
      )}

      {/* TAB 2: DESPESAS */}
      {activeTab === "despesas" && (
        <DespesasTab
          isFlorianopolis={isFlorianopolis}
          name={name}
          periodo={periodo}
          loadingData={loadingData}
          searchFilter={searchFilter}
          onSearchChange={setSearchFilter}
          areaFilter={areaFilter}
          onAreaChange={setAreaFilter}
          uniqueAreas={uniqueAreas}
          filteredDespesas={filteredDespesas}
          formatCurrency={formatCurrency}
        />
      )}

      {/* TAB 3: ORÇAMENTO (LOA) */}
      {activeTab === "orcamento" && (
        <OrcamentoTab
          isFlorianopolis={isFlorianopolis}
          name={name}
          periodo={periodo}
          loadingData={loadingData}
          liveOrcamento={liveOrcamento}
          totalEmpenhadoOrcamento={totalEmpenhadoOrcamento}
          totalLiquidadoOrcamento={totalLiquidadoOrcamento}
          totalPagoOrcamento={totalPagoOrcamento}
          formatCurrency={formatCurrency}
        />
      )}

      {/* TAB 4: LICITAÇÕES */}
      {activeTab === "licitacoes" && (
        <LicitacoesTab
          isFlorianopolis={isFlorianopolis}
          cityId={slug}
          name={name}
          periodo={periodo}
          loadingData={loadingData}
          liveLicitacoes={liveLicitacoes}
          formatCurrency={formatCurrency}
        />
      )}

      {/* TAB 5: CONTRATOS */}
      {activeTab === "contratos" && (
        <ContratosTab
          isFlorianopolis={isFlorianopolis}
          name={name}
          periodo={periodo}
          loadingData={loadingData}
          liveContratos={liveContratos}
          formatCurrency={formatCurrency}
        />
      )}

      {/* TAB 6: PESSOAL & FOLHA */}
      {activeTab === "pessoal" && (
        <PessoalTab
          isFlorianopolis={isFlorianopolis}
          name={name}
          periodo={periodo}
          loadingData={loadingData}
          livePessoal={livePessoal}
          totalFolhaBruta={totalFolhaBruta}
          formatCurrency={formatCurrency}
        />
      )}

      </>
      )}

      {/* Footer Banner
      <ExecutiveFooter isFlorianopolis={isFlorianopolis} /> */}
    </div>
  );
}
