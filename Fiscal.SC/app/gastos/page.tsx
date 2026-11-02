"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  ChevronDown,
  Landmark,
  MapPinned,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { formatPopulation, municipalities } from "@/data/municipalities";

export default function ExecutivePage() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("Todas as regiões");
  const [order, setOrder] = useState("População");

  const regions = [
    "Todas as regiões",
    ...Array.from(new Set(municipalities.map((item) => item.region))),
  ];
  const filtered = useMemo(() => {
    const result = municipalities.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) &&
        (region === "Todas as regiões" || item.region === region),
    );
    return [...result].sort((a, b) =>
      order === "População" ? b.population - a.population : b.score - a.score,
    );
  }, [query, region, order]);

  return (
    <div className="mx-auto max-w-[1540px]">
      <h2 className="mb-5 text-xl font-extrabold tracking-tight">
        O que você deseja acompanhar?
      </h2>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0">
          <section className="grid gap-4 md:grid-cols-2">
            <Link
              href="/gastos/estado"
              data-testid="state-card"
              className="group relative flex min-h-[220px] min-w-0 flex-col sm:flex-row items-center gap-5 overflow-hidden rounded-xl border-2 border-[#42a868] bg-white p-6 shadow-[0_4px_20px_rgba(22,84,57,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(22,84,57,.13)]"
            >
              <span className="absolute right-0 top-0 grid size-12 place-items-center rounded-bl-[48px] bg-[#169a4e] pl-2 pb-2 text-white">
                <ShieldCheck size={20} />
              </span>
              <div className="relative grid h-[125px] w-[145px] shrink-0 place-items-center">
                <div className="absolute h-20 w-32 -rotate-6 rounded-[45%_55%_48%_52%] bg-[linear-gradient(145deg,#197e3d,#3a9d55)] opacity-95" />
                <div className="relative grid size-14 rotate-45 place-items-center border-[4px] border-white bg-[#e63946]">
                  <span className="-rotate-45 text-xl text-white">✦</span>
                </div>
              </div>
              <div className="min-w-0 flex-1 pr-4">
                <h3 className="font-display text-xl xl:text-[22px] font-extrabold leading-[1.18] text-gray-900">
                  Governo do Estado de Santa Catarina
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#365780]">
                  Acompanhe os dados consolidados de todo o estado.
                </p>
              </div>
            </Link>

            <a
              href="#municipios"
              className="group flex min-h-[220px] min-w-0 flex-col sm:flex-row items-center gap-5 rounded-xl border border-[#dce4e1] bg-white p-6 shadow-[0_4px_20px_rgba(22,84,57,.05)] transition hover:-translate-y-0.5 hover:border-[#78ae8d] hover:shadow-[0_15px_35px_rgba(22,84,57,.1)]"
            >
              <div className="flex h-[125px] w-[145px] shrink-0 items-end justify-center gap-1 text-[#164f7d]">
                <Building2 size={105} strokeWidth={1.3} />
                <Building2
                  size={60}
                  strokeWidth={1.5}
                  className="-ml-7 text-[#2476aa]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl xl:text-[22px] font-extrabold leading-[1.18] text-gray-900">
                  Prefeituras Municipais
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#365780]">
                  Selecione um município para acompanhar os dados locais.
                </p>
              </div>
            </a>
          </section>

          <section id="municipios" className="mt-8 scroll-mt-28">
            <h2 className="mb-3 text-base font-extrabold">
              Selecione um município
            </h2>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_190px_190px] items-end">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold text-[#365780]">
                  Buscar município
                </span>
                <div className="relative">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6680a0]"
                    size={17}
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="h-11 w-full rounded-lg border border-[#d9e2e7] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#25894c] focus:ring-3 focus:ring-[#25894c]/10"
                    placeholder="Buscar município..."
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold text-[#365780]">
                  Região
                </span>
                <div className="relative">
                  <select
                    value={region}
                    onChange={(event) => setRegion(event.target.value)}
                    className="h-11 w-full appearance-none rounded-lg border border-[#d9e2e7] bg-white pl-3 pr-8 text-xs font-medium"
                  >
                    <option disabled>Região</option>
                    {regions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={15}
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold text-[#365780]">
                  Ordenar por
                </span>
                <div className="relative">
                  <select
                    value={order}
                    onChange={(event) => setOrder(event.target.value)}
                    className="h-11 w-full appearance-none rounded-lg border border-[#d9e2e7] bg-white pl-3 pr-8 text-xs font-medium"
                  >
                    <option>População</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={15}
                  />
                </div>
              </label>
            </div>

            <div className="mt-5 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((municipality) => (
                <Link
                  key={municipality.slug}
                  href={`/gastos/municipio/${municipality.slug}`}
                  data-testid={`municipality-${municipality.slug}`}
                  className="group flex min-h-[150px] min-w-0 flex-col rounded-xl border border-[#dce4e1] bg-white p-4 shadow-[0_2px_12px_rgba(24,65,53,.04)] transition hover:-translate-y-0.5 hover:border-[#5ea579] hover:shadow-[0_10px_25px_rgba(24,65,53,.1)]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-xl border-2 bg-white text-[10px] font-black"
                      style={{
                        borderColor: municipality.accent,
                        color: municipality.accent,
                      }}
                    >
                      {municipality.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm text-gray-900">
                        {municipality.name}
                      </strong>
                      <small className="block truncate text-[10px] text-[#46658e]">
                        {municipality.region}
                      </small>
                    </span>
                  </div>
                  <div className="mt-auto flex items-end justify-between border-t border-[#edf1ef] pt-2 text-[10px] text-[#2f527c]">
                    <span>
                      População:{" "}
                      <strong>
                        {formatPopulation(municipality.population)}
                      </strong>
                    </span>
                    <ArrowRight
                      size={15}
                      className="shrink-0 transition group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              ))}
            </div>
            {!filtered.length && (
              <div className="mt-4 rounded-xl border border-dashed border-[#cfdcd6] bg-white p-8 text-center text-sm text-[#55716a]">
                Nenhum município encontrado com esses filtros.
              </div>
            )}
            <button className="mx-auto mt-4 flex h-10 min-w-[185px] items-center justify-center gap-3 rounded-lg border border-[#d7e1dd] bg-white text-xs font-bold text-blue-700">
              Ver mais municípios <ChevronDown size={15} />
            </button>
            <p className="mt-6 flex items-center justify-center gap-2 border-t border-[#e4eae7] pt-4 text-xs text-[#6a829f]">
              <ShieldCheck size={15} /> Todos os dados são públicos e
              atualizados pelos órgãos oficiais.
            </p>
          </section>
        </div>

        <aside className="grid min-w-0 content-start gap-4">
          <section className="rounded-xl border border-[#e0e7e4] bg-white p-6 shadow-sm">
            <h2 className="text-base font-extrabold">Como funciona?</h2>
            <div className="mt-5 grid gap-6">
              <div className="flex gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#e5f6ea] text-[#1b9b55]">
                  <Landmark size={23} />
                </span>
                <p>
                  <strong className="text-xs">Escolha o âmbito</strong>
                  <span className="mt-1 block text-xs leading-5 text-[#456489]">
                    Selecione entre Estado ou um município específico.
                  </span>
                </p>
              </div>
              <div className="flex gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#e8f1fc] text-[#2c7fe3]">
                  <BarChart3 size={23} />
                </span>
                <p>
                  <strong className="text-xs">Explore os dados</strong>
                  <span className="mt-1 block text-xs leading-5 text-[#456489]">
                    Visualize receitas, despesas, contratos e programas.
                  </span>
                </p>
              </div>
              <div className="flex gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#f3e9fb] text-[#853ac0]">
                  <Users size={23} />
                </span>
                <p>
                  <strong className="text-xs">Participe da fiscalização</strong>
                  <span className="mt-1 block text-xs leading-5 text-[#456489]">
                    Complete missões, faça análises e ganhe pontos.
                  </span>
                </p>
              </div>
            </div>
          </section>

          <p className="flex items-center gap-2 px-1 text-[10px] text-[#7790a7]">
            <MapPinned size={14} /> Última atualização: 27/05/2025 09:30
          </p>
        </aside>
      </div>
    </div>
  );
}
