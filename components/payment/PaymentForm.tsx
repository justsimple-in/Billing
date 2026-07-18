"use client";

import { useMemo, useState } from "react";
import { Calendar, FileText, IndianRupee, Search } from "lucide-react";
import { NumberInput } from "../number-format";

interface Supplier {
  _id: string;
  supplierName: string;
  phone: string;
  address: string;
  prevBalance: number;
}

interface PaymentFormProps {
  slug: string;
  suppliers: Supplier[];
}

export default function PaymentForm({
  slug,
  suppliers,
}: PaymentFormProps) {
  const [search, setSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );

  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState("");

  const filteredSuppliers = useMemo(() => {
    if (!search) return [];

    return suppliers
      .filter((supplier) =>
        supplier.supplierName
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .slice(0, 8);
  }, [search, suppliers]);

  function handleSupplierSelect(supplier: Supplier) {
    setSelectedSupplier(supplier);
    setSearch(supplier.supplierName);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedSupplier) {
      alert("Please select a supplier.");
      return;
    }

    console.log({
      slug,
      supplier: selectedSupplier,
      paymentDate,
      amount,
      notes,
    });

    // TODO:
    // call server action
    // redirect to payment view page
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

        <div className="relative">
          <Search
            className="absolute left-3 top-3 text-neutral-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Search supplier..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedSupplier(null);
            }}
            className="w-full rounded-lg border  border-gray-300  py-2.5 pl-10 pr-4 outline-none focus:border-black"
          />

          {!selectedSupplier && filteredSuppliers.length > 0 && (
            <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border bg-white shadow-lg">
              {filteredSuppliers.map((supplier) => (
                <button
                  key={supplier._id}
                  type="button"
                  onClick={() => handleSupplierSelect(supplier)}
                  className="block w-full border-b px-4 py-3 text-left hover:bg-neutral-100"
                >
                  <p className="font-medium">
                    {supplier.supplierName}
                  </p>

                  {supplier.phone && (
                    <p className="text-sm text-neutral-500">
                      {supplier.phone}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
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
          type="submit"
          className="rounded-lg bg-black px-6 py-2.5 font-medium text-white hover:bg-neutral-800"
        >
          Save Payment
        </button>
      </div>
    </form>
  );
}