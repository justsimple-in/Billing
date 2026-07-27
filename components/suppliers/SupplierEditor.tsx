"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, PencilLine, X } from "lucide-react";

interface SupplierEditorProps {
  slug: string;
  supplierId: string;
  initial: {
    supplierName: string;
    phone?: string;
    address?: string;
    prevBalance: number;
  };
}

export function SupplierEditor({ slug, supplierId, initial }: SupplierEditorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [address, setAddress] = useState(initial.address ?? "");
  const [balance, setBalance] = useState(initial.prevBalance ?? 0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const balanceChanged = Number(balance) !== Number(initial.prevBalance ?? 0);

    if (balanceChanged) {
      const firstConfirm = window.confirm(
        "Are you sure you want to change the outstanding balance?"
      );
      if (!firstConfirm) return;

      const secondConfirm = window.confirm(
        "Please confirm once more before saving the new balance."
      );
      if (!secondConfirm) return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/${slug}/api/suppliers`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplierId,
          phone,
          address,
          prevBalance: Number(balance),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update supplier");
      }

      setMessage("Supplier details updated successfully.");
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        <PencilLine className="h-4 w-4" />
        Edit
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PencilLine className="h-5 w-5 text-neutral-700" />
                <h2 className="text-xl font-semibold text-black">Edit supplier details</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="Close editor"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Phone number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Outstanding balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={balance}
                  onChange={(e) => setBalance(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Changing this value will ask for confirmation twice.
                </p>
              </div>

              {message ? (
                <p className={`text-sm ${message.includes("success") ? "text-emerald-600" : "text-red-600"}`}>
                  {message}
                </p>
              ) : null}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
