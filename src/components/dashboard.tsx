"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  CircleDot,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import type { Company } from "@/app/settings/page";

type DashboardProps = {
  companies: Company[];
};

type Filter = "ALL" | "HIGH_SCORE" | "WITH_EMAIL" | "WITHOUT_EMAIL";

const navigation = [
  { label: "Inicio", icon: Sparkles, href: "/", active: true },
  { label: "Scout", icon: Search, href: "#", active: false },
  { label: "Empresas", icon: Building2, href: "#", active: false },
  { label: "Configuración", icon: Settings, href: "/settings", active: false },
];

function getScoreStyle(score: number | null) {
  if (score === null) return "border-slate-200 bg-slate-50 text-slate-600";
  if (score >= 85) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (score >= 70) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function getStatusStyle(status: string | null) {
  switch (status) {
    case "CONTACTED":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "REJECTED":
    case "DISCARDED":
      return "border-red-200 bg-red-50 text-red-700";
    case "NEW":
    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
}

function formatStatus(status: string | null) {
  switch (status) {
    case "CONTACTED":
      return "Contactado";
    case "REJECTED":
    case "DISCARDED":
      return "Descartado";
    case "NEW":
      return "Nuevo";
    default:
      return status || "Nuevo";
  }
}

function formatTextList(value: string | null) {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // El valor no es JSON. Se procesa como texto normal.
  }

  return value
    .split(/\n|,|;|\|/)
    .map((item) => item.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
}

function createMailtoLink(company: Company) {
  if (!company.contact_email) return "#";

  const subject = encodeURIComponent(
    `Consulta sobre gestión de mantenimiento - ${company.company_name}`,
  );

  const body = encodeURIComponent(`Hola,

Estuve viendo que ${company.company_name} trabaja en el sector ${company.industry || "de servicios"
    }.

En Avance Software desarrollamos SatWeb, una plataforma para gestionar mantenimientos, servicios técnicos y órdenes de trabajo.

Creo que podría ser interesante mostrarles cómo SatWeb puede ayudarlos a centralizar solicitudes, asignar responsables y mantener el historial de los trabajos realizados.

¿Les parece si coordinamos una breve reunión?

Saludos cordiales,

Germán Fernández
Socio Director
Avance Software`);

  return `mailto:${company.contact_email}?subject=${subject}&body=${body}`;
}

export default function Dashboard({ companies }: DashboardProps) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const newCompanies = companies.filter(
    (company) => company.status === "NEW" || !company.status,
  ).length;

  const highScoreCompanies = companies.filter(
    (company) => (company.satweb_fit_score ?? 0) >= 85,
  ).length;

  const companiesWithEmail = companies.filter((company) =>
    Boolean(company.contact_email),
  ).length;

  const filteredCompanies = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return companies.filter((company) => {
      const matchesSearch =
        !normalizedSearch ||
        company.company_name.toLowerCase().includes(normalizedSearch) ||
        company.industry?.toLowerCase().includes(normalizedSearch) ||
        company.location?.toLowerCase().includes(normalizedSearch) ||
        company.company_summary?.toLowerCase().includes(normalizedSearch) ||
        company.description?.toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) return false;

      switch (filter) {
        case "HIGH_SCORE":
          return (company.satweb_fit_score ?? 0) >= 85;
        case "WITH_EMAIL":
          return Boolean(company.contact_email);
        case "WITHOUT_EMAIL":
          return !company.contact_email;
        case "ALL":
        default:
          return true;
      }
    });
  }, [companies, filter, searchTerm]);

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-2">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">A</div>
            <div>
              <p className="font-semibold tracking-tight">AASOS</p>
              <p className="text-xs text-slate-500">AI Sales Operating System</p>
            </div>
          </div>

          <nav className="mt-10 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const className = [
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                item.active
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              ].join(" ");

              if (item.href === "#") {
                return (
                  <button key={item.label} type="button" className={className}>
                    <Icon size={17} />
                    {item.label}
                  </button>
                );
              }

              return (
                <Link key={item.label} href={item.href} className={className}>
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CircleDot size={16} className="text-emerald-500" />
              Scout conectado
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Los leads se leen directamente desde PostgreSQL.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8 lg:px-10">
            <div>
              <p className="text-sm text-slate-500">Panel comercial</p>
              <h1 className="text-lg font-semibold">SatWeb Scout</h1>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">GF</div>
          </header>

          <div className="px-5 py-8 sm:px-8 lg:px-10">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                <Sparkles size={14} />
                Scout activo
              </div>

              <h2 className="mt-5 text-3xl font-semibold tracking-tight">
                {newCompanies} leads nuevos para revisar
              </h2>
              <p className="mt-3 text-slate-600">
                Hay {companies.length} empresas calificadas en la base de datos.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <StatCard label="Leads visibles" value={companies.length} />
                <StatCard label="Score 85+" value={highScoreCompanies} />
                <StatCard label="Con email" value={companiesWithEmail} />
              </div>
            </section>

            <section className="mt-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-sm font-medium text-violet-700">Base de leads</p>
                  <h3 className="mt-1 text-2xl font-semibold">Empresas calificadas</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Mostrando {filteredCompanies.length} de {companies.length} empresas.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Search
                      size={17}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Buscar empresa, industria o ubicación"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 xl:w-96"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <FilterButton active={filter === "ALL"} onClick={() => setFilter("ALL")}>Todos</FilterButton>
                    <FilterButton active={filter === "HIGH_SCORE"} onClick={() => setFilter("HIGH_SCORE")}>Score 85+</FilterButton>
                    <FilterButton active={filter === "WITH_EMAIL"} onClick={() => setFilter("WITH_EMAIL")}>Con email</FilterButton>
                    <FilterButton active={filter === "WITHOUT_EMAIL"} onClick={() => setFilter("WITHOUT_EMAIL")}>Sin email</FilterButton>
                  </div>
                </div>
              </div>

              {filteredCompanies.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <p className="font-medium">No se encontraron empresas.</p>
                  <p className="mt-2 text-sm text-slate-500">Probá modificando la búsqueda o los filtros.</p>
                </div>
              ) : (
                <div className="mt-6 grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
                  {filteredCompanies.map((company) => {
                    const services = formatTextList(company.services);
                    const painPoints = formatTextList(company.pain_points);

                    return (
                      <article key={company.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-700">
                            {company.company_name.slice(0, 2).toUpperCase()}
                          </div>

                          <div className="flex flex-wrap justify-end gap-2">
                            <span className={["rounded-full border px-2.5 py-1 text-xs font-semibold", getScoreStyle(company.satweb_fit_score)].join(" ")}>Score {company.satweb_fit_score ?? "—"}</span>
                            <span className={["rounded-full border px-2.5 py-1 text-xs font-semibold", getStatusStyle(company.status)].join(" ")}>{formatStatus(company.status)}</span>
                          </div>
                        </div>

                        <h4 className="mt-5 text-lg font-semibold">{company.company_name}</h4>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {company.industry && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">{company.industry}</span>}
                          {company.location && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              <MapPin size={12} />
                              {company.location}
                            </span>
                          )}
                        </div>

                        <p className="mt-4 line-clamp-5 text-sm leading-6 text-slate-600">
                          {company.company_summary || company.description || "Sin resumen disponible."}
                        </p>

                        {services.length > 0 && (
                          <div className="mt-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Servicios</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {services.slice(0, 4).map((service) => (
                                <span key={service} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">{service}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {painPoints.length > 0 && (
                          <div className="mt-5 rounded-xl bg-amber-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Oportunidades detectadas</p>
                            <ul className="mt-2 space-y-1.5 text-sm text-amber-950">
                              {painPoints.slice(0, 3).map((painPoint) => (
                                <li key={painPoint} className="flex items-start gap-2">
                                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" />
                                  <span>{painPoint}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
                          {company.contact_email ? (
                            <a href={`mailto:${company.contact_email}`} className="flex items-center gap-2 text-slate-700 transition hover:text-slate-950">
                              <Mail size={15} className="text-slate-400" />
                              <span className="truncate">{company.contact_email}</span>
                            </a>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-400"><Mail size={15} />Sin email encontrado</div>
                          )}

                          {company.contact_phone ? (
                            <a href={`tel:${company.contact_phone}`} className="flex items-center gap-2 text-slate-700 transition hover:text-slate-950">
                              <Phone size={15} className="text-slate-400" />
                              {company.contact_phone}
                            </a>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-400"><Phone size={15} />Sin teléfono encontrado</div>
                          )}

                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock3 size={14} />
                            {new Date(company.created_at).toLocaleString("es-UY", {
                              timeZone: "America/Montevideo",
                            })}
                          </div>
                        </div>

                        <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
                          <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
                            Ver sitio
                            <ArrowUpRight size={16} />
                          </a>

                          {company.contact_email ? (
                            <a href={createMailtoLink(company)} className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
                              <Mail size={16} />
                              Enviar mail
                            </a>
                          ) : (
                            <button type="button" disabled title="Este lead no tiene un email disponible" className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-medium text-slate-400">
                              <Mail size={16} />
                              Sin email
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

type StatCardProps = {
  label: string;
  value: number;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

type FilterButtonProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function FilterButton({ active, onClick, children }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border px-3 py-2 text-xs font-semibold transition",
        active
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
