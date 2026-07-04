import { getDb } from "../mongodb";

export async function getBusinessesCollection() {
  const db = await getDb();
  return db.collection("business");
}