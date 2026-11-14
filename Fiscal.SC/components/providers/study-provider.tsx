"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Sparkles, Trophy, X } from "lucide-react";
import { ACHIEVEMENTS, missions } from "@/data/content";

export type Condition = "gamificada" | "neutra";
export type StudyEvent = {
  id: string;
  type: string;
  at: string;
  metadata?: Record<string, string | number | boolean>;
};
export type Participant = {
  code: string;
  alias: string;
  age: string;
  resident: boolean;
};

export type XpToast = {
  id: string;
  title: string;
  subtitle?: string;
  xp: number;
  isLevelUp?: boolean;
};

type StudyContextValue = {
  ready: boolean;
  condition: Condition;
  completed: string[];
  startedMissions: string[];
  completedActions: string[];
  unlockedAchievements: string[];
  events: StudyEvent[];
  participant: Participant | null;
  points: number;
  level: number;
  levelTitle: string;
  nextLevelTitle: string;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  xpRemaining: number;
  levelProgress: number;
  track: (type: string, metadata?: StudyEvent["metadata"]) => void;
  setCondition: (condition: Condition) => void;
  startMission: (missionId: string) => void;
  completeMission: (missionId: string, missionPoints?: number) => void;
  awardAction: (actionId: string, label: string, xp: number) => void;
  resetProgress: () => void;
  simulateDemoProgress: () => void;
  saveParticipant: (participant: Participant) => void;
};

const StudyContext = createContext<StudyContextValue | null>(null);

const XP_PER_LEVEL = 250;

const ACTION_XP_MAP: Record<string, number> = {
  explore_tab_receitas: 25,
  explore_tab_despesas: 25,
  explore_tab_orcamento: 25,
  explore_tab_licitacoes: 25,
  explore_tab_contratos: 25,
  explore_tab_pessoal: 25,
  expand_movimentos_despesa: 30,
  change_competencia: 20,
  share_dashboard: 20,
};

const WEEKLY_SPECIAL_MIN_MISSIONS = 5;
const WEEKLY_SPECIAL_XP_BONUS = 250;

/**
 * Fonte única do cálculo de XP. Usada tanto no total do perfil quanto nos avisos (toasts),
 * para que o valor anunciado nunca divirja do valor efetivamente creditado.
 */
export function calculatePoints(completedMissions: string[], completedActions: string[]): number {
  const missionPoints = completedMissions.reduce(
    (sum, id) => sum + (missions.find((m) => m.id === id)?.pontos ?? 0),
    0,
  );
  const actionPoints = completedActions.reduce(
    (sum, id) => sum + (ACTION_XP_MAP[id] ?? 20),
    0,
  );
  // Bônus da Missão Especial da Semana (5 missões concluídas)
  const weeklyBonus =
    completedMissions.length >= WEEKLY_SPECIAL_MIN_MISSIONS ? WEEKLY_SPECIAL_XP_BONUS : 0;
  return missionPoints + actionPoints + weeklyBonus;
}

export function getLevelTitle(lvl: number): string {
  if (lvl <= 1) return "Cidadão Iniciante";
  if (lvl === 2) return "Observador Municipal";
  if (lvl === 3) return "Fiscal de Dados";
  if (lvl === 4) return "Auditor Cívico";
  return "Guardião da Transparência SC";
}

