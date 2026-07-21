import Dashboard from "@/components/dashboard";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export type Company = {
    id: number;
    company_name: string;
    website: string;
    description: string | null;
    industry: string | null;
    company_summary: string | null;
    services: string | null;
    location: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    satweb_fit_score: number | null;
    pain_points: string | null;
    status: string | null;
    enrichment_status?: string | null;
    is_company?: boolean | null;
    ai_score?: number | null;
    created_at: string;
};

export default async function HomePage() {
    const { rows } = await db.query<Company>(`
    SELECT
      id,
      company_name,
      website,
      description,
      industry,
      company_summary,
      services,
      location,
      contact_email,
      contact_phone,
      satweb_fit_score,
      pain_points,
      status,
      enrichment_status,
      is_company,
      ai_score,
      created_at
    FROM leads
    WHERE enrichment_status = 'PROCESSED'
      AND is_company = true
      AND COALESCE(status, 'NEW') NOT IN ('REJECTED', 'DISCARDED')
    ORDER BY
      satweb_fit_score DESC NULLS LAST,
      ai_score DESC NULLS LAST,
      created_at DESC
  `);

    return <Dashboard companies={rows} />;
}