"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Search,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import type { Company } from "@/app/settings/page";

type DashboardProps = {
  companies: Company[];
};

type Filter = "ALL" | "HIGH_SCORE" | "WITH_EMAIL" | "WITHOUT_EMAIL";
type SourceFilter = "ALL" | "GOOGLE" | "LINKEDIN";
type View = "PENDING" | "CONTACTED";

function matchesSourceFilter(
  source: string | null | undefined,
  sourceFilter: SourceFilter,
) {
  if (sourceFilter === "ALL") return true;
  if (sourceFilter === "LINKEDIN") return source === "serpapi_linkedin";
  // "GOOGLE" cubre tanto "serpapi_google" (nuevo) como "serpapi" (leads viejos).
  return source !== "serpapi_linkedin";
}

type EmailSettings = {
  email_subject: string;
  email_template: string;
  email_signature: string;
  calendly_url: string;
};

type SendResult = {
  success: boolean;
  message: string;
};

const navigation = [
  { label: "Inicio", icon: Sparkles, href: "/", active: true },
  { label: "Scout", icon: Search, href: "#", active: false },
  { label: "Empresas", icon: Building2, href: "#", active: false },
  { label: "Configuración", icon: Settings, href: "/settings", active: false },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.15-.174.199-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.86.505 3.622 1.475 5.163L2 22l4.995-1.44A9.94 9.94 0 0 0 12.001 22C17.524 22 22 17.523 22 12S17.524 2 12.001 2zm0 18.09a8.06 8.06 0 0 1-4.211-1.183l-.301-.18-3.005.866.85-2.933-.196-.31A8.08 8.08 0 1 1 20.08 12a8.09 8.09 0 0 1-8.079 8.09z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.558V9h3.556v11.452z" />
    </svg>
  );
}

function getWhatsappNumber(rawPhone: string | null | undefined) {
  if (!rawPhone) return null;

  const digits = rawPhone.replace(/\D/g, "");
  let national = digits;

  if (national.startsWith("56")) {
    national = national.slice(2);
  }
  if (national.startsWith("0")) {
    national = national.slice(1);
  }

  // Celulares chilenos: 9 dígitos, empiezan con 9 (ej. 9XXXXXXXX).
  if (/^9\d{8}$/.test(national)) {
    return `56${national}`;
  }

  return null;
}

function getSourceLabel(source: string | null | undefined) {
  switch (source) {
    case "serpapi_linkedin":
      return "LinkedIn";
    case "serpapi_google":
    case "serpapi":
      return "Google";
    default:
      return source || "Google";
  }
}

function getSourceStyle(source: string | null | undefined) {
  return source === "serpapi_linkedin"
    ? "border-sky-200 bg-sky-50 text-sky-700"
    : "border-slate-200 bg-slate-50 text-slate-600";
}

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
      return "Enviado";
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

function fillTemplate(
  template: string,
  company: Company,
  settings: EmailSettings,
) {
  const servicesList = formatTextList(company.services).join(", ");

  return template
    .replaceAll("{{company_name}}", company.company_name || "")
    .replaceAll("{{industry}}", company.industry || "")
    .replaceAll("{{services}}", servicesList)
    .replaceAll("{{location}}", company.location || "")
    .replaceAll("{{company_summary}}", company.company_summary || "")
    .replaceAll("{{calendly_url}}", settings.calendly_url || "")
    .replaceAll("{{signature}}", settings.email_signature || "");
}

const DEFAULT_SUBJECT_TEMPLATE =
  "Consulta sobre gestión de mantenimiento - {{company_name}}";

const DEFAULT_BODY_TEMPLATE = `Hola,

Estuve viendo que {{company_name}} trabaja en el sector {{industry}}.

En Avance Software desarrollamos SatWeb, una plataforma para gestionar mantenimientos, servicios técnicos y órdenes de trabajo.

Creo que podría ser interesante mostrarles cómo SatWeb puede ayudarlos a centralizar solicitudes, asignar responsables y mantener el historial de los trabajos realizados.

¿Les parece si coordinamos una breve reunión?

{{signature}}`;

