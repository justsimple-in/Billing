import { getDb } from "../mongodb";

export async function getBusinessMembersCollection() {
  const db = await getDb();
  return db.collection("businessMembers");
}