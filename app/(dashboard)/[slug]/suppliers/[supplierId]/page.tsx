import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, MapPin, Wallet } from "lucide-react";
import { ObjectId } from "mongodb";

import { getBusiness } from "@/lib/actions/getbusiness";
import { getSuppliersCollection } from "@/lib/collections/suppliers";
import { getPurchaseReceiptsCollection} from "@/lib/collections/purchaseReceipt";
import { SupplierEditor } from "@/components/suppliers/SupplierEditor";
import { SupplierReportButton } from "@/components/suppliers/report/SupplierReportButton";

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
    <main className="mx-auto max-w-5xl px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <Link
        href={`/${slug}/suppliers`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-sky-700"
      >
        <ArrowLeft size={18} />
        Suppliers
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900">
            {supplier.supplierName}
          </h1>
          <div className="flex flex-wrap gap-2">
            <SupplierReportButton
              slug={slug}
              supplierId={supplier._id.toString()}
            />
            <SupplierEditor
              slug={slug}
              supplierId={supplier._id.toString()}
              initial={{
                supplierName: supplier.supplierName,
                phone: supplier.phone ?? "",
                address: supplier.address ?? "",
                prevBalance: supplier.prevBalance ?? 0,
              }}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">
              Outstanding Balance
            </p>

            <div className="mt-2 flex items-center gap-2">
              <Wallet className="text-emerald-600" />

              <span className="text-2xl font-bold text-slate-900">
                ₹{supplier.prevBalance.toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Phone
            </p>

            <div className="mt-2 flex items-center gap-2">
              <Phone size={18} />
              {supplier.phone || "-"}
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Address
            </p>

            <div className="mt-2 flex items-center gap-2">
              <MapPin size={18} />
              {supplier.address || "-"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8">
        <h2 className="text-xl font-semibold text-slate-900">
          Purchase Ledger
        </h2>

        <div className="mt-4">
          {receipts.length === 0 ? (
            <p className="text-slate-500">
              No purchase receipts yet.
            </p>
          ) : (
            <div className="space-y-3 text-slate-900">
              {receipts.map((receipt) => (
                <Link
                  key={receipt._id.toString()}
                  href={`/${slug}/purchase/${receipt.shareId}?owner=true&slug=${slug}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-200 hover:bg-sky-50"
                >
                  <div>
                    <p className="font-medium">
                      Receipt #{receipt.receiptNo}
                    </p>

                    <p className="text-sm text-slate-500">
                      {receipt.purchaseDate}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      ₹{receipt.total.toLocaleString()}
                    </p>

                    <p className="text-sm text-slate-500">
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
          className="rounded-xl bg-sky-600 px-5 py-3 text-white shadow-sm transition hover:bg-sky-700"
        >
          Create Purchase
        </Link>
      </div>
    </main>
  );
}