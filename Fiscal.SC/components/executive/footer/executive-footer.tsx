"use client";

import Link from "next/link";
import { Globe2, ShieldCheck, HelpCircle } from "lucide-react";

export type ExecutiveFooterProps = {
  isFlorianopolis: boolean;
};

export default function ExecutiveFooter({ isFlorianopolis }: ExecutiveFooterProps) {
  if (isFlorianopolis) {
    return (
      <section className="mt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-[linear-gradient(90deg,#f0fbf5,#fff)] p-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#16844a] text-white">
            <Globe2 size={23} />
          </span>
          <div className="min-w-0">
            <h2 className="font-extrabold text-sm text-gray-900">Portal de Dados Abertos — Florianópolis</h2>
            <p className="text-xs text-[#365780]">
              Conexão direta com os 6 módulos oficiais do Portal da Transparência da PMF.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-lg bg-emerald-100/70 border border-emerald-200 px-3 py-1.5 text-center shrink-0">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Amparo Legal</span>
            <strong className="text-xs text-emerald-900">Lei nº 12.527 / LC nº 131</strong>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-gray-500">Módulos Conectados (100%)</p>
            <p className="text-xs font-bold text-gray-800">
              Receitas • Empenhos • Orçamento (LOA) • Licitações • Contratos • Pessoal
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-[#dfe7e3] bg-[linear-gradient(90deg,#f4f8f3,#fff)] p-4">
      <div className="flex items-center gap-3.5 min-w-0">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#43a53b] text-white">
          <ShieldCheck size={23} />
        </span>
        <div className="min-w-0">
          <h2 className="font-extrabold text-sm text-gray-900">Nível de Vigilância Popular</h2>
          <p className="text-xs text-[#496588]">Quanto mais cidadãos analisam, maior a transparência!</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 flex-1 lg:max-w-md">
        <strong className="text-3xl font-black text-[#4dad37] shrink-0">74%</strong>
        <div className="min-w-[160px] flex-1">
          <div className="flex items-center justify-between text-[10px] font-semibold">
            <span>Participação da comunidade</span>
            <strong>Meta: 85%</strong>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-[#e2e8e5]">
            <div className="h-full w-[74%] rounded-full bg-[#55bd38]" />
          </div>
        </div>
      </div>

      <Link
        href="/missoes"
        className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#dce4e1] bg-white px-4 text-xs font-semibold hover:bg-gray-50 transition"
      >
        <HelpCircle size={16} className="text-[#69b63f]" /> Participar das missões
      </Link>
    </section>
  );
}
