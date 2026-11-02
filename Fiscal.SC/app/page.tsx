"use client";

import Link from "next/link";
import {
  ArrowDown,
  BookOpen,
  CheckCircle2,
  Circle,
  CircleDollarSign,
  FileCheck2,
  FileText,
  Flame,
  Gavel,
  Heart,
  Landmark,
  Medal,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { ACHIEVEMENTS, missions } from "@/data/content";
import { useStudy } from "@/components/providers/study-provider";

const investigations = [
  {
    title: "Receitas e Arrecadação · Florianópolis",
    value: "Módulo Receitas (LOA vs Arrecadado)",
    people: 235,
    progress: 78,
    color: "#1168b7",
    icon: CircleDollarSign,
    href: "/gastos/municipio/florianopolis?tab=receitas",
  },
  {
    title: "Despesas e Pagamentos · Florianópolis",
    value: "Empenhos, Liquidações e Pagamentos",
    people: 189,
    progress: 72,
    color: "#16844a",
    icon: Landmark,
    href: "/gastos/municipio/florianopolis?tab=despesas",
  },
  {
    title: "Contratos e Editais · Florianópolis",
    value: "Contratos Vigentes e Licitações",
    people: 312,
    progress: 85,
    color: "#7c3aed",
    icon: BookOpen,
    href: "/gastos/municipio/florianopolis?tab=contratos",
  },
];

const overview = [
  {
    label: "Receitas (2025)",
    value: "R$ 1,24 bi",
    trend: "+8,2% vs mês anterior",
    color: "#349948",
    icon: Users,
  },
  {
    label: "Despesas Pagas (2025)",
    value: "R$ 1,11 bi",
    trend: "+4,7% vs mês anterior",
    color: "#d94747",
    icon: ArrowDown,
  },
  {
    label: "Contratos Ativos",
    value: "1.248",
    trend: "+3,1% vs mês anterior",
    color: "#287eb2",
    icon: FileText,
  },
  {
    label: "Licitações em Andamento",
    value: "87",
    trend: "-2,3% vs mês anterior",
    color: "#7a3fbd",
    icon: Gavel,
  },
  {
    label: "Pedidos LAI Respondidos",
    value: "98,3%",
    trend: "+1,4% vs mês anterior",
    color: "#3c9a4a",
    icon: FileCheck2,
  },
];

function ProgressRing({ value }: { value: number }) {
  return (
    <div
      className="relative grid size-[180px] place-items-center rounded-full"
      style={{
        background: `conic-gradient(#27894c 0 ${value}%, #edf1f2 ${value}% 100%)`,
      }}
    >
      <div className="grid size-[132px] place-items-center rounded-full bg-white text-center">
        <span>
          <strong className="block text-[42px] leading-none">{value}%</strong>
          <small className="mt-2 block max-w-[105px] text-[9px] leading-4 text-[#4c6786]">
            Missões de fiscalização concluídas
          </small>
        </span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const {
    completed,
    completedActions,
    unlockedAchievements,
    points,
    coins,
    level,
    levelTitle,
    nextLevelTitle,
    xpInCurrentLevel,
    xpForNextLevel,
    xpRemaining,
    levelProgress,
    participant,
  } = useStudy();

  const dailyMissions = missions.slice(0, 4);
  const completedDailyCount = dailyMissions.filter((m) =>
    completed.includes(m.id),
  ).length;
  const missionCompletionPct = Math.round(
    (completed.length / missions.length) * 100,
  );

  return (
    <div className="mx-auto max-w-[1540px]">
      <section className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))]">
        <article className="flex min-h-[145px] min-w-0 items-center gap-4 rounded-xl border border-[#e0e7e4] bg-white p-5 shadow-[0_4px_18px_rgba(26,62,52,.05)] sm:col-span-2 lg:col-span-1">
          <div className="grid size-[76px] xl:size-[88px] shrink-0 place-items-center rounded-full bg-[linear-gradient(145deg,#44a9d5,#4ca555)] text-2xl xl:text-3xl font-black text-white ring-4 ring-[#e4b526]">
            {participant?.alias?.slice(0, 1).toUpperCase() || "V"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold leading-tight">
                  Nível {level} <span className="text-[#f1b300]">✦</span>
                </h2>
                <p className="truncate text-xs font-semibold text-[#365b83]">
                  {levelTitle}
                </p>
              </div>
              <span className="shrink-0 text-[11px] font-bold text-[#405f7f]">
                {xpInCurrentLevel.toLocaleString("pt-BR")} /{" "}
                {xpForNextLevel.toLocaleString("pt-BR")} XP
              </span>
            </div>
            <div className="mt-3.5 h-2.5 overflow-hidden rounded-full bg-[#e6ece9]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#47a33d,#69c840)] transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-1 text-[10px] font-medium text-[#4d6988]">
              <span className="truncate">Próximo: {nextLevelTitle}</span>
              <span className="shrink-0">Faltam {xpRemaining} XP</span>
            </div>
          </div>
        </article>

        <article className="grid min-h-[145px] min-w-0 place-items-center rounded-xl border border-[#e0e7e4] bg-white p-4 text-center shadow-sm">
          <span className="grid size-10 place-items-center rounded-full bg-[#fff1c8] text-[#e9a500]">
            <CircleDollarSign size={22} />
          </span>
          <div>
            <strong className="text-xl">
              {points.toLocaleString("pt-BR")} XP
            </strong>
            <p className="text-[11px] text-[#4d6988]">Pontos de Cidadania</p>
          </div>
          <small className="font-bold text-[#208b3f]">
            {coins} moedas acumuladas
          </small>
        </article>

        <article className="grid min-h-[145px] min-w-0 place-items-center rounded-xl border border-[#e0e7e4] bg-white p-4 text-center shadow-sm">
          <span className="grid size-10 place-items-center rounded-full bg-[#e4f1fa] text-[#2078ad]">
            <Target size={22} />
          </span>
          <div>
            <strong className="text-xl">
              {completed.length} / {missions.length}
            </strong>
            <p className="text-[11px] text-[#4d6988]">Missões concluídas</p>
          </div>
          <Link
            href="/missoes"
            className="text-[11px] font-bold text-[#16844a] hover:underline"
          >
            Ir para missões →
          </Link>
        </article>

        <article className="grid min-h-[145px] min-w-0 place-items-center rounded-xl border border-[#e0e7e4] bg-white p-4 text-center shadow-sm">
          <span className="grid size-10 place-items-center rounded-full bg-[#fff0e4] text-[#f26c20]">
            <Sparkles size={22} />
          </span>
          <div>
            <strong className="text-xl">{completedActions.length}</strong>
            <p className="text-[11px] text-[#4d6988]">
              Explorações no Executivo
            </p>
          </div>
          <small className="font-bold text-[#f08a28]">
            {unlockedAchievements.length} / {ACHIEVEMENTS.length} medalhas
          </small>
        </article>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="grid min-w-0 gap-4">
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <article className="min-w-0 rounded-xl border border-[#e0e7e4] bg-white p-5 shadow-sm flex flex-col justify-between">
              <h2 className="text-sm font-extrabold">
                Índice de Fiscalização Cidadã{" "}
                <span className="text-[#7890a7]">ⓘ</span>
              </h2>
              <div className="mt-5 grid place-items-center">
                <ProgressRing value={missionCompletionPct} />
              </div>
              <div className="mt-5 flex justify-between text-[10px] font-semibold">
                <span>Meta recomendada: 5 missões (55%)</span>
                <span>
                  {completed.length}/{missions.length}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e5eae8]">
                <div
                  className="h-full rounded-full bg-[#45a344] transition-all duration-500"
                  style={{ width: `${missionCompletionPct}%` }}
                />
              </div>
              <p className="mt-4 flex items-center gap-2 rounded-lg bg-[#f2f7f4] p-3 text-[10px] text-[#486685]">
                <Users size={15} className="shrink-0 text-[#287bae]" />{" "}
                {completed.length >= 5
                  ? "Parabéns! Você desbloqueou o bônus da Missão Especial da Semana!"
                  : `Conclua mais ${5 - completed.length} missão(ões) para liberar o bônus de +250 XP!`}
              </p>
            </article>

            <article className="min-w-0 rounded-xl border border-[#e0e7e4] bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-extrabold truncate">
                    Missões em Destaque (Florianópolis)
                  </h2>
                  <span className="shrink-0 rounded-full bg-[#eef2f4] px-2.5 py-1 text-[10px] font-bold">
                    {completedDailyCount}/{dailyMissions.length} concluídas
                  </span>
                </div>
                <div className="mt-4 grid gap-3">
                  {dailyMissions.map((mission, index) => {
                    const icons = [
                      CircleDollarSign,
                      Landmark,
                      BookOpen,
                      FileText,
                    ];
                    const Icon = icons[index % icons.length];
                    const isDone = completed.includes(mission.id);
                    return (
                      <Link
                        href={"/missoes/" + mission.id}
                        key={mission.id}
                        className="flex min-w-0 items-center gap-3 rounded-lg border border-[#e6ece9] p-3 transition hover:border-[#7aaa8b] hover:bg-[#f7faf8]"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#e8f4e8] text-[#329348]">
                          <Icon size={18} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <strong className="block truncate text-xs text-slate-900">
                            {mission.titulo}
                          </strong>
                          <small className="block truncate text-[10px] text-[#55718e]">
                            {mission.descricao}
                          </small>
                        </span>
                        <strong className="shrink-0 text-[11px] font-extrabold text-[#158944]">
                          +{mission.pontos} XP
                        </strong>
                        {isDone ? (
                          <CheckCircle2
                            size={18}
                            className="shrink-0 fill-[#158944] text-white"
                          />
                        ) : (
                          <Circle
                            size={18}
                            className="shrink-0 text-slate-300"
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#e7ece9] pt-3 text-[11px] text-[#4e6986]">
                <span>Ganhe XP explorando dados reais da PMF</span>
                <Link
                  href="/missoes"
                  className="font-bold text-[#16844a] hover:underline"
                >
                  Ver todas as {missions.length} missões →
                </Link>
              </div>
            </article>

            <article className="min-w-0 md:col-span-2 lg:col-span-1 rounded-xl border border-[#e0e7e4] bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-extrabold truncate">
                    Exploração Rápida (+25 XP por aba)
                  </h2>
                  <Link
                    href="/gastos/municipio/florianopolis"
                    className="shrink-0 text-[10px] font-bold text-blue-600"
                  >
                    Abrir Painel
                  </Link>
                </div>
                <div className="mt-4 grid gap-3">
                  {investigations.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        href={item.href}
                        key={item.title}
                        className="flex min-w-0 gap-3 rounded-lg border border-[#e6ece9] p-3 transition hover:border-[#7aaa8b] hover:bg-[#f8faf9]"
                      >
                        <span
                          className="grid size-10 shrink-0 place-items-center rounded-full text-white"
                          style={{ backgroundColor: item.color }}
                        >
                          <Icon size={20} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <strong className="block truncate text-xs text-slate-900">
                            {item.title}
                          </strong>
                          <b className="block truncate text-[11px] text-slate-700">
                            {item.value}
                          </b>
                          <small className="block truncate text-[10px] text-[#5b7390]">
                            Clique para auditar ao vivo no portal e-Pública
                          </small>
                          <i className="mt-2 block h-1.5 rounded-full bg-[#e8edef]">
                            <i
                              className="block h-full rounded-full bg-[#349548]"
                              style={{ width: String(item.progress) + "%" }}
                            />
                          </i>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </article>
          </section>

          <section className="min-w-0 rounded-xl border border-[#e0e7e4] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-extrabold text-[#244d76]">
                Panorama Geral de Santa Catarina
              </h2>
              <span className="text-[10px] text-[#667f98]">
                Dados públicos consolidados
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {overview.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.label}
                    className="flex min-w-0 items-center gap-3 rounded-lg border border-[#e7ece9] p-3.5"
                  >
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-full bg-[#edf5ef]"
                      style={{ color: item.color }}
                    >
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <small className="block truncate text-[10px] text-[#4f6a87]">
                        {item.label}
                      </small>
                      <strong className="block truncate text-sm">{item.value}</strong>
                      <small
                        className="block truncate text-[9px] font-semibold"
                        style={{ color: item.color }}
                      >
                        {item.trend}
                      </small>
                    </span>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="grid min-w-0 content-start gap-4">
          <section className="rounded-xl border border-[#e0e7e4] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold">Suas Medalhas</h2>
              <Link
                href="/progresso"
                className="text-[10px] font-bold text-blue-600 hover:underline"
              >
                Ver todas ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {ACHIEVEMENTS.map((ach) => {
                const isUnlocked = unlockedAchievements.includes(ach.id);
                return (
                  <Link
                    href="/progresso"
                    key={ach.id}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition ${
                      isUnlocked
                        ? "border-emerald-200 bg-emerald-50/50 shadow-sm"
                        : "border-slate-200 bg-slate-50 opacity-55"
                    }`}
                  >
                    <span
                      className="grid size-10 place-items-center rounded-xl text-lg shadow-sm"
                      style={{
                        backgroundColor: isUnlocked ? ach.color : "#cbd5e1",
                        color: "#fff",
                      }}
                    >
                      {ach.symbol}
                    </span>
                    <strong className="text-[11px] font-extrabold leading-tight text-slate-900">
                      {ach.title}
                    </strong>
                    <span
                      className={`text-[9px] font-bold ${
                        isUnlocked ? "text-emerald-700" : "text-slate-500"
                      }`}
                    >
                      {isUnlocked ? "✓ Desbloqueada" : "Bloqueada"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </aside>
      </div>

      <p className="mt-5 flex items-center justify-center gap-2 border-t border-[#e3e9e6] pt-4 text-[10px] text-[#6d829b]">
        <ShieldCheck size={14} /> Todos os dados são públicos e atualizados
        pelos órgãos oficiais.
      </p>
    </div>
  );
}
