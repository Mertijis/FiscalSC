import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MunicipalityExecutiveView from "@/components/executive/views/municipality-executive-view";
import { findMunicipality, municipalities } from "@/data/municipalities";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return municipalities.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const municipality = findMunicipality(slug);
  return { title: municipality ? `Executivo de ${municipality.name}` : "Município não encontrado" };
}

export default async function MunicipalityExecutivePage({ params }: PageProps) {
  const { slug } = await params;
  const municipality = findMunicipality(slug);
  if (!municipality) notFound();

  const scale = municipality.population / 537213;

  return (
    <MunicipalityExecutiveView
      name={municipality.name}
      slug={slug}
      revenue={`R$ ${(3.82 * scale).toFixed(2).replace(".", ",")} bi`}
      expenses={`R$ ${(3.37 * scale).toFixed(2).replace(".", ",")} bi`}
      contracts={Math.round(428 * scale).toLocaleString("pt-BR")}
      bids={String(Math.max(12, Math.round(47 * scale)))}
    />
  );
}
