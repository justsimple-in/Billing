"use client"

import { useRef, useState } from "react"
import { Download, Send, Loader2 } from "lucide-react"
import { InvoiceLayout } from "@/components/invoice-layout"
import type { InvoiceDetails } from "@/lib/types"

interface Props {
  invoice: InvoiceDetails
  invoiceId: string
}

export function InvoiceShare({ invoice, invoiceId }: Props) {
  const printRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)

  const fileName = `invoice-${invoice.billNo || invoiceId}.pdf`

  const buildShareLink = () => {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "")
    return `${base}/view/${invoiceId}`
  }

  const generatePdf = async () => {
    const el = printRef.current
    if (!el) return
    setGenerating(true)
    try {
      // Dynamically import heavy libs only in the browser.
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ])

      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      })
      const imgData = canvas.toDataURL("image/png")

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(fileName)
    } catch (err) {
      console.error("[v0] Failed to generate PDF:", err)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  const shareWhatsApp = async () => {
    // Download the PDF first so the user has the file ready to attach.
    await generatePdf()

    const link = buildShareLink()
    const message =
      `*Invoice #${invoice.billNo}*\n` +
      `Client: ${invoice.clientName}\n` +
      `Date: ${invoice.invoiceDate}\n` +
      `Total: Rs ${invoice.total.toFixed(2)}\n` +
      `New Balance: Rs ${invoice.newBalance.toFixed(2)}\n\n` +
      `View invoice: ${link}\n\n` +
      `(The PDF has been downloaded to your device — attach it in the chat.)`

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(waUrl, "_blank")
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={generatePdf}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 disabled:opacity-60"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download PDF
        </button>
        <button
          type="button"
          onClick={shareWhatsApp}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          Download &amp; Share on WhatsApp
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 shadow-sm">
        <InvoiceLayout ref={printRef} invoice={invoice} />
      </div>
    </div>
  )
}
