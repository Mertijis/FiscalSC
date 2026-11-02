"use client";

import { ArrowDown, ArrowUp, RefreshCw, type LucideIcon } from "lucide-react";

export type MetricCardProps = {
  icon: LucideIcon;
  title: string;
  value: string;
  trend: string;
  color: string;
  down?: boolean;
  badge?: React.ReactNode;
  loading?: boolean;
};

export default function MetricCard({
  icon: Icon,
  title,
  value,
  trend,
  color,
  down,
  badge,
  loading = false,
}: MetricCardProps) {
  return (
    <article className="min-w-0 rounded-xl border border-[#e1e8e5] bg-white p-4 xl:p-5 shadow-[0_4px_18px_rgba(25,60,51,.05)]">
      <div className="flex items-start gap-3.5">
        <span
          className="grid size-11 xl:size-12 shrink-0 place-items-center rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          <Icon size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xs font-bold" style={{ color }} title={title}>
            {title}
          </h2>
          {loading ? (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                <RefreshCw size={13} className="animate-spin text-gray-400" />
                <span>Carregando...</span>
              </div>
              <div className="h-3.5 w-24 rounded bg-gray-200 animate-pulse" />
            </div>
          ) : (
            <>
              <p className="mt-1 truncate text-lg xl:text-[21px] font-extrabold leading-tight" title={value}>
                {value}
              </p>
              <p
                className={`mt-1 flex items-center gap-1 truncate text-[10px] font-semibold ${
                  down ? "text-red-600" : "text-blue-600"
                }`}
              >
                {!trend.includes("e-Pública") &&
                  !trend.includes("extraídos") &&
                  !trend.includes("Pagamentos") &&
                  !trend.includes("Arrecadação") &&
                  !trend.includes("Base") &&
                  !trend.includes("download") &&
                  (down ? <ArrowDown size={11} className="shrink-0" /> : <ArrowUp size={11} className="shrink-0" />)}
                <span className="truncate">{trend}</span>
              </p>
            </>
          )}
          {badge && <div className="mt-2">{badge}</div>}
        </div>
      </div>
    </article>
  );
}
