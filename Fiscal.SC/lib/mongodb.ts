import { MongoClient, ServerApiVersion } from "mongodb";

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let internalClientPromise: Promise<MongoClient> | null = null;

export function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Defina a variável de ambiente MONGODB_URI nas configurações de ambiente da Vercel ou no arquivo .env.local"
    );
  }

  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    return globalWithMongo._mongoClientPromise;
  }

  if (!internalClientPromise) {
    const client = new MongoClient(uri, options);
    internalClientPromise = client.connect();
  }
  return internalClientPromise;
}

// Objeto Promise preguiçoso (lazy): só avalia MONGODB_URI quando a Promise for aguardada (await)
const clientPromise: Promise<MongoClient> = {
  then: (...args: Parameters<Promise<MongoClient>["then"]>) =>
    getClientPromise().then(...args),
  catch: (...args: Parameters<Promise<MongoClient>["catch"]>) =>
    getClientPromise().catch(...args),
  finally: (...args: Parameters<Promise<MongoClient>["finally"]>) =>
    getClientPromise().finally(...args),
  [Symbol.toStringTag]: "Promise",
} as Promise<MongoClient>;

export default clientPromise;
