export type Municipality = {
  slug: string;
  name: string;
  region: string;
  score: number;
  population: number;
  accent: string;
  initials: string;
};

export const municipalities: Municipality[] = [
  { slug: "florianopolis", name: "Florianópolis", region: "Grande Florianópolis", score: 92, population: 537213, accent: "#1d78b6", initials: "FLN" },
  { slug: "joinville", name: "Joinville", region: "Norte", score: 88, population: 616323, accent: "#c73531", initials: "JVE" },
  { slug: "chapeco", name: "Chapecó", region: "Oeste", score: 79, population: 254781, accent: "#148c47", initials: "CHA" },
  { slug: "itajai", name: "Itajaí", region: "Vale do Itajaí", score: 78, population: 291805, accent: "#364c9c", initials: "ITJ" },
];

export const findMunicipality = (slug: string) =>
  municipalities.find((municipality) => municipality.slug === slug);

export const formatPopulation = (value: number) =>
  new Intl.NumberFormat("pt-BR").format(value);
