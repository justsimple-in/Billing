import { getBusiness } from "@/lib/actions/getbusiness";
import { getSuppliersCollection } from "@/lib/collections/suppliers";
import PaymentForm from "@/components/payment/PaymentForm"

async function getSuppliers(slug: string) {
  const business = await getBusiness(slug);

  if (!business) return [];

  const collection = await getSuppliersCollection();

  const suppliers = await collection
    .find({
      businessId: business._id!.toString(),
    })
    .sort({
      supplierName: 1,
    })
    .toArray();

  return suppliers.map((supplier) => ({
    _id: supplier._id.toString(),
    supplierName: supplier.supplierName,
    phone: supplier.phone ?? "",
    address: supplier.address ?? "",
    prevBalance: supplier.prevBalance ?? 0,
  }));
}

export default async function NewPaymentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const suppliers = await getSuppliers(slug);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          New Purchase Payment
        </h1>

        <p className="mt-2 text-neutral-400">
          Record a payment made to a supplier.
        </p>
      </div>

      <PaymentForm
        slug={slug}
        suppliers={suppliers}
      />
    </main>
  );
}