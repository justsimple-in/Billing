"use client"
import { toPng } from "html-to-image";
import { useSearchParams } from "next/navigation";

import { useRef, useState } from "react"
import Link from "next/link"
import { Download, Send, Loader2, Pencil, Plus } from "lucide-react"
import { InvoiceLayout } from "@/components/invoice-layout"
import type {  PurchaseReceipt } from "@/lib/types"
import { PurchaseLayout } from "./purchase-layout";

interface Props {
  invoice: PurchaseReceipt
  shareId: string
}

export function PurchaseShare({ invoice, shareId }: Props) {
  const printRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)

  const fileName = `Rec-${invoice.supplierName}-v${invoice.version}-${invoice.receiptDate}`
  const searchParams = useSearchParams();

  const isOwner = searchParams.get("owner") === "true"; 
  const slug = searchParams.get("slug") || "";

  const buildShareLink = () => {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "")
    return `${base}/view/receipt/${shareId}`
  }

  // Render the invoice DOM to a PNG and trigger a download.
  console.log("PurchaseShare invoice:", invoice);
  useState(() => {
    console.log("PurchaseShare invoice:", invoice);
  });

const generateImage = async () => {
  if (!printRef.current) return;

  const dataUrl = await toPng(printRef.current, {
    cacheBust: true,
    pixelRatio: 3,
    backgroundColor: "#fff",
  });

  const link = document.createElement("a");
  link.download = `${fileName}.png`;
  link.href = dataUrl;
  link.click();
};

  const shareWhatsApp = async () => {
    // Download the image first so the user has the file ready to attach.
    await generateImage()

    const link = buildShareLink()
    const message =
      `Hi ${invoice.supplierName}\n` +
      `View Receipt: ${invoice.receiptDate} \n\n ${link}\n`

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    // console.log(message);
    // console.log(waUrl);
    window.open(waUrl, "_blank")
  }

  return (
    <div>
      <div className="mb-4 flex justify-end gap-3">

  <button
    type="button"
    onClick={generateImage}
    disabled={generating}
    className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 disabled:opacity-60"
  >
    {generating ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <Download className="h-4 w-4" />
    )}
    Download Receipt
  </button>

  {isOwner && (
    <button
      type="button"
      onClick={shareWhatsApp}
      disabled={generating}
      className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
    >
      <Send className="h-4 w-4" />
      Share on WhatsApp
    </button>
  )}
  {isOwner && (
    <Link
          href={`/${slug}/purchase/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" />
          New Receipt
        </Link>
  )}

</div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 shadow-sm">
        <PurchaseLayout ref={printRef} invoice={invoice} />
      </div>
    </div>
  )
}
