"use client";

import { useState } from "react";
import { PageHead } from "@/components/ui";
import {
  useStudy,
  type Participant,
} from "@/components/providers/study-provider";
const newCode = () =>
  ("P-" + Math.random().toString(36).slice(2, 9)).toUpperCase();

export default function ResearchPage() {
  const {
    participant,
    saveParticipant,
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
  const [alias, setAlias] = useState(participant?.alias ?? "");
  const [age, setAge] = useState(participant?.age ?? "18–21");
  const [resident, setResident] = useState(participant?.resident ?? true);
  const [consent, setConsent] = useState(Boolean(participant));
  const [sus, setSus] = useState("3");
  function save() {
    const value: Participant = {
      code: participant?.code ?? newCode(),
      alias,
      age,
      resident,
    };
    saveParticipant(value);
  }
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
        text="Cadastro mínimo, questionário e controles experimentais em uma página exclusiva para o pesquisador."
      />
      <section className="card">
        <div className="card-head">
          <div>
            <p className="eyebrow">Participante</p>
            <h2>Perfil mínimo</h2>
          </div>
          {participant && (
            <span className="badge">Código {participant.code}</span>
          )}
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="alias">Pseudônimo</label>
            <input
              id="alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Como prefere ser chamado?"
            />
          </div>
          <div className="field">
            <label htmlFor="age">Faixa etária</label>
            <select
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            >
              <option>18–21</option>
              <option>22–25</option>
              <option>26–29</option>
            </select>
          </div>
        </div>
        <label className="consent">
          <input
            type="checkbox"
            checked={resident}
            onChange={(e) => setResident(e.target.checked)}
          />{" "}
          Resido em Santa Catarina.
        </label>
        <label className="consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />{" "}
          Li as informações e aceito participar voluntariamente. Posso desistir
          a qualquer momento.
        </label>
        <button
          className="btn btn-dark"
          disabled={!alias || !resident || !consent}
          onClick={save}
        >
          Salvar perfil
        </button>
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <div className="card-head">
          <div>
            <p className="eyebrow">Questionário pós-condição</p>
            <h2>Experiência de uso</h2>
          </div>
        </div>
        <div className="field">
          <label htmlFor="sus">
            Eu gostaria de usar este sistema com frequência.
          </label>
          <select id="sus" value={sus} onChange={(e) => setSus(e.target.value)}>
            <option value="1">1 — Discordo totalmente</option>
            <option value="2">2</option>
            <option value="3">3 — Neutro</option>
            <option value="4">4</option>
            <option value="5">5 — Concordo totalmente</option>
          </select>
        </div>
        <button
          className="btn btn-ghost"
          style={{ marginTop: 14 }}
          onClick={() =>
            track("questionnaire_answered", {
              instrument: "SUS-demo",
              item: 1,
              answer: Number(sus),
            })
          }
        >
          Registrar resposta
        </button>
      </section>
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
