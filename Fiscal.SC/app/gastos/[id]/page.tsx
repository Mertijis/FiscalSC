"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { expenses, formatCurrency } from "@/data/content";
import { BackLink, DemoNotice, Metric } from "@/components/ui";
import { useStudy } from "@/components/providers/study-provider";

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const item = expenses.find((expense) => expense.id === id);
  const { track } = useStudy();
  useEffect(() => {
    if (item) track("expense_opened", { expenseId: item.id });
  }, [item?.id]);
  if (!item)
    return (
      <div className="card">
        <h2>Registro não encontrado</h2>
        <Link href="/gastos">Voltar aos gastos</Link>
      </div>
    );
  return (
    <>
      <BackLink href="/gastos" label="Todos os gastos" />
      <div className="detail-hero">
        <div>
          <span className="badge">{item.categoria}</span>
          <h1>{item.descricao}</h1>
          <p>{item.orgao}</p>
        </div>
        <div className="detail-value">
          <span>Valor registrado</span>
          <strong>{formatCurrency(item.valor)}</strong>
        </div>
      </div>
      <DemoNotice />
      <section className="metrics detail-metrics">
        <Metric
          icon="R$"
          color="green"
          value={formatCurrency(item.valor)}
          label="valor registrado"
        />
        <Metric
          icon="⌂"
          color="blue"
          value={item.data.split("-").reverse().join("/")}
          label="data de referência"
        />
        <Metric
          icon="✓"
          color="lime"
          value={item.atualizadoEm}
          label="última atualização"
        />
      </section>
      <section className="section-grid">
        <div className="card">
          <p className="eyebrow">Como ler este dado</p>
          <h2>O que este registro informa?</h2>
          <p className="muted">
            Ele representa uma despesa selecionada para fins educativos. O órgão
            é a instituição responsável pelo registro; o favorecido é quem
            recebeu ou receberá o recurso conforme a fonte.
          </p>
          <dl className="detail-list">
            <div>
              <dt>Órgão</dt>
              <dd>{item.orgao}</dd>
            </div>
            <div>
              <dt>Favorecido</dt>
              <dd>{item.favorecido}</dd>
            </div>
            <div>
              <dt>Identificador</dt>
              <dd>{item.id}</dd>
            </div>
          </dl>
        </div>
        <aside className="card source-card">
          <p className="eyebrow">Rastreabilidade</p>
          <h2>{item.fonte}</h2>
          <p className="muted">
            Confira os campos diretamente no serviço público de origem.
          </p>
          <a
            className="btn btn-dark"
            href={item.fonteUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              track("official_source_opened", {
                kind: "expense",
                recordId: item.id,
              })
            }
          >
            Abrir fonte oficial ↗
          </a>
        </aside>
      </section>
    </>
  );
}
