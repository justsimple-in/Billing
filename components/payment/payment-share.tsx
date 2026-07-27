import Link from "next/link";
import { ArrowLeft, CalendarDays, FileText, IndianRupee, Wallet2 } from "lucide-react";
import type { Payment } from "@/lib/types";

interface PaymentShareProps {
  payment: Payment;
  shareId: string;
  slug: string;
}

export function PaymentShare({ payment, shareId, slug }: PaymentShareProps) {
  const isPositiveBalance = payment.newBalance >= 0;

  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col gap-6 px-4 py-8">
      <Link
        href={`/${slug}/payment/new`}
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to payment form
      </Link>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
              Payment receipt
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-neutral-900">
              {payment.supplierName}
            </h1>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            Paid successfully
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-neutral-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
              <CalendarDays className="h-4 w-4" />
              Payment date
            </div>
            <p className="mt-2 text-lg font-semibold text-neutral-900">
              {payment.paymentDate}
            </p>
          </div>

          <div className="rounded-xl bg-neutral-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
              <IndianRupee className="h-4 w-4" />
              Amount paid
            </div>
            <p className="mt-2 text-lg font-semibold text-neutral-900">
              ₹{payment.amount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
              <Wallet2 className="h-4 w-4" />
              Previous balance
            </div>
            <p className="mt-2 text-lg font-semibold text-neutral-900">
              ₹{payment.previousBalance.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
              <Wallet2 className="h-4 w-4" />
              New balance
            </div>
            <p className={`mt-2 text-lg font-semibold ${isPositiveBalance ? "text-emerald-700" : "text-red-700"}`}>
              ₹{payment.newBalance.toLocaleString()}
            </p>
          </div>
        </div>

        {payment.notes ? (
          <div className="mt-6 rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
              <FileText className="h-4 w-4" />
              Notes
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">
              {payment.notes}
            </p>
          </div>
        ) : null}

        <div className="mt-6 rounded-xl bg-neutral-900 p-4 text-sm text-neutral-300">
          <p>
            Payment reference: <span className="font-mono text-white">{shareId}</span>
          </p>
        </div>
      </section>
    </main>
  );
}
