import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";

export const dynamic = "force-dynamic";

type SendEmailPayload = {
    leadId?: number;
    to?: string;
    subject?: string;
    body?: string;
};

type Lead = {
    id: number;
    company_name: string;
    website: string | null;
    industry: string | null;
    location: string | null;
    company_summary: string | null;
    services: string | null;
    contact_email: string | null;
};

const DEFAULT_SUBJECT_TEMPLATE =
    "Consulta sobre gestión de mantenimiento - {{company_name}}";

const DEFAULT_BODY_TEMPLATE = `Hola,

Estuve viendo que {{company_name}} trabaja en el sector {{industry}}.

En Avance Software desarrollamos SatWeb, una plataforma para gestionar mantenimientos, servicios técnicos y órdenes de trabajo.

Creo que podría ser interesante mostrarles cómo SatWeb puede ayudarlos a centralizar solicitudes, asignar responsables y mantener el historial de los trabajos realizados.

¿Les parece si coordinamos una breve reunión?

{{signature}}`;

function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatTextList(value: string | null) {
    if (!value) return [];

    try {
        const parsed: unknown = JSON.parse(value);
        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
    } catch {
        // No es JSON, se procesa como texto plano.
    }

    return value
        .split(/\n|,|;|\|/)
        .map((item) => item.replace(/^[-•]\s*/, "").trim())
        .filter(Boolean);
}

function fillTemplate(
    template: string,
    lead: Lead,
    settings: Record<string, string>,
) {
    const servicesList = formatTextList(lead.services).join(", ");

    return template
        .replaceAll("{{company_name}}", lead.company_name || "")
        .replaceAll("{{industry}}", lead.industry || "")
        .replaceAll("{{services}}", servicesList)
        .replaceAll("{{location}}", lead.location || "")
        .replaceAll("{{company_summary}}", lead.company_summary || "")
        .replaceAll("{{calendly_url}}", settings.calendly_url || "")
        .replaceAll("{{signature}}", settings.email_signature || "");
}

async function composeFromLead(lead: Lead) {
    const { rows } = await db.query<{
        setting_key: string;
        setting_value: string | null;
    }>(
        `
      SELECT setting_key, setting_value
      FROM app_settings
      WHERE setting_key IN ('email_subject', 'email_template', 'email_signature', 'calendly_url')
    `,
    );

    const settings = Object.fromEntries(
        rows.map((row) => [row.setting_key, row.setting_value ?? ""]),
    );

    const subjectTemplate = settings.email_subject || DEFAULT_SUBJECT_TEMPLATE;
    const bodyTemplate = settings.email_template || DEFAULT_BODY_TEMPLATE;

    return {
        subject: fillTemplate(subjectTemplate, lead, settings),
        body: fillTemplate(bodyTemplate, lead, settings),
    };
}

export async function POST(request: NextRequest) {
    try {
        const payload = (await request.json()) as SendEmailPayload;

        const leadId = Number(payload.leadId);

        if (!Number.isInteger(leadId) || leadId <= 0) {
            return NextResponse.json(
                {
                    error: "El lead no es válido.",
                },
                {
                    status: 400,
                },
            );
        }

        const leadResult = await db.query<Lead>(
            `
        SELECT
          id,
          company_name,
          website,
          industry,
          location,
          company_summary,
          services,
          contact_email
        FROM leads
        WHERE id = $1
        LIMIT 1
      `,
            [leadId],
        );

        if (leadResult.rowCount === 0) {
            return NextResponse.json(
                {
                    error: "El lead no existe.",
                },
                {
                    status: 404,
                },
            );
        }

        const lead = leadResult.rows[0];

        // "to" / "subject" / "body" son opcionales: si no vienen (por ejemplo
        // cuando se dispara desde el botón de Telegram), se auto-completan
        // con la plantilla guardada en Configuración.
        const to = (payload.to?.trim() || lead.contact_email || "").trim();
        let subject = payload.subject?.trim() ?? "";
        let body = payload.body?.trim() ?? "";

        if (!subject || !body) {
            const composed = await composeFromLead(lead);
            subject = subject || composed.subject;
            body = body || composed.body;
        }

        if (!isValidEmail(to)) {
            return NextResponse.json(
                {
                    error: "El email del destinatario no es válido.",
                },
                {
                    status: 400,
                },
            );
        }

        if (!subject) {
            return NextResponse.json(
                {
                    error: "El asunto no puede estar vacío.",
                },
                {
                    status: 400,
                },
            );
        }

        if (!body) {
            return NextResponse.json(
                {
                    error: "El mensaje no puede estar vacío.",
                },
                {
                    status: 400,
                },
            );
        }

        const result = await sendMail({
            to,
            subject,
            body,
        });

        await db.query(
            `
        UPDATE leads
        SET
          status = 'CONTACTED',
          contacted_at = NOW()
        WHERE id = $1
      `,
            [leadId],
        );

        return NextResponse.json({
            success: true,
            message: "Email enviado correctamente.",
            messageId: result.messageId,
            companyName: lead.company_name,
        });
    } catch (error) {
        console.error("Error enviando email:", error);

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "No se pudo enviar el email.",
            },
            {
                status: 500,
            },
        );
    }
}
