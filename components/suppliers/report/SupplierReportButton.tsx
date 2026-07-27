"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function formatInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

interface SupplierReportButtonProps {
  slug: string;
  supplierId: string;
}

export function SupplierReportButton({ slug, supplierId }: SupplierReportButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(() => formatInputDate(new Date()));
  const [error, setError] = useState<string | null>(null);

  const canGenerate = useMemo(() => toDate.length > 0, [toDate]);

  function handleShowReport() {
    if (!toDate) {
      setError("Please choose a To Date.");
      return;
    }

    if (toDate < fromDate) {
      setError("To Date must be on or after From Date.");
      return;
    }

    setError(null);
    setOpen(false);
    router.push(
      `/${slug}/suppliers/${supplierId}/report?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}`,
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="lg"
        onClick={() => setOpen(true)}
        className="border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300 hover:bg-sky-100 hover:text-sky-800"
      >
        <FileText className="h-4 w-4" />
        Report
      </Button>

      <DialogContent className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
        <div className="bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-400 px-6 py-5 text-white sm:px-7">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl text-white">Supplier Report</DialogTitle>
            <DialogDescription>
              Select a date range to review receipts and payments for this supplier.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 sm:p-7">

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(event) => {
                  setToDate(event.target.value);
                  setError(null);
                }}
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
              />
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter className="border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-7">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setError(null);
            }}
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleShowReport}
            disabled={!canGenerate}
            className="bg-sky-600 text-white hover:bg-sky-700"
          >
            Show Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}