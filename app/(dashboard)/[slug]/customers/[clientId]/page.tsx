import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, MapPin, Wallet } from "lucide-react";
import { ObjectId } from "mongodb";

import { getBusiness } from "@/lib/actions/getbusiness";
import { getClientsCollection } from "@/lib/collections/clients";
import { getInvoicesCollection } from "@/lib/collections/invoices";

interface Props {
  params: Promise<{
    slug: string;
    clientId: string;
  }>;
}

export default async function CustomerPage({ params }: Props) {
  const { slug, clientId } = await params;

  const business = await getBusiness(slug);

  if (!business) {
    notFound();
  }

  const clients = await getClientsCollection();

  const client = await clients.findOne({
    _id: new ObjectId(clientId),
    businessId: business._id.toString(),
  });

  if (!client) {
    notFound();
  }



const invoices = await getInvoicesCollection();

const bills = await invoices
  .find({
    businessId: business._id.toString(),
    selectedClientId: client._id.toString(),
    active: true,
  })
  .sort({
    createdAt: -1,
  })
  .toArray();

  // console.log("bills", bills);

  return (
    <main className="mx-auto max-w-5xl p-8 text-black">

      <Link
        href={`/${slug}/customers`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black"
      >
        <ArrowLeft size={18} />
        Customers
      </Link>

      <div className="rounded-2xl border bg-white p-8 shadow-sm">

        <h1 className="text-3xl font-bold text-black">
          {client.clientName}
        </h1>

        <div className="mt-8 grid gap-6 md:grid-cols-2">

          <div>
            <p className="text-sm text-neutral-500">
              Outstanding Balance
            </p>

            <div className="mt-2 flex items-center gap-2">
              <Wallet className="text-green-600" />

              <span className="text-2xl font-bold">
                ₹{client.prevBalance.toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-neutral-500">
              Phone
            </p>

            <div className="mt-2 flex items-center gap-2">
              <Phone size={18} />
              {client.phone || "-"}
            </div>
          </div>

          <div>
            <p className="text-sm text-neutral-500">
              Address
            </p>

            <div className="mt-2 flex items-center gap-2">
              <MapPin size={18} />
              {client.address || "-"}
            </div>
          </div>

        </div>

      </div>

      <div className="mt-8 rounded-2xl border bg-white p-8">

        <h2 className="text-xl font-semibold text-black">
         Ledger
        </h2>

        <div className="mt-4">
  {bills.length === 0 ? (
    <p className="text-neutral-500">
      No bills yet.
    </p>
  ) : (
    <div className="space-y-3 text-black">
      {bills.map((bill) => (
        <Link
          key={bill._id.toString()}
          href={`/view/${bill.shareId}?owner=true&slug=${slug}`}
          // href={`/${slug}/bills/${bill.shareId}`}
          className="flex  items-center justify-between rounded-lg border p-4 bg-neutral-200 hover:bg-neutral-400"
        >
          <div>
            <p className="font-medium">
              Bill #{bill.billNo}
            </p>

            <p className="text-sm text-neutral-500">
              {bill.invoiceDate}
            </p>
          </div>

          <div className="text-right">
            <p className="font-semibold">
              ₹{bill.total.toLocaleString()}
            </p>

            <p className="text-sm text-neutral-500">
              Balance ₹{bill.newBalance.toLocaleString()}
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
          href={`/${slug}/bills/new?client=${client._id}`}
          className="rounded-xl bg-black px-5 py-3 text-white hover:bg-neutral-800"
        >
          Create Bill
        </Link>

      </div>

    </main>
  );
}