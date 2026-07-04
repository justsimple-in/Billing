import Link from "next/link";
import { getInvoicesCollection } from "@/lib/mongodb";
import { getBusiness } from "@/lib/actions/getbusiness";
import { Eye, Pencil, Plus } from "lucide-react";

async function getInvoices(slug: string) {
  const business = await getBusiness(slug);


  if (!business) return [];

  const collection = await getInvoicesCollection();

  const invoices = await collection
  .find({
    businessId: business._id!.toString(),
  })
  .sort({
    createdAt: -1,
  })
  .toArray();

    console.log("Invoices fetched for slug:", slug, "Count:", invoices.length);

  return invoices.map((i) => ({
    _id: i._id.toString(),
    shareId: i.shareId,
    billNo: i.billNo,
    clientName: i.clientName,
    invoiceDate: i.invoiceDate,
    total: i.total,
    newBalance: i.newBalance,
    version: i.version ?? 1,
    active: i.active ?? true,
    edited: i.edited ?? false,
  }));
}

export default async function BillsHistoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const invoices = await getInvoices(slug);

  return (
    <main className="mx-auto max-w-7xl text-black px-4 py-6 sm:px-6 sm:py-8">
  <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold sm:text-3xl">Invoices</h1>
      <p className="mt-1 text-sm text-neutral-500 sm:text-base">
        View and manage all invoices.
      </p>
    </div>

    <Link
      href={`/${slug}/bills/new`}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-300 px-4 py-2.5 text-sm text-white hover:bg-neutral-800 sm:py-2 sm:text-base"
    >
      <Plus className="h-4 w-4" />
      New Bill
    </Link>
  </div>

  {invoices.length === 0 ? (
    <div className="rounded-xl border bg-white py-12 text-center text-neutral-500">
      No invoices yet.
    </div>
  ) : (
    <>
      {/* Mobile: card list */}
      <div className="flex flex-col gap-3 sm:hidden">
        {invoices.map((invoice) => (
          <div
            key={invoice._id}
            className="rounded-xl border bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="font-semibold">#{invoice.billNo}</p>
                <p className="text-sm text-neutral-500">
                  {invoice.clientName}
                </p>
              </div>
              {invoice.active ? (
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
                  {new Date(invoice.invoiceDate).toLocaleDateString("en-GB")}
                </p>
              </div>
              <div>
                <p className="text-neutral-400">Version</p>
                <p className="font-medium">v{invoice.version}</p>
              </div>
              <div>
                <p className="text-neutral-400">Total</p>
                <p className="font-medium">₹{invoice.total}</p>
              </div>
              <div>
                <p className="text-neutral-400">Balance</p>
                <p className="font-medium">₹{invoice.newBalance}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/view/${invoice.shareId}`}
                className="flex flex-1 bg-blue-400 items-center justify-center gap-1 rounded-md border px-3 py-2 text-sm hover:bg-neutral-100"
              >
                <Eye className="h-4 w-4" />
                View
              </Link>

              {invoice.active ? (
                <Link
                  href={`/edit/${invoice.shareId}`}
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

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-xl border bg-white sm:block">
        <table className="w-full">
          <thead className="bg-neutral-100">
            <tr className="text-left">
              <th className="px-5 py-3">Bill</th>
              <th className="px-5 py-3">Client</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Balance</th>
              <th className="px-5 py-3">Version</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice._id} className="border-t hover:bg-neutral-50">
                <td className="px-5 py-4 font-medium">#{invoice.billNo}</td>
                <td className="px-5 py-4">{invoice.clientName}</td>
                <td className="px-5 py-4">
                  {new Date(invoice.invoiceDate).toLocaleDateString("en-GB")}
                </td>
                <td className="px-5 py-4">₹{invoice.total}</td>
                <td className="px-5 py-4">₹{invoice.newBalance}</td>
                <td className="px-5 py-4">v{invoice.version}</td>
                <td className="px-5 py-4">
                  {invoice.active ? (
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
                      href={`/view/${invoice.shareId}`}
                      className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-100"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Link>

                    {invoice.active ? (
                      <Link
                        href={`/edit/${invoice.shareId}`}
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