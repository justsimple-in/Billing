import { MongoClient, type Db } from "mongodb"

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || "billing"

if (!uri) {
  console.warn(
    "[v0] MONGODB_URI is not set. Add your MongoDB connection string to the .env file.",
  )
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Reuse the connection across hot reloads in development.
const globalWithMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>
}

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not configured. Please add it to your .env file.",
    )
  }

  if (process.env.NODE_ENV === "development") {
    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    return globalWithMongo._mongoClientPromise
  }

  if (!clientPromise) {
    client = new MongoClient(uri)
    clientPromise = client.connect()
  }
  return clientPromise
}

export async function getDb(): Promise<Db> {
  const connectedClient = await getClientPromise()
  return connectedClient.db(dbName)
}

// Collection helpers
export async function getClientsCollection() {
  const db = await getDb()
  return db.collection("clients")
}

export async function getInvoicesCollection() {
  const db = await getDb()
  return db.collection("invoices")
}
