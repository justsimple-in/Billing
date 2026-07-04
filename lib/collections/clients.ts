import { getDb } from "../mongodb";

export async function getClientsCollection() {
  const db = await getDb();
  return db.collection("clients");
}