"use client";

import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  CircleDot,
  Clock3,
  Plus,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import type { Company } from "@/app/page";

type DashboardProps = {
  companies: Company[];
};

const navigation = [
  { label: "Inicio", icon: Sparkles, active: true },
  { label: "Scout", icon: Search },
  { label: "Empresas", icon: Building2 },
  { label: "Configuración", icon: Settings },
];

function getStatusLabel(status: Company["research_status"]) {
  if (status === "verified") return "Verificada";
  if (status === "partial") return "Parcial";
  return "Insuficiente";
}

function getStatusStyles(status: Company["research_status"]) {
  if (status === "verified") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "partial") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

export default function Dashboard({ companies }: DashboardProps) {
  const verifiedCompanies = companies.filter(
    (company) => company.research_status === "verified",
  ).length;

  const averageScore = Math.round(
    companies.reduce((total, company) => total + company.score, 0) /
    companies.length,
  );

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-2">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
              A
            </div>

            <div>
              <p className="font-semibold tracking-tight">AASOS</p>
              <p className="text-xs text-slate-500">AI Sales Operating System</p>
            </div>
          </div>

          <nav className="mt-10 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                    item.active
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  ].join(" ")}
                >
                  <Icon size={17} strokeWidth={1.8} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <CircleDot size={16} className="text-emerald-500" />
              Scout activo
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Analizando empresas de servicios técnicos y mantenimiento.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8 lg:px-10">
            <div>
              <p className="text-sm text-slate-500">Panel comercial</p>
              <h1 className="text-lg font-semibold tracking-tight">SatWeb Scout</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:block"
              >
                Ver actividad
              </button>

              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white"
              >
                GF
              </button>
            </div>
          </header>

          <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.45fr_0.8fr] lg:p-10">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                    <Sparkles size={14} />
                    Resumen del Scout
                  </div>

                  <h2 className="mt-6 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
                    Buenos días, Germán.
                  </h2>

                  <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                    El Scout encontró{" "}
                    <span className="font-semibold text-slate-950">
                      18 empresas nuevas
                    </span>{" "}
                    listas para revisar y contactar.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <Plus size={17} />
                      Nueva investigación
                    </button>

                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Ver empresas
                      <ArrowUpRight size={17} />
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Scout activo
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Investigación en curso
                      </p>
                    </div>

                    <div className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
                      <Search size={18} />
                    </div>
                  </div>

                  <div className="mt-8 flex items-end justify-between">
                    <div>
                      <p className="text-4xl font-semibold tracking-tight">72%</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Progreso de investigación
                      </p>
                    </div>

                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      En ejecución
                    </span>
                  </div>

                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[72%] rounded-full bg-slate-950" />
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
                    <Clock3 size={14} />
                    Última actualización hace 4 minutos
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">Empresas encontradas</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {companies.length}
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">Verificadas</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {verifiedCompanies}
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">Score promedio</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {averageScore}
                </p>
              </article>
            </section>

            <section className="mt-10">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-violet-700">
                    Oportunidades destacadas
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold tracking-tight">
                    Empresas recomendadas
                  </h3>
                </div>

                <button
                  type="button"
                  className="hidden text-sm font-semibold text-slate-600 transition hover:text-slate-950 sm:block"
                >
                  Ver todas
                </button>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-3">
                {companies.map((company) => (
                  <article
                    key={company.id}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-700">
                        {company.company_name.slice(0, 2).toUpperCase()}
                      </div>

                      <span
                        className={[
                          "rounded-full border px-2.5 py-1 text-xs font-semibold",
                          getStatusStyles(company.research_status),
                        ].join(" ")}
                      >
                        {getStatusLabel(company.research_status)}
                      </span>
                    </div>

                    <div className="mt-5">
                      <h4 className="text-lg font-semibold tracking-tight text-slate-950">
                        {company.company_name}
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        {company.city}, {company.country}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                          Score
                        </p>
                        <p className="mt-1 text-2xl font-semibold">
                          {company.score}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                          Industria
                        </p>
                        <p className="mt-1 max-w-40 text-sm font-medium text-slate-700">
                          {company.industry}
                        </p>
                      </div>
                    </div>

                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition group-hover:bg-slate-100"
                    >
                      Ver empresa
                      <ArrowUpRight size={16} />
                    </a>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}