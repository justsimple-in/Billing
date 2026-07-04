"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Plus, Search, Loader2 } from "lucide-react"
import type { Client } from "@/lib/types"

interface Props {
  clients: Client[]
  value: string
  slug: string
  onSelect: (client: Client) => void
  onClientAdded: (client: Client) => void
}

export function ClientCombobox({
  clients,
  value,
  slug,
  onSelect,
  onClientAdded,
}: Props) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newBalance, setNewBalance] = useState("0")
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

  const filtered = clients.filter((c) =>
    c.clientName.toLowerCase().includes(query.toLowerCase()),
  )

  const exactMatch = clients.some(
    (c) => c.clientName.toLowerCase() === query.trim().toLowerCase(),
  )

  const handleAddClient = async () => {
    const name = query.trim()
    if (!name) return
    setAdding(true)
    try {
      const res = await fetch(`/${slug}/api/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: name,
          prevBalance: Number(newBalance) || 0,
        }),
      })
      const data = await res.json()
      if (data.client) {
        onClientAdded(data.client)
        onSelect(data.client)
        setQuery(data.client.clientName)
        setOpen(false)
        setShowAddForm(false)
      }
    } catch (err) {
      console.error("[v0] Failed to add client:", err)
      alert("Failed to add client.")
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
          placeholder="Search or add a client"
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
            filtered.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => {
                  onSelect(c)
                  setQuery(c.clientName)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-100"
              >
                <span className="flex items-center gap-2">
                  {c.clientName === value && (
                    <Check className="h-4 w-4 text-emerald-600" />
                  )}
                  {c.clientName}
                </span>
                <span
                  className={
                    c.prevBalance >= 0 ? "text-emerald-600" : "text-red-600"
                  }
                >
                  Rs {c.prevBalance}
                </span>
              </button>
            ))}

          {filtered.length === 0 && !showAddForm && (
            <p className="px-3 py-2 text-sm text-neutral-500">
              No clients match &quot;{query}&quot;
            </p>
          )}

          {/* Add new client option */}
          {query.trim() && !exactMatch && !showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex w-full items-center gap-2 border-t border-neutral-200 px-3 py-2 text-left text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              <Plus className="h-4 w-4" />
              Add &quot;{query.trim()}&quot; as new client
            </button>
          )}

          {showAddForm && (
            <div className="border-t border-neutral-200 p-3">
              <p className="mb-2 text-sm font-medium text-neutral-800">
                Add {query.trim()}
              </p>
              <label className="mb-1 block text-xs text-neutral-500">
                Previous Balance
              </label>
              <input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className="mb-2 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
              />
              <button
                type="button"
                onClick={handleAddClient}
                disabled={adding}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Client
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
