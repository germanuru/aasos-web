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

function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
    try {
        const payload = (await request.json()) as SendEmailPayload;

        const leadId = Number(payload.leadId);
        const to = payload.to?.trim() ?? "";
        const subject = payload.subject?.trim() ?? "";
        const body = payload.body?.trim() ?? "";

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

        const leadResult = await db.query<{
            id: number;
        }>(
            `
        SELECT id
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
          updated_at = NOW()
        WHERE id = $1
      `,
            [leadId],
        );

        return NextResponse.json({
            success: true,
            message: "Email enviado correctamente.",
            messageId: result.messageId,
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