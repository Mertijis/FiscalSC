"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, CheckCircle2, CircleDollarSign, ExternalLink } from "lucide-react";
import { missions } from "@/data/content";
import { BackLink } from "@/components/ui";
import { useStudy } from "@/components/providers/study-provider";

export default function MissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const mission = missions.find((item) => item.id === id);
  const { completed, condition, track, startMission, completeMission } =
    useStudy();
  const [answer, setAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);

  useEffect(() => {
    if (mission) {
      startMission(mission.id);
    }
  }, [mission?.id]);

  if (!mission)
    return (
      <div className="card">
        <h2>Missão não encontrada</h2>
        <Link href="/missoes">Voltar às missões</Link>
      </div>
    );

  function submit() {
    if (answer === null || !mission) return;
    const correct = answer === mission.correta;
    setFeedback(correct ? "ok" : "no");
    track("comprehension_answered", {
      missionId: mission.id,
      correct,
      answer,
    });
    if (correct) completeMission(mission.id, mission.pontos);
  }

  const done = completed.includes(mission.id);
  const executiveLink = `/gastos/municipio/florianopolis?tab=${mission.abaExecutivo}`;

  return (
    <>
      <BackLink href="/missoes" label="Todas as missões" />
      <section className="mission-page">
        <div className="mission-page-head">
          <span className="badge">{mission.categoria}</span>
          <h1>{mission.titulo}</h1>
          <p>{mission.descricao}</p>
          <div className="mission-meta">
            <span>◷ {mission.duracao}</span>
            {condition === "gamificada" && (
              <>
                <span>✦ +{mission.pontos} XP</span>
                <span className="inline-flex items-center gap-1">
                  <CircleDollarSign size={14} /> +{mission.moedas} moedas
                </span>
              </>
            )}
            {done && (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 size={15} /> Concluída
              </span>
            )}
          </div>
        </div>

        <div className="learning-step">
          <span className="step-number">1</span>
          <div className="space-y-3">
            <p className="eyebrow">Passo Prático no Executivo de Florianópolis</p>
            <h2>Explore o dado real antes de responder</h2>
            <p className="muted leading-relaxed">{mission.dicaContexto}</p>
            <div className="tip-box">
              <strong>Dica prática:</strong> Clique no botão abaixo para abrir
              diretamente a aba correspondente do Executivo de Florianópolis (você
              também ganha <strong>+25 XP de bônus</strong> ao explorar a aba!).
            </div>
            <div className="pt-2">
              <Link
                href={executiveLink}
                className="inline-flex items-center gap-2 rounded-lg bg-[#16844a] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#126b3c]"
              >
                {mission.acaoTexto} <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="learning-step">
          <span className="step-number">2</span>
          <div className="question">
            <p className="eyebrow">Verificação de Aprendizagem Cívica</p>
            <h2>{mission.pergunta}</h2>
            <div className="options">
              {mission.opcoes.map((option, index) => (
                <button
                  key={option}
                  className={"option " + (answer === index ? "selected" : "")}
                  onClick={() => {
                    setAnswer(index);
                    setFeedback(null);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            {feedback && (
              <div className={"feedback " + feedback} role="status">
                {feedback === "ok"
                  ? condition === "gamificada"
                    ? done
                      ? `Resposta correta! Você garantiu +${mission.pontos} XP e +${mission.moedas} moedas.`
                      : `Parabéns! Resposta correta: +${mission.pontos} XP creditados.`
                    : "Resposta correta registrada com sucesso."
                  : "Ainda não. Releia a explicação do Passo 1 e tente novamente."}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                className="btn btn-dark"
                disabled={answer === null}
                onClick={submit}
              >
                Conferir resposta
              </button>
              {done && (
                <Link
                  href="/missoes"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 px-4 py-2.5 text-xs font-extrabold text-emerald-800 hover:bg-emerald-50"
                >
                  Voltar para Missões <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
