import { ReactNode } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

import { getBusiness } from "@/lib/actions/getbusiness";
import { isBusinessMember } from "@/lib/actions/isBusinessMember";

interface Props {
  children: ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

export default async function DashboardLayout({
  children,
  params,
}: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { slug } = await params;

  const business = await getBusiness(slug);

  if (!business) {
    notFound();
  }

  const member = await isBusinessMember(
    business._id.toString(),
    session.user.id
  );

  if (!member) {
    redirect("/unauthorized");
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-10 max-w-7xl items-center px-4">
          <Link
            href={`/${slug}`}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-black"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>
      </header>

      <main>{children}</main>
    </>
  );
}