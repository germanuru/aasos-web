import Dashboard from "@/components/dashboard";

export type Company = {
  id: number;
  company_name: string;
  website: string;
  country: string;
  city: string;
  industry: string;
  score: number;
  research_status: "verified" | "partial" | "insufficient";
  updated_at: string;
};

const companies: Company[] = [
  {
    id: 1,
    company_name: "Sotecsa Ascensores S.A.",
    website: "https://sotecsa.cl",
    country: "Chile",
    city: "Viña del Mar",
    industry: "Ascensores",
    score: 88,
    research_status: "verified",
    updated_at: "2026-07-20T02:11:01.992Z",
  },
  {
    id: 2,
    company_name: "Clima Técnica Chile",
    website: "https://climatecnica.cl",
    country: "Chile",
    city: "Santiago",
    industry: "HVAC",
    score: 82,
    research_status: "partial",
    updated_at: "2026-07-19T21:00:00.000Z",
  },
  {
    id: 3,
    company_name: "Energía Respaldo SpA",
    website: "https://energiarespaldo.cl",
    country: "Chile",
    city: "Concepción",
    industry: "Grupos electrógenos",
    score: 76,
    research_status: "verified",
    updated_at: "2026-07-18T18:30:00.000Z",
  },
];

export default function Home() {
  return <Dashboard companies={companies} />;
}
