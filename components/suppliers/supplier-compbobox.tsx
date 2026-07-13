"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Plus, Search, Loader2 } from "lucide-react"
import type { Supplier } from "@/lib/types"

interface Props {
  suppliers: Supplier[]
  value: string
  slug: string
  onSelect: (supplier: Supplier) => void
  onSupplierAdded: (supplier: Supplier) => void
}

export function SupplierCombobox({
  suppliers,
  value,
  slug,
  onSelect,
  onSupplierAdded,
}: Props) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
//   const [newBalance, setNewBalance] = useState("0")
  const [showAddForm, setShowAddForm] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
        setShowAddForm(false)
      }
    }

    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  const filtered = suppliers.filter((s) =>
    s.supplierName.toLowerCase().includes(query.toLowerCase()),
  )

  const exactMatch = suppliers.some(
    (s) => s.supplierName.toLowerCase() === query.trim().toLowerCase(),
  )

  const handleAddSupplier = async () => {
    const name = query.trim()
    if (!name) return

    setAdding(true)

    try {
      const res = await fetch(`/${slug}/api/suppliers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplierName: name,
          prevBalance: 0,
        }),
      })

      const data = await res.json()

      if (data.supplier) {
        onSupplierAdded(data.supplier)
        onSelect(data.supplier)
        setQuery(data.supplier.supplierName)
        setOpen(false)
        setShowAddForm(false)
      }
    } catch (err) {
      console.error("[Purchase] Failed to add supplier:", err)
      alert("Failed to add supplier.")
    } finally {
      setAdding(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

        <input
          type="text"
          value={query}
          placeholder="Search or add a supplier"
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setShowAddForm(false)
          }}
          onFocus={() => setOpen(true)}
          className="w-full rounded-md border border-neutral-300 bg-white py-2 pl-9 pr-3 text-neutral-900 outline-none focus:border-neutral-900"
        />
      </div>

      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-neutral-200 bg-white shadow-lg">

          {filtered.length > 0 &&
            filtered.map((s) => (
              <button
                key={s._id}
                type="button"
                onClick={() => {
                  onSelect(s)
                  setQuery(s.supplierName)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-100"
              >
                <span className="flex items-center gap-2">
                  {s.supplierName === value && (
                    <Check className="h-4 w-4 text-emerald-600" />
                  )}

                  {s.supplierName}
                </span>

                <span
                  className={
                    s.prevBalance >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }
                >
                  Rs {s.prevBalance}
                </span>
              </button>
            ))}

          {filtered.length === 0 && !showAddForm && (
            <p className="px-3 py-2 text-sm text-neutral-500">
              No suppliers match &quot;{query}&quot;
            </p>
          )}

          {query.trim() && !exactMatch && !showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex w-full items-center gap-2 border-t border-neutral-200 px-3 py-2 text-left text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              <Plus className="h-4 w-4" />
              Add &quot;{query.trim()}&quot; as new supplier
            </button>
          )}

          {showAddForm && (
            <div className="border-t border-neutral-200 p-3">
              <p className="mb-2 text-sm font-medium text-neutral-800">
                Add {query.trim()}
              </p>

              {/* <label className="mb-1 block text-xs text-neutral-500">
                Previous Balance
              </label>

              <input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className="mb-2 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
              /> */}

              <button
                type="button"
                onClick={handleAddSupplier}
                disabled={adding}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}

                Add Supplier
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  )
}