import { getDb } from "../mongodb";

export async function getSuppliersCollection() {
  const db = await getDb();
  return db.collection("suppliers");
}