import Link from "next/link";
import type { ReactNode } from "react";

export function PageHead({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {action}
    </div>
  );
}

export function Metric({
  icon,
  color,
  value,
  label,
}: {
  icon: string;
  color: string;
  value: string;
  label: string;
}) {
  return (
    <div className="metric">
      <div className={"metric-icon " + color} aria-hidden="true">
        {icon}
      </div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function BackLink({
  href,
  label = "Voltar",
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link href={href} className="back-link">
      ← {label}
    </Link>
  );
}

export function DemoNotice() {
  return (
    <div className="demo-notice" role="note">
      <strong>Versão demonstrativa</strong>
      <span>
        Confirme valores e etapas na fonte oficial antes de utilizá-los.
      </span>
    </div>
  );
}
