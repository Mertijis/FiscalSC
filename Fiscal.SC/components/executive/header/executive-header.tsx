"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe2, Share2, Check } from "lucide-react";
import { useStudy } from "@/components/providers/study-provider";

type ExecutiveHeaderProps = {
  label: string;
  isFlorianopolis: boolean;
  kind: "estado" | "municipio";
};

export default function ExecutiveHeader({
  label,
  isFlorianopolis,
  kind,
}: ExecutiveHeaderProps) {
  const [copied, setCopied] = useState(false);
  const { awardAction } = useStudy();

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      awardAction(
        "share_dashboard",
        "Compartilhou o link do Painel Executivo",
        20,
      );
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e1e8e5] pb-5">
      <div>
        <div className="flex items-center gap-2 text-[26px] font-extrabold tracking-tight">
          <Link href="/gastos" className="text-gray-900 hover:text-[#16844a]">
            Executivo
          </Link>
          <span className="font-normal text-[#7690a8]">›</span>
          <span>{label}</span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="text-xs text-[#365780]">
            Acompanhe receitas, despesas, orçamento, licitações, contratos e pessoal do Poder Executivo.
          </p>
          {isFlorianopolis ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
              <Globe2 size={13} className="text-emerald-700" />
              Dados Oficiais em Tempo Real (6 Módulos • Portal e-Pública)
            </span>
          ) : kind === "municipio" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
              Dados Estimados / Integração em Andamento
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800">
              Painel Estadual Consolidado
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleShare}
          className="flex h-10 items-center gap-2 rounded-lg bg-[#08763f] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#065e32]"
        >
          {copied ? <Check size={17} /> : <Share2 size={17} />}
          {copied ? "Link copiado!" : "Compartilhar"}
        </button>
      </div>
    </div>
  );
}
