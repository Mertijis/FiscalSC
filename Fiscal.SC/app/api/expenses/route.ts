import { NextResponse } from "next/server";
import { getDatabase, COLLECTIONS } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDatabase();
    const rawExpenses = await db.collection(COLLECTIONS.EXPENSES).find().toArray();

    // Normaliza _id de ObjectId para string para garantir serialização JSON perfeita
    const expenses = rawExpenses.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    }));

    return NextResponse.json(
      {
        success: true,
        count: expenses.length,
        data: expenses,
        retrievedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao buscar despesas do MongoDB:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Falha ao consultar despesas no banco de dados",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
