"use client";

import { useMemo, useState } from "react";
import type { Company } from "@/app/page";

type Props = {
  companies: Company[];
};

function getStatus(status: Company["research_status"]) {
  if (status === "verified") {
    return {
      label: "Verificado",
      className: "badge badge-success",
    };
  }

  if (status === "partial") {
    return {
      label: "Parcial",
      className: "badge badge-warning",
    };
  }

  return {
    label: "Insuficiente",
    className: "badge badge-danger",
  };
}

function getScoreClass(score: number) {
  if (score >= 85) return "score score-high";
  if (score >= 70) return "score score-medium";
  return "score score-low";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function Dashboard({ companies }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return companies;

    return companies.filter((company) =>
      [
        company.company_name,
        company.industry,
        company.city,
        company.country,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [companies, search]);

  const highScore = companies.filter((company) => company.score >= 85).length;
  const verified = companies.filter(
    (company) => company.research_status === "verified",
  ).length;

  const averageScore = Math.round(
    companies.reduce((total, company) => total + company.score, 0) /
      companies.length,
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div>
          <div className="brand">
            <div className="brand-logo">A</div>

            <div>
              <strong>AASOS</strong>
              <span>SatWeb Scout</span>
            </div>
          </div>

          <nav className="navigation">
            <button className="navigation-item navigation-item-active">
              <span className="navigation-icon">⌂</span>
              Dashboard
            </button>

            <button className="navigation-item">
              <span className="navigation-icon">▦</span>
              Empresas
            </button>

            <button className="navigation-item">
              <span className="navigation-icon">⌕</span>
              Búsquedas
            </button>
          </nav>
        </div>

        <div className="system-card">
          <div className="system-title">
            <span className="live-dot" />
            Sistema operativo
          </div>

          <p>Scout, API y base de datos conectados.</p>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <p className="eyebrow">Panel comercial</p>
            <h1>Prospectos encontrados</h1>
            <p className="subtitle">
              Empresas investigadas y calificadas automáticamente para SatWeb.
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              alert("Este botón se conectará al Scout más adelante.")
            }
          >
            <span>＋</span>
            Buscar empresas
          </button>
        </header>

        <section className="metrics">
          <MetricCard
            title="Prospectos"
            value={companies.length}
            detail="Empresas almacenadas"
            icon="▦"
          />

          <MetricCard
            title="Alta afinidad"
            value={highScore}
            detail="Score igual o superior a 85"
            icon="↗"
          />

          <MetricCard
            title="Verificados"
            value={verified}
            detail="Investigación confirmada"
            icon="✓"
          />

          <MetricCard
            title="Score promedio"
            value={averageScore}
            suffix="/100"
            detail="Calidad general"
            icon="◎"
          />
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Empresas</h2>
              <p>Ordenadas por afinidad comercial con SatWeb.</p>
            </div>

            <div className="search">
              <span>⌕</span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar empresa..."
              />
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Industria</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th>Score</th>
                  <th>Actualización</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredCompanies.map((company) => {
                  const status = getStatus(company.research_status);

                  return (
                    <tr
                      key={company.id}
                      onClick={() => setSelectedCompany(company)}
                    >
                      <td>
                        <div className="company">
                          <div className="company-avatar">
                            {company.company_name.charAt(0)}
                          </div>

                          <div>
                            <strong>{company.company_name}</strong>
                            <span>
                              {company.website.replace(/^https?:\/\//, "")}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>{company.industry}</td>

                      <td>
                        {company.city}, {company.country}
                      </td>

                      <td>
                        <span className={status.className}>
                          {status.label}
                        </span>
                      </td>

                      <td>
                        <span className={getScoreClass(company.score)}>
                          {company.score}
                        </span>
                      </td>

                      <td className="date">
                        {formatDate(company.updated_at)}
                      </td>

                      <td className="arrow">→</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="panel-footer">
            Mostrando {filteredCompanies.length} de {companies.length} empresas
          </div>
        </section>
      </main>

      {selectedCompany && (
        <div className="drawer-container">
          <button
            type="button"
            className="drawer-overlay"
            aria-label="Cerrar"
            onClick={() => setSelectedCompany(null)}
          />

          <aside className="drawer">
            <header className="drawer-header">
              <span>Detalle del prospecto</span>

              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
              >
                ×
              </button>
            </header>

            <div className="drawer-content">
              <div className="drawer-company">
                <div className="drawer-avatar">
                  {selectedCompany.company_name.charAt(0)}
                </div>

                <div>
                  <h2>{selectedCompany.company_name}</h2>
                  <p>{selectedCompany.industry}</p>
                </div>
              </div>

              <div className="drawer-score">
                <span
                  className={getScoreClass(selectedCompany.score)}
                >
                  {selectedCompany.score}
                </span>

                <div>
                  <strong>Score comercial</strong>
                  <p>Alta afinidad con SatWeb</p>
                </div>
              </div>

              <section className="detail-section">
                <h3>Información</h3>

                <DetailRow
                  label="Sitio web"
                  value={selectedCompany.website}
                />

                <DetailRow
                  label="Ubicación"
                  value={`${selectedCompany.city}, ${selectedCompany.country}`}
                />

                <DetailRow
                  label="Estado"
                  value={getStatus(selectedCompany.research_status).label}
                />

                <DetailRow
                  label="Última actualización"
                  value={formatDate(selectedCompany.updated_at)}
                />
              </section>

              <section className="detail-section">
                <h3>Por qué encaja con SatWeb</h3>

                <p className="detail-text">
                  Opera con personal técnico en terreno y necesita coordinar
                  mantenimientos, evidencias, clientes y equipos distribuidos.
                </p>
              </section>

              <section className="detail-section">
                <h3>Servicios detectados</h3>

                <div className="tags">
                  <span>Mantenimiento</span>
                  <span>Servicio técnico</span>
                  <span>Emergencias</span>
                </div>
              </section>

              <a
                href={selectedCompany.website}
                target="_blank"
                rel="noreferrer"
                className="website-button"
              >
                Visitar sitio web ↗
              </a>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon,
  suffix,
}: {
  title: string;
  value: number;
  detail: string;
  icon: string;
  suffix?: string;
}) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span>{title}</span>
        <div className="metric-icon">{icon}</div>
      </div>

      <strong>
        {value}
        {suffix && <small>{suffix}</small>}
      </strong>

      <p>{detail}</p>
    </article>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