const newId = (prefix = "evt") =>
  prefix + "-" + Math.random().toString(36).slice(2, 9);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [conditionState, setConditionState] = useState<Condition>("gamificada");
  const [completed, setCompleted] = useState<string[]>([]);
  const [startedMissions, setStartedMissions] = useState<string[]>([]);
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [toasts, setToasts] = useState<XpToast[]>([]);

  // Refs síncronas para evitar side-effects duplicados no React 19 Strict Mode
  const completedRef = useRef<string[]>([]);
  const startedRef = useRef<string[]>([]);
  const actionsRef = useRef<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("observa-condition") as Condition | null;
    const assigned = saved ?? "gamificada";
    localStorage.setItem("observa-condition", assigned);
    setConditionState(assigned);
    try {
      const initialCompleted = JSON.parse(
        localStorage.getItem("observa-completed-v2") ?? "[]",
      );
      const initialStarted = JSON.parse(
        localStorage.getItem("observa-started-v2") ?? "[]",
      );
      const initialActions = JSON.parse(
        localStorage.getItem("observa-actions-v2") ?? "[]",
      );
      completedRef.current = initialCompleted;
      startedRef.current = initialStarted;
      actionsRef.current = initialActions;
      setCompleted(initialCompleted);
      setStartedMissions(initialStarted);
      setCompletedActions(initialActions);
      setEvents(JSON.parse(localStorage.getItem("observa-events") ?? "[]"));
      const profile = localStorage.getItem("observa-participant");
      if (profile) setParticipant(JSON.parse(profile));
    } catch {
      localStorage.removeItem("observa-events");
    }
    setReady(true);
  }, []);

  function pushToast(toast: Omit<XpToast, "id">) {
    if (conditionState !== "gamificada") return;
    const id = newId("toast");
    setToasts((prev) => {
      // Impede toasts duplicados com o mesmo título ativos simultaneamente
      if (prev.some((item) => item.title === toast.title)) return prev;
      return [...prev.slice(-2), { ...toast, id }];
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  }

  function track(type: string, metadata?: StudyEvent["metadata"]) {
    const event: StudyEvent = {
      id: newId(),
      type,
      at: new Date().toISOString(),
      metadata: { condition: conditionState, ...metadata },
    };
    setEvents((current) => {
      const next = [...current, event];
      localStorage.setItem("observa-events", JSON.stringify(next));
      return next;
    });
  }

  function setCondition(condition: Condition) {
    setConditionState(condition);
    localStorage.setItem("observa-condition", condition);
    track("condition_changed_by_researcher", { to: condition });
  }

  function startMission(missionId: string) {
    if (startedRef.current.includes(missionId)) return;
    const next = [...startedRef.current, missionId];
    startedRef.current = next;
    setStartedMissions(next);
    localStorage.setItem("observa-started-v2", JSON.stringify(next));
    track("mission_started", { missionId });
  }

  function completeMission(missionId: string, awardedPoints?: number) {
    if (completedRef.current.includes(missionId)) return;

    const missionObj = missions.find((m) => m.id === missionId);
    const pts = awardedPoints ?? missionObj?.pontos ?? 100;

    const next = [...completedRef.current, missionId];
    completedRef.current = next;
    setCompleted(next);
    localStorage.setItem("observa-completed-v2", JSON.stringify(next));

    track("mission_completed", {
      missionId,
      points: conditionState === "gamificada" ? pts : 0,
    });

    pushToast({
      title: missionObj
        ? `Missão concluída: ${missionObj.titulo}`
        : "Missão concluída!",
      subtitle: "Recompensa creditada no seu perfil de Fiscal Cidadão",
      xp: pts,
    });
  }

  function awardAction(actionId: string, label: string, xp: number) {
    if (actionsRef.current.includes(actionId)) return;

    const next = [...actionsRef.current, actionId];
    actionsRef.current = next;
    setCompletedActions(next);
    localStorage.setItem("observa-actions-v2", JSON.stringify(next));

    track("executive_action_awarded", {
      actionId,
      label,
      xp: conditionState === "gamificada" ? xp : 0,
    });

    pushToast({
      title: label,
      subtitle: "Bônus de exploração do Executivo Municipal",
      xp,
    });
  }

  function resetProgress() {
    completedRef.current = [];
    startedRef.current = [];
    actionsRef.current = [];
    setCompleted([]);
    setStartedMissions([]);
    setCompletedActions([]);
    setToasts([]);
    localStorage.setItem("observa-completed-v2", "[]");
    localStorage.setItem("observa-started-v2", "[]");
    localStorage.setItem("observa-actions-v2", "[]");
    track("progress_reset_to_zero");
  }

  function simulateDemoProgress() {
    const demoCompleted = [
      "missao-receitas",
      "missao-despesas",
      "missao-orcamento",
    ];
    const demoStarted = [
      "missao-receitas",
      "missao-despesas",
      "missao-orcamento",
      "missao-licitacoes",
    ];
    const demoActions = [
      "explore_tab_receitas",
      "explore_tab_despesas",
      "expand_movimentos_despesa",
    ];
    completedRef.current = demoCompleted;
    startedRef.current = demoStarted;
    actionsRef.current = demoActions;
    setCompleted(demoCompleted);
    setStartedMissions(demoStarted);
    setCompletedActions(demoActions);
    localStorage.setItem("observa-completed-v2", JSON.stringify(demoCompleted));
    localStorage.setItem("observa-started-v2", JSON.stringify(demoStarted));
    localStorage.setItem("observa-actions-v2", JSON.stringify(demoActions));
    track("progress_simulated_demo");
    pushToast({
      title: "Progresso de demonstração carregado!",
      subtitle: `${demoCompleted.length} missões e ${demoActions.length} explorações ativadas`,
      xp: calculatePoints(demoCompleted, demoActions),
    });
  }

  function saveParticipant(value: Participant) {
    setParticipant(value);
    localStorage.setItem("observa-participant", JSON.stringify(value));
    track("participant_registered", {
      ageRange: value.age,
      resident: value.resident,
    });
  }

  const points =
    conditionState === "gamificada" ? calculatePoints(completed, completedActions) : 0;

  const level = 1 + Math.floor(points / XP_PER_LEVEL);
  const levelTitle = getLevelTitle(level);
  const nextLevelTitle = getLevelTitle(level + 1);
  const xpInCurrentLevel = points % XP_PER_LEVEL;
  const xpForNextLevel = XP_PER_LEVEL;
  const xpRemaining = XP_PER_LEVEL - xpInCurrentLevel;
  const levelProgress = Math.min(
    Math.round((xpInCurrentLevel / XP_PER_LEVEL) * 100),
    100,
  );

  const unlockedAchievements = ACHIEVEMENTS.filter((ach) => {
    if (ach.missionId && completed.includes(ach.missionId)) return true;
    if (ach.id === "medal-contratos" && completed.includes("missao-licitacoes"))
      return true;
    if (ach.actionId && completedActions.includes(ach.actionId)) return true;
    if (
      ach.minCompletedMissions &&
      completed.length >= ach.minCompletedMissions
    )
      return true;
    return false;
  }).map((ach) => ach.id);

  return (
    <StudyContext.Provider
      value={{
        ready,
        condition: conditionState,
        completed,
        startedMissions,
        completedActions,
        unlockedAchievements,
        events,
        participant,
        points,
        level,
        levelTitle,
        nextLevelTitle,
        xpInCurrentLevel,
        xpForNextLevel,
        xpRemaining,
        levelProgress,
        track,
        setCondition,
        startMission,
        completeMission,
        awardAction,
        resetProgress,
        simulateDemoProgress,
        saveParticipant,
      }}
    >
      {children}

      {/* Floating XP Toast Notifications */}
      {toasts.length > 0 && conditionState === "gamificada" && (
        <div className="fixed bottom-20 lg:bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start gap-3.5 rounded-2xl border border-emerald-500/30 bg-[#0b2e26] p-4 text-white shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {toast.isLevelUp ? <Trophy size={20} /> : <Sparkles size={20} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                    +{toast.xp} XP
                  </span>
                </div>
                <p className="mt-1 text-xs font-extrabold leading-snug text-white">
                  {toast.title}
                </p>
                {toast.subtitle && (
                  <p className="mt-0.5 text-[11px] text-emerald-200/80">
                    {toast.subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                }
                className="text-white/50 hover:text-white"
                aria-label="Fechar notificação"
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const value = useContext(StudyContext);
  if (!value)
    throw new Error("useStudy deve ser usado dentro de StudyProvider");
  return value;
}
