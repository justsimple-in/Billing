import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

import { getPaymentsCollection } from "@/lib/collections/payments";
import { PaymentShare } from "@/components/payment/payment-share";
import type { Payment } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    shareId: string;
    slug: string;
  }>;
}): Promise<Metadata> {
  const { shareId } = await params;
  const payment = await getPayment(shareId);

  if (!payment) {
    return {
      title: "Payment not found",
      description: "This payment may have been removed or the link is invalid.",
    };
  }

  return {
    title: `Payment for ${payment.supplierName}`,
    description: `Amount paid: ₹${payment.amount.toLocaleString()} on ${payment.paymentDate}`,
    openGraph: {
      title: `Payment for ${payment.supplierName}`,
      description: `Amount paid: ₹${payment.amount.toLocaleString()} on ${payment.paymentDate}`,
      url: `https://billing.justsimple.in/payment/${shareId}`,
      siteName: "billing.justsimple.in",
      type: "website",
    },
  };
}

async function getPayment(shareId: string): Promise<Payment | null> {
  try {
    const payments = await getPaymentsCollection();

    const doc = await payments.findOne({
      shareId,
      active: true,
    });

    if (!doc) return null;

    return {
      businessId: doc.businessId,
      businessSlug: doc.businessSlug,
      version: doc.version ?? 1,
      createdAt: doc.createdAt,
      supplierName: doc.supplierName,
      selectedSupplierId: doc.selectedSupplierId,
      paymentDate: doc.paymentDate,
      amount: doc.amount,
      notes: doc.notes ?? "",
      previousBalance: doc.previousBalance ?? 0,
      newBalance: doc.newBalance ?? 0,
    };
  } catch (err) {
    console.error("[Payment] Error loading payment:", err);
    return null;
  }
}

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{
    shareId: string;
    slug: string;
  }>;
}) {
  const { shareId, slug } = await params;
  const payment = await getPayment(shareId);

  if (!payment) {
    return (
      <main className="mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">
          Payment not found
        </h1>
        <p className="text-neutral-600">
          This payment may have been removed or the link is invalid.
        </p>
        <Link
          href={`/${slug}/payment/new`}
          className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Create payment
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-svh max-w-4xl px-4 py-6">
      <PaymentShare payment={payment} shareId={shareId} slug={slug} />
    </main>
  );
}
