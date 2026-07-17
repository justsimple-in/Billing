import Link from "next/link";
import { Eye, Pencil, Plus } from "lucide-react";

import { getBusiness } from "@/lib/actions/getbusiness";
import { getPurchaseReceiptsCollection } from "@/lib/collections/purchaseReceipt";
import SearchBar from "@/components/SearchBar";

async function getPurchases(slug: string, search: string) {
  const business = await getBusiness(slug);

  if (!business) return [];

  const collection = await getPurchaseReceiptsCollection();

  const purchases = await collection
    .find({
      businessId: business._id.toString(),
    })
    .sort({
      createdAt: -1,
    })
    .toArray();

    

  const searchLower = search.trim().toLowerCase();

  const filtered = !searchLower
    ? purchases
    : purchases.filter((purchase) => { 
      const text = [
        purchase.receiptNo,
        purchase.supplierName,
        purchase.total,
        // purchase.newBalance,
        purchase.purchaseDate,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(searchLower);
    });

  return filtered.map((purchase) => ({
    _id: purchase._id.toString(),
    shareId: purchase.shareId,
    receiptNo: purchase.receiptNo,
    supplierName: purchase.supplierName,
    purchaseDate: purchase.receiptDate,
    total: purchase.total,
    newBalance: purchase.newBalance,
    version: purchase.version ?? 1,
    active: purchase.active ?? true,
    edited: purchase.edited ?? false,
  }));
}

export default async function PurchaseHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ search?: string }>;
}) {
  const { slug  } = await params;
  const { search = "" } = await searchParams;

  const purchases = await getPurchases(slug , search);

  

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-black sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl text-white">
            Purchase Receipts
          </h1>

          <p className="mt-1 text-sm text-neutral-500 sm:text-base">
            View and manage all purchase receipts.
          </p>
        </div>

        <div className="flex gap-3">
                <SearchBar placeholder="Search receipts..." />
          
        <Link
          href={`/${slug}/purchase/new`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-300 px-4 py-2.5 text-sm text-white hover:bg-neutral-800 sm:py-2 sm:text-base"
        >
          <Plus className="h-4 w-4" />
          New
        </Link>
        </div>
      </div>

      {purchases.length === 0 ? (
        <div className="rounded-xl border bg-white py-12 text-center text-neutral-500">
          No purchase receipts yet.
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className="flex flex-col gap-3 sm:hidden">
            {purchases.map((purchase) => (
              <div
                key={purchase._id}
                className="rounded-xl border bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-semibold">
                      #{purchase.receiptNo}
                    </p>

                    <p className="text-sm text-neutral-500">
                      {purchase.supplierName}
                    </p>
                  </div>

                  {purchase.active ? (
                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      Active
                    </span>
                  ) : (
                    <span className="rounded bg-neutral-200 px-2 py-1 text-xs font-medium text-neutral-600">
                      Old
                    </span>
                  )}
                </div>

                <div className="mb-3 grid grid-cols-2 gap-y-2 text-sm">
                  <div>
                    <p className="text-neutral-400">Date</p>
                    <p className="font-medium">
                      {new Date(
                        purchase.purchaseDate 
                      ).toLocaleDateString("en-GB")}
                    </p>
                  </div>

                  <div>
                    <p className="text-neutral-400">Version</p>
                    <p className="font-medium">
                      v{purchase.version}
                    </p>
                  </div>

                  <div>
                    <p className="text-neutral-400">Total</p>
                    <p className="font-medium">
                      ₹{purchase.total}
                    </p>
                  </div>

                  <div>
                    <p className="text-neutral-400">Balance</p>
                    <p className="font-medium">
                      ₹{purchase.newBalance}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/${slug}/purchase/${purchase.shareId}`}
                    className="flex flex-1 items-center justify-center gap-1 rounded-md border bg-blue-400 px-3 py-2 text-sm hover:bg-neutral-100"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>

                  {purchase.active ? (
                    <Link
                      href={`/${slug}/purchase/edit/${purchase.shareId}`}
                      className="flex flex-1 items-center justify-center gap-1 rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-neutral-800"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="flex flex-1 items-center justify-center gap-1 rounded-md bg-neutral-300 px-3 py-2 text-sm text-neutral-500"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden overflow-hidden rounded-xl border bg-white sm:block">
            <table className="w-full">
              <thead className="bg-neutral-100">
                <tr className="text-left">
                  <th className="px-5 py-3">Receipt</th>
                  <th className="px-5 py-3">Supplier</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Balance</th>
                  <th className="px-5 py-3">Version</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {purchases.map((purchase) => (
                  <tr
                    key={purchase._id}
                    className="border-t hover:bg-neutral-50"
                  >
                    <td className="px-5 py-4 font-medium">
                      #{purchase.receiptNo}
                    </td>

                    <td className="px-5 py-4">
                      {purchase.supplierName}
                    </td>

                    <td className="px-5 py-4">
                      {new Date(
                        purchase.purchaseDate
                      ).toLocaleDateString("en-GB")}
                    </td>

                    <td className="px-5 py-4">
                      ₹{purchase.total}
                    </td>

                    <td className="px-5 py-4">
                      ₹{purchase.newBalance}
                    </td>

                    <td className="px-5 py-4">
                      v{purchase.version}
                    </td>

                    <td className="px-5 py-4">
                      {purchase.active ? (
                        <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded bg-neutral-200 px-2 py-1 text-xs font-medium text-neutral-600">
                          Old
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/${slug}/purchase/${purchase.shareId}`}
                          className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-100"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>

                        {purchase.active ? (
                          <Link
                            href={`/${slug}/purchase/edit/${purchase.shareId}`}
                            className="inline-flex items-center gap-1 rounded-md bg-black px-3 py-1.5 text-sm text-white hover:bg-neutral-800"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center gap-1 rounded-md bg-neutral-300 px-3 py-1.5 text-sm text-neutral-500"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}