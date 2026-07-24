import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getPurchaseReceiptsCollection } from "@/lib/collections/purchaseReceipt";
import { PurchaseReceiptForm} from "@/components/purchase/PurchaseReceiptForm";
import type { PurchaseReceipt } from "@/lib/types";

async function getReceipt(
  shareId: string
): Promise<PurchaseReceipt | null> {
  try {
    const receipts = await getPurchaseReceiptsCollection();

    const doc = await receipts.findOne({
      shareId,
      active: true,
    });

    if (!doc) return null;

    return {
      businessId: doc.businessId,
      businessSlug: doc.businessSlug,

      createdAt: doc.createdAt,
      version: doc.version ?? 1,

      supplierName: doc.supplierName,
      selectedSupplierId: doc.selectedSupplierId,

      receiptDate: doc.receiptDate,

      fare: doc.fare,

      items: doc.items,
      extra: doc.extra,

      notes: doc.notes,

      total: doc.total,
      paid: doc.paid,
      balance: doc.balance,
      newBalance: doc.newBalance,
    };
  } catch (err) {
    console.error("Error loading purchase receipt:", err);
    return null;
  }
}

export default async function EditPurchasePage({
  params,
}: {
  params: Promise<{
    slug: string;
    shareId: string;
  }>;
}) {
  const { slug, shareId } = await params;

  const receipt = await getReceipt(shareId);

  if (!receipt) {
    return (
      <main className="mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold">
          Purchase receipt not found
        </h1>

        <p className="text-muted-foreground">
          This purchase receipt may have been removed or the link is invalid.
        </p>

        <Link
          href={`/${slug}/purchase`}
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Purchase History
        </Link>
      </main>
    );
  }

  return (
    <PurchaseReceiptForm
      mode="edit"
      slug={slug}
      initial={receipt}
      editId={shareId}
    />
  );
}