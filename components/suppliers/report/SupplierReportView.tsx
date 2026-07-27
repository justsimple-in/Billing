"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";

import type { SupplierReportResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";

type ReportState =
  | { status: "idle"; data: null; error: null }
  | { status: "loading"; data: null; error: null }
  | { status: "error"; data: null; error: string }
  | { status: "success"; data: SupplierReportResponse; error: null };

interface SupplierReportViewProps {
  slug: string;
  supplierId: string;
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function SupplierReportView({ slug, supplierId }: SupplierReportViewProps) {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const [state, setState] = useState<ReportState>({
    status: "idle",
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!from || !to) {
      setState({
        status: "idle",
        data: null,
        error: null,
      });

      return;
    }

    const controller = new AbortController();

    setState({
      status: "loading",
      data: null,
      error: null,
    });

    const run = async () => {
      try {
        const response = await fetch(
          `/${slug}/api/suppliers/${supplierId}/report?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load supplier report");
        }

        setState({
          status: "success",
          data: payload,
          error: null,
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: "error",
          data: null,
          error: error instanceof Error ? error.message : "Failed to load supplier report",
        });
      }
    };

    void run();

    return () => controller.abort();
  }, [from, slug, supplierId, to]);

  const groupedReceipts = useMemo(() => {
    if (state.status !== "success") {
      return [];
    }

    const groups = new Map<
      string,
      Array<{
        _id: string;
        displayNo: string;
        total: number;
        items: SupplierReportResponse["receipts"][number]["items"];
      }>
    >();

    state.data.receipts.forEach((receipt, index) => {
      const list = groups.get(receipt.date) ?? [];

      list.push({
        ...receipt,
        displayNo: String(index + 1).padStart(3, "0"),
      });

      groups.set(receipt.date, list);
    });

    return Array.from(groups.entries()).map(([date, receipts]) => ({
      date,
      receipts,
    }));
  }, [state]);

  const groupedPayments = useMemo(() => {
    if (state.status !== "success") {
      return [];
    }

    const groups = new Map<string, SupplierReportResponse["payments"]>();

    state.data.payments.forEach((payment) => {
      const list = groups.get(payment.date) ?? [];
      list.push(payment);
      groups.set(payment.date, list);
    });

    return Array.from(groups.entries()).map(([date, payments]) => ({
      date,
      payments,
    }));
  }, [state]);

  const rangeLabel =
    from && to ? `${formatDate(from)} - ${formatDate(to)}` : "Choose a date range to view the report";

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f6f8fc] text-foreground print:bg-white">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_45%),radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_35%)]" />
      <div className="mx-auto flex w-full max-w-[210mm] flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8 print:max-w-none print:px-0 print:py-0">
        <header className="sticky top-0 z-20 -mx-4 overflow-hidden rounded-none border-b border-slate-200 bg-white/90 px-4 py-4 shadow-sm backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 print:static print:border-0 print:bg-transparent print:px-0 print:shadow-none">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-400" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Supplier Report</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {state.status === "success" ? state.data.supplier.name : "Supplier Report"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{rangeLabel}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                render={<Link href={`/${slug}/suppliers/${supplierId}`} />}
                nativeButton={false}
                className="border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Supplier
              </Button>

              <Button
                size="sm"
                onClick={() => window.location.reload()}
                disabled={state.status === "loading"}
                className="border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
              >
                <RefreshCw className={state.status === "loading" ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        {state.status === "idle" ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
            <div className="mx-auto max-w-xl text-center">
              <p className="text-lg font-medium text-slate-900">Choose a date range to view the supplier report.</p>
              <p className="mt-2 text-sm text-slate-500">
                Use the Report button on the supplier page, then pick a To Date to generate the report.
              </p>
            </div>
          </section>
        ) : null}

        {state.status === "loading" ? (
          <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
            <div className="h-7 w-56 animate-pulse rounded-full bg-slate-200" />
            <div className="h-4 w-72 animate-pulse rounded-full bg-slate-100" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-32 animate-pulse rounded-2xl bg-sky-50" />
              <div className="h-32 animate-pulse rounded-2xl bg-cyan-50" />
            </div>
            <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
          </section>
        ) : null}

        {state.status === "error" ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50/70 p-6 shadow-sm print:border-0 print:shadow-none">
            <div className="mx-auto max-w-xl text-center">
              <p className="text-lg font-semibold text-rose-700">Unable to load report</p>
              <p className="mt-2 text-sm text-slate-600">{state.error}</p>
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                >
                  Try Again
                </Button>
                <Button
                  render={<Link href={`/${slug}/suppliers/${supplierId}`} />}
                  nativeButton={false}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  Back to Supplier
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        {state.status === "success" ? (
          <>
            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-sky-200 bg-gradient-to-br from-white to-sky-50 p-5 shadow-sm print:break-inside-avoid">
                <p className="text-sm font-medium text-sky-700">Supplier</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">{state.data.supplier.name}</h2>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>{state.data.supplier.phone || "No phone number"}</p>
                  <p className="whitespace-pre-line">{state.data.supplier.address || "No address"}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-white to-cyan-50 p-5 shadow-sm print:break-inside-avoid">
                <p className="text-sm font-medium text-cyan-700">Date Range</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">{rangeLabel}</h2>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-sky-100">
                    <p className="text-slate-500">Receipts</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(state.data.totals.receipts)}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-cyan-100">
                    <p className="text-slate-500">Payments</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(state.data.totals.payments)}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-teal-100">
                    <p className="text-slate-500">Outstanding</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(state.data.totals.outstanding)}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm print:break-inside-avoid">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Receipts</h2>
                  <p className="text-sm text-slate-500">Grouped by date in ascending order.</p>
                </div>
                <p className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">Grand Total {formatCurrency(state.data.totals.receipts)}</p>
              </div>

              <div className="mt-5 space-y-6">
                {groupedReceipts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    No receipts found for this date range.
                  </div>
                ) : (
                  groupedReceipts.map((group) => (
                    <div key={group.date} className="space-y-4 print:break-inside-avoid">
                      <p className="text-sm font-semibold text-muted-foreground">{formatDate(group.date)}</p>
                      <div className="space-y-4">
                        {group.receipts.map((receipt) => (
                          <article
                            key={receipt._id}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:break-inside-avoid"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                              <div>
                                <p className="text-sm font-semibold text-sky-700">
                                  Receipt #{receipt.displayNo}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                  {receipt.items.length} item{receipt.items.length === 1 ? "" : "s"}
                                </p>
                              </div>
                              <p className="rounded-full bg-slate-900 px-3 py-1 text-base font-semibold text-white">{formatCurrency(receipt.total)}</p>
                            </div>

                            <div className="mt-4 space-y-4">
                              {receipt.items.map((item, itemIndex) => (
                                <div key={`${receipt._id}-${itemIndex}`} className="space-y-1 text-sm">
                                  <p className="font-medium text-slate-900">• {item.itemName}</p>
                                  <p className="text-slate-500">
                                    {item.carats} Carat × {item.weightPerCarat} Kg
                                  </p>
                                  <p className="text-slate-500">
                                    ₹{item.amount.toLocaleString("en-IN")}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-medium text-slate-700">
                              <span>Receipt Total</span>
                              <span>{formatCurrency(receipt.total)}</span>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm print:break-inside-avoid">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Payments</h2>
                  <p className="text-sm text-slate-500">Shown in ascending order by date.</p>
                </div>
                <p className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700">Total {formatCurrency(state.data.totals.payments)}</p>
              </div>

              <div className="mt-5 space-y-4">
                {groupedPayments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    No payments found for this date range.
                  </div>
                ) : (
                  groupedPayments.map((group) => (
                    <div key={group.date} className="space-y-3 print:break-inside-avoid">
                      <p className="text-sm font-semibold text-muted-foreground">{formatDate(group.date)}</p>
                      <div className="space-y-3">
                        {group.payments.map((payment) => (
                          <article
                            key={payment._id}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:break-inside-avoid"
                          >
                            <p className="text-lg font-semibold text-slate-900">{formatCurrency(payment.amount)}</p>
                            {payment.notes ? (
                              <p className="mt-2 text-sm text-slate-600">
                                <span className="font-medium text-slate-900">Notes:</span> {payment.notes}
                              </p>
                            ) : null}
                          </article>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] print:break-inside-avoid">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Summary</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
                    <p className="text-sm text-sky-700">Receipt Total</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(state.data.totals.receipts)}</p>
                  </div>
                  <div className="rounded-2xl bg-cyan-50 p-4 ring-1 ring-cyan-100">
                    <p className="text-sm text-cyan-700">Payment Total</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(state.data.totals.payments)}</p>
                  </div>
                  <div className="rounded-2xl bg-teal-50 p-4 ring-1 ring-teal-100">
                    <p className="text-sm text-teal-700">Outstanding</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(state.data.totals.outstanding)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Report Details</h2>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
                    <dt className="text-slate-500">Supplier</dt>
                    <dd className="font-medium text-slate-900">{state.data.supplier.name}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
                    <dt className="text-slate-500">From</dt>
                    <dd className="font-medium text-slate-900">{formatDate(state.data.from)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">To</dt>
                    <dd className="font-medium text-slate-900">{formatDate(state.data.to)}</dd>
                  </div>
                </dl>
              </div>
            </section>

            {state.data.receipts.length === 0 && state.data.payments.length === 0 ? (
              <section className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
                No receipts or payments were found for this date range.
              </section>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}