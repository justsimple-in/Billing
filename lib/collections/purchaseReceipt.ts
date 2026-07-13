import { getDb } from "../mongodb";

export async function getPurchaseReceiptsCollection() {
  const db = await getDb();
  return db.collection("purchaseReceipts");
}