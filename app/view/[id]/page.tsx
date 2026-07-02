import Link from "next/link"
import { ObjectId } from "mongodb"
import { ArrowLeft } from "lucide-react"
import { getInvoicesCollection } from "@/lib/mongodb"
import { InvoiceShare } from "@/components/invoice-share"
import type { InvoiceDetails } from "@/lib/types"

async function getInvoice(id: string): Promise<InvoiceDetails | null> {
  if (!ObjectId.isValid(id)) return null
  try {
    const invoices = await getInvoicesCollection()
    const doc = await invoices.findOne({ _id: new ObjectId(id) })
    if (!doc) return null
    return {
      billNo: doc.billNo,
      clientName: doc.clientName,
      invoiceDate: doc.invoiceDate,
      selectedClientId: doc.selectedClientId,
      balance: doc.balance,
      paid: doc.paid,
      fare: doc.fare,
      items: doc.items,
      extra: doc.extra,
      notes: doc.notes,
      total: doc.total,
      newBalance: doc.newBalance,
    }
  } catch (err) {
    console.error("[v0] Error loading invoice:", err)
    return null
  }
}

export default async function ViewInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const invoice = await getInvoice(id)

  if (!invoice) {
    return (
      <main className="mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold">Invoice not found</h1>
        <p className="text-muted-foreground">
          This invoice may have been removed or the link is invalid.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          <ArrowLeft className="h-4 w-4" /> Create a new invoice
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> New Invoice
        </Link>
        <span className="text-sm text-muted-foreground">
          Invoice #{invoice.billNo}
        </span>
      </div>

      <InvoiceShare invoice={invoice} invoiceId={id} />
    </main>
  )
}
