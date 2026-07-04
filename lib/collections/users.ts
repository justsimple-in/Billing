import { getDb } from "../mongodb";

export async function getUsersCollection() {
  const db = await getDb();
  return db.collection("users");
}