export default function Dashboard({ companies }: DashboardProps) {
  const [localCompanies, setLocalCompanies] = useState<Company[]>(companies);
  const [view, setView] = useState<View>("PENDING");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [sendResults, setSendResults] = useState<
    Record<number, SendResult>
  >({});
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLocalCompanies(companies);
  }, [companies]);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings", {
          cache: "no-store",
        });

        const data = await response.json();

        if (response.ok) {
          setSettings({
            email_subject: data.email_subject || "",
            email_template: data.email_template || "",
            email_signature: data.email_signature || "",
            calendly_url: data.calendly_url || "",
          });
        }
      } catch {
        // Si falla la carga, igual se puede enviar con la plantilla por defecto.
      }
    }

    void loadSettings();
  }, []);

  async function handleSendEmail(company: Company) {
    if (!company.contact_email) return;

    setSendingId(company.id);
    setSendResults((current) => {
      const next = { ...current };
      delete next[company.id];
      return next;
    });

    try {
      const effectiveSettings: EmailSettings = settings || {
        email_subject: DEFAULT_SUBJECT_TEMPLATE,
        email_template: DEFAULT_BODY_TEMPLATE,
        email_signature:
          "Saludos cordiales,\n\nGermán Fernández\nSocio Director\nAvance Software",
        calendly_url: "",
      };

      const subjectTemplate =
        effectiveSettings.email_subject || DEFAULT_SUBJECT_TEMPLATE;
      const bodyTemplate =
        effectiveSettings.email_template || DEFAULT_BODY_TEMPLATE;

      const subject = fillTemplate(subjectTemplate, company, effectiveSettings);
      const body = fillTemplate(bodyTemplate, company, effectiveSettings);

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId: company.id,
          to: company.contact_email,
          subject,
          body,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "No se pudo enviar el correo.");
      }

      // Actualización optimista: el lead pasa a "Enviado" / Contactados
      // sin esperar un refetch de la página.
      setLocalCompanies((current) =>
        current.map((item) =>
          item.id === company.id
            ? { ...item, status: "CONTACTED" }
            : item,
        ),
      );

      setSendResults((current) => ({
        ...current,
        [company.id]: {
          success: true,
          message: "Correo enviado correctamente.",
        },
      }));
    } catch (error) {
      setSendResults((current) => ({
        ...current,
        [company.id]: {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "No se pudo enviar el correo.",
        },
      }));
    } finally {
      setSendingId(null);
    }
  }

  const pendingCompanies = useMemo(
    () => localCompanies.filter((company) => company.status !== "CONTACTED"),
    [localCompanies],
  );

  const contactedCompanies = useMemo(
    () => localCompanies.filter((company) => company.status === "CONTACTED"),
    [localCompanies],
  );

  const newCompanies = pendingCompanies.filter(
    (company) => company.status === "NEW" || !company.status,
  ).length;

  const highScoreCompanies = pendingCompanies.filter(
    (company) => (company.satweb_fit_score ?? 0) >= 85,
  ).length;

  const companiesWithEmail = pendingCompanies.filter((company) =>
    Boolean(company.contact_email),
  ).length;

  const baseCompanies =
    view === "CONTACTED" ? contactedCompanies : pendingCompanies;

  const filteredCompanies = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return baseCompanies.filter((company) => {
      const matchesSearch =
        !normalizedSearch ||
        company.company_name.toLowerCase().includes(normalizedSearch) ||
        company.industry?.toLowerCase().includes(normalizedSearch) ||
        company.location?.toLowerCase().includes(normalizedSearch) ||
        company.company_summary?.toLowerCase().includes(normalizedSearch) ||
        company.description?.toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) return false;

      if (!matchesSourceFilter(company.source, sourceFilter)) return false;

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
  }, [baseCompanies, filter, sourceFilter, searchTerm]);

  // Cada vez que cambia la vista, el filtro, la búsqueda o el tamaño de
  // página, volvemos a la página 1 para no quedar "perdidos" en una
  // página que ya no tiene resultados.
  useEffect(() => {
    setCurrentPage(1);
  }, [view, filter, sourceFilter, searchTerm, pageSize]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCompanies.length / pageSize),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCompanies.slice(start, start + pageSize);
  }, [filteredCompanies, currentPage, pageSize]);

  const rangeStart =
    filteredCompanies.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(
    currentPage * pageSize,
    filteredCompanies.length,
  );

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-2">
            <Image
              src="/satweb-logo.png"
              alt="SatWeb"
              width={160}
              height={48}
              className="h-11 w-auto object-contain"
              priority
              unoptimized
            />
          </div>
          <p className="mt-2 px-2 text-xs text-slate-500">
            AASOS · AI Sales Operating System
          </p>

          <nav className="mt-10 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const className = [
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                item.active
                  ? "bg-blue-600 text-white"
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
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">GF</div>
          </header>

          <div className="px-5 py-8 sm:px-8 lg:px-10">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <Sparkles size={14} />
                Scout activo
              </div>

              <h2 className="mt-5 text-3xl font-semibold tracking-tight">
                {newCompanies} leads nuevos para revisar
              </h2>
              <p className="mt-3 text-slate-600">
                Hay {pendingCompanies.length} empresas por revisar y {contactedCompanies.length} ya contactadas.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-4">
                <StatCard label="Por revisar" value={pendingCompanies.length} />
                <StatCard label="Score 85+" value={highScoreCompanies} />
                <StatCard label="Con email" value={companiesWithEmail} />
                <StatCard label="Contactados" value={contactedCompanies.length} />
              </div>
            </section>

            <section className="mt-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setView("PENDING")}
                      className={[
                        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
                        view === "PENDING"
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-100",
                      ].join(" ")}
                    >
                      <Sparkles size={15} />
                      Leads nuevos
                      <span
                        className={[
                          "rounded-full px-1.5 py-0.5 text-xs",
                          view === "PENDING"
                            ? "bg-white/20"
                            : "bg-slate-100 text-slate-500",
                        ].join(" ")}
                      >
                        {pendingCompanies.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setView("CONTACTED")}
                      className={[
                        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
                        view === "CONTACTED"
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-100",
                      ].join(" ")}
                    >
                      <Users size={15} />
                      Contactados
                      <span
                        className={[
                          "rounded-full px-1.5 py-0.5 text-xs",
                          view === "CONTACTED"
                            ? "bg-white/20"
                            : "bg-slate-100 text-slate-500",
                        ].join(" ")}
                      >
                        {contactedCompanies.length}
                      </span>
                    </button>
                  </div>

                  <p className="mt-3 text-sm text-slate-500">
                    Mostrando {filteredCompanies.length === 0 ? 0 : rangeStart}
                    –{rangeEnd} de {filteredCompanies.length} empresas.
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
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 xl:w-96"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <FilterButton active={filter === "ALL"} onClick={() => setFilter("ALL")}>Todos</FilterButton>
                    <FilterButton active={filter === "HIGH_SCORE"} onClick={() => setFilter("HIGH_SCORE")}>Score 85+</FilterButton>
                    <FilterButton active={filter === "WITH_EMAIL"} onClick={() => setFilter("WITH_EMAIL")}>Con email</FilterButton>
                    <FilterButton active={filter === "WITHOUT_EMAIL"} onClick={() => setFilter("WITHOUT_EMAIL")}>Sin email</FilterButton>

                    <span className="mx-1 h-5 w-px bg-slate-200" />

                    <FilterButton active={sourceFilter === "ALL"} onClick={() => setSourceFilter("ALL")}>Todo origen</FilterButton>
                    <FilterButton active={sourceFilter === "GOOGLE"} onClick={() => setSourceFilter("GOOGLE")}>Google</FilterButton>
                    <FilterButton active={sourceFilter === "LINKEDIN"} onClick={() => setSourceFilter("LINKEDIN")}>
                      <span className="inline-flex items-center gap-1">
                        <LinkedInIcon className="size-3" />
                        LinkedIn
                      </span>
                    </FilterButton>

                    <label className="ml-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                      Por página
                      <select
                        value={pageSize}
                        onChange={(event) => setPageSize(Number(event.target.value))}
                        className="bg-transparent text-xs font-semibold text-slate-950 outline-none"
                      >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              {filteredCompanies.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <p className="font-medium">
                    {view === "CONTACTED"
                      ? "Todavía no contactaste a ningún lead."
                      : "No se encontraron empresas."}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {view === "CONTACTED"
                      ? "Los leads a los que les envíes un mail van a aparecer acá."
                      : "Probá modificando la búsqueda o los filtros."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {paginatedCompanies.map((company) => {
                      const services = formatTextList(company.services);
                      const sendResult = sendResults[company.id];
                      const isSending = sendingId === company.id;
                      const isContacted = company.status === "CONTACTED";
                      const whatsappNumber = getWhatsappNumber(company.contact_phone);

                      return (
                        <div
                          key={company.id}
                          className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                        >
                          <div className="flex min-w-0 flex-1 items-start gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-700">
                              {company.company_name.slice(0, 2).toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="truncate text-base font-semibold text-slate-950">
                                  {company.company_name}
                                </h4>
                                <span className={["rounded-full border px-2 py-0.5 text-xs font-semibold", getScoreStyle(company.satweb_fit_score)].join(" ")}>
                                  Score {company.satweb_fit_score ?? "—"}
                                </span>
                                <span className={["rounded-full border px-2 py-0.5 text-xs font-semibold", getStatusStyle(company.status)].join(" ")}>
                                  {formatStatus(company.status)}
                                </span>
                                <span className={["inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold", getSourceStyle(company.source)].join(" ")}>
                                  {company.source === "serpapi_linkedin" && <LinkedInIcon className="size-2.5" />}
                                  {getSourceLabel(company.source)}
                                </span>
                              </div>

                              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                {company.industry && (
                                  <span className="inline-flex items-center gap-1 font-medium text-blue-700">
                                    {company.industry}
                                  </span>
                                )}
                                {company.location && (
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin size={12} />
                                    {company.location}
                                  </span>
                                )}
                                {company.linkedin_url && (
                                  <a
                                    href={company.linkedin_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-sky-700 hover:underline"
                                  >
                                    <LinkedInIcon className="size-3" />
                                    Perfil de LinkedIn
                                  </a>
                                )}
                                {company.contact_email ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Mail size={12} />
                                    {company.contact_email}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-slate-400">
                                    <Mail size={12} />
                                    Sin email
                                  </span>
                                )}
                                {company.contact_phone && (
                                  <span className="inline-flex items-center gap-1">
                                    <Phone size={12} />
                                    {company.contact_phone}
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1">
                                  <Clock3 size={12} />
                                  {new Date(company.created_at).toLocaleString("es-UY", {
                                    timeZone: "America/Montevideo",
                                  })}
                                </span>
                              </div>

                              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                                {company.company_summary || company.description || "Sin resumen disponible."}
                              </p>

                              {services.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {services.slice(0, 3).map((service) => (
                                    <span key={service} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">
                                      {service}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {company.decision_maker_name && (
                                <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                                  <span className="font-medium text-slate-700">
                                    Decisor: {company.decision_maker_name}
                                  </span>
                                  {company.decision_maker_title && (
                                    <span className="text-slate-400">
                                      · {company.decision_maker_title}
                                    </span>
                                  )}
                                  {company.decision_maker_linkedin && (
                                    <a
                                      href={company.decision_maker_linkedin}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-sky-700 hover:underline"
                                    >
                                      <LinkedInIcon className="size-3" />
                                      Ver perfil
                                    </a>
                                  )}
                                </p>
                              )}

                              {sendResult && (
                                <p
                                  className={[
                                    "mt-2 text-xs",
                                    sendResult.success
                                      ? "text-emerald-600"
                                      : "text-rose-600",
                                  ].join(" ")}
                                >
                                  {sendResult.success ? "✓ " : "✗ "}
                                  {sendResult.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-center">
                            {whatsappNumber && (
                              <a
                                href={`https://wa.me/${whatsappNumber}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Abrir conversación de WhatsApp"
                                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                              >
                                <WhatsAppIcon className="size-4" />
                                WhatsApp
                              </a>
                            )}

                            <a
                              href={company.website}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                            >
                              Ver sitio
                              <ArrowUpRight size={15} />
                            </a>

                            {isContacted ? (
                              <span className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700">
                                <CheckCircle2 size={15} />
                                Enviado
                              </span>
                            ) : company.contact_email ? (
                              <button
                                type="button"
                                onClick={() => handleSendEmail(company)}
                                disabled={isSending}
                                className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-blue-600 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
                              >
                                <Mail size={15} />
                                {isSending ? "Enviando..." : "Enviar mail"}
                              </button>
                            ) : (
                              <button type="button" disabled title="Este lead no tiene un email disponible" className="flex cursor-not-allowed items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-400">
                                <Mail size={15} />
                                Sin email
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                    <p className="text-xs text-slate-500">
                      Página {currentPage} de {totalPages}
                    </p>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                        disabled={currentPage === 1}
                        className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {getPageNumbers(currentPage, totalPages).map((page, index) =>
                        page === "..." ? (
                          <span key={`ellipsis-${index}`} className="px-1 text-xs text-slate-400">
                            …
                          </span>
                        ) : (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={[
                              "flex size-9 items-center justify-center rounded-lg text-sm font-semibold transition",
                              page === currentPage
                                ? "bg-blue-600 text-white"
                                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                            ].join(" ")}
                          >
                            {page}
                          </button>
                        ),
                      )}

                      <button
                        type="button"
                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                        disabled={currentPage === totalPages}
                        className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function getPageNumbers(currentPage: number, totalPages: number) {
  const pages: (number | "...")[] = [];
  const windowSize = 1;

  for (let page = 1; page <= totalPages; page += 1) {
    const isEdge = page === 1 || page === totalPages;
    const isNearCurrent = Math.abs(page - currentPage) <= windowSize;

    if (isEdge || isNearCurrent) {
      pages.push(page);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return pages;
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
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
