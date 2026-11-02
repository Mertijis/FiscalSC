"use client";

import { Calculator, X } from "lucide-react";
import type { ReceitaTrimestreResultado } from "@/lib/transparencia-service";

export type TrimestreModalProps = {
  isOpen: boolean;
  onClose: () => void;
  trimestreResultado: ReceitaTrimestreResultado | null;
  formatCurrency?: (val: number) => string;
};

export default function TrimestreModal({
  isOpen,
  onClose,
  trimestreResultado,
  formatCurrency = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
}: TrimestreModalProps) {
  if (!isOpen || !trimestreResultado) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Fechar modal"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-100 text-blue-700">
            <Calculator size={20} />
          </span>
          <div>
            <h3 className="text-base font-extrabold text-gray-900">
              Agregação de Receitas em 3 Meses
            </h3>
            <p className="text-xs text-gray-500">
              {trimestreResultado.trimestreReferencia} — Prefeitura de Florianópolis
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-gray-600">
            A API personalizada consultou os dados abertos de cada um dos 3 meses em paralelo, somou os movimentos de receita de cada mês e calculou a soma total:
          </p>

          <div className="grid gap-2">
            {trimestreResultado.detalhesPorMes.map((mesDetalhe, idx) => (
              <div
                key={mesDetalhe.mes}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/70 p-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-800">
                    {idx + 1}º
                  </span>
                  <div>
                    <strong className="text-xs text-gray-900 block">Mês: {mesDetalhe.mes}</strong>
                    <span className="text-[10px] text-gray-400">
                      {mesDetalhe.quantidadeRegistros} registros processados • Status {mesDetalhe.status}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-blue-700">
                  {formatCurrency(mesDetalhe.subtotal)}
                </span>
              </div>
            ))}
          </div>

          {/* Total Card */}
          <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Soma Total dos 3 Meses
                </span>
                <p className="text-2xl font-black text-emerald-900">
                  {formatCurrency(trimestreResultado.somaTotalTrimestre)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-700 block">Média Mensal:</span>
                <strong className="text-xs text-emerald-900">
                  {formatCurrency(trimestreResultado.mediaMensal)}
                </strong>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-emerald-200 pt-2 text-[10px] text-emerald-700">
              <span>
                Tempo de execução: <strong>{trimestreResultado.tempoExecucaoMs} ms</strong>
              </span>
              <span>Executado via endpoint BFF</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
