import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Truck } from "lucide-react";

import { getBusiness } from "@/lib/actions/getbusiness";
import { getSuppliersCollection } from "@/lib/collections/suppliers";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SuppliersPage({ params }: Props) {
  const { slug } = await params;

  const business = await getBusiness(slug);

  if (!business) {
    notFound();
  }

  const suppliers = await getSuppliersCollection();

  const allSuppliers = await suppliers
    .find({
      businessId: business._id.toString(),
    })
    .sort({
      supplierName: 1,
    })
    .toArray();

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Suppliers
          </h1>

          <p className="mt-2 text-neutral-500">
            Manage all your suppliers.
          </p>
        </div>

        <Link
          href={`/${slug}/suppliers/`}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white hover:bg-neutral-800"
        >
          <Plus size={18} />
          Add Supplier
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        {allSuppliers.map((supplier) => (
          <Link
            key={supplier._id.toString()}
            href={`/${slug}/suppliers/${supplier._id}`}
            className="flex items-center justify-between border-b p-5 transition hover:bg-neutral-50 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <Truck className="text-green-600" />

              <div>
                <p className="font-medium text-black">
                  {supplier.supplierName}
                </p>

                {/* Last purchase date can go here later */}
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold text-black">
                .....
              </p>

              <p className="text-sm text-neutral-500">
                Outstanding
              </p>
            </div>
          </Link>
        ))}

        {allSuppliers.length === 0 && (
          <div className="p-12 text-center text-neutral-500">
            No suppliers yet.
          </div>
        )}
      </div>
    </main>
  );
}