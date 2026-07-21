import { NextRequest, NextResponse } from "next/server";
import { sendMail, verifyMailConnection } from "@/lib/mail";

export const dynamic = "force-dynamic";

function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
    try {
        // Si mandan un "to", enviamos un correo de prueba real.
        // Si no, solo verificamos la conexión SMTP (sin enviar nada).
        const payload = await request
            .json()
            .catch(() => ({}) as { to?: string });

        const to = payload.to?.trim();

        if (to) {
            if (!isValidEmail(to)) {
                return NextResponse.json(
                    {
                        error: "El email de destino no es válido.",
                    },
                    {
                        status: 400,
                    },
                );
            }

            const result = await sendMail({
                to,
                subject: "AASOS - Correo de prueba",
                body: "Este es un correo de prueba enviado desde la configuración SMTP de AASOS. Si lo estás leyendo, el envío de mails desde el dashboard funciona correctamente.",
            });

            return NextResponse.json({
                success: true,
                message: `Correo de prueba enviado a ${to}.`,
                messageId: result.messageId,
            });
        }

        await verifyMailConnection();

        return NextResponse.json({
            success: true,
            message: "Conexión SMTP verificada correctamente.",
        });
    } catch (error) {
        console.error("Error en test-email:", error);

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "No se pudo verificar la conexión SMTP.",
            },
            {
                status: 500,
            },
        );
    }
}
