import Link from "next/link"
// import { ObjectId } from "mongodb"
import { ArrowLeft } from "lucide-react"
import { getInvoicesCollection } from "@/lib/mongodb"
import { InvoiceForm } from "@/components/invoice-form"
import type { InvoiceDetails } from "@/lib/types"

async function getInvoice( shareId: string): Promise<InvoiceDetails | null> {
  // if (!ObjectId.isValid(id)) return null
  try {
    const invoices = await getInvoicesCollection()
    const doc = await invoices.findOne({
  shareId,
  active: true,
});
    if (!doc) return null
    return {
  businessId: doc.businessId,
  clientId: doc.clientId ?? doc.selectedClientId,
  createdAt: doc.createdAt,
  version: doc.version ?? 1,
  billNo: doc.billNo,
  clientName: doc.clientName,
  invoiceDate: doc.invoiceDate,
  selectedClientId: doc.selectedClientId,
  balance: doc.balance,
  paid: doc.paid,
  fare: doc.fare,
  showCarat: doc.showCarat,
  items: doc.items,
  extra: doc.extra,
  notes: doc.notes,
  total: doc.total,
  newBalance: doc.newBalance,
};
  } catch (err) {
    console.error(" Error loading invoice for edit:", err)
    return null
  }
}

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{
    slug: string;
    shareId: string;
  }>;
}) {
const { slug, shareId } = await params;
  const invoice = await getInvoice(shareId)

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

  return  (
    <InvoiceForm
      mode="edit"
      slug={slug}
      initial={invoice}
      editId={shareId}
    />
  );
}
