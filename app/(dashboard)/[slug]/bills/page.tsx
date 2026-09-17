import Link from "next/link";
import { getInvoicesCollection } from "@/lib/mongodb";
import { getBusiness } from "@/lib/actions/getbusiness";
import { Eye, Pencil, Plus } from "lucide-react";
import SearchBar from "@/components/SearchBar";

async function getInvoices(slug: string , search: string) {
  const business = await getBusiness(slug);

  // console.log(slug)
  if (!business) return [];

  const collection = await getInvoicesCollection();

//   const query: any = {
//   businessId: business._id!.toString(),
// };

// if (search.trim()) {
//   query.$or = [
//     {
//       clientName: {
//         $regex: search,
//         $options: "i",
//       },
//     },
//     {
//       billNo: {
//         $regex: search,
//         $options: "i",
//       },
//     },
//   ];
// }



const invoices = await collection
  .find({
    businessId: business._id!.toString(),
  })
  .sort({ createdAt: -1 })
  .toArray();


  const searchLower = search.trim().toLowerCase();

const filtered = !searchLower
  ? invoices
  : invoices.filter((invoice) => {
      const text = [
        invoice.billNo,
        invoice.clientName,
        invoice.total,
        invoice.newBalance,
        invoice.invoiceDate,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(searchLower);
    });
    // console.log("Invoices fetched for slug:", slug, "Count:", invoices.length);

  return filtered.map((i) => ({
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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ search?: string }>;

}) {
  const { slug } = await params;
  const { search = "" } = await searchParams;

  const invoices = await getInvoices(slug, search);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 text-black sm:px-6 sm:py-8">
  <div className="mb-6 flex flex-col gap-4 text-left sm:mb-8">
    <div className="flex w-full items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Invoices</h1>
        <p className="mt-1 text-sm text-neutral-500 sm:text-base">
          View and manage all invoices.
        </p>
      </div>
    <Link
      href={`/${slug}/bills/new`}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-300 px-3 py-2.5 text-sm text-white hover:bg-neutral-800 sm:px-4 sm:py-2 sm:text-base"
      >
      <Plus className="h-4 w-4" />
      New 
    </Link>
    </div>

    <div className="w-full">
      <SearchBar className="max-w-none" placeholder="Search invoices..." />
    </div>
  </div>

  {invoices.length === 0 ? (
    <div className="rounded-xl border bg-white py-12 text-center text-neutral-500">
      No invoices yet.
    </div>
  ) : (
    <>
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {invoices.map((invoice) => (
          <div
            key={invoice._id}
            className="flex min-w-0 flex-col rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex w-full min-w-0 items-center justify-between gap-3">
              <p className="truncate font-semibold">#{invoice.billNo}</p>
              <span
                className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${
                  invoice.active
                    ? "bg-green-100 text-green-700"
                    : "bg-neutral-200 text-neutral-600"
                }`}
              >
                V{invoice.version}
              </span>
            </div>

            <div className="mb-3 grid w-full grid-cols-2 gap-3 border-y border-neutral-100 py-3 text-left text-sm">
              <div className="min-w-0">
                <p className="text-xs text-neutral-400">Customer</p>
                <p className="truncate font-medium">{invoice.clientName}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Date</p>
                <p className="font-medium">
                  {new Date(invoice.invoiceDate).toLocaleDateString("en-GB")}
                </p>
              </div>
            </div>

            <div className="mb-4 grid w-full grid-cols-2 gap-3 text-left text-sm">
              <div>
                <p className="text-xs text-neutral-400">Total</p>
                <p className="font-medium">₹{invoice.total}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Balance</p>
                <p className="font-medium">₹{invoice.newBalance}</p>
              </div>
            </div>

            <div className="mt-auto flex w-full gap-2 border-t pt-3">
              <Link
                href={`/view/${invoice.shareId}`}
                className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
              >
                <Eye className="h-4 w-4" />
                View
              </Link>

              {invoice.active ? (
                <Link
                  href={`/${slug}/edit/${invoice.shareId}`}
                  className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md bg-black px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex min-w-0 flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-md bg-neutral-300 px-3 py-2 text-sm font-medium text-neutral-500"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )}
</main>
  );
}