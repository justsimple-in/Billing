import{ getDb }from "@/lib/mongodb";

const getPaymentsCollection = async () => {
  const db = await getDb();
  return db.collection("payments");
};

export { getPaymentsCollection };