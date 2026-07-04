import { getDb } from "../mongodb";

export async function getInvoicesCollection() {
  const db = await getDb();
  return db.collection("invoices");
}