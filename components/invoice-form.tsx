"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Loader2, FileText, Save } from "lucide-react"
import { ClientCombobox } from "@/components/client-combobox"
import type { Client, Extra, Item, InvoiceDetails, InvoiceSettings } from "@/lib/types"
import { NumberInput } from "./number-format"

const emptyItem = (): Item => ({
  description: "",
  comm: 0,
  fare: 0,
  quantity: 0,
  price: 0,
  eachItemTotal: 0,
  carat: 0,
  perCarat: 0,
})

interface Props {
  mode: "create" | "edit";

  slug: string;

  initial?: InvoiceDetails;

  editId?: string;
}

export function InvoiceForm({ mode, slug, initial, editId }: Props) {
  const router = useRouter()

  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState(
    initial?.selectedClientId ?? "",
  )
  const [clientName, setClientName] = useState(initial?.clientName ?? "")

  const [items, setItems] = useState<Item[]>(
    initial?.items?.length ? initial.items : [emptyItem()],
  )
  const [extra, setExtra] = useState<Extra[]>(initial?.extra ?? [])
  const [notes, setNotes] = useState(initial?.notes ?? "")
  const [billNo, setBillNo] = useState(initial?.billNo ?? 0)
  const [fare, setFare] = useState(initial?.fare ?? true)
  const [paid, setPaid] = useState(initial?.paid ?? 0)
  const [balance, setBalance] = useState(initial?.balance ?? 0)
  const [invoiceDate, setInvoiceDate] = useState(initial?.invoiceDate ?? "")
  const [submitting, setSubmitting] = useState(false)
  const [settings, setSettings] = useState<InvoiceSettings | null>({
              fields: {
                carat: true,
                commission: true,
                fare: true,
                previousBalance: true,
                paidAmount: true,
                additionalCharges: true,
                notes: true,
              },
              lastBillNo: 0,
            });

  // Default today's date only for a new invoice.
  useEffect(() => {
    if (mode === "edit") return
    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, "0")
    const d = String(today.getDate()).padStart(2, "0")
    setInvoiceDate(`${y}-${m}-${d}`)
  }, [mode])

  // Fetch clients for the searchable combobox.
  useEffect(() => {

    const loadInvoiceData = async () => {
      try {
        const res = await fetch(`/${slug}/api/settings`);
        const data = await res.json();

        setClients(data.clients);

        if (mode === "create") {
          setBillNo(data.invoiceSettings.lastBillNo + 1);
          setSettings(
            data.invoiceSettings ?? {
              fields: {
                carat: true,
                commission: true,
                fare: true,
                previousBalance: true,
                paidAmount: true,
                additionalCharges: true,
                notes: true,
              },
              lastBillNo: 0,
            }
          );
        }

        // later
        // setInvoiceSettings(data.invoiceSettings);
      } catch (err) {
        console.error(err);
      }
    };

    // loadInvoiceData();
    const fetchClients = async () => {
      try {
        const res = await fetch(`/${slug}/api/clients`)
        
        const data = await res.json()
        setBillNo(data.invoiceSettings.lastBillNo + 1);
        setClients(data.clients || [])
        setSettings(data.invoiceSettings || null);
        setFare(data.invoiceSettings?.fields.fare ?? true);
      } catch (err) {
        console.error("[v0] Error fetching clients:", err)
      }
    }
    fetchClients()
  }, [])

  const computedItems = useMemo(
    () =>
      items.map((item) => {
        const perCarat =
          (item.comm || 0) +
          (item.fare || 0) +
          (item.price || 0) * (item.quantity || 0)
        const eachItemTotal = (item.carat || 1) * perCarat
        return { ...item, perCarat, eachItemTotal }
      }),
    [items],
  )

  const extraTotal = useMemo(
    () => extra.reduce((sum, e) => sum + (e.amount || 0), 0),
    [extra],
  )

  const billTotal = useMemo(
    () =>
      computedItems.reduce((sum, i) => sum + i.eachItemTotal, 0) + extraTotal,
    [computedItems, extraTotal],
  )

  const total = billTotal + balance
  const newBalance = billTotal + balance - paid

  const updateItem = useCallback(
    (index: number, field: keyof Item, value: string | number) => {
      setItems((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], [field]: value }
        return next
      })
    },
    [],
  )

  const updateExtra = useCallback(
    (index: number, field: keyof Extra, value: string | number) => {
      setExtra((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], [field]: value }
        return next
      })
    },
    [],
  )

  const handleFareToggle = () => {
    const nextFare = !fare
    setFare(nextFare)
    if (!nextFare) {
      setItems((prev) => prev.map((i) => ({ ...i, comm: 0, fare: 0 })))
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!clientName) {
      alert("Please select or add a client.")
      return
    }
    setSubmitting(true)

    const payload = {
      billNo,
      clientName,
      selectedClientId,
      invoiceDate,
      balance,
      paid,
      fare,
      showCarat: settings?.fields.carat ?? true,
      items: computedItems,
      extra,
      notes,
      total,
      newBalance,
    }

    try {
      const endpoint =
        mode === "edit" ? `/${slug}/api/invoices/${editId}` : `/${slug}/api/invoices`
      const method = mode === "edit" ? "PUT" : "POST"

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.invoice?.shareId) {
        router.push(`/view/${data.invoice.shareId}?owner=true&slug=${slug}`);
      } else {
        throw new Error("shareId not returned from server");
      }
    } catch (err) {
      console.error("[v0] Error saving invoice:", err)
      alert("Failed to save invoice. Please try again.")
      setSubmitting(false)
    }
  }

  const inputCls =
    "w-full rounded-md border border-neutral-300 bg-white p-2 text-neutral-900 outline-none focus:border-neutral-900"

  const isEdit = mode === "edit"

  return (
    <main className="min-h-svh bg-neutral-100 px-4 py-8">
      <div className="mx-auto max-w-4xl rounded-xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <FileText className="h-6 w-6 text-neutral-900" />
          <h1 className="text-2xl font-bold text-neutral-900">
            {isEdit ? "Edit Invoice" : "Create Invoice"}
          </h1>
        </div>

        {isEdit && (
          <p className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Saving creates a new invoice with a fresh link. The previous version
            is preserved in this invoice&apos;s history.
          </p>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Top meta */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Bill No
              </label>
              <NumberInput
                // type="number"
                value={billNo}
                onChange={(value) => setBillNo(value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Invoice Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Client Name
              </label>
              <ClientCombobox
                slug={slug}
                clients={clients}
                value={clientName}
                onSelect={(c) => {
                  setClientName(c.clientName)
                  setSelectedClientId(c._id ?? "")
                  setBalance(c.prevBalance || 0)
                }}
                onClientAdded={(c) => setClients((prev) => [...prev, c])}
              />
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-700">
                <input
                  type="checkbox"
                  checked={fare}
                  onChange={handleFareToggle}
                  className="h-4 w-4"
                />
                Commission + Fare
              </label>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-700">
                Invoice Items
              </h2>
              <button
                type="button"
                onClick={() => setItems((prev) => [...prev, emptyItem()])}
                className="inline-flex items-center gap-1 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
              >
                <Plus className="h-4 w-4" /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {computedItems.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 p-3"
                >
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                    <div className="col-span-2 sm:col-span-2 lg:col-span-2">
                      <label className="mb-1 block text-xs text-neutral-500">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        placeholder="Item description"
                        onChange={(e) =>
                          updateItem(index, "description", e.target.value)
                        }
                        className={inputCls}
                      />
                    </div>
                    
                    { settings?.fields.carat &&   <div>
                      <label className="mb-1 block text-xs text-neutral-500">
                        Carat
                        {item.perCarat > 0 && (
                          <span className="ml-1 text-orange-500">
                            @{item.perCarat}
                          </span>
                        )}
                      </label>
                      <NumberInput
                        // type="number"
                        value={item.carat}
                        onChange={(value) => updateItem(index, "carat", value)}
                        className={inputCls}
                      />
                    </div>}
                    <div>
                      <label className="mb-1 block text-xs text-neutral-500">
                        Quantity
                      </label>
                      <NumberInput
                        // type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e)
                        }
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-neutral-500">
                        Price
                      </label>
                      <NumberInput
                        // type="number"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(index, "price", e)
                        }
                        className={inputCls}
                      />
                    </div>
                    {fare && (
                      <div>
                        <label className="mb-1 block text-xs text-neutral-500">
                          Commission
                        </label>
                        <NumberInput
                          // type="number"
                          value={item.comm}
                          onChange={(e) =>
                            updateItem(index, "comm", e)
                          }
                          className={inputCls}
                        />
                      </div>
                    )}
                    {fare && (
                      <div>
                        <label className="mb-1 block text-xs text-neutral-500">
                          Fare
                        </label>
                        <NumberInput
                          // type="number"
                          value={item.fare}
                          onWheel={(e) => e.currentTarget.blur()}
                          onChange={(e) =>
                            updateItem(index, "fare", e)
                          }
                          className={inputCls}
                        />
                      </div>
                    )}
                    <div>
                      <label className="mb-1 block text-xs text-neutral-500">
                        Item Total
                      </label>
                      <input
                        type="number"
                        value={item.eachItemTotal}
                        readOnly
                        className={`${inputCls} bg-neutral-100 font-medium`}
                      />
                    </div>
                  </div>
                  {computedItems.length > 1 && (
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          setItems((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-700">
                Additional Charges
              </h2>
              <button
                type="button"
                onClick={() =>
                  setExtra((prev) => [...prev, { description: "", amount: 0 }])
                }
                className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {extra.map((ex, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-neutral-500">
                      Description
                    </label>
                    <input
                      type="text"
                      value={ex.description}
                      placeholder="Something extra"
                      onChange={(e) =>
                        updateExtra(index, "description", e.target.value)
                      }
                      className={inputCls}
                    />
                  </div>
                  <div className="w-32">
                    <label className="mb-1 block text-xs text-neutral-500">
                      Amount
                    </label>
                    <NumberInput
                      // type="number"
                      value={ex.amount}
                      onChange={(e) =>
                        updateExtra(index, "amount", e)
                      }
                      className={inputCls}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setExtra((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="mb-0.5 rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50"
                    aria-label="Remove charge"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Balance + Paid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                className={`mb-1 block text-sm font-medium ${balance <= 0 ? "text-emerald-700" : "text-red-700"
                  }`}
              >
                Previous Balance
              </label>
              <NumberInput
                // type="number"
                value={balance}
                onChange={(e) => setBalance(e)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-emerald-700">
                Paid Amount
              </label>
              <NumberInput
                // type="number"
                value={paid}
                onChange={(e) => setPaid(e)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Notes
            </label>
            <textarea
              value={notes}
              placeholder="Any additional notes"
              onChange={(e) => setNotes(e.target.value)}
              className={`${inputCls} min-h-20`}
            />
          </div>

          {/* Totals */}
          <div className="rounded-lg bg-neutral-900 p-4 text-right text-white">
            <p className="text-lg font-semibold">Total: Rs {total.toFixed(2)}</p>
            <p className="text-sm text-neutral-300">
              New Balance: Rs {newBalance.toFixed(2)}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                  {isEdit ? "Saving..." : "Creating..."}
                </>
              ) : isEdit ? (
                <>
                  <Save className="h-4 w-4" /> Save Changes
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" /> Create Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
