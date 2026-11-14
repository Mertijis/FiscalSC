"use client";

import Link from "next/link";
import { useMemo, useState, type ComponentType } from "react";
import {
  BarChart3,
  Bookmark,
  CalendarDays,
  CircleDollarSign,
  FileText,
  Flame,
  Gavel,
  Gift,
  Landmark,
  Lightbulb,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { ACHIEVEMENTS, missions, type Mission } from "@/data/content";
import { useStudy } from "@/components/providers/study-provider";

type MissionVisual = {
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  color: string;
  soft: string;
};

const visuals: Record<string, MissionVisual> = {
  "missao-receitas": {
    icon: CircleDollarSign,
    color: "#1168b7",
    soft: "#e8f2fc",
  },
  "missao-despesas": {
    icon: BarChart3,
    color: "#008d64",
    soft: "#e5f5ef",
  },
  "missao-orcamento": {
    icon: Landmark,
    color: "#d97706",
    soft: "#fef3c7",
  },
  "missao-licitacoes": {
    icon: Gavel,
    color: "#7c3aed",
    soft: "#f3e8ff",
  },
  "missao-contratos": {
    icon: FileText,
    color: "#1677cf",
    soft: "#e6f2fd",
  },
  "missao-pessoal": {
    icon: Users,
    color: "#0d9488",
    soft: "#ccfbf1",
  },
  "missao-competencia": {
    icon: CalendarDays,
    color: "#ee741f",
    soft: "#fff0e5",
  },
  "missao-compartilhar": {
    icon: Share2,
    color: "#47a83f",
    soft: "#eaf6e8",
  },
  "missao-lai": {
    icon: ShieldCheck,
    color: "#7540bd",
    soft: "#f0e9f9",
  },
};

const categories = [
  "Todas",
  "Receitas e Tributos",
  "Orçamento e Gastos",
  "Contratos e Licitações",
  "Transparência",
  "Participação",
];

function MissionCard({
  mission,
  done,
  inProgress,
}: {
  mission: Mission;
  done: boolean;
  inProgress: boolean;
}) {
  const visual = visuals[mission.id] ?? visuals["missao-receitas"];
  const Icon = visual.icon;

  return (
    <article
      className={`group relative flex min-h-[240px] flex-col justify-between rounded-xl border bg-white p-5 shadow-[0_3px_16px_rgba(28,61,52,.045)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(28,61,52,.09)] ${
        done
          ? "border-[#65c69b] bg-emerald-50/15"
          : inProgress
            ? "border-amber-300"
            : "border-[#e2e8e5]"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
            {mission.categoria} • {mission.duracao}
          </span>
          {done ? (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
              ✓ Concluída
            </span>
          ) : inProgress ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
              Em andamento
            </span>
          ) : (
            <Bookmark className="text-[#d7e0dc]" size={16} />
          )}
        </div>

        <div className="flex gap-4 mt-2">
          <span
            className="grid size-[54px] shrink-0 place-items-center rounded-2xl"
            style={{ backgroundColor: visual.soft, color: visual.color }}
          >
            <Icon size={28} strokeWidth={2.3} />
          </span>
          <div className="min-w-0 pt-0.5">
            <h2 className="text-[15px] font-extrabold leading-tight text-[#101b2a]">
              {mission.titulo}
            </h2>
            <p className="mt-1.5 text-xs leading-[1.5] text-[#25456f]">
              {mission.descricao}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="mt-4 flex items-center gap-5 text-xs font-extrabold text-[#0b1f36]">
          <span style={{ color: visual.color }}>+{mission.pontos} XP</span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#edf1f3]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#078147,#5ab843)] transition-all duration-300"
              style={{
                width: done ? "100%" : inProgress ? "50%" : "0%",
              }}
            />
          </div>
          <span className="text-[10px] font-bold text-[#173c68]">
            {done ? "1/1" : inProgress ? "Em curso" : "0/1"}
          </span>
        </div>

        <Link
          href={`/missoes/${mission.id}`}
          className={`mt-3 grid h-9 place-items-center rounded-md border text-xs font-extrabold transition ${
            done
              ? "border-emerald-200 bg-emerald-50 text-[#07562f] hover:bg-emerald-100"
              : inProgress
                ? "border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100"
                : "border-[#dfe6e3] text-[#07562f] hover:border-[#218a51] hover:bg-[#eff9f2]"
          }`}
        >
          {done
            ? "Revisar Missão"
            : inProgress
              ? "Continuar Missão →"
              : "Iniciar Missão"}
        </Link>
      </div>
    </article>
  );
}

export default function MissionsPage() {
  const {
    completed,
    startedMissions,
    completedActions,
    unlockedAchievements,
    points,
    level,
    levelTitle,
    levelProgress,
    xpRemaining,
  } = useStudy();

  const [category, setCategory] = useState("Todas");
  const [tab, setTab] = useState<"Disponíveis" | "Em andamento" | "Concluídas">(
    "Disponíveis",
  );
  const [sortBy, setSortBy] = useState<
    "Relevância" | "Mais pontos" | "Mais rápidas"
  >("Relevância");

  const inProgressIds = useMemo(
    () => startedMissions.filter((id) => !completed.includes(id)),
    [startedMissions, completed],
  );

  const filtered = useMemo(() => {
    let list =
      category === "Todas"
        ? [...missions]
        : missions.filter((mission) => mission.categoria === category);

    if (tab === "Em andamento") {
      list = list.filter((m) => inProgressIds.includes(m.id));
    } else if (tab === "Concluídas") {
      list = list.filter((m) => completed.includes(m.id));
    }

    if (sortBy === "Mais pontos") {
      list.sort((a, b) => b.pontos - a.pontos);
    } else if (sortBy === "Mais rápidas") {
      list.sort((a, b) => a.duracaoMinutos - b.duracaoMinutos);
    }

    return list;
  }, [category, tab, sortBy, inProgressIds, completed]);

  const weeklyProgressCount = Math.min(completed.length, 5);
  const weeklyProgressPct = Math.round((weeklyProgressCount / 5) * 100);

  return (
    <div className="mx-auto max-w-[1540px]">
      <section className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="flex min-h-[104px] min-w-0 items-center gap-4 rounded-xl border border-[#e1e7e4] bg-white p-5 shadow-sm">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#fff1e6] text-[#ff820f]">
            <Flame size={28} fill="currentColor" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold">Atividade de Fiscalização</p>
            <p className="mt-1 text-xl xl:text-2xl font-extrabold tracking-tight">
              {completed.length} missões • {completedActions.length} ações
            </p>
            <p className="text-xs font-semibold text-[#345888]">
              {unlockedAchievements.length} de {ACHIEVEMENTS.length} medalhas
              conquistadas
            </p>
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-[#e1e7e4] bg-white p-5 shadow-sm">
          <p className="mb-3 text-xs font-extrabold">
            Categorias do Executivo Municipal
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {categories.map((item) => {
              const count =
                item === "Todas"
                  ? missions.length
                  : missions.filter((mission) => mission.categoria === item)
                      .length;
              return (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`shrink-0 min-w-[130px] rounded-lg border px-3.5 py-2.5 text-left transition ${
                    category === item
                      ? "border-[#1b8a49] bg-[linear-gradient(135deg,#288b47,#1e9d52)] text-white shadow-md"
                      : "border-[#e0e6e3] bg-white text-[#15233a] hover:border-[#7db793]"
                  }`}
                >
                  <strong className="block text-xs">{item}</strong>
                  <span
                    className={`mt-1 inline-grid min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold ${
                      category === item
                        ? "bg-[#f0c927] text-[#3b531e]"
                        : "bg-slate-100 text-[#243c5f]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#dce4e0]">
            <div className="flex flex-wrap items-center">
              {(["Disponíveis", "Em andamento", "Concluídas"] as const).map(
                (item) => {
                  const badgeCount =
                    item === "Disponíveis"
                      ? missions.length
                      : item === "Em andamento"
                        ? inProgressIds.length
                        : completed.length;

                  return (
                    <button
                      key={item}
                      onClick={() => setTab(item)}
                      className={`relative px-4 sm:px-5 py-3 text-xs font-semibold text-[#284d7b] transition ${
                        tab === item
                          ? "font-extrabold text-[#113322] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#23864b]"
                          : "hover:text-[#113322]"
                      }`}
                    >
                      {item}
                      <span
                        className={`ml-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                          tab === item
                            ? "bg-[#26954e] text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {badgeCount}
                      </span>
                    </button>
                  );
                },
              )}
            </div>
            <label className="flex items-center gap-2 pb-2 text-[11px] text-[#365988]">
              Ordenar por{" "}
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | "Relevância"
                      | "Mais pontos"
                      | "Mais rápidas",
                  )
                }
                className="h-9 min-w-[135px] rounded-lg border border-[#dce3e8] bg-white px-3 font-semibold text-[#1f3658]"
              >
                <option value="Relevância">Relevância</option>
                <option value="Mais pontos">Mais pontos (XP)</option>
                <option value="Mais rápidas">Mais rápidas</option>
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-sm font-extrabold text-slate-800">
                Nenhuma missão encontrada nesta aba ({tab})
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {tab === "Em andamento"
                  ? "Abra qualquer missão disponível para iniciá-la e ela aparecerá aqui até você responder o quiz."
                  : tab === "Concluídas"
                    ? "Complete sua primeira missão respondendo à pergunta de verificação para vê-la aqui!"
                    : "Experimente selecionar a categoria 'Todas'."}
              </p>
              {tab !== "Disponíveis" && (
                <button
                  onClick={() => setTab("Disponíveis")}
                  className="mt-4 rounded-lg bg-[#16844a] px-4 py-2 text-xs font-bold text-white hover:bg-[#126b3c]"
                >
                  Ver todas as missões disponíveis
                </button>
              )}
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  done={completed.includes(mission.id)}
                  inProgress={inProgressIds.includes(mission.id)}
                />
              ))}
            </div>
          )}

          <p className="mt-7 flex items-center justify-center gap-2 border-t border-[#e4eae7] pt-5 text-xs text-[#526d92]">
            <ShieldAlert size={15} /> Todos os dados são públicos e atualizados
            pelos órgãos oficiais.
          </p>
        </div>

        <aside className="grid min-w-0 content-start gap-4">
          <section className="rounded-xl border border-[#e2e8e5] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-extrabold">Seu Progresso</h2>
              <Link
                href="/progresso"
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                Ver medalhas →
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row xl:flex-row items-center gap-4">
              <div
                className="relative grid size-[112px] shrink-0 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(#27894c 0 ${levelProgress}%, #edf1f1 ${levelProgress}% 100%)`,
                }}
              >
                <div className="grid size-[86px] place-items-center rounded-full bg-white text-center px-1">
                  <span className="text-[10px] font-extrabold leading-tight">
                    NÍVEL<strong className="block text-xl">{level}</strong>
                    <small className="block truncate font-semibold text-[#27894c] text-[9px] max-w-[74px]">
                      {levelTitle}
                    </small>
                  </span>
                </div>
              </div>
              <dl className="grid w-full flex-1 min-w-0 gap-2 text-[11px] text-[#35547d]">
                <div className="flex justify-between gap-2">
                  <dt className="truncate">XP próximo nível</dt>
                  <dd className="shrink-0 font-extrabold text-[#0f2038]">
                    {xpRemaining} XP
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="truncate">Missões concluídas</dt>
                  <dd className="shrink-0 font-extrabold text-[#0f2038]">
                    {completed.length} / {missions.length}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="truncate">Pontos Cidadania</dt>
                  <dd className="shrink-0 font-extrabold text-[#0f2038]">
                    {points.toLocaleString("pt-BR")} XP
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#985ce3] bg-white shadow-sm">
            <header className="flex items-center justify-between bg-[linear-gradient(90deg,#6d2bb7,#9551d4)] px-5 py-3 text-xs font-extrabold text-white">
              <span>Missão Especial da Semana</span>
              <span>
                {weeklyProgressCount >= 5 ? "✓ Concluída!" : "Desafio Ativo"}
              </span>
            </header>
            <div className="relative p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-extrabold">
                    Cidadão Exemplar de Florianópolis
                  </h2>
                  <p className="mt-1 text-xs text-[#365a8a]">
                    Conclua pelo menos 5 missões práticas do Executivo Municipal
                    para receber a medalha máxima e bônus extra.
                  </p>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-purple-50 text-[#8e45d1]">
                  <Gift size={24} />
                </span>
              </div>
              <p className="mt-4 flex flex-wrap gap-4 text-xs font-extrabold text-[#f09a00]">
                <span>+250 XP Bônus</span>
              </p>
              <div className="mt-3.5 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#edf0f3]">
                  <div
                    className="h-full rounded-full bg-[#2d9a51] transition-all duration-500"
                    style={{ width: `${weeklyProgressPct}%` }}
                  />
                </div>
                <span className="text-[11px] font-extrabold">
                  {weeklyProgressCount}/5
                </span>
              </div>
            </div>
          </section>

          <section className="flex items-center gap-4 rounded-xl border border-[#dce8df] bg-[linear-gradient(135deg,#f7fbf8,#edf8ef)] p-5 shadow-sm">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#3b9a55] text-white">
              <Lightbulb size={24} />
            </span>
            <div>
              <h2 className="text-sm font-extrabold">
                Dica: Ganhe XP Explorando!
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#31567f]">
                Visitar as abas de Receitas, Despesas, LOA, Licitações,
                Contratos e Pessoal de Florianópolis concede{" "}
                <strong>+25 XP</strong> automáticos por módulo explorado!
              </p>
              <Link
                href="/gastos/municipio/florianopolis"
                className="mt-3 inline-block rounded-md bg-[linear-gradient(90deg,#2e9148,#46a844)] px-4 py-2 text-xs font-extrabold text-white"
              >
                Explorar Executivo de Florianópolis →
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
