import Link from "next/link";
import { ArrowLeft, Calculator, Search } from "lucide-react";

import { getBusiness } from "@/lib/actions/getbusiness";
import { getInvoicesCollection } from "@/lib/mongodb";
import type { InvoiceDocument } from "@/lib/types";
import { notFound } from "next/navigation";

interface TallyPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ billNo?: string }>;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB");
}




async function getDailyBills(businessId: string, billNo: number) {
  if (!businessId || !Number.isInteger(billNo)) return [];


  const invoices = await getInvoicesCollection();

  const documents = await invoices
    .find({
      businessId,
      billNo, 
      active: true,
    })
    .sort({ createdAt: 1 })
    .toArray();


  return documents.map((invoice) => ({
    ...invoice,
    _id: invoice._id.toString(),
  })) as unknown as InvoiceDocument[];
}


export default async function TallyPage({
  params,
  searchParams,
}: TallyPageProps) {
  const { slug } = await params;
  const business = await getBusiness(slug);
  const businessId = business?._id.toString();
  
    if (!businessId) {
      notFound();
    }
  const { billNo: billNoParam } = await searchParams;
  const parsedBillNo = billNoParam?.trim() ? Number(billNoParam) : NaN;
  const hasSearch = billNoParam !== undefined;
  const invoices = await getDailyBills(businessId, parsedBillNo);

  const summary = invoices.reduce(
    (totals, invoice) => ({
      previousBalance: totals.previousBalance + (invoice.balance || 0),
      total: totals.total + (invoice.total || 0),
      paid: totals.paid + (invoice.paid || 0),
      outstanding: totals.outstanding + (invoice.newBalance || 0),
    }),
    { previousBalance: 0, total: 0, paid: 0, outstanding: 0 },
  );

  const totalCarat = invoices.reduce(
  (total, invoice) =>
    total +
    (invoice.items ?? []).reduce(
      (itemTotal, item) => itemTotal + (item.carat || 0),
      0
    ),
  0
);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-black sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/${slug}`}
            className="mb-3 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
            <Calculator className="h-7 w-7 text-blue-600" />
            Daily tally
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Enter the bill number shared by all bills created that day.
          </p>
        </div>
      </div>

      <form className="mb-8 flex max-w-xl gap-2" method="get">
        <label htmlFor="billNo" className="sr-only">
          Bill number
        </label>
        <input
          id="billNo"
          name="billNo"
          type="number"
          min="0"
          step="1"
          defaultValue={billNoParam ?? ""}
          placeholder="Enter bill number"
          required
          className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </form>

      {hasSearch && !Number.isInteger(parsedBillNo) ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
          Enter a valid whole bill number.
        </div>
      ) : null}

      {hasSearch && Number.isInteger(parsedBillNo) && invoices.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center text-neutral-500">
          No active bills found for bill number {parsedBillNo}.
        </div>
      ) : null}

      {invoices.length > 0 ? (
        <>
          <section className="mb-8 grid gap-3 sm:grid-cols-2">
  <div className="rounded-xl border bg-white p-4 shadow-sm">
    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
      Total Bills
    </p>
    <p className="mt-2 text-xl font-semibold">
      {formatNumber(invoices.length)}
    </p>
  </div>

  <div className="rounded-xl border bg-white p-4 shadow-sm">
    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
      Total Carat
    </p>
    <p className="mt-2 text-xl font-semibold">
      {formatNumber(totalCarat)}
    </p>
  </div>
</section>

          <div className="space-y-6">
            {invoices.map((invoice) => (
              <article key={invoice._id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <header className="flex flex-wrap items-start justify-between gap-4 border-b bg-neutral-50 px-4 py-4 sm:px-6">
                  <div>
                    <h2 className="text-lg font-bold">{invoice.clientName || "Unnamed client"}</h2>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
                      <span>Bill #{invoice.billNo}</span>
                      <span>Date: {formatDate(invoice.invoiceDate)}</span>
                      <span>Version: {invoice.version}</span>
                    </div>
                  </div>
                  <Link href={`/view/${invoice.shareId}`} className="text-sm font-medium text-blue-600 hover:underline">
                    View bill
                  </Link>
                </header>

                <div className="overflow-x-auto px-4 py-5 sm:px-6">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b text-xs uppercase text-neutral-500">
                      <tr>
                        <th className="px-2 py-3">Item</th>
                        <th className="px-2 py-3">Quantity</th>
                        <th className="px-2 py-3">Carat</th>
                        <th className="px-2 py-3">Per carat</th>
                        <th className="px-2 py-3">Price</th>
                        <th className="px-2 py-3">Commission</th>
                        <th className="px-2 py-3">Fare</th>
                        <th className="px-2 py-3">Item total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(invoice.items ?? []).map((item, index) => (
                        <tr key={`${invoice._id}-item-${index}`}>
                          <td className="px-2 py-3 font-medium">{item.description || "-"}</td>
                          <td className="px-2 py-3">{formatNumber(item.quantity)}</td>
                          <td className="px-2 py-3">{formatNumber(item.carat)}</td>
                          <td className="px-2 py-3">{formatAmount(item.perCarat)}</td>
                          <td className="px-2 py-3">{formatAmount(item.price)}</td>
                          <td className="px-2 py-3">{formatAmount(item.comm)}</td>
                          <td className="px-2 py-3">{formatAmount(item.fare)}</td>
                          <td className="px-2 py-3 font-medium">{formatAmount(item.eachItemTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {(invoice.extra ?? []).length > 0 ? (
                    <div className="mt-5 border-t pt-4">
                      <h3 className="mb-2 font-semibold">Additional charges</h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {invoice.extra.map((extra, index) => (
                          <div key={`${invoice._id}-extra-${index}`} className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2 text-sm">
                            <span>{extra.description || "Additional charge"}</span>
                            <span className="font-medium">{formatAmount(extra.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-5 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div><span className="text-neutral-500">Previous balance</span><p className="font-semibold">{formatAmount(invoice.balance)}</p></div>
                    <div><span className="text-neutral-500">Bill total</span><p className="font-semibold">{formatAmount(invoice.total)}</p></div>
                    <div><span className="text-neutral-500">Paid</span><p className="font-semibold">{formatAmount(invoice.paid)}</p></div>
                    <div><span className="text-neutral-500">Outstanding</span><p className="font-semibold text-blue-700">{formatAmount(invoice.newBalance)}</p></div>
                  </div>

                  {invoice.notes ? (
                    <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      <span className="font-semibold">Notes:</span> {invoice.notes}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </main>
  );
}