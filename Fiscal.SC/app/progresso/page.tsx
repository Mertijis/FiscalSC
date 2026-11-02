"use client";

import Link from "next/link";
import { ACHIEVEMENTS, missions } from "@/data/content";
import { PageHead } from "@/components/ui";
import { useStudy } from "@/components/providers/study-provider";

function AchievementCard({
  symbol,
  title,
  text,
  unlocked,
}: {
  symbol: string;
  title: string;
  text: string;
  unlocked: boolean;
}) {
  return (
    <div className={"achievement " + (!unlocked ? "locked" : "")}>
      <div className="achievement-symbol">{symbol}</div>
      <strong>{title}</strong>
      <small>{unlocked ? "✓ Medalha conquistada" : text}</small>
    </div>
  );
}

export default function ProgressPage() {
  const {
    condition,
    completed,
    completedActions,
    unlockedAchievements,
    points,
    coins,
    level,
    levelTitle,
    levelProgress,
    xpRemaining,
  } = useStudy();

  if (condition === "neutra")
    return (
      <>
        <PageHead
          title="Seu histórico"
          text="Nesta sessão, o progresso é apresentado de forma neutra, sem pontos, níveis ou medalhas."
        />
        <div className="card">
          <h2>Atividades concluídas</h2>
          <p className="muted">
            {completed.length} de {missions.length} missões concluídas.
          </p>
          {missions.map((m) => (
            <div className="mission-row" key={m.id}>
              <div className="mission-symbol">
                {completed.includes(m.id) ? "✓" : "○"}
              </div>
              <div>
                <strong>{m.titulo}</strong>
                <small>
                  {completed.includes(m.id)
                    ? "Concluída"
                    : "Ainda não concluída"}
                </small>
              </div>
            </div>
          ))}
        </div>
      </>
    );

  return (
    <>
      <PageHead
        title="Suas Conquistas e Medalhas"
        text="Pontos, níveis e medalhas representam suas ações práticas de fiscalização nos dados abertos de Florianópolis e Santa Catarina."
      />
      <section className="level-card">
        <div className="level-orb">{level}</div>
        <div>
          <h2>
            Nível {level} · {levelTitle}
          </h2>
          <p>
            {completed.length} de {missions.length} missões concluídas •{" "}
            {completedActions.length} ações no Executivo • Faltam {xpRemaining}{" "}
            XP para o Nível {level + 1}
          </p>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: levelProgress + "%" }}
            />
          </div>
        </div>
        <div className="level-points">
          {points.toLocaleString("pt-BR")} XP
          <small>{coins} moedas acumuladas</small>
        </div>
      </section>

      <div className="badge-grid">
        {ACHIEVEMENTS.map((ach) => (
          <AchievementCard
            key={ach.id}
            symbol={ach.symbol}
            title={ach.title}
            text={ach.description}
            unlocked={unlockedAchievements.includes(ach.id)}
          />
        ))}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h2>Histórico de Missões do Executivo</h2>
        <p className="muted">
          Clique em qualquer missão abaixo para iniciá-la ou revisar seu
          conteúdo.
        </p>
        <div className="mt-3 grid gap-2">
          {missions.map((m) => {
            const isDone = completed.includes(m.id);
            return (
              <Link
                href={`/missoes/${m.id}`}
                className="mission-row no-underline hover:bg-slate-50 rounded-lg px-2 transition"
                key={m.id}
              >
                <div className="mission-symbol">{isDone ? "✓" : "○"}</div>
                <div className="flex-1">
                  <strong>{m.titulo}</strong>
                  <small>
                    {m.categoria} • +{m.pontos} XP •{" "}
                    {isDone ? "Concluída" : "Disponível"}
                  </small>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
