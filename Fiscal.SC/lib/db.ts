import { Db } from "mongodb";
import clientPromise from "./mongodb";

export const DEFAULT_DATABASE_NAME = process.env.MONGODB_DB || "fiscal_sc";

/**
 * Nomes padronizados das coleções da aplicação
 */
export const COLLECTIONS = {
  EXPENSES: "expenses",
  BILLS: "bills",
  MISSIONS: "missions",
  PARTICIPANTS: "participants",
  EVENTS: "events",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/**
 * Retorna a instância do banco de dados MongoDB
 */
export async function getDatabase(dbName: string = DEFAULT_DATABASE_NAME): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export type DatabaseHealth = {
  status: "connected" | "disconnected";
  latencyMs: number;
  databaseName: string;
  error?: string;
};

/**
 * Executa um ping de diagnóstico e calcula a latência de comunicação com o MongoDB
 */
export async function checkDatabaseHealth(dbName: string = DEFAULT_DATABASE_NAME): Promise<DatabaseHealth> {
  const startTime = Date.now();
  try {
    const db = await getDatabase(dbName);
    await db.command({ ping: 1 });
    const latencyMs = Date.now() - startTime;

    return {
      status: "connected",
      latencyMs,
      databaseName: dbName,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return {
      status: "disconnected",
      latencyMs,
      databaseName: dbName,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
