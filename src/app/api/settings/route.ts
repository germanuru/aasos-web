import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const ALLOWED_SETTINGS = [
    "sender_name",
    "sender_email",
    "email_subject",
    "email_template",
    "email_signature",
    "calendly_url",
    "smtp_host",
    "smtp_port",
    "smtp_user",
    "smtp_password",
    "smtp_ssl",
] as const;

type SettingKey = (typeof ALLOWED_SETTINGS)[number];

type SettingsPayload = Partial<Record<SettingKey, string | boolean | number>>;

function normalizeSettingValue(
    key: SettingKey,
    value: string | boolean | number,
): string {
    if (key === "smtp_ssl") {
        return String(value === true || value === "true");
    }

    if (key === "smtp_port") {
        const port = Number(value);

        if (!Number.isInteger(port) || port <= 0 || port > 65535) {
            throw new Error("El puerto SMTP no es válido.");
        }

        return String(port);
    }

    return String(value).trim();
}

export async function GET() {
    try {
        const { rows } = await db.query<{
            setting_key: SettingKey;
            setting_value: string | null;
        }>(
            `
        SELECT setting_key, setting_value
        FROM app_settings
        WHERE setting_key = ANY($1::text[])
      `,
            [ALLOWED_SETTINGS],
        );

        const settings: Record<string, string | boolean> = {
            sender_name: "",
            sender_email: "",
            email_subject: "",
            email_template: "",
            email_signature: "",
            calendly_url: "",
            smtp_host: "smtp.zoho.com",
            smtp_port: "465",
            smtp_user: "",
            smtp_password: "",
            smtp_password_configured: false,
            smtp_ssl: true,
        };

        for (const row of rows) {
            if (row.setting_key === "smtp_ssl") {
                settings.smtp_ssl = row.setting_value === "true";
                continue;
            }

            /*
             * No enviamos la contraseña SMTP al navegador.
             * La pantalla solamente recibe información sobre si ya existe.
             */
            if (row.setting_key === "smtp_password") {
                settings.smtp_password = "";
                settings.smtp_password_configured = Boolean(row.setting_value);
                continue;
            }

            settings[row.setting_key] = row.setting_value ?? "";
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Error leyendo configuración:", error);

        return NextResponse.json(
            {
                error: "No se pudo cargar la configuración.",
            },
            {
                status: 500,
            },
        );
    }
}

export async function PUT(request: NextRequest) {
    const client = await db.connect();

    try {
        const body = (await request.json()) as SettingsPayload;

        const entries = Object.entries(body).filter(
            ([key, value]) =>
                ALLOWED_SETTINGS.includes(key as SettingKey) &&
                value !== undefined &&
                value !== null,
        ) as Array<[SettingKey, string | boolean | number]>;

        if (entries.length === 0) {
            return NextResponse.json(
                {
                    error: "No se recibieron configuraciones válidas.",
                },
                {
                    status: 400,
                },
            );
        }

        await client.query("BEGIN");

        for (const [key, rawValue] of entries) {
            /*
             * Si la contraseña llega vacía, conservamos la existente.
             * Así no se borra al guardar otros campos.
             */
            if (
                key === "smtp_password" &&
                String(rawValue).trim().length === 0
            ) {
                continue;
            }

            const value = normalizeSettingValue(key, rawValue);

            await client.query(
                `
          INSERT INTO app_settings (
            setting_key,
            setting_value,
            updated_at
          )
          VALUES ($1, $2, NOW())
          ON CONFLICT (setting_key)
          DO UPDATE SET
            setting_value = EXCLUDED.setting_value,
            updated_at = NOW()
        `,
                [key, value],
            );
        }

        await client.query("COMMIT");

        return NextResponse.json({
            success: true,
            message: "Configuración guardada correctamente.",
        });
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Error guardando configuración:", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "No se pudo guardar la configuración.",
            },
            {
                status: 500,
            },
        );
    } finally {
        client.release();
    }
}