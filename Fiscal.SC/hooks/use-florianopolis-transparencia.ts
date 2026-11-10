"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  fetchExecutiveDashboard,
  getWorkerUrl,
  formatCurrencyBRL,
  type DespesaItem,
  type ReceitaItem,
  type LicitacaoItem,
  type ContratoItem,
  type PessoalItem,
  type DespesaOrcamentariaItem,
  type AreaDistribItem,
  type DashboardPackage,
} from "@/lib/transparencia-service";

export type { AreaDistribItem } from "@/lib/transparencia-service";

export const MESES_OPCOES = [
  { valor: "01", label: "Jan (01)" },
  { valor: "02", label: "Fev (02)" },
  { valor: "03", label: "Mar (03)" },
  { valor: "04", label: "Abr (04)" },
  { valor: "05", label: "Mai (05)" },
  { valor: "06", label: "Jun (06)" },
  { valor: "07", label: "Jul (07)" },
  { valor: "08", label: "Ago (08)" },
  { valor: "09", label: "Set (09)" },
  { valor: "10", label: "Out (10)" },
  { valor: "11", label: "Nov (11)" },
  { valor: "12", label: "Dez (12)" },
];

export const ANOS_OPCOES = [
  "2016",
  "2017",
  "2018",
  "2019",
  "2020",
  "2021",
  "2022",
  "2023",
  "2024",
  "2025",
  "2026",
];

