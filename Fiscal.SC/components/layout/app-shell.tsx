"use client";

// TODO - arrumar arquitetura da pagina, separar em componentes menores e mais reutilizáveis, e adicionar testes unitários e de integração.
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Home,
  Landmark,
  Search,
  Settings,
  ShieldCheck,
  Target,
  Trophy,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useStudy } from "@/components/providers/study-provider";
import { missions } from "@/data/content";

type NavigationItem = {
  href?: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

const navigation: NavigationItem[] = [
  { href: "/", label: "Início", icon: Home },
  { href: "/missoes", label: "Missões", icon: Target },
  { href: "/gastos", label: "Executivo", icon: Landmark },
  { href: "/progresso", label: "Conquistas", icon: Trophy },
  { href: "/pesquisa", label: "Meu Perfil", icon: UserRound },
];

const pageMeta: Record<
  string,
  { title: string; subtitle: string; icon: LucideIcon }
> = {
  "/": {
    title: "Olá, Victor! 👋",
    subtitle: "Bem-vindo de volta, Fiscal Cidadão.",
    icon: ShieldCheck,
  },
  "/missoes": {
    title: "Missões",
    subtitle:
      "Complete missões, ganhe pontos e transforme Santa Catarina com cidadania.",
    icon: Target,
  },
  "/gastos": {
    title: "Executivo",
    subtitle: "Entenda como os recursos públicos estaduais e municipais são utilizados.",
    icon: Landmark,
  },
  "/progresso": {
    title: "Minhas Conquistas",
    subtitle: "Acompanhe seu nível, medalhas e histórico de missões concluídas.",
    icon: Trophy,
  },
  "/pesquisa": {
    title: "Meu Perfil",
    subtitle: "Gerencie sua participação no estudo e seus dados.",
    icon: UserRound,
  },
};

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    participant,
    completed,
    points,
    level,
    levelTitle,
    levelProgress,
    xpForNextLevel,
    xpInCurrentLevel,
  } = useStudy();
  const pendingMissionsCount = Math.max(0, missions.length - completed.length);
  const section = "/" + (pathname.split("/")[1] || "");
  const meta = pageMeta[section] ?? pageMeta["/"];
  const PageIcon = meta.icon;
  const isActive = (href?: string) =>
    href
      ? href === "/"
        ? pathname === "/"
        : pathname.startsWith(href)
      : false;

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#11251f] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col overflow-y-auto bg-[linear-gradient(180deg,#003d34_0%,#005548_55%,#003f37_100%)] text-white shadow-2xl lg:flex">
        <Link
          href="/"
          className="flex items-center gap-3 px-6 pb-6 pt-6 no-underline"
        >
          <span className="grid size-14 place-items-center rounded-2xl border-2 border-white bg-white/10 shadow-inner">
            <ShieldCheck size={36} strokeWidth={2.2} />
          </span>
          <span>
            <strong className="block text-[22px] font-extrabold leading-none tracking-tight">
              FISCAL SC
            </strong>
            <span className="mt-2 block text-[11px] font-bold uppercase leading-[1.35] tracking-wide text-white/85">
              Transparência
              <br />
              que transforma
            </span>
          </span>
        </Link>

        <nav className="grid gap-1.5 px-3" aria-label="Navegação principal">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const classes = `group flex min-h-11 items-center gap-3 rounded-lg px-3.5 text-[15px] font-semibold transition ${
              isActive(item.href)
                ? "bg-[linear-gradient(90deg,rgba(63,158,80,.78),rgba(54,145,72,.48))] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]"
                : item.href
                  ? "text-white/90 hover:bg-white/10 hover:text-white"
                  : "cursor-not-allowed text-white/45"
            } ${index === 3 ? "mt-2" : ""}`;

            if (!item.href) {
              return (
                <span
                  key={item.label}
                  className={classes}
                  title="Fora do escopo desta versão"
                  aria-disabled="true"
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                  <span className="ml-auto text-[9px] uppercase">em breve</span>
                </span>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={classes}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {item.href === "/missoes" && pendingMissionsCount > 0 && (
                  <span className="ml-auto grid size-5 place-items-center rounded-full bg-[#58c450] text-[10px] font-extrabold">
                    {pendingMissionsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mx-3 mt-auto rounded-xl border border-white/35 bg-black/10 p-4 shadow-inner">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase">Nível {level}</p>
              <p className="text-xs font-semibold text-white/80">
                {levelTitle}
              </p>
            </div>
            <span className="grid size-10 place-items-center rounded-lg border border-[#f6c945] bg-[#114e43] text-[#f6c945]">
              <ShieldCheck size={23} />
            </span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#efc337,#38bd65,#4fa3ff)] transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold">
            {xpInCurrentLevel.toLocaleString("pt-BR")} /{" "}
            {xpForNextLevel.toLocaleString("pt-BR")} XP neste nível
          </p>
          <div className="my-3 h-px bg-white/30" />
          <div className="grid gap-3 text-sm">
            <p className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-full bg-[#f6bd16] text-[#173e36]">
                ★
              </span>
              <span>
                <strong className="block">
                  {points.toLocaleString("pt-BR")} XP
                </strong>
                <small className="text-[10px] text-white/75">
                  Pontos de Cidadania
                </small>
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-full bg-[#0d83a4]">
                ◎
              </span>
              <span>
                <strong className="block">
                  {completed.length} / {missions.length}
                </strong>
                <small className="text-[10px] text-white/75">
                  Missões concluídas
                </small>
              </span>
            </p>
          </div>
        </div>
        <p className="px-6 pb-5 pt-6 text-xs leading-5 text-white/65">
          Projeto de TIC
          <br />
          versão 0.1 (dev)
        </p>
      </aside>

      <main className="min-w-0 lg:col-start-2 overflow-x-hidden">
        <header className="sticky top-0 z-20 flex min-h-[88px] items-center gap-5 border-b border-[#e3e9e6] bg-white/95 px-4 py-4 backdrop-blur-xl md:px-7 xl:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#00483d] text-white shadow-[0_8px_20px_rgba(0,72,61,.22)]">
              <PageIcon size={24} />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-extrabold leading-tight tracking-tight md:text-[27px]">
                {meta.title}
              </h1>
              <p className="hidden truncate text-xs text-[#173d6a] md:block">
                {meta.subtitle}
              </p>
            </div>
          </div>
          <label className="relative ml-auto hidden w-full max-w-[360px] lg:block">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#58709a]"
              size={17}
            />
            <input
              className="h-11 w-full rounded-lg border border-[#d9e0e8] bg-white pl-10 pr-10 text-sm outline-none transition focus:border-[#198d54] focus:ring-3 focus:ring-[#198d54]/10"
              placeholder="Buscar missão, tema ou palavra-chave..."
            />
            <Search
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#58709a]"
              size={17}
            />
          </label>
          <button
            className="relative ml-auto grid size-10 place-items-center rounded-lg text-[#075269] hover:bg-slate-100 lg:ml-2"
            aria-label="Notificações"
          >
            <Bell size={21} />
            <span className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-red-600 text-[9px] font-bold text-white">
              3
            </span>
          </button>
          <button
            className="hidden size-10 place-items-center rounded-lg text-[#075269] hover:bg-slate-100 sm:grid"
            aria-label="Calendário"
          >
            <CalendarDays size={21} />
          </button>
          <div className="hidden h-9 w-px bg-[#e2e8e5] sm:block" />
          <div className="flex items-center gap-2.5">
            <div className="grid size-10 place-items-center rounded-full bg-[linear-gradient(145deg,#37a9da,#33a853)] text-sm font-extrabold text-white ring-2 ring-white shadow">
              {participant?.alias?.slice(0, 1).toUpperCase() || "V"}
            </div>
            <div className="hidden min-w-24 xl:block">
              <strong className="block text-xs">
                {participant?.alias || "Victor Fineto"}
              </strong>
              <span className="text-[10px] font-semibold text-[#365b8c]">
                {levelTitle}
              </span>
            </div>
            <ChevronDown className="hidden text-[#173d6a] sm:block" size={17} />
          </div>
        </header>

        <div className="min-w-0 max-w-full p-4 pb-24 md:p-6 lg:pb-8 xl:p-7">
          {children}
        </div>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex h-[68px] items-center justify-around border-t border-[#dce5e1] bg-white px-2 shadow-[0_-8px_30px_rgba(0,55,45,.08)] lg:hidden"
        aria-label="Navegação móvel"
      >
        {navigation
          .filter((item) => item.href)
          .slice(0, 5)
          .map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href!}
                className={`grid min-w-14 justify-items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold ${isActive(item.href) ? "bg-[#e4f4e8] text-[#087a45]" : "text-[#58706a]"}`}
              >
                <Icon size={20} />
                <span>{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
      </nav>
    </div>
  );
}
