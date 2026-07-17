import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

import { getPurchaseReceiptsCollection } from "@/lib/collections/purchaseReceipt";
import { PurchaseShare } from "@/components/purchase/purchase-share";
import type { PurchaseReceipt } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    shareId: string;
  }>;
}): Promise<Metadata> {
  const { shareId } = await params;

  const receipt = await getReceipt(shareId);

  if (!receipt) {
    return {
      title: "Purchase Receipt not found",
      description:
        "This purchase receipt may have been removed or the link is invalid.",
    };
  }

  return {
    title: `Purchase Receipt`,

    description: [
      `Supplier: ${receipt.supplierName}`,
      `Date: ${receipt.receiptDate}`,
      `Amount: ₹${receipt.total.toLocaleString()}`,
    ].join("\n"),

    openGraph: {
      title: `Purchase Receipt`,
      description: [
        `Supplier: ${receipt.supplierName}`,
        `Date: ${receipt.receiptDate}`,
        `Amount: ₹${receipt.total.toLocaleString()}`,
      ].join("\n"),

      url: `https://billing.justsimple.in/purchase/${shareId}`,
      siteName: "billing.justsimple.in",
      type: "website",
    },

    twitter: {
      card: "summary",
      title: `Purchase Receipt`,
      description: [
        `Supplier: ${receipt.supplierName}`,
        `Date: ${receipt.receiptDate}`,
        `Amount: ₹${receipt.total.toLocaleString()}`,
      ].join("\n"),
    },
  };
}

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

    //   supplierId:
    //     doc.supplierId ?? doc.selectedSupplierId,

      createdAt: doc.createdAt,

      version: doc.version ?? 1,

      supplierName: doc.supplierName,

      receiptDate: doc.receiptDate,

      selectedSupplierId: doc.selectedSupplierId,

      fare: doc.fare,

      items: doc.items,

      extra: doc.extra,

      notes: doc.notes,

      total: doc.total,

    //   newBalance: doc.newBalance,
    };
  } catch (err) {
    console.error("[Purchase] Error loading receipt:", err);
    return null;
  }
}

export default async function ViewPurchaseReceiptPage({
  params,
}: {
  params: Promise<{
    shareId: string;
  }>;
}) {
  const { shareId } = await params;

  const receipt = await getReceipt(shareId);

  if (!receipt) {
    return (
      <main className="mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold">
          Purchase Receipt not found
        </h1>

        <p className="text-muted-foreground">
          This purchase receipt may have been removed or the link is invalid.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-svh max-w-md px-4 py-6">
      <PurchaseShare
        invoice={receipt}
        shareId={shareId}
      />
    </main>
  );
}