import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, User } from "lucide-react";

import { getBusiness } from "@/lib/actions/getbusiness";
import { getClientsCollection } from "@/lib/collections/clients";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CustomersPage({ params }: Props) {
  const { slug } = await params;

  const business = await getBusiness(slug);
  // console.log("business", business);
  if (!business) {
    notFound();
  }

  const clients = await getClientsCollection();
  // console.log("clients", clients);
  const allClients = await clients
    .find({
      businessId: business._id.toString(),
    })
    .sort({
      clientName: 1,
    })
    .toArray();

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-black">
            Customers
          </h1>

          <p className="mt-2 text-neutral-500">
            Manage all your customers.
          </p>
        </div>

        <Link
          href={`/${slug}/customers/new`}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white hover:bg-neutral-800"
        >
          <Plus size={18} />
          Add Customer
        </Link>

      </div>

      <div className="overflow-hidden rounded-xl border bg-white">

        {allClients.map((client) => (
          <Link
            key={client._id.toString()}
            href={`/${slug}/customers/${client._id}`}
            className="flex items-center justify-between border-b p-5 transition hover:bg-neutral-50 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <User className="text-blue-600" />

              <div>
                <p className="font-medium text-black">
                  {client.clientName}
                </p>

                {/* Last bill date will go here later */}
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold text-black">
                ₹{client.prevBalance.toLocaleString()}
              </p>

              <p className="text-sm text-neutral-500">
                Outstanding
              </p>
            </div>
          </Link>
        ))}

        {allClients.length === 0 && (
          <div className="p-12 text-center text-neutral-500">
            No customers yet.
          </div>
        )}

      </div>
    </main>
  );
}