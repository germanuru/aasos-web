import nodemailer from "nodemailer";
import { db } from "@/lib/db";

type MailConfiguration = {
    senderName: string;
    senderEmail: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    smtpSsl: boolean;
};

const MAIL_SETTING_KEYS = [
    "sender_name",
    "sender_email",
    "smtp_host",
    "smtp_port",
    "smtp_user",
    "smtp_password",
    "smtp_ssl",
] as const;

async function getMailConfiguration(): Promise<MailConfiguration> {
    const { rows } = await db.query<{
        setting_key: string;
        setting_value: string | null;
    }>(
        `
      SELECT setting_key, setting_value
      FROM app_settings
      WHERE setting_key = ANY($1::text[])
    `,
        [MAIL_SETTING_KEYS],
    );

    const settings = Object.fromEntries(
        rows.map((row) => [
            row.setting_key,
            row.setting_value ?? "",
        ]),
    );

    const smtpPort = Number(settings.smtp_port || 465);

    if (!settings.smtp_host) {
        throw new Error("Falta configurar el servidor SMTP.");
    }

    if (
        !Number.isInteger(smtpPort) ||
        smtpPort <= 0 ||
        smtpPort > 65535
    ) {
        throw new Error("El puerto SMTP no es válido.");
    }

    if (!settings.smtp_user) {
        throw new Error("Falta configurar el usuario SMTP.");
    }

    if (!settings.smtp_password) {
        throw new Error(
            "Falta configurar la contraseña de aplicación de Zoho.",
        );
    }

    const senderEmail =
        settings.sender_email || settings.smtp_user;

    if (!senderEmail) {
        throw new Error(
            "Falta configurar el email del remitente.",
        );
    }

    return {
        senderName: settings.sender_name || "Germán Fernández",
        senderEmail,
        smtpHost: settings.smtp_host,
        smtpPort,
        smtpUser: settings.smtp_user,
        smtpPassword: settings.smtp_password,
        smtpSsl: settings.smtp_ssl !== "false",
    };
}

export async function createMailTransporter() {
    const config = await getMailConfiguration();

    const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSsl,
        auth: {
            user: config.smtpUser,
            pass: config.smtpPassword,
        },
    });

    return {
        transporter,
        config,
    };
}

export async function verifyMailConnection() {
    const { transporter } = await createMailTransporter();

    await transporter.verify();

    return {
        success: true,
    };
}

type SendMailInput = {
    to: string;
    subject: string;
    body: string;
};

export async function sendMail({
    to,
    subject,
    body,
}: SendMailInput) {
    const { transporter, config } =
        await createMailTransporter();

    const result = await transporter.sendMail({
        from: {
            name: config.senderName,
            address: config.senderEmail,
        },
        to,
        subject,
        text: body,
    });

    return {
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
    };
}