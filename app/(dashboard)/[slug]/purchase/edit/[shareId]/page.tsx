import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

interface Props {
  params: Promise<{
    slug: string;
    shareId: string;
  }>;
}

export default async function EditPurchaseComingSoon({ params }: Props) {
  const { slug } = await params;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <Construction className="mb-6 h-16 w-16 text-amber-500" />

      <h1 className="text-3xl font-bold text-white">
        Edit Purchase Coming Soon
      </h1>

      <p className="mt-4 text-neutral-600">
        Editing purchase receipts is currently under development.
        <br />
        This feature will be available in a future update.
      </p>

      <Link
        href={`/${slug}/purchase`}
        className="mt-8 rounded-lg bg-black px-5 py-3 text-white hover:bg-neutral-800"
      >
        ← Back to Purchase History
      </Link>
    </main>
  );
}