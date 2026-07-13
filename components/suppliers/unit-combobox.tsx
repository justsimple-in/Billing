"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

const UNITS = [
  "Carat",
  "Box",
  "Bag",
  "Piece",
  "Kg",
]

interface Props {
  value: string
  onChange: (unit: string) => void
}

export function UnitCombobox({
  value,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () =>
      document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 hover:border-neutral-500"
      >
        <span>{value || "Select"}</span>

        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg">
          {UNITS.map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => {
                onChange(unit)
                setOpen(false)
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-100"
            >
              <span>{unit}</span>

              {value === unit && (
                <Check className="h-4 w-4 text-emerald-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}