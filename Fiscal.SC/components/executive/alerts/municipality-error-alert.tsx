"use client";

import { ServerCrash, WifiOff, RefreshCw, Clock, TriangleAlert, type LucideIcon } from "lucide-react";
import type { DashboardError, DashboardErrorCode } from "@/hooks/use-florianopolis-transparencia";

type MunicipalityErrorAlertProps = {
  name: string;
  error: DashboardError;
  onRetry: () => void;
  loading?: boolean;
};

type ErrorCopy = { Icon: LucideIcon; title: string; description: string };

// Texto exibido por código de erro (o código vem do backend, nunca é deduzido da mensagem)
const ERROR_COPY: Record<DashboardErrorCode, (name: string, periodo: string) => ErrorCopy> = {
  MUNICIPIO_INDISPONIVEL: (name, periodo) => ({
    Icon: ServerCrash,
    title: `Portal de transparência de ${name} indisponível`,
    description: `O servidor da Prefeitura de ${name} não respondeu corretamente ao consultar a competência ${periodo}. Isso costuma ser temporário e depende da prefeitura — os dados não estão zerados, apenas não puderam ser obtidos agora.`,
  }),
  TEMPO_ESGOTADO: (name, periodo) => ({
    Icon: Clock,
    title: "A consulta demorou demais",
    description: `Os dados de ${name} para a competência ${periodo} não chegaram a tempo. O portal da prefeitura pode estar lento ou sobrecarregado.`,
  }),
  BACKEND_INDISPONIVEL: () => ({
    Icon: WifiOff,
    title: "Não foi possível conectar ao servidor do Fiscal.SC",
    description:
      "O serviço que consolida os dados (fiscal-backend) não está respondendo. Verifique se ele está em execução e tente novamente.",
  }),
  ERRO_INTERNO: () => ({
    Icon: TriangleAlert,
    title: "Erro ao montar o painel",
    description:
      "Ocorreu um erro inesperado no servidor do Fiscal.SC ao processar os dados deste município.",
  }),
};

export default function MunicipalityErrorAlert({
  name,
  error,
  onRetry,
  loading = false,
}: MunicipalityErrorAlertProps) {
  const { Icon, title, description } = ERROR_COPY[error.code](name, error.periodo);

  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50/70 p-5 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
          <Icon size={22} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-base font-extrabold text-red-950">{title}</h2>
          <p className="text-sm leading-relaxed text-red-900/90">{description}</p>
          <p className="text-xs text-red-900/80">
            Você pode tentar novamente ou escolher outro mês/ano no seletor acima.
          </p>

          <details className="text-xs text-red-900/80">
            <summary className="cursor-pointer select-none font-bold">Detalhes técnicos</summary>
            <code className="mt-1.5 block break-words rounded-lg bg-white/70 px-3 py-2 font-mono text-[11px] text-red-950">
              {error.message}
            </code>
          </details>
        </div>

        <button
          type="button"
          onClick={onRetry}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-800 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} aria-hidden="true" />
          {loading ? "Tentando..." : "Tentar novamente"}
        </button>
      </div>
    </div>
  );
}
