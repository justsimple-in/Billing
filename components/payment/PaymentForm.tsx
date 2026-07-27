"use client";

import { useEffect, useState } from "react";
import { Calendar, FileText, IndianRupee } from "lucide-react";
import { NumberInput } from "../number-format";
import { SupplierCombobox } from "../suppliers/supplier-combobox";
import type { Payment, Supplier } from "@/lib/types";
import { useRouter } from "next/dist/client/components/navigation";

interface PaymentFormProps {
  slug: string;

  suppliers: Supplier[];

  mode?: "new" | "edit";

  editId?: string;

  initial?: Payment;
}

export default function PaymentForm({
  slug,
  suppliers,
  mode = "new",
  editId,
  initial,
}: PaymentFormProps) {
  const [search, setSearch] = useState(
    initial?.supplierName ?? ""
  );
  const [supplierOptions, setSupplierOptions] = useState(suppliers);

  const [selectedSupplier, setSelectedSupplier] =
    useState<Supplier | null>(
      initial
        ? suppliers.find(
          s => s._id === initial.selectedSupplierId
        ) ?? null
        : null
    );

  const [paymentDate, setPaymentDate] =
    useState(
      initial?.paymentDate ??
      new Date().toISOString().split("T")[0]
    );

  const [amount, setAmount] =
    useState(initial?.amount ?? 0);

  const [notes, setNotes] =
    useState(initial?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setSupplierOptions(suppliers);
  }, [suppliers]);

  function handleSupplierSelect(supplier: Supplier) {
    setSelectedSupplier(supplier);
    setSearch(supplier.supplierName);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedSupplier) {
      alert("Please select a supplier.");
      return;
    }

    if (amount <= 0) {
      alert("Enter a valid payment amount.");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        mode === "edit"
          ? `/${slug}/api/payment/${editId}`
          : `/${slug}/api/payment`;

      const method =
        mode === "edit"
          ? "PUT"
          : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplierName: selectedSupplier.supplierName,
          selectedSupplierId: selectedSupplier._id,
          paymentDate,
          amount,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save payment");
      }

      router.push(`/${slug}/payment/${data.payment.shareId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl bg-white text-black p-6 shadow"
    >
      {/* Supplier */}
      <div>
        <label className="mb-2 block font-medium">
          Supplier
        </label>

        <SupplierCombobox
          slug={slug}
          suppliers={supplierOptions}
          value={search}
          onSelect={(supplier) => {
            handleSupplierSelect(supplier);
          }}
          onSupplierAdded={(supplier) => {
            setSupplierOptions((prev) => [...prev, supplier]);
            handleSupplierSelect(supplier);
          }}
        />
      </div>

      {/* Payment Date */}
      <div>
        <label className="mb-2 flex items-center gap-2 font-medium">
          <Calendar size={16} />
          Payment Date
        </label>

        <input
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          className="w-full rounded-lg border  border-gray-300  px-4 py-2.5 outline-none focus:border-black"
        />
      </div>

      {/* Amount */}
      <div>
        <label className="mb-2 flex items-center gap-2 font-medium">
          <IndianRupee size={16} />
          Amount Paid
        </label>

        <NumberInput
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e)}
          placeholder="Enter amount"
          className="w-full rounded-lg border  border-gray-300  px-4 py-2.5 outline-none focus:border-black"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="mb-2 flex items-center gap-2 font-medium">
          <FileText size={16} />
          Notes
        </label>

        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..."
          className="w-full rounded-lg border  border-gray-300 px-4 py-3 outline-none focus:border-black"
        />
      </div>

      <div className="flex justify-end">
        <button
          disabled={loading}
          type="submit"
        >
          {loading
            ? "Saving..."
            : mode === "edit"
              ? "Update Payment"
              : "Save Payment"}
        </button>
      </div>
    </form>
  );
}