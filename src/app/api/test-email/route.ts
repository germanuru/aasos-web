import { NextResponse } from "next/server";
import { verifyMailConnection } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function POST() {
    try {
        await verifyMailConnection();

        return NextResponse.json({
            success: true,
            message: "Conexión SMTP verificada correctamente.",
        });
    } catch (error) {
        console.error("Error verificando SMTP:", error);

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