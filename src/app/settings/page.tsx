"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Save,
  Settings,
} from "lucide-react";

type SettingsForm = {
  email_subject: string;
  email_template: string;
  email_signature: string;
  calendly_url: string;
};

const initialSettings: SettingsForm = {
  email_subject: "",
  email_template: "",
  email_signature: "",
  calendly_url: "",
};

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<SettingsForm>(initialSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "No se pudo cargar la configuración",
          );
        }

        setSettings({
          ...initialSettings,
          ...data,
        });
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudo cargar la configuración",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadSettings();
  }, []);

  function updateField(
    field: keyof SettingsForm,
    value: string,
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudo guardar la configuración",
        );
      }

      setSuccessMessage("Configuración guardada correctamente.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la configuración",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-5 py-8 text-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft size={16} />
          Volver al dashboard
        </Link>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Settings size={21} />
            </div>

            <div>
              <p className="text-sm font-medium text-violet-700">
                Configuración
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                Plantilla de email
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Estos datos se usarán para preparar los correos desde el
                dashboard.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 rounded-2xl bg-slate-50 p-8 text-sm text-slate-500">
              Cargando configuración...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <Field label="Asunto del email">
                <input
                  type="text"
                  value={settings.email_subject}
                  onChange={(event) =>
                    updateField("email_subject", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  placeholder="Consulta para {{company_name}}"
                />
              </Field>

              <Field
                label="Plantilla del email"
                help="Variables disponibles: {{company_name}}, {{industry}}, {{services}}, {{location}}, {{company_summary}}, {{calendly_url}}, {{signature}}"
              >
                <textarea
                  value={settings.email_template}
                  onChange={(event) =>
                    updateField("email_template", event.target.value)
                  }
                  rows={14}
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-400"
                />
              </Field>

              <Field label="Firma">
                <textarea
                  value={settings.email_signature}
                  onChange={(event) =>
                    updateField("email_signature", event.target.value)
                  }
                  rows={6}
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-400"
                />
              </Field>

              <Field label="Calendly">
                <input
                  type="url"
                  value={settings.calendly_url}
                  onChange={(event) =>
                    updateField("calendly_url", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  placeholder="https://calendly.com/..."
                />
              </Field>

              {successMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle2 size={17} />
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={17} />
                  {saving ? "Guardando..." : "Guardar configuración"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

type FieldProps = {
  label: string;
  help?: string;
  children: React.ReactNode;
};

function Field({ label, help, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-800">
        {label}
      </label>

      {help && (
        <p className="mt-1 text-xs leading-5 text-slate-500">{help}</p>
      )}

      <div className="mt-2">{children}</div>
    </div>
  );
}