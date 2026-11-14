"use client";

import { PageHead } from "@/components/ui";
import {
  useStudy,
} from "@/components/providers/study-provider";

export default function ResearchPage() {
  const {
    participant,
    condition,
    setCondition,
    events,
    track,
    points,
    level,
    completed,
    completedActions,
    resetProgress,
    simulateDemoProgress,
  } = useStudy();
  function exportEvents() {
    const payload = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        participantCode: participant?.code ?? "anonymous",
        condition,
        events,
      },
      null,
      2,
    );
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "observa-sc-eventos.json";
    link.click();
    URL.revokeObjectURL(url);
    track("research_export_requested", { eventCount: events.length });
  }
  return (
    <div className="research-card">
      <PageHead
        title="Configuração do estudo"
        text="Controles experimentais e exportação de eventos, em uma página exclusiva para o pesquisador."
      />
      <section className="admin-box">
        <p className="eyebrow">Controles do pesquisador & Gamificação</p>
        <h3>
          Condição atual: {condition} • Nível {level} ({points} XP)
        </h3>
        <p className="muted small">
          Missões concluídas: {completed.length} • Ações no Executivo:{" "}
          {completedActions.length}
        </p>
        <div className="toolbar">
          <button
            className={
              "btn " + (condition === "gamificada" ? "btn-dark" : "btn-ghost")
            }
            onClick={() => setCondition("gamificada")}
          >
            Gamificada
          </button>
          <button
            className={
              "btn " + (condition === "neutra" ? "btn-dark" : "btn-ghost")
            }
            onClick={() => setCondition("neutra")}
          >
            Neutra
          </button>
          <button
            className="btn btn-ghost"
            onClick={resetProgress}
            title="Zera missões, ações, moedas e retorna ao Nível 1 (0 XP)"
          >
            Zerar Progresso (Nível 1 / 0 XP)
          </button>
          <button
            className="btn btn-ghost"
            onClick={simulateDemoProgress}
            title="Preenche 3 missões e 3 ações de demonstração"
          >
            Simular Progresso Demo
          </button>
          <button className="btn btn-primary" onClick={exportEvents}>
            Exportar {events.length} eventos
          </button>
        </div>
        <div className="event-list">
          {events
            .slice(-8)
            .reverse()
            .map((event) => (
              <div key={event.id}>
                {event.at} · {event.type}
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
