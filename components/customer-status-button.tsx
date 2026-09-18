"use client"

import { useState } from "react"
import { Loader2, Power } from "lucide-react"

interface Props {
  slug: string
  clientId: string
  enabled: boolean
}

export function CustomerStatusButton({ slug, clientId, enabled: initialEnabled }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [saving, setSaving] = useState(false)

  const toggleStatus = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/${slug}/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      })

      if (!res.ok) throw new Error("Failed to update customer status")
      setEnabled(!enabled)
    } catch (error) {
      console.error("Failed to update customer status:", error)
      alert("Failed to update customer status. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggleStatus}
      disabled={saving}
      className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60 ${
        enabled ? "bg-neutral-700 hover:bg-neutral-800" : "bg-emerald-600 hover:bg-emerald-700"
      }`}
    >
      {saving ? <Loader2 size={18} className="animate-spin" /> : <Power size={18} />}
      {enabled ? "Disable Customer" : "Enable Customer"}
    </button>
  )
}