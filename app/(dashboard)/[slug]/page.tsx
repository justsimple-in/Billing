import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ReceiptText,
  Users,
  History,
  Building2,
  Phone,
  MapPin,
  Leaf,
  User,
} from "lucide-react";

import { getBusiness } from "@/lib/actions/getbusiness";
import { getUsersCollection } from "@/lib/collections/users";
import { ObjectId } from "mongodb";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DashboardPage({ params }: Props) {
  const { slug } = await params;

  const business = await getBusiness(slug);

  if (!business) {
    notFound();
  }

  const users = await getUsersCollection();

  

const owner = await users.findOne({
  _id: new ObjectId(business.ownerId),
});

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-3xl font-bold">
        {business.name}
      </h1>

      <p className="mt-2 text-white">
        Welcome to your billing workspace.
      </p>

      <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl text-black font-semibold">
            Business Information
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <p className="text-sm text-black">
              Workspace
            </p>

            <p className="font-medium  text-black ">
              billing.justsimple.in/{business.slug}
            </p>
          </div>

          <div>
            <p className="text-sm text-black ">
              Owner
            </p>

            <div className="mt-1 flex items-center gap-2  text-black ">
              <User size={18} />
              <span className=" text-black " >{owner?.name ?? "-"}</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-black">
              Contact
            </p>

            <div className="mt-1 flex items-center gap-2  text-black ">
              <Phone size={18} />
              <span>{business.phone}</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-black">
              Address
            </p>

            <div className="mt-1 flex items-center gap-2  text-black ">
              <MapPin size={18} />
              <span>{business.address}</span>
            </div>
          </div>

        </div>
      </div>

      <h2 className="mt-10 mb-4 text-xl font-semibold">
        Quick Actions
      </h2>

      <div className="grid gap-4 md:grid-cols-2">

        <Link
          href={`/${slug}/bills/new`}
          className="rounded-2xl border bg-white p-6 shadow-sm transition hover:border-blue-500 hover:shadow"
        >
          <ReceiptText className="mb-3 h-8 w-8 text-blue-600" />

          <h3 className="font-semibold  text-black ">
            Create Bill
          </h3>

          <p className="mt-2 text-sm text-black ">
            Generate a new invoice.
          </p>
        </Link>

        {/* <Link
          href={`/${slug}/customers/new`}
          className="rounded-2xl border bg-white p-6 shadow-sm transition hover:border-blue-500 hover:shadow"
        >
          <Users className="mb-3 h-8 w-8 text-green-600" />

          <h3 className="font-semibold  text-black ">
            Add Customer
          </h3>

          <p className="mt-2 text-sm text-black">
            Create a new customer.
          </p>
        </Link> */}

        <Link
          href={`/${slug}/bills`}
          className="rounded-2xl border bg-white p-6 shadow-sm transition hover:border-blue-500 hover:shadow"
        >
          <History className="mb-3 h-8 w-8 text-purple-600" />

          <h3 className="font-semibold  text-black ">
            Bill History
          </h3>

          <p className="mt-2 text-sm text-black">
            View all invoices.
          </p>
        </Link>

        <Link
          href={`/${slug}/purchase/new`}
          className="rounded-2xl border bg-white p-6 shadow-sm transition hover:border-blue-500 hover:shadow"
        >
          <Leaf className="mb-3 h-8 w-8 text-purple-600" />

          <h3 className="font-semibold  text-black ">
            Purchase Receipt
          </h3>

          <p className="mt-2 text-sm text-black">
            Create a new purchase receipt.
          </p>
        </Link>

        <Link
          href={`/${slug}/purchase/`}
          className="rounded-2xl border bg-white p-6 shadow-sm transition hover:border-blue-500 hover:shadow"
        >
          <Leaf className="mb-3 h-8 w-8 text-purple-600" />

          <h3 className="font-semibold  text-black ">
            Purchase History
          </h3>

          <p className="mt-2 text-sm text-black">
            View all purchase receipts.
          </p>
        </Link>

        <Link
          href={`/${slug}/customers`}
          className="rounded-2xl border bg-white p-6 shadow-sm transition hover:border-blue-500 hover:shadow"
        >
          <Users className="mb-3 h-8 w-8 text-orange-600" />

          <h3 className="font-semibold  text-black ">
            Customers
          </h3>

          <p className="mt-2 text-sm text-black">
            Manage customers.
          </p>
        </Link>
        <Link
          href={`/${slug}/suppliers`}
          className="rounded-2xl border bg-white p-6 shadow-sm transition hover:border-blue-500 hover:shadow"
        >
          <Leaf className="mb-3 h-8 w-8 text-purple-600" />

          <h3 className="font-semibold  text-black ">
            Shetkari
          </h3>

          <p className="mt-2 text-sm text-black">
            View all suppliers.
          </p>
        </Link>
        

      </div>
    </main>
  );
}