export function useFlorianopolisTransparencia(enabled = true, cityId = "florianopolis") {
  const [loadingData, setLoadingData] = useState(enabled);
  const [mes, setMes] = useState("10");
  const [ano, setAno] = useState("2026");

  const periodo = `${mes}/${ano}`;

  const [liveReceitas, setLiveReceitas] = useState<ReceitaItem[]>([]);
  const [liveDespesas, setLiveDespesas] = useState<DespesaItem[]>([]);
  const [liveLicitacoes, setLiveLicitacoes] = useState<LicitacaoItem[]>([]);
  const [liveContratos, setLiveContratos] = useState<ContratoItem[]>([]);
  const [livePessoal, setLivePessoal] = useState<PessoalItem[]>([]);
  const [liveOrcamento, setLiveOrcamento] = useState<DespesaOrcamentariaItem[]>([]);
  const [tempoExecucaoMs, setTempoExecucaoMs] = useState<number | undefined>(undefined);

  // Dados calculados pré-computados pelo BFF (fiscal-backend)
  const [areasDistrib, setAreasDistrib] = useState<AreaDistribItem[]>([]);
  const [uniqueAreas, setUniqueAreas] = useState<string[]>(["Todas as áreas"]);
  const [totalReceitasArrecadadas, setTotalReceitasArrecadadas] = useState<number>(0);
  const [totalReceitasPrevistas, setTotalReceitasPrevistas] = useState<number>(0);
  const [totalDespesasReais, setTotalDespesasReais] = useState<number>(0);
  const [totalFolhaBruta, setTotalFolhaBruta] = useState<number>(0);
  const [totalEmpenhadoOrcamento, setTotalEmpenhadoOrcamento] = useState<number>(0);
  const [totalLiquidadoOrcamento, setTotalLiquidadoOrcamento] = useState<number>(0);
  const [totalPagoOrcamento, setTotalPagoOrcamento] = useState<number>(0);
  const [dashboardSource, setDashboardSource] = useState<"cache" | "worker" | "live" | null>(null);

  // Filtros locais dentro das abas
  const [searchFilter, setSearchFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("Todas as áreas");

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;
    setLoadingData(true);

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socketId = "dash-" + Math.random().toString(36).substring(2, 9);
    const workerUrl = getWorkerUrl();

    const applyPackage = (pkg: DashboardPackage, isPartial = false) => {
      if (!isMounted) return;
      if (Array.isArray(pkg.receitas)) setLiveReceitas(pkg.receitas);
      if (Array.isArray(pkg.despesas)) setLiveDespesas(pkg.despesas);
      if (Array.isArray(pkg.contratos)) setLiveContratos(pkg.contratos);
      if (Array.isArray(pkg.pessoal)) setLivePessoal(pkg.pessoal);
      if (Array.isArray(pkg.despesaOrcamentaria)) setLiveOrcamento(pkg.despesaOrcamentaria);
      if (typeof pkg.tempoExecucaoMs === "number") setTempoExecucaoMs(pkg.tempoExecucaoMs);
      if (Array.isArray(pkg.resumo?.distribuicaoAreas)) {
        setAreasDistrib(pkg.resumo.distribuicaoAreas);
      }
      if (Array.isArray(pkg.resumo?.areas)) {
        setUniqueAreas(pkg.resumo.areas);
      }
      if (typeof pkg.resumo?.totalReceitasArrecadadas === "number") {
        setTotalReceitasArrecadadas(pkg.resumo.totalReceitasArrecadadas);
      }
      if (typeof pkg.resumo?.totalReceitasPrevistas === "number") {
        setTotalReceitasPrevistas(pkg.resumo.totalReceitasPrevistas);
      }
      if (typeof pkg.resumo?.totalDespesasReais === "number") {
        setTotalDespesasReais(pkg.resumo.totalDespesasReais);
      }
      if (typeof pkg.resumo?.totalFolhaBruta === "number") {
        setTotalFolhaBruta(pkg.resumo.totalFolhaBruta);
      }
      if (typeof pkg.resumo?.totalEmpenhadoOrcamento === "number") {
        setTotalEmpenhadoOrcamento(pkg.resumo.totalEmpenhadoOrcamento);
      }
      if (typeof pkg.resumo?.totalLiquidadoOrcamento === "number") {
        setTotalLiquidadoOrcamento(pkg.resumo.totalLiquidadoOrcamento);
      }
      if (typeof pkg.resumo?.totalPagoOrcamento === "number") {
        setTotalPagoOrcamento(pkg.resumo.totalPagoOrcamento);
      }
      if (pkg.source) setDashboardSource(pkg.source);

      if (!isPartial && Array.isArray(pkg.licitacoes)) {
        setLiveLicitacoes(pkg.licitacoes);
      }
      // Libera a tela imediatamente mesmo se for parcial (<400ms)
      setLoadingData(false);
    };

    // Conecta o WebSocket proativamente para não perder eventos emitidos rapidamente
    const socket = io(workerUrl, {
      transports: ["websocket", "polling"],
      timeout: 15000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", socketId);
    });

    // 1. Evento Progressivo: Recebido em <400ms (Despesas, Contratos, Orçamento, Pessoal, Trimestre e Distribuição)
    socket.on("dashboard_partial", (response: { cacheKey: string; data: DashboardPackage }) => {
      if (response?.data) {
        applyPackage(response.data, true);
      }
    });

    // 2. Evento Final: Pacote Completo Consolidado com Licitações
    socket.on("dashboard_result", (response: { cacheKey: string; data: DashboardPackage }) => {
      if (response?.data) {
        applyPackage(response.data, false);
      }
      socket.disconnect();
    });

    socket.on("dashboard_error", (err: any) => {
      console.error("Erro ao receber dashboard via WebSocket:", err);
      if (isMounted) setLoadingData(false);
      socket.disconnect();
    });

    // Dispara a requisição BFF (se já estiver em cache, o REST retorna instantaneamente em <10ms)
    fetchExecutiveDashboard(cityId, periodo, socketId).then((res) => {
      if (!isMounted) return;

      if (res.status === 200) {
        applyPackage(res.data, false);
        socket.disconnect();
        return;
      }

      // Se for 202 Accepted, o processamento continuará via WebSocket (parcial e final)
      if (res.status !== 202) {
        if (isMounted) setLoadingData(false);
      }
    });

    // Fallback de segurança: se após 3s ainda estiver carregando, faz uma checagem rápida no cache
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        fetchExecutiveDashboard(cityId, periodo).then((fallbackRes) => {
          if (isMounted && fallbackRes.status === 200) {
            applyPackage(fallbackRes.data, false);
            socket.disconnect();
          }
        });
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [enabled, cityId, periodo]);

  const filteredDespesas = useMemo(() => {
    return liveDespesas.filter((d) => {
      const matchesSearch =
        d.fornecedorNome.toLowerCase().includes(searchFilter.toLowerCase()) ||
        d.objeto.toLowerCase().includes(searchFilter.toLowerCase()) ||
        d.fornecedorCpfCnpj.toLowerCase().includes(searchFilter.toLowerCase()) ||
        String(d.numeroEmpenho).includes(searchFilter);
      const matchesArea = areaFilter === "Todas as áreas" || d.funcao === areaFilter;
      return matchesSearch && matchesArea;
    });
  }, [liveDespesas, searchFilter, areaFilter]);

  const dynamicConic = useMemo(() => {
    if (!areasDistrib.length) return "none";
    let cur = 0;
    const parts: string[] = [];
    for (const item of areasDistrib) {
      const next = Math.min(100, cur + item.percent);
      parts.push(`${item.color} ${cur}% ${next}%`);
      cur = next;
    }
    if (cur < 100 && parts.length > 0) {
      parts.push(`${areasDistrib[areasDistrib.length - 1].color} ${cur}% 100%`);
    }
    return `conic-gradient(${parts.join(", ")})`;
  }, [areasDistrib]);

  return {
    loadingData,
    mes,
    setMes,
    ano,
    setAno,
    periodo,
    setPeriodo: (newPeriodo: string) => {
      const parts = newPeriodo.split("/");
      if (parts.length === 2) {
        setMes(parts[0]);
        setAno(parts[1]);
      }
    },
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
    formatCurrency: formatCurrencyBRL,
    dashboardSource,
  };
}
