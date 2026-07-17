import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, MapPin, Wallet } from "lucide-react";
import { ObjectId } from "mongodb";

import { getBusiness } from "@/lib/actions/getbusiness";
import { getSuppliersCollection } from "@/lib/collections/suppliers";
import { getPurchaseReceiptsCollection} from "@/lib/collections/purchaseReceipt";

interface Props {
  params: Promise<{
    slug: string;
    supplierId: string;
  }>;
}

export default async function SupplierPage({ params }: Props) {
  const { slug, supplierId } = await params;

  const business = await getBusiness(slug);

  if (!business) {
    notFound();
  }

  const suppliers = await getSuppliersCollection();

  const supplier = await suppliers.findOne({
    _id: new ObjectId(supplierId),
    businessId: business._id.toString(),
  });

  if (!supplier) {
    notFound();
  }

  const purchaseReceipts = await getPurchaseReceiptsCollection();

  const receipts = await purchaseReceipts
    .find({
      businessId: business._id.toString(),
      selectedSupplierId: supplier._id.toString(),
      active: true,
    })
    .sort({
      createdAt: -1,
    })
    .toArray();

  return (
    <main className="mx-auto max-w-5xl p-8 text-black">
      <Link
        href={`/${slug}/suppliers`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black"
      >
        <ArrowLeft size={18} />
        Suppliers
      </Link>

      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-black">
          {supplier.supplierName}
        </h1>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-neutral-500">
              Outstanding Balance
            </p>

            <div className="mt-2 flex items-center gap-2">
              <Wallet className="text-green-600" />

              <span className="text-2xl font-bold">
                ₹{supplier.prevBalance.toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-neutral-500">
              Phone
            </p>

            <div className="mt-2 flex items-center gap-2">
              <Phone size={18} />
              {supplier.phone || "-"}
            </div>
          </div>

          <div>
            <p className="text-sm text-neutral-500">
              Address
            </p>

            <div className="mt-2 flex items-center gap-2">
              <MapPin size={18} />
              {supplier.address || "-"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border bg-white p-8">
        <h2 className="text-xl font-semibold text-black">
          Purchase Ledger
        </h2>

        <div className="mt-4">
          {receipts.length === 0 ? (
            <p className="text-neutral-500">
              No purchase receipts yet.
            </p>
          ) : (
            <div className="space-y-3 text-black">
              {receipts.map((receipt) => (
                <Link
                  key={receipt._id.toString()}
                  href={`/${slug}/purchase/${receipt.shareId}?owner=true&slug=${slug}`}
                  className="flex items-center justify-between rounded-lg border bg-neutral-200 p-4 hover:bg-neutral-400"
                >
                  <div>
                    <p className="font-medium">
                      Receipt #{receipt.receiptNo}
                    </p>

                    <p className="text-sm text-neutral-500">
                      {receipt.purchaseDate}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{receipt.total.toLocaleString()}
                    </p>

                    <p className="text-sm text-neutral-500">
                      Balance ₹{receipt.newBalance.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <Link
          href={`/${slug}/purchase/new?supplier=${supplier._id}`}
          className="rounded-xl bg-black px-5 py-3 text-white hover:bg-neutral-800"
        >
          Create Purchase
        </Link>
      </div>
    </main>
  );
}