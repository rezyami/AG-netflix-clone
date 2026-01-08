import { NextResponse } from "next/server";
import { syncM3UToDb } from "@/lib/sync";

export async function GET() {
    try {
        const result = await syncM3UToDb();
